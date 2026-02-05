/**
 * @file apps/web/components/maintenance/maintenance-request-management.tsx
 * @description 유지보수 요청 관리 컴포넌트 - 표준 DataTable 형식
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 보전작업 요청의 CRUD 관리 (생성, 조회, 수정, 삭제)
 * 2. **사용 방법**: useCrudState 훅으로 상태 관리 단순화
 * 3. **상태 관리**: crud.formOpen, crud.selectedItem 등으로 통합 접근
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
  DialogDescription,
  DialogFooter,
} from "@fms/ui/dialog";
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

// Mock/API 모드 전환
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
import { Icon } from "@/components/ui/Icon";
import { useTranslation } from "@/lib/language-context";

export function MaintenanceRequestManagement() {
  const { t } = useTranslation("maintenance");

  // API 훅 (API 모드에서만 사용)
  const apiQuery = useMaintenanceRequests(undefined, { enabled: !USE_MOCK_API });
  const createMutation = useCreateMaintenanceRequest();
  const updateMutation = useUpdateMaintenanceRequest();
  const deleteMutation = useDeleteMaintenanceRequest();

  // Mock 모드용 상태
  const [mockRequestData, setMockRequestData] = useState<MaintenanceRequest[]>([]);
  const [mockLoading, setMockLoading] = useState(USE_MOCK_API);

  // CRUD 상태 관리 (useCrudState 훅 사용)
  const crud = useCrudState<MaintenanceRequest>();

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { toast } = useToast();

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

  const handleApprove = async (request: MaintenanceRequest) => {
    try {
      if (USE_MOCK_API) {
        setMockRequestData((prev) =>
          prev.map((req) =>
            req.id === request.id
              ? {
                  ...req,
                  status: "approved",
                  approvedBy: "current-user",
                  approvedByName: "현재사용자",
                  approvalDate: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : req
          )
        );
      } else {
        await updateMutation.mutateAsync({
          id: request.id,
          data: { status: "approved" } as any,
        });
      }
      toast({
        title: "승인 완료",
        description: `"${request.title}" 요청이 승인되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "승인 처리에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (request: MaintenanceRequest) => {
    try {
      if (USE_MOCK_API) {
        setMockRequestData((prev) =>
          prev.map((req) =>
            req.id === request.id
              ? {
                  ...req,
                  status: "rejected",
                  updatedAt: new Date().toISOString(),
                }
              : req
          )
        );
      } else {
        await updateMutation.mutateAsync({
          id: request.id,
          data: { status: "rejected" } as any,
        });
      }
      toast({
        title: "반려 완료",
        description: `"${request.title}" 요청이 반려되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "반려 처리에 실패했습니다.",
        variant: "destructive",
      });
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

      const newPlan = {
        ...data,
        id: `MPLAN-${Date.now()}`,
        planNo: `P${Date.now().toString().slice(-6)}`,
        requestId: requestToPlan.id,
        equipmentCode: requestToPlan.equipmentCode,
        equipmentName: requestToPlan.equipmentName,
        status: "planned",
        planDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "current-user",
      };

      console.log("신규 작업 계획 생성 (요청 기반):", newPlan);

      setMockRequestData((prev) =>
        prev.map((req) =>
          req.id === requestToPlan.id
            ? {
                ...req,
                status: "planned",
                updatedAt: new Date().toISOString(),
              }
            : req
        )
      );

      toast({
        title: "계획 수립 완료",
        description: `"${data.title}" 작업 계획이 생성되었습니다. '작업계획 배정' 메뉴에서 확인하세요.`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "작업 계획 수립에 실패했습니다.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (!crud.itemToDelete) return;

    try {
      if (USE_MOCK_API) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMockRequestData((prev) =>
          prev.filter((req) => req.id !== crud.itemToDelete!.id)
        );
      } else {
        await deleteMutation.mutateAsync(crud.itemToDelete.id);
      }
      toast({
        title: "삭제 완료",
        description: "작업 요청이 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "작업 요청 삭제에 실패했습니다.",
        variant: "destructive",
      });
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
            requestNo: `REQ-${new Date().getFullYear()}-${String(
              requests.length + 1
            ).padStart(3, "0")}`,
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
        toast({
          title: "등록 완료",
          description: "보전작업 요청이 등록되었습니다.",
        });
      } else if (crud.formMode === "edit") {
        if (USE_MOCK_API) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setMockRequestData((prev) =>
            prev.map((req) =>
              req.id === crud.selectedItem?.id
                ? {
                    ...req,
                    ...data,
                    updatedAt: new Date().toISOString(),
                    updatedBy: "current-user",
                  }
                : req
            )
          );
        } else {
          await updateMutation.mutateAsync({
            id: crud.selectedItem!.id,
            data,
          });
        }
        toast({
          title: "수정 완료",
          description: "작업 요청이 수정되었습니다.",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: `작업 요청 ${
          crud.formMode === "create" ? "등록" : "수정"
        }에 실패했습니다.`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleImportComplete = async (importedData: MaintenanceRequest[]) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMockRequestData((prev) => [...prev, ...importedData]);
      toast({
        title: "가져오기 완료",
        description: `${importedData.length}개의 작업 요청이 가져오기 되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "데이터 가져오기에 실패했습니다.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "requested":
        return <Icon name="schedule" size="sm" />;
      case "approved":
        return <Icon name="check_circle" size="sm" />;
      case "rejected":
        return <Icon name="cancel" size="sm" />;
      case "planned":
        return <Icon name="calendar_month" size="sm" />;
      case "in_progress":
        return <Icon name="settings" size="sm" />;
      case "completed":
        return <Icon name="check_circle" size="sm" />;
      default:
        return <Icon name="schedule" size="sm" />;
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "planned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "normal":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
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

  const columns: DataTableColumn<MaintenanceRequest>[] = [
    {
      key: "requestNo",
      title: t("requestNo"),
      width: "150px",
      searchable: true,
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Icon name="settings" size="sm" className="text-muted-foreground" />
          <span className="font-mono font-medium">{record.requestNo}</span>
        </div>
      ),
    },
    {
      key: "title",
      title: t("workTitle"),
      width: "minmax(200px, 1fr)",
      searchable: true,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.title}</div>
          <div className="text-sm text-text-secondary">
            {record.equipmentName}
          </div>
        </div>
      ),
    },
    {
      key: "requestType",
      title: t("requestType"),
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "고장수리", value: "breakdown" },
        { label: "예방정비", value: "preventive" },
        { label: "개선작업", value: "improvement" },
        { label: "비상수리", value: "emergency" },
      ],
      render: (_, record) => <Badge variant="outline">{t(record.requestType || "")}</Badge>,
    },
    {
      key: "status",
      title: t("status"),
      width: "120px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "요청됨", value: "requested" },
        { label: "승인됨", value: "approved" },
        { label: "반려됨", value: "rejected" },
        { label: "계획됨", value: "planned" },
        { label: "진행중", value: "in_progress" },
        { label: "완료됨", value: "completed" },
      ],
      render: (_, record) => (
        <div className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(record.status)}`}>
           {getStatusIcon(record.status)}
           {t(record.status)}
        </div>
      ),
    },
    {
      key: "priority",
      title: "우선순위",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "긴급", value: "critical" },
        { label: "높음", value: "high" },
        { label: "보통", value: "normal" },
        { label: "낮음", value: "low" },
      ],
      render: (_, record) => (
        <div className={`px-2 py-1 rounded-full text-xs font-medium text-center ${getPriorityColor(record.priority)}`}>
          {getPriorityLabel(record.priority)}
        </div>
      ),
    },
    {
      key: "requestedByName",
      title: "요청자",
      width: "150px",
      render: (_, record) => (
        <div>
           <div className="font-medium">{record.requestedByName}</div>
           <div className="text-xs text-text-secondary">
             {new Date(record.requestDate).toLocaleDateString("ko-KR")}
           </div>
        </div>
      ),
    },
    {
      key: "estimatedCost",
      title: "예상비용",
      width: "100px",
      align: "right",
      render: (_, record) => (record.estimatedCost ? `${Number(record.estimatedCost).toLocaleString()}원` : "-"),
    },
  ];

  // 커스텀 액션 (복잡한 조건부 버튼들)
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
      label: "계획 수립",
      iconName: "calendar_month",
      onClick: (record) => handleCreatePlan(record),
      hidden: (record) => record.status !== "approved",
    },
  ];

  const exportColumns: ExportColumn[] = [
    { key: "requestNo", title: "요청번호", width: 15 },
    { key: "title", title: "작업 제목", width: 30 },
    { key: "equipmentName", title: "설비명", width: 20 },
    {
      key: "requestType",
      title: "요청 유형",
      width: 15,
      format: (value) => getRequestTypeLabel(value),
    },
    {
      key: "status",
      title: "상태",
      width: 15,
      format: (value) => getStatusLabel(value),
    },
    {
      key: "priority",
      title: "우선순위",
      width: 10,
      format: (value) => getPriorityLabel(value),
    },
    { key: "requestedByName", title: "요청자", width: 15 },
    {
      key: "requestDate",
      title: "요청일",
      width: 15,
      format: (value) => new Date(value).toLocaleDateString("ko-KR"),
    },
    {
      key: "estimatedCost",
      title: "예상비용",
      width: 15,
      format: (value) => (value ? `${Number(value).toLocaleString()}원` : ""),
    },
    { key: "description", title: "설명", width: 40 },
  ];

  const importColumns = [
    {
      key: "title",
      title: "작업 제목",
      required: true,
      type: "string" as const,
    },
    {
      key: "description",
      title: "작업 내용",
      required: true,
      type: "string" as const,
    },
    {
      key: "equipmentId",
      title: "설비 ID",
      required: true,
      type: "string" as const,
    },
    {
      key: "requestType",
      title: "요청 유형",
      required: true,
      type: "string" as const,
    },
    {
      key: "priority",
      title: "우선순위",
      required: true,
      type: "string" as const,
    },
    { key: "estimatedDuration", title: "예상 시간", type: "number" as const },
    { key: "estimatedCost", title: "예상 비용", type: "number" as const },
  ];

  const sampleData: Partial<MaintenanceRequest>[] = [
    {
      title: "샘플 보전작업",
      description: "샘플 작업 내용",
      equipmentId: "1",
      requestType: "breakdown" as "breakdown",
      priority: "normal",
      estimatedDuration: 2,
      estimatedCost: 100000,
    },
  ];

  const handleExport = () => {
    // CSV 형식으로 변환
    const headers = exportColumns.map((c) => c.title).join(",");
    const rows = requests.map((item: MaintenanceRequest) =>
      exportColumns.map((c) => {
        const value = (item as any)[c.key];
        const formatted = c.format ? c.format(value) : value;
        if (typeof formatted === "string" && (formatted.includes(",") || formatted.includes("\n"))) {
          return `"${formatted.replace(/"/g, '""')}"`;
        }
        return formatted ?? "";
      }).join(",")
    );
    const csv = [headers, ...rows].join("\n");

    // BOM 추가 (한글 깨짐 방지)
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "maintenance-requests.csv";
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "다운로드 완료", description: "보전작업 요청 목록이 다운로드되었습니다." });
  };

  return (
    <>
      <div className="p-6">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text dark:text-white">
            보전작업 요청 관리
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            보전작업 요청을 등록하고 승인/반려 처리합니다.
          </p>
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
          showImport
          onExport={handleExport}
          onImport={() => crud.setImportExportOpen(true)}
          searchPlaceholder={t("master.search_placeholder") || "요청번호, 제목, 설비명으로 검색..."}
          onAdd={crud.handleAdd}
          addButtonText="작업 요청"
          pagination={{
            page: currentPage,
            pageSize,
            total: requests.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>

      {/* 요청 폼 */}
      <MaintenanceForm
        open={crud.formOpen}
        onOpenChange={crud.setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={crud.selectedItem ?? undefined}
        mode={crud.formMode}
      />

      {/* 가져오기/내보내기 다이얼로그 */}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>작업 요청 삭제</DialogTitle>
            <DialogDescription>
              "{crud.itemToDelete?.title}" 요청을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => crud.setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              삭제
            </Button>
          </DialogFooter>
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
