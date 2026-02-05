/**
 * @file apps/web/components/maintenance/maintenance-complete-management.tsx
 * @description 작업완료 처리 관리 컴포넌트 - 표준 DataTable 형식
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 배정된 유지보수 작업의 상태를 관리하고 완료 처리하는 컴포넌트
 * 2. **사용 방법**: MaintenanceWork 데이터를 테이블로 표시하고, 작업 시작/완료/삭제 등의 액션 제공
 * 3. **상태 관리**: useCrudState 훅을 사용하여 CRUD 관련 UI 상태를 일관성 있게 관리
 */
"use client";

import { useState, useEffect } from "react";
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
import type { MaintenanceWork } from "@fms/types";
import { mockMaintenanceWorks } from "@/lib/mock-data/maintenance";
import type { ExportColumn } from "@/lib/utils/export-utils";
import { Icon } from "@/components/ui/Icon";

export function MaintenanceCompleteManagement() {
  const [works, setWorks] = useState<MaintenanceWork[]>([]);
  const [loading, setLoading] = useState(true);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { toast } = useToast();

  // useCrudState 훅으로 CRUD 관련 상태 관리
  const crud = useCrudState<MaintenanceWork>();

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setWorks(mockMaintenanceWorks);
    } catch (error) {
      toast({
        title: "오류",
        description: "작업 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (work: MaintenanceWork) => {
    crud.handleView(work);
    toast({
      title: "작업 상세",
      description: `${work.title}의 상세 정보를 조회합니다. (구현 필요)`,
    });
  };

  const handleEdit = (work: MaintenanceWork) => {
    crud.handleEdit(work);
    toast({
      title: "작업 수정",
      description: `${work.title}을 수정합니다. (구현 필요)`,
    });
  };

  const handleStart = (work: MaintenanceWork) => {
    setWorks((prev) =>
      prev.map((w) =>
        w.id === work.id
          ? {
              ...w,
              status: "in_progress",
              startDate: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : w
      )
    );
    toast({
      title: "작업 시작",
      description: `"${work.title}" 작업을 시작했습니다.`,
    });
  };

  const handleComplete = (work: MaintenanceWork) => {
    setWorks((prev) =>
      prev.map((w) =>
        w.id === work.id
          ? {
              ...w,
              status: "completed",
              endDate: new Date().toISOString(),
              actualDuration: w.actualDuration || 4,
              actualCost: w.actualCost || 0,
              updatedAt: new Date().toISOString(),
            }
          : w
      )
    );
    toast({
      description: `"${work.title}" 작업이 완료되었습니다.`,
    });
  };

  const handlePhotos = (work: MaintenanceWork) => {
    toast({
      title: "작업 사진",
      description: `${work.title}의 작업 사진을 관리합니다. (구현 필요)`,
    });
  };

  const handleReport = (work: MaintenanceWork) => {
    toast({
      title: "작업 보고서",
      description: `${work.title}의 작업 보고서를 생성합니다. (구현 필요)`,
    });
  };

  const confirmDelete = async () => {
    if (!crud.itemToDelete) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setWorks((prev) => prev.filter((work) => work.id !== crud.itemToDelete!.id));
      toast({
        title: "삭제 완료",
        description: "작업이 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "작업 삭제에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      crud.setDeleteDialogOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Icon name="hourglass_empty" size="sm" />;
      case "assigned":
        return <Icon name="group" size="sm" />;
      case "in_progress":
        return <Icon name="settings" size="sm" className="animate-spin-slow" />;
      case "completed":
        return <Icon name="check_circle" size="sm" />;
      case "on_hold":
        return <Icon name="schedule" size="sm" />;
      default:
        return <Icon name="schedule" size="sm" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "대기중",
      assigned: "배정됨",
      in_progress: "진행중",
      completed: "완료됨",
      on_hold: "보류중",
      cancelled: "취소됨",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "assigned":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "in_progress":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "on_hold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
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

  const getWorkTypeLabel = (type: string) => {
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

  const columns: DataTableColumn<MaintenanceWork>[] = [
    {
      key: "workNo",
      title: "작업번호",
      width: "150px",
      searchable: true,
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Icon name="settings" size="sm" className="text-muted-foreground" />
          <span className="font-mono font-medium">{record.workNo}</span>
        </div>
      ),
    },
    {
      key: "title",
      title: "작업 제목",
      width: "minmax(200px, 1fr)",
      searchable: true,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.title}</div>
          <div className="text-sm text-text-secondary">{record.equipmentName}</div>
        </div>
      ),
    },
    {
      key: "workType",
      title: "작업 유형",
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
      render: (_, record) => <Badge variant="outline">{getWorkTypeLabel(record.workType)}</Badge>,
    },
    {
      key: "status",
      title: "상태",
      width: "120px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "대기중", value: "pending" },
        { label: "진행중", value: "in_progress" },
        { label: "완료됨", value: "completed" },
        { label: "보류중", value: "on_hold" },
      ],
      render: (_, record) => (
        <div className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(record.status)}`}>
           {getStatusIcon(record.status)}
           {getStatusLabel(record.status)}
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
          <Icon name="group" size="sm" className="text-muted-foreground" />
          <div>
            <div className="font-medium">{record.assignedToName}</div>
            <div className="text-xs text-text-secondary">{record.assignedTeamName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "startDate",
      title: "시작일",
      width: "120px",
      align: "center",
      sortable: true,
      render: (_, record) => (record.startDate ? new Date(record.startDate).toLocaleDateString("ko-KR") : "-"),
    },
    {
      key: "actualDuration",
      title: "실제시간",
      width: "100px",
      align: "center",
      render: (_, record) => (record.actualDuration ? `${record.actualDuration}시간` : "-"),
    },
    {
      key: "actualCost",
      title: "실제비용",
      width: "120px",
      align: "right",
      render: (_, record) => (record.actualCost ? `${Number(record.actualCost).toLocaleString()}원` : "-"),
    },
  ];

  const actions: DataTableAction<MaintenanceWork>[] = [
    {
      key: "view",
      label: "상세보기",
      iconName: "visibility",
      onClick: (record) => handleView(record),
    },
    {
      key: "edit",
      label: "수정",
      iconName: "edit",
      onClick: (record) => handleEdit(record),
      hidden: (record) => ["pending", "cancelled", "completed"].includes(record.status),
    },
    {
      key: "start",
      label: "작업 시작",
      iconName: "play_arrow",
      onClick: (record) => handleStart(record),
      hidden: (record) => record.status !== "pending",
    },
    {
      key: "complete",
      label: "작업 완료",
      iconName: "check_circle",
      onClick: (record) => handleComplete(record),
      hidden: (record) => record.status !== "in_progress",
    },
    {
      key: "photos",
      label: "작업 사진",
      iconName: "photo_camera",
      onClick: (record) => handlePhotos(record),
      hidden: (record) => !["pending", "cancelled"].includes(record.status),
    },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => crud.handleDelete(record),
      hidden: (record) => !["pending", "cancelled"].includes(record.status),
    },
    {
      key: "report",
      label: "작업 보고서",
      iconName: "description",
      onClick: (record) => handleReport(record),
      hidden: (record) => record.status !== "completed",
    },
  ];

  const exportColumns: ExportColumn[] = [
    { key: "workNo", title: "작업번호", width: 15 },
    { key: "title", title: "작업 제목", width: 30 },
    { key: "equipmentName", title: "설비명", width: 20 },
    { key: "workType", title: "작업 유형", width: 15, format: (value) => getWorkTypeLabel(value as string) },
    { key: "status", title: "상태", width: 15, format: (value) => getStatusLabel(value as string) },
    { key: "priority", title: "우선순위", width: 10, format: (value) => getPriorityLabel(value as string) },
    { key: "assignedToName", title: "담당자", width: 15 },
    { key: "assignedTeamName", title: "담당팀", width: 15 },
    {
      key: "startDate",
      title: "시작일",
      width: 15,
      format: (value) => (value ? new Date(value as string).toLocaleDateString("ko-KR") : ""),
    },
    {
      key: "endDate",
      title: "완료일",
      width: 15,
      format: (value) => (value ? new Date(value as string).toLocaleDateString("ko-KR") : ""),
    },
    { key: "actualDuration", title: "실제시간", width: 10, format: (value) => (value ? `${value}시간` : "") },
    {
      key: "actualCost",
      title: "실제비용",
      width: 15,
      format: (value) => (value ? `${Number(value).toLocaleString()}원` : ""),
    },
    { key: "completionNotes", title: "완료 메모", width: 40 },
  ];

  const handleExport = () => {
    const headers = exportColumns.map((c) => c.title).join(",");
    const rows = works.map((item) =>
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
    link.download = "maintenance-works.csv";
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "다운로드 완료", description: "작업 완료 처리 목록이 다운로드되었습니다." });
  };

  return (
    <>
      <div className="p-6">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text dark:text-white">
            작업완료 처리
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            배정된 작업을 시작하고 완료 처리합니다.
          </p>
        </div>

        {/* DataTable */}
        <DataTable
          data={works}
          columns={columns}
          actions={actions}
          loading={loading}
          showSearch
          showFilter
          showColumnSettings
          showExport
          onExport={handleExport}
          searchPlaceholder="작업번호, 제목, 설비명으로 검색..."
          pagination={{
            page: currentPage,
            pageSize,
            total: works.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>

      {/* 가져오기/내보내기 다이얼로그 */}
      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title="작업완료 처리"
        exportColumns={exportColumns}
        importColumns={[]}
        exportData={works}
        onImportComplete={async () => {}}
        exportOptions={{ filename: "maintenance-works" }}
        sampleData={[]}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={crud.deleteDialogOpen} onOpenChange={crud.setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>작업 삭제</DialogTitle>
            <DialogDescription>
              "{crud.itemToDelete?.title}" 작업을 삭제하시겠습니까?
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
    </>
  );
}
