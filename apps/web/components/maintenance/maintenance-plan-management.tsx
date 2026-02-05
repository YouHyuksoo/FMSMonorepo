/**
 * @file apps/web/components/maintenance/maintenance-plan-management.tsx
 * @description 보전 작업 계획 관리 컴포넌트 - 표준 DataTable 형식
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 보전 작업 계획의 CRUD(생성/조회/수정/삭제) 및 배정 관리
 * 2. **사용 방법**: 작업 계획 목록 조회, 신규 계획 생성, 담당자 배정, 배정 취소 등
 * 3. **상태 관리**: useCrudState 훅을 사용하여 폼/삭제 다이얼로그 상태를 관리
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table";
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
import type {
  MaintenancePlan,
  MaintenanceRequest,
  MaintenanceWork,
} from "@fms/types";
import type { ExportColumn } from "@/lib/utils/export-utils";
import {
  useMaintenancePlans,
  useCreateMaintenancePlan,
  useUpdateMaintenancePlan,
  useDeleteMaintenancePlan,
} from "@/hooks/api/use-maintenance";

// Mock/API 모드 전환
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
import { Icon } from "@/components/ui/Icon";
import { MaintenancePlanForm } from "./maintenance-plan-form";
import { getTodayIsoDate } from "@fms/utils";
import { useTranslation } from "@/lib/language-context";

export function MaintenancePlanManagement() {
  const { t } = useTranslation("maintenance");

  // CRUD 상태 관리 훅
  const crud = useCrudState<MaintenancePlan>();

  // API 훅 (API 모드에서만 사용)
  const apiQuery = useMaintenancePlans(undefined, { enabled: !USE_MOCK_API });
  const createMutation = useCreateMaintenancePlan();
  const updateMutation = useUpdateMaintenancePlan();
  const deleteMutation = useDeleteMaintenancePlan();

  // Mock 모드용 상태
  const [mockPlanData, setMockPlanData] = useState<MaintenancePlan[]>([]);
  const [mockLoading, setMockLoading] = useState(USE_MOCK_API);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { toast } = useToast();

  const [sourceRequest, setSourceRequest] = useState<MaintenanceRequest | undefined>(undefined);

  // Mock 모드 데이터 로드
  useEffect(() => {
    if (USE_MOCK_API) {
      setMockLoading(true);
      setTimeout(() => {
        setMockPlanData([]);
        setMockLoading(false);
      }, 500);
    }
  }, []);

  // 통합 데이터 및 로딩 상태
  const plans = useMemo(() => {
    if (USE_MOCK_API) return mockPlanData;
    const data = apiQuery.data as any;
    return data?.items || data || [];
  }, [mockPlanData, apiQuery.data]);

  const loading = USE_MOCK_API ? mockLoading : apiQuery.isLoading;

  const handleNewPlan = (request?: MaintenanceRequest) => {
    if (request) {
      setSourceRequest(request);
    } else {
      setSourceRequest(undefined);
    }
    crud.handleAdd();
  };

  const handleAssign = (plan: MaintenancePlan) => {
    const assignedTo = "user6";
    const assignedToName = "강정비";
    const assignedTeam = "maintenance-team-1";
    const assignedTeamName = "정비1팀";
    const assignDate = new Date().toISOString();

    setMockPlanData((prev) =>
      prev.map((p) =>
        p.id === plan.id
          ? {
              ...p,
              status: "assigned",
              assignedTo,
              assignedToName,
              assignedTeam,
              assignedTeamName,
              assignDate,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    toast({
      title: "작업 배정됨",
      description: `"${plan.title}" 작업이 배정되었습니다. 작업 완료 처리 목록에서 해당 작업을 확인할 수 있습니다.`,
    });

    const newWorkOrder: Partial<MaintenanceWork> = {
      planId: plan.id,
      workNo: `W${Date.now().toString().slice(-6)}`,
      title: plan.title,
      description: plan.description,
      equipmentId: plan.equipmentId,
      equipmentName: plan.equipmentName,
      workType: plan.workType,
      priority: plan.priority,
      status: "pending",
      assignedTo,
      assignedToName,
      assignedTeam,
      assignedTeamName,
      assignDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log("Simulated New Work Order:", newWorkOrder);
  };

  const handleCancelAssignment = (plan: MaintenancePlan) => {
    setMockPlanData((prev) =>
      prev.map((p) =>
        p.id === plan.id
          ? {
              ...p,
              status: "planned",
              assignedTo: undefined,
              assignedToName: undefined,
              assignedTeam: undefined,
              assignedTeamName: undefined,
              assignDate: undefined,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    toast({
      title: "배정 취소됨",
      description: `"${plan.title}" 작업 배정이 취소되었습니다.`,
      variant: "default",
    });
  };

  const confirmDelete = async () => {
    if (!crud.itemToDelete) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMockPlanData((prev) =>
        prev.filter((plan) => plan.id !== crud.itemToDelete?.id)
      );
      toast({
        title: "삭제 완료",
        description: "작업 계획이 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "작업 계획 삭제에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      crud.setDeleteDialogOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "planned":
        return <Icon name="calendar_month" size="sm" />;
      case "assigned":
        return <Icon name="person_check" size="sm" />;
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
      planned: "계획됨",
      assigned: "배정됨",
      in_progress: "진행중",
      completed: "완료됨",
      cancelled: "취소됨",
      on_hold: "보류중",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "assigned":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "in_progress":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
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

  const getWorkTypeLabel = (type?: string) => {
    if (!type) return "일반";
    const labels: Record<string, string> = {
      repair: "수리",
      replace: "교체",
      inspect: "점검",
      calibrate: "교정",
      upgrade: "개선",
      general: "일반",
    };
    return labels[type] || type;
  };

  const columns: DataTableColumn<MaintenancePlan>[] = [
    {
      key: "planNo",
      title: t("planNo"),
      width: "150px",
      searchable: true,
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Icon name="calendar_month" size="sm" className="text-muted-foreground" />
          <span className="font-mono font-medium">{record.planNo}</span>
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
      key: "workType",
      title: t("workType"),
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "수리", value: "repair" },
        { label: "교체", value: "replace" },
        { label: "점검", value: "inspect" },
        { label: "교정", value: "calibrate" },
        { label: "개선", value: "upgrade" },
        { label: "일반", value: "general" },
      ],
      render: (_, record) => <Badge variant="outline">{t(record.workType || "")}</Badge>,
    },
    {
      key: "status",
      title: t("status"),
      width: "120px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "계획됨", value: "planned" },
        { label: "배정됨", value: "assigned" },
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
      key: "assignedToName",
      title: "담당자",
      width: "150px",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.assignedToName ? (
            <>
              <Icon name="group" size="sm" className="text-muted-foreground" />
              <div>
                <div className="font-medium">{record.assignedToName}</div>
                <div className="text-xs text-text-secondary">
                  {record.assignedTeamName}
                </div>
              </div>
            </>
          ) : (
             <span className="text-text-secondary">미배정</span>
          )}
        </div>
      ),
    },
    {
      key: "scheduledStartDate",
      title: "예정 시작일",
      width: "120px",
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-text-secondary">날짜 없음</span>;

        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return <span className="text-text-secondary">유효하지 않은 날짜</span>;
        }

        const isActuallyOverdue = date < new Date() && date.toISOString().split("T")[0] !== new Date().toISOString().split("T")[0];

        return (
          <span className={isActuallyOverdue ? "text-error font-medium" : ""}>
             {date.toLocaleDateString("ko-KR")}
          </span>
         );
      },
    },
    {
      key: "estimatedCost",
      title: "예상비용",
      width: "100px",
      align: "right",
      render: (_, record) => `${Number(record.estimatedCost ?? 0).toLocaleString()}원`,
    },
  ];

  const actions: DataTableAction<MaintenancePlan>[] = [
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
      hidden: (record) => record.status !== "planned",
    },
    {
      key: "assign",
      label: "작업 배정",
      iconName: "person_check",
      onClick: (record) => handleAssign(record),
      hidden: (record) => record.status !== "planned",
    },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => crud.handleDelete(record),
      hidden: (record) => record.status !== "planned",
    },
    {
      key: "cancelAssign",
      label: "배정 취소",
      iconName: "person_cancel",
      onClick: (record) => handleCancelAssignment(record),
      hidden: (record) => record.status !== "assigned",
    },
  ];

  const exportColumns: ExportColumn[] = [
    { key: "planNo", title: "계획번호", width: 15 },
    { key: "title", title: "작업 제목", width: 30 },
    { key: "equipmentName", title: "설비명", width: 20 },
    {
      key: "workType",
      title: "작업 유형",
      width: 15,
      format: (value) => getWorkTypeLabel(value as string),
    },
    {
      key: "status",
      title: "상태",
      width: 15,
      format: (value) => getStatusLabel(value as string),
    },
    {
      key: "priority",
      title: "우선순위",
      width: 10,
      format: (value) => getPriorityLabel(value as string),
    },
    { key: "assignedToName", title: "담당자", width: 15 },
    { key: "assignedTeamName", title: "담당팀", width: 15 },
    {
      key: "scheduledStartDate",
      title: "예정 시작일",
      width: 15,
      format: (value) =>
        value ? new Date(value as string).toLocaleDateString("ko-KR") : "",
    },
    {
      key: "scheduledEndDate",
      title: "예정 완료일",
      width: 15,
      format: (value) =>
        value ? new Date(value as string).toLocaleDateString("ko-KR") : "",
    },
    {
      key: "estimatedCost",
      title: "예상비용",
      width: 15,
      format: (value) => `${Number(value).toLocaleString()}원`,
    },
    { key: "description", title: "설명", width: 40 },
  ];

  const getFormInitialData = (): Partial<MaintenancePlan> => {
    if (crud.formMode === "create") {
      if (sourceRequest) {
        return {
          title: `[요청기반] ${sourceRequest.equipmentName} 작업`,
          equipmentId: sourceRequest.equipmentId,
          equipmentName: sourceRequest.equipmentName,
          description: sourceRequest.description,
          priority: sourceRequest.priority,
          workType: sourceRequest.workType || "general",
          requesterName: sourceRequest.requesterName,
          requestDate: sourceRequest.requestDate,
          status: "planned",
          scheduledStartDate: getTodayIsoDate(),
        };
      }
      return {
        priority: "normal",
        status: "planned",
        scheduledStartDate: getTodayIsoDate(),
        workType: "general",
      };
    }
    return crud.selectedItem || {};
  };

  const handlePlanFormSubmit = async (planData: Partial<MaintenancePlan>) => {
    setMockLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (crud.formMode === "create") {
        const newPlan: MaintenancePlan = {
          id: `MPLAN-${Date.now()}`,
          planNo: `P${Date.now().toString().slice(-6)}`,
          title: planData.title || "제목 없음",
          equipmentId: planData.equipmentId || "EQ-UNKNOWN",
          equipmentName: planData.equipmentName || "설비명 없음",
          workType: planData.workType || "general",
          status: "planned",
          priority: planData.priority || "normal",
          description: planData.description || "",
          scheduledStartDate: planData.scheduledStartDate || getTodayIsoDate(),
          estimatedDuration: planData.estimatedDuration || 0,
          estimatedCost: planData.estimatedCost || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          materials: planData.materials || [],
          procedures: planData.procedures || [],
          ...planData,
        };
        setMockPlanData((prev) => [newPlan, ...prev]);
        toast({ title: "성공", description: "새 작업 계획이 등록되었습니다." });

        if (sourceRequest) {
          toast({
            title: "정보",
            description: `작업 요청 ${sourceRequest.requestNo}의 상태를 '계획됨'으로 업데이트해야 합니다. (실제 시스템 구현 필요)`,
            variant: "default",
          });
        }
      } else if (
        crud.formMode === "edit" &&
        crud.selectedItem &&
        crud.selectedItem.id
      ) {
        const updatedPlan = {
          ...crud.selectedItem,
          ...planData,
          updatedAt: new Date().toISOString(),
        } as MaintenancePlan;
        setMockPlanData((prev) =>
          prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
        );
        toast({ title: "성공", description: "작업 계획이 수정되었습니다." });
      }
      crud.setFormOpen(false);
      setSourceRequest(undefined);
    } catch (error) {
      toast({
        title: "오류",
        description: "작업 계획 처리에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setMockLoading(false);
    }
  };

  const handleExport = () => {
    const headers = exportColumns.map((c) => c.title).join(",");
    const rows = plans.map((item: MaintenancePlan) =>
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

    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "maintenance-plans.csv";
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "다운로드 완료", description: "작업 계획 목록이 다운로드되었습니다." });
  };

  return (
    <>
      <div className="p-6">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text dark:text-white">
            작업계획 배정 관리
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            작업 계획을 수립하고 담당자를 배정합니다.
          </p>
        </div>

        {/* DataTable */}
        <DataTable
          data={plans}
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
          searchPlaceholder={t("master.search_placeholder") || "계획번호, 제목, 설비명으로 검색..."}
          onAdd={() => handleNewPlan()}
          addButtonText="신규 계획"
          pagination={{
            page: currentPage,
            pageSize,
            total: plans.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>

      {/* 가져오기/내보내기 다이얼로그 */}
      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title="작업계획 배정"
        exportColumns={exportColumns}
        importColumns={[]}
        exportData={plans}
        onImportComplete={async () => {}}
        exportOptions={{ filename: "maintenance-plans" }}
        sampleData={[]}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={crud.deleteDialogOpen} onOpenChange={crud.setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>작업 계획 삭제</DialogTitle>
            <DialogDescription>
              "{crud.itemToDelete?.title}" 계획을 삭제하시겠습니까?
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

      {/* 계획 폼 다이얼로그 */}
      <Dialog open={crud.formOpen} onOpenChange={(open) => {
        crud.setFormOpen(open);
        if (!open) {
          setSourceRequest(undefined);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {crud.formMode === "create" ? "신규 작업 계획" :
               crud.formMode === "edit" ? "작업 계획 수정" :
               "작업 계획 상세"}
            </DialogTitle>
          </DialogHeader>
          {crud.formOpen && (
            <MaintenancePlanForm
              initialData={getFormInitialData()}
              onSubmit={handlePlanFormSubmit}
              onCancel={() => {
                crud.setFormOpen(false);
                setSourceRequest(undefined);
              }}
              mode={crud.formMode}
              open={crud.formOpen}
              onOpenChange={(open) => {
                crud.setFormOpen(open);
                if (!open) {
                  setSourceRequest(undefined);
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
