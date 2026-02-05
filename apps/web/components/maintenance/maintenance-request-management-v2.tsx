/**
 * @file apps/web/components/maintenance/maintenance-request-management-v2.tsx
 * @description 유지보수 요청 관리 컴포넌트 - 표준 DataTable 레이아웃
 *
 * 초보자 가이드:
 * 1. **레이아웃**: DataTable의 내장 검색/필터/컬럼설정 사용
 * 2. **기능**: 검색, 필터, 컬럼설정, 정렬, 페이지네이션, 엑셀 다운로드
 * 3. **표준 패턴**: equipment-master-management-v2.tsx 참고
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table";
import { MaintenanceForm } from "./maintenance-form";
import { MaintenancePlanForm } from "./maintenance-plan-form";
import { ImportExportDialog } from "@/components/common/import-export-dialog";
import { Badge } from "@fms/ui/badge";
import { Button } from "@fms/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/hooks/use-toast";
import { useCrudState } from "@/hooks/use-crud-state";
import type { MaintenanceRequest } from "@fms/types";
import { mockMaintenanceRequests } from "@/lib/mock-data/maintenance";
import type { ExportColumn } from "@/lib/utils/export-utils";
import {
  useMaintenanceRequests,
  useCreateMaintenanceRequest,
  useUpdateMaintenanceRequest,
  useDeleteMaintenanceRequest,
} from "@/hooks/api/use-maintenance";
import { useTranslation } from "@/lib/language-context";

// Mock/API 모드 전환
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// ============================================
// 엑셀 다운로드 유틸
// ============================================
function downloadExcel<T extends Record<string, any>>(
  data: T[],
  columns: { key: string; title: string; format?: (value: any) => string }[],
  filename: string
) {
  const headers = columns.map((c) => c.title).join(",");
  const rows = data.map((item) =>
    columns.map((c) => {
      const value = item[c.key];
      const formatted = c.format ? c.format(value) : value;
      if (typeof formatted === "string" && (formatted.includes(",") || formatted.includes("\n"))) {
        return `"${formatted.replace(/"/g, '""')}"`;
      }
      return formatted ?? "";
    }).join(",")
  );
  const csv = [headers, ...rows].join("\n");
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================
// 상태/우선순위 헬퍼 함수
// ============================================
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    requested: "요청됨",
    approved: "승인됨",
    rejected: "반려됨",
    planned: "계획됨",
    assigned: "배정됨",
    in_progress: "진행중",
    completed: "완료됨",
    cancelled: "취소됨",
  };
  return labels[status] || status;
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "requested": return "outline";
    case "approved": return "default";
    case "rejected": return "destructive";
    case "planned": return "secondary";
    case "in_progress": return "default";
    case "completed": return "default";
    default: return "outline";
  }
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    critical: "긴급",
    high: "높음",
    normal: "보통",
    low: "낮음",
  };
  return labels[priority] || priority;
};

const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (priority) {
    case "critical": return "destructive";
    case "high": return "default";
    case "normal": return "secondary";
    case "low": return "outline";
    default: return "outline";
  }
};

const getRequestTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    breakdown: "고장수리",
    preventive: "예방정비",
    improvement: "개선작업",
    emergency: "비상수리",
  };
  return labels[type] || type;
};

// ============================================
// 메인 컴포넌트
// ============================================
export function MaintenanceRequestManagementV2() {
  const { t } = useTranslation("maintenance");
  const { toast } = useToast();

  // API 훅 (API 모드에서만 사용)
  const apiQuery = useMaintenanceRequests(undefined, { enabled: !USE_MOCK_API });
  const createMutation = useCreateMaintenanceRequest();
  const updateMutation = useUpdateMaintenanceRequest();
  const deleteMutation = useDeleteMaintenanceRequest();

  // Mock 모드용 상태
  const [mockRequestData, setMockRequestData] = useState<MaintenanceRequest[]>([]);
  const [mockLoading, setMockLoading] = useState(USE_MOCK_API);

  // CRUD 상태 관리
  const crud = useCrudState<MaintenanceRequest>();

  // 페이지네이션
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 계획 수립 폼 상태
  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [requestToPlan, setRequestToPlan] = useState<MaintenanceRequest | undefined>();

  // Mock 모드 데이터 로드
  useEffect(() => {
    if (USE_MOCK_API) {
      setMockLoading(true);
      setTimeout(() => {
        setMockRequestData(mockMaintenanceRequests);
        setMockLoading(false);
      }, 500);
    }
  }, []);

  // 통합 데이터 및 로딩 상태
  const requests = useMemo(() => {
    if (USE_MOCK_API) return mockRequestData;
    const data = apiQuery.data as any;
    return data?.items || data || [];
  }, [mockRequestData, apiQuery.data]);

  const loading = USE_MOCK_API ? mockLoading : apiQuery.isLoading;

  // ============================================
  // 핸들러 함수
  // ============================================
  const handleApprove = async (request: MaintenanceRequest) => {
    try {
      if (USE_MOCK_API) {
        setMockRequestData((prev) =>
          prev.map((req) =>
            req.id === request.id
              ? { ...req, status: "approved", approvedBy: "current-user", approvedByName: "현재사용자", approvalDate: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : req
          )
        );
      } else {
        await updateMutation.mutateAsync({ id: request.id, data: { status: "approved" } as any });
      }
      toast({ title: "승인 완료", description: `"${request.title}" 요청이 승인되었습니다.` });
    } catch (error) {
      toast({ title: "오류", description: "승인 처리에 실패했습니다.", variant: "destructive" });
    }
  };

  const handleReject = async (request: MaintenanceRequest) => {
    try {
      if (USE_MOCK_API) {
        setMockRequestData((prev) =>
          prev.map((req) =>
            req.id === request.id ? { ...req, status: "rejected", updatedAt: new Date().toISOString() } : req
          )
        );
      } else {
        await updateMutation.mutateAsync({ id: request.id, data: { status: "rejected" } as any });
      }
      toast({ title: "반려 완료", description: `"${request.title}" 요청이 반려되었습니다.` });
    } catch (error) {
      toast({ title: "오류", description: "반려 처리에 실패했습니다.", variant: "destructive" });
    }
  };

  const handleCreatePlan = (request: MaintenanceRequest) => {
    setRequestToPlan(request);
    setPlanFormOpen(true);
  };

  const handlePlanFormSubmit = async (data: any) => {
    if (!requestToPlan) return;
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMockRequestData((prev) =>
        prev.map((req) =>
          req.id === requestToPlan.id ? { ...req, status: "planned", updatedAt: new Date().toISOString() } : req
        )
      );
      toast({ title: "계획 수립 완료", description: `"${data.title}" 작업 계획이 생성되었습니다.`, duration: 5000 });
    } catch (error) {
      toast({ title: "오류", description: "작업 계획 수립에 실패했습니다.", variant: "destructive" });
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (!crud.itemToDelete) return;
    try {
      if (USE_MOCK_API) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMockRequestData((prev) => prev.filter((req) => req.id !== crud.itemToDelete!.id));
      } else {
        await deleteMutation.mutateAsync(crud.itemToDelete.id);
      }
      toast({ title: "삭제 완료", description: "작업 요청이 삭제되었습니다." });
    } catch (error) {
      toast({ title: "오류", description: "작업 요청 삭제에 실패했습니다.", variant: "destructive" });
    } finally {
      crud.setDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (crud.formMode === "create") {
        if (USE_MOCK_API) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const newRequest: MaintenanceRequest = {
            id: Date.now().toString(),
            requestNo: `REQ-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, "0")}`,
            title: data.title ?? "제목 없음",
            description: data.description ?? "설명 없음",
            equipmentId: data.equipmentId ?? "EQ-UNKNOWN",
            requestType: data.requestType ?? "breakdown",
            priority: data.priority ?? "normal",
            estimatedDuration: data.estimatedDuration ?? 0,
            estimatedCost: data.estimatedCost ?? 0,
            equipmentCode: "EQ-SAMPLE-001",
            equipmentName: "샘플 설비",
            status: "requested",
            requestedBy: "current-user",
            requestedByName: "현재사용자",
            requestDate: new Date().toISOString(),
            location: "A동 1층",
            department: "생산1팀",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: "current-user",
            updatedBy: "current-user",
          };
          setMockRequestData((prev) => [...prev, newRequest]);
        } else {
          await createMutation.mutateAsync(data);
        }
        toast({ title: "등록 완료", description: "보전작업 요청이 등록되었습니다." });
      } else if (crud.formMode === "edit") {
        if (USE_MOCK_API) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setMockRequestData((prev) =>
            prev.map((req) =>
              req.id === crud.selectedItem?.id ? { ...req, ...data, updatedAt: new Date().toISOString(), updatedBy: "current-user" } : req
            )
          );
        } else {
          await updateMutation.mutateAsync({ id: crud.selectedItem!.id, data });
        }
        toast({ title: "수정 완료", description: "작업 요청이 수정되었습니다." });
      }
    } catch (error) {
      toast({ title: "오류", description: `작업 요청 ${crud.formMode === "create" ? "등록" : "수정"}에 실패했습니다.`, variant: "destructive" });
      throw error;
    }
  };

  const handleImportComplete = async (importedData: MaintenanceRequest[]) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMockRequestData((prev) => [...prev, ...importedData]);
      toast({ title: "가져오기 완료", description: `${importedData.length}개의 작업 요청이 가져오기 되었습니다.` });
    } catch (error) {
      toast({ title: "오류", description: "데이터 가져오기에 실패했습니다.", variant: "destructive" });
      throw error;
    }
  };

  // ============================================
  // 엑셀 다운로드
  // ============================================
  const handleExport = () => {
    downloadExcel(requests, [
      { key: "requestNo", title: "요청번호" },
      { key: "title", title: "작업제목" },
      { key: "equipmentName", title: "설비명" },
      { key: "requestType", title: "요청유형", format: getRequestTypeLabel },
      { key: "status", title: "상태", format: getStatusLabel },
      { key: "priority", title: "우선순위", format: getPriorityLabel },
      { key: "requestedByName", title: "요청자" },
      { key: "requestDate", title: "요청일", format: (v) => new Date(v).toLocaleDateString("ko-KR") },
      { key: "estimatedCost", title: "예상비용", format: (v) => v ? `${Number(v).toLocaleString()}원` : "" },
    ], "보전작업요청");
    toast({ title: "다운로드 완료", description: "보전작업 요청 목록이 다운로드되었습니다." });
  };

  // ============================================
  // 컬럼 정의
  // ============================================
  const columns: DataTableColumn<MaintenanceRequest>[] = [
    {
      key: "requestNo",
      title: t("requestNo") || "요청번호",
      width: "130px",
      sortable: true,
      searchable: true,
      render: (value) => <span className="font-mono font-medium">{value}</span>,
    },
    {
      key: "title",
      title: t("workTitle") || "작업제목",
      width: "200px",
      sortable: true,
      searchable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{record.equipmentName}</div>
        </div>
      ),
    },
    {
      key: "requestType",
      title: t("requestType") || "요청유형",
      width: "100px",
      align: "center",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "고장수리", value: "breakdown" },
        { label: "예방정비", value: "preventive" },
        { label: "개선작업", value: "improvement" },
        { label: "비상수리", value: "emergency" },
      ],
      render: (value) => <Badge variant="outline">{getRequestTypeLabel(value)}</Badge>,
    },
    {
      key: "status",
      title: t("status") || "상태",
      width: "100px",
      align: "center",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "요청됨", value: "requested" },
        { label: "승인됨", value: "approved" },
        { label: "반려됨", value: "rejected" },
        { label: "계획됨", value: "planned" },
        { label: "진행중", value: "in_progress" },
        { label: "완료됨", value: "completed" },
      ],
      render: (value) => <Badge variant={getStatusVariant(value)}>{getStatusLabel(value)}</Badge>,
    },
    {
      key: "priority",
      title: "우선순위",
      width: "90px",
      align: "center",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "긴급", value: "critical" },
        { label: "높음", value: "high" },
        { label: "보통", value: "normal" },
        { label: "낮음", value: "low" },
      ],
      render: (value) => <Badge variant={getPriorityVariant(value)}>{getPriorityLabel(value)}</Badge>,
    },
    {
      key: "requestedByName",
      title: "요청자",
      width: "120px",
      sortable: true,
      searchable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">{new Date(record.requestDate).toLocaleDateString("ko-KR")}</div>
        </div>
      ),
    },
    {
      key: "estimatedCost",
      title: "예상비용",
      width: "100px",
      align: "right",
      sortable: true,
      render: (value) => value ? `${Number(value).toLocaleString()}원` : "-",
    },
  ];

  // ============================================
  // 액션 정의
  // ============================================
  const actions: DataTableAction<MaintenanceRequest>[] = [
    {
      key: "view",
      label: "상세보기",
      iconName: "visibility",
      onClick: (record) => crud.handleView(record),
    },
    {
      key: "edit",
      label: "수정",
      iconName: "edit",
      onClick: (record) => crud.handleEdit(record),
      hidden: (record) => !["requested", "rejected"].includes(record.status),
    },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => crud.handleDelete(record),
      hidden: (record) => !["requested", "rejected"].includes(record.status),
    },
    {
      key: "approve",
      label: "승인",
      iconName: "check_circle",
      onClick: (record) => handleApprove(record),
      hidden: (record) => record.status !== "requested",
    },
    {
      key: "reject",
      label: "반려",
      iconName: "cancel",
      variant: "destructive",
      onClick: (record) => handleReject(record),
      hidden: (record) => record.status !== "requested",
    },
    {
      key: "plan",
      label: "계획수립",
      iconName: "calendar_month",
      onClick: (record) => handleCreatePlan(record),
      hidden: (record) => record.status !== "approved",
    },
  ];

  // Import/Export 설정
  const exportColumns: ExportColumn[] = [
    { key: "requestNo", title: "요청번호", width: 15 },
    { key: "title", title: "작업 제목", width: 30 },
    { key: "equipmentName", title: "설비명", width: 20 },
    { key: "requestType", title: "요청 유형", width: 15, format: getRequestTypeLabel },
    { key: "status", title: "상태", width: 15, format: getStatusLabel },
    { key: "priority", title: "우선순위", width: 10, format: getPriorityLabel },
    { key: "requestedByName", title: "요청자", width: 15 },
    { key: "requestDate", title: "요청일", width: 15, format: (value) => new Date(value).toLocaleDateString("ko-KR") },
    { key: "estimatedCost", title: "예상비용", width: 15, format: (value) => (value ? `${Number(value).toLocaleString()}원` : "") },
  ];

  const importColumns = [
    { key: "title", title: "작업 제목", required: true, type: "string" as const },
    { key: "description", title: "작업 내용", required: true, type: "string" as const },
    { key: "equipmentId", title: "설비 ID", required: true, type: "string" as const },
    { key: "requestType", title: "요청 유형", required: true, type: "string" as const },
    { key: "priority", title: "우선순위", required: true, type: "string" as const },
    { key: "estimatedDuration", title: "예상 시간", type: "number" as const },
    { key: "estimatedCost", title: "예상 비용", type: "number" as const },
  ];

  const sampleData: Partial<MaintenanceRequest>[] = [
    { title: "샘플 보전작업", description: "샘플 작업 내용", equipmentId: "1", requestType: "breakdown", priority: "normal", estimatedDuration: 2, estimatedCost: 100000 },
  ];

  // ============================================
  // 렌더링
  // ============================================
  return (
    <>
      <div className="p-6">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t("request_management") || "보전작업 요청"}</h1>
          <p className="text-sm text-muted-foreground mt-1">보전작업 요청을 관리하고 승인/반려 처리합니다.</p>
        </div>

        {/* DataTable */}
        <DataTable
          data={requests}
          columns={columns}
          actions={actions}
          loading={loading}
          showSearch
          showFilter
          showColumnSettings
          showExport
          onExport={handleExport}
          searchPlaceholder="요청번호, 제목, 요청자로 검색..."
          onAdd={crud.handleAdd}
          addButtonText="작업 요청"
          pagination={{
            page,
            pageSize,
            total: requests.length,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>

      {/* 요청 폼 다이얼로그 */}
      <MaintenanceForm
        open={crud.formOpen}
        onOpenChange={crud.setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={crud.selectedItem ?? undefined}
        mode={crud.formMode}
      />

      {/* Import/Export 다이얼로그 */}
      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title="보전작업 요청"
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={requests}
        onImportComplete={handleImportComplete}
        exportOptions={{ filename: "maintenance-requests" }}
        sampleData={sampleData}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={crud.deleteDialogOpen} onOpenChange={crud.setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>작업 요청 삭제</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>"{crud.itemToDelete?.title}" 요청을 삭제하시겠습니까?<br />이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => crud.setDeleteDialogOpen(false)}>취소</Button>
              <Button variant="destructive" onClick={confirmDelete}>삭제</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 계획 수립 폼 */}
      <MaintenancePlanForm
        open={planFormOpen}
        onOpenChange={setPlanFormOpen}
        onSubmit={handlePlanFormSubmit}
        initialData={requestToPlan}
        mode="create"
        onCancel={() => setPlanFormOpen(false)}
      />
    </>
  );
}

export default MaintenanceRequestManagementV2;
