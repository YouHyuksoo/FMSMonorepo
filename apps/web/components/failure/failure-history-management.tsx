/**
 * @file apps/web/components/failure/failure-history-management.tsx
 * @description 고장 이력 관리 컴포넌트 - 표준 DataTable 형식
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 고장 이력을 테이블 형태로 조회
 * 2. **사용 방법**: /failure/history 페이지에서 사용
 * 3. **상태 관리**: useCrudState 훅을 사용하여 가져오기/내보내기 다이얼로그 상태 관리
 * 4. **데이터 흐름**: mockFailures -> DataTable 표시
 */

"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { ImportExportDialog } from "@/components/common/import-export-dialog";
import { Badge } from "@fms/ui/badge";
import { Button } from "@fms/ui/button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/hooks/use-toast";
import { useCrudState } from "@/hooks/use-crud-state";
import {
  type Failure,
  FailureStatus,
  FailurePriority,
  FailureType,
} from "@fms/types";

export function FailureHistoryManagement() {
  const [failures, setFailures] = useState<Failure[]>([]);
  const { toast } = useToast();

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // useCrudState 훅으로 가져오기/내보내기 상태 관리
  const crud = useCrudState<Failure>();

  const getStatusBadge = (status: FailureStatus) => {
    const statusConfig = {
      [FailureStatus.REPORTED]: {
        label: "접수됨",
        variant: "secondary" as const,
      },
      [FailureStatus.DIAGNOSED]: {
        label: "진단중",
        variant: "default" as const,
      },
      [FailureStatus.IN_REPAIR]: {
        label: "수리중",
        variant: "destructive" as const,
      },
      [FailureStatus.COMPLETED]: {
        label: "완료됨",
        variant: "default" as const,
      },
    };
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: FailurePriority) => {
    const priorityConfig = {
      [FailurePriority.EMERGENCY]: {
        label: "긴급",
        variant: "destructive" as const,
      },
      [FailurePriority.HIGH]: {
        label: "높음",
        variant: "destructive" as const,
      },
      [FailurePriority.MEDIUM]: {
        label: "보통",
        variant: "secondary" as const,
      },
      [FailurePriority.LOW]: { label: "낮음", variant: "outline" as const },
    };
    const config = priorityConfig[priority];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: DataTableColumn<Failure>[] = [
    {
      key: "title",
      title: "고장 제목",
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
      key: "type",
      title: "고장 유형",
      width: "120px",
      align: "center",
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "priority",
      title: "우선순위",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "긴급", value: FailurePriority.EMERGENCY },
        { label: "높음", value: FailurePriority.HIGH },
        { label: "보통", value: FailurePriority.MEDIUM },
        { label: "낮음", value: FailurePriority.LOW },
      ],
      render: (_, record) => getPriorityBadge(record.priority),
    },
    {
      key: "status",
      title: "상태",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "접수됨", value: FailureStatus.REPORTED },
        { label: "진단중", value: FailureStatus.DIAGNOSED },
        { label: "수리중", value: FailureStatus.IN_REPAIR },
        { label: "완료됨", value: FailureStatus.COMPLETED },
      ],
      render: (_, record) => getStatusBadge(record.status),
    },
    {
      key: "downtimeHours",
      title: "정지시간",
      width: "100px",
      align: "right",
      render: (value) => `${value}h`,
    },
    {
      key: "actualCost",
      title: "수리비용",
      width: "120px",
      align: "right",
      render: (value) => `₩${value?.toLocaleString() || 0}`,
    },
    {
      key: "reportedAt",
      title: "신고일시",
      width: "150px",
      sortable: true,
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      key: "completedAt",
      title: "완료일시",
      width: "150px",
      render: (value) => value ? new Date(value).toLocaleString() : "-",
    },
  ];

  const exportColumns = [
    { key: "title", title: "고장 제목", width: 20 },
    { key: "equipmentName", title: "설비명", width: 15 },
    { key: "type", title: "고장 유형", width: 12 },
    { key: "priority", title: "우선순위", width: 10 },
    { key: "status", title: "상태", width: 10 },
    { key: "downtimeHours", title: "정지시간", width: 10 },
    { key: "actualCost", title: "수리비용", width: 12 },
    { key: "reportedAt", title: "신고일시", width: 15 },
    { key: "completedAt", title: "완료일시", width: 15 },
  ];

  const importColumns = [
    { key: "title", title: "고장 제목", required: true },
    { key: "equipmentName", title: "설비명", required: true },
    { key: "type", title: "고장 유형", required: true },
    { key: "priority", title: "우선순위", required: true },
    { key: "downtimeHours", title: "정지시간", required: false },
    { key: "actualCost", title: "수리비용", required: false },
  ];

  const handleImportComplete = async (data: Partial<Failure>[]) => {
    toast({
      title: "가져오기 완료",
      description: `${data.length}개의 고장 이력을 가져왔습니다.`,
    });
  };

  const handleExport = () => {
    // CSV 형식으로 변환
    const headers = exportColumns.map((c) => c.title).join(",");
    const rows = failures.map((item) =>
      exportColumns.map((c) => {
        const value = (item as any)[c.key];
        if (typeof value === "string" && (value.includes(",") || value.includes("\n"))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      }).join(",")
    );
    const csv = [headers, ...rows].join("\n");

    // BOM 추가 (한글 깨짐 방지)
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "failure-history.csv";
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "다운로드 완료", description: "고장 이력이 다운로드되었습니다." });
  };

  const sampleData: Partial<Failure>[] = [
    {
      title: "펌프 고장",
      equipmentName: "펌프 #1",
      type: FailureType.MECHANICAL,
      priority: FailurePriority.HIGH,
      downtimeHours: 4,
      actualCost: 500000,
      status: FailureStatus.COMPLETED,
      reportedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
  ];

  // 헤더 우측 버튼 영역
  const HeaderRight = () => (
    <Button onClick={() => crud.setImportExportOpen(true)} variant="outline">
      <Icon name="upload_file" size="sm" className="mr-2" />
      가져오기/내보내기
    </Button>
  );

  return (
    <>
      <div className="p-6">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text dark:text-white">
            고장 이력 관리
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            설비 고장 이력을 조회하고 분석합니다.
          </p>
        </div>

        {/* DataTable */}
        <DataTable
          data={failures}
          columns={columns}
          loading={false}
          showSearch
          showFilter
          showColumnSettings
          showExport
          onExport={handleExport}
          searchPlaceholder="고장 제목, 설비명으로 검색..."
          pagination={{
            page: currentPage,
            pageSize,
            total: failures.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>

      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title="고장 이력"
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={failures}
        onImportComplete={handleImportComplete}
        sampleData={sampleData}
      />
    </>
  );
}
