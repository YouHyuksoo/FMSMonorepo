/**
 * @file apps/web/components/failure/desktop-failure-register-management.tsx
 * @description 고장 등록 관리 컴포넌트 (데스크톱 버전)
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 고장 정보를 등록, 수정, 삭제, 조회하는 CRUD 관리 화면
 * 2. **사용 방법**: 이 컴포넌트는 고장 등록 페이지에서 사용됨
 * 3. **상태 관리**: useCrudState 훅을 사용하여 폼/삭제/Import-Export 상태를 통합 관리
 * 4. **AI 분석**: Copilot 기능으로 고장 원인 및 조치방안을 자동 분석
 */

"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table";
import { ImportExportDialog } from "@/components/common/import-export-dialog";
import { Badge } from "@fms/ui/badge";
import { Button } from "@fms/ui/button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/hooks/use-toast";
import { useCrudState } from "@/hooks/use-crud-state";
import {
  type Failure,
  FailureStatus,
  FailureType,
  FailurePriority,
} from "@fms/types";
import { mockFailures } from "@/lib/mock-data/failure";
import { mockEquipment } from "@/lib/mock-data/equipment";
import { FailureForm } from "./desktop-failure-form";
import { useTranslation } from "@/lib/language-context";

// 상태 배지 설정
const statusConfig: Record<FailureStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  [FailureStatus.REPORTED]: { label: "접수됨", variant: "secondary" },
  [FailureStatus.DIAGNOSED]: { label: "진단중", variant: "default" },
  [FailureStatus.IN_REPAIR]: { label: "수리중", variant: "destructive" },
  [FailureStatus.COMPLETED]: { label: "완료됨", variant: "default" },
};

// 우선순위 배지 설정
const priorityConfig: Record<FailurePriority, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  [FailurePriority.EMERGENCY]: { label: "긴급", variant: "destructive" },
  [FailurePriority.HIGH]: { label: "높음", variant: "destructive" },
  [FailurePriority.MEDIUM]: { label: "보통", variant: "secondary" },
  [FailurePriority.LOW]: { label: "낮음", variant: "outline" },
};

// 고장 유형 라벨
const failureTypeLabels: Record<string, string> = {
  [FailureType.MECHANICAL]: "기계적",
  [FailureType.ELECTRICAL]: "전기적",
  [FailureType.SOFTWARE]: "소프트웨어",
  [FailureType.HYDRAULIC]: "유압",
  [FailureType.PNEUMATIC]: "공압",
  [FailureType.OTHER]: "기타",
};

export function FailureRegisterManagement() {
  const { toast } = useToast();
  const { t } = useTranslation("common");

  // useCrudState 훅으로 CRUD 상태 관리
  const crud = useCrudState<Failure>();

  const [failures, setFailures] = useState<Failure[]>(
    mockFailures.map((f) => ({ ...f, attachments: f.attachments || [] }))
  );

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const handleDeleteConfirm = async (id: string) => {
    setFailures((prev) => prev.filter((failure) => failure.id !== id));
    toast({
      title: t("success"),
      description: "고장 정보가 삭제되었습니다.",
    });
  };

  const handleSave = (failureData: Partial<Failure>) => {
    if (crud.selectedItem) {
      // 수정 모드
      setFailures((prev) =>
        prev.map((failure) =>
          failure.id === crud.selectedItem!.id
            ? {
                ...failure,
                ...failureData,
                attachments: failureData.attachments || [],
                updatedAt: new Date().toISOString(),
              }
            : failure
        )
      );
      toast({
        title: "수정 완료",
        description: "고장 정보가 수정되었습니다.",
      });
    } else {
      // 생성 모드
      const newFailure: Failure = {
        id: `failure-${Date.now()}`,
        equipmentId: failureData.equipmentId || "",
        equipmentName: failureData.equipmentName || "",
        title: failureData.title || "",
        description: failureData.description || "",
        type: failureData.type || FailureType.MECHANICAL,
        priority: failureData.priority || FailurePriority.MEDIUM,
        status: FailureStatus.REPORTED,
        reportedAt: new Date().toISOString(),
        reporterName: failureData.reporterName || "",
        reporterContact: failureData.reporterContact || "",
        symptom: failureData.symptom || "",
        possibleCauses: failureData.possibleCauses || "",
        recommendedActions: failureData.recommendedActions || "",
        preventionMethods: failureData.preventionMethods || "",
        attachments: failureData.attachments || [],
        estimatedCost: failureData.estimatedCost || 0,
        actualCost: 0,
        downtimeHours: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFailures((prev) => [newFailure, ...prev]);
      toast({
        title: "등록 완료",
        description: "고장이 등록되었습니다.",
      });
    }
    crud.setFormOpen(false);
  };

  const generateCopilotDescription = async (failure: Failure) => {
    const description = `[AI 분석 결과]
설비: ${failure.equipmentName}
고장유형: ${failure.type}
증상: ${failure.symptom}

가능한 원인:
1. 부품 마모로 인한 성능 저하
2. 윤활유 부족 또는 오염
3. 과부하 운전으로 인한 손상

권장 조치:
1. 해당 부품 점검 및 교체
2. 윤활유 교체 및 보충
3. 운전 조건 재검토

예방 방법:
1. 정기적인 예방정비 실시
2. 운전 조건 모니터링 강화
3. 부품 교체 주기 단축`;

    const updatedFailure = {
      ...failure,
      possibleCauses: "부품 마모, 윤활유 부족, 과부하 운전",
      recommendedActions: "부품 교체, 윤활유 교체, 운전조건 재검토",
      preventionMethods: "정기 예방정비, 조건 모니터링, 교체주기 단축",
      copilotDescription: description,
      updatedAt: new Date().toISOString(),
    };
    setFailures((prev) =>
      prev.map((f) => (f.id === failure.id ? updatedFailure : f))
    );
    toast({
      title: "AI 분석 완료",
      description: "Copilot이 고장 원인과 조치방안을 분석했습니다.",
    });
  };

  // 컬럼 정의
  const columns: DataTableColumn<Failure>[] = [
    {
      key: "title",
      title: "고장 제목",
      width: "200px",
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
      filterable: true,
      filterOptions: Object.entries(failureTypeLabels).map(([value, label]) => ({ label, value })),
      render: (_, record) => (
        <Badge variant="outline">{failureTypeLabels[record.type] || record.type}</Badge>
      ),
    },
    {
      key: "priority",
      title: "우선순위",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: Object.entries(priorityConfig).map(([value, { label }]) => ({ label, value })),
      render: (_, record) => {
        const config = priorityConfig[record.priority] || { label: record.priority, variant: "outline" as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "status",
      title: "상태",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: Object.entries(statusConfig).map(([value, { label }]) => ({ label, value })),
      render: (_, record) => {
        const config = statusConfig[record.status] || { label: record.status, variant: "outline" as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "reporterName",
      title: "신고자",
      width: "100px",
      searchable: true,
      render: (_, record) => record.reporterName,
    },
    {
      key: "reportedAt",
      title: "신고일시",
      width: "150px",
      sortable: true,
      render: (_, record) => new Date(record.reportedAt).toLocaleString("ko-KR"),
    },
    {
      key: "attachments",
      title: "첨부",
      width: "80px",
      align: "center",
      render: (_, record) =>
        record.attachments && record.attachments.length > 0 ? (
          <Icon name="attach_file" size="sm" />
        ) : (
          "-"
        ),
    },
  ];

  // 행 액션 정의
  const rowActions: DataTableAction<Failure>[] = [
    {
      key: "ai",
      label: "AI 분석",
      iconName: "psychology",
      onClick: (record) => generateCopilotDescription(record),
    },
    {
      key: "edit",
      label: "수정",
      iconName: "edit",
      onClick: (record) => crud.handleEdit(record),
    },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => handleDeleteConfirm(record.id),
    },
  ];

  const exportColumns = [
    { key: "title", title: "고장 제목", width: 20 },
    { key: "equipmentName", title: "설비명", width: 15 },
    { key: "type", title: "고장 유형", width: 10 },
    { key: "priority", title: "우선순위", width: 10 },
    { key: "status", title: "상태", width: 10 },
    { key: "reporterName", title: "신고자", width: 10 },
    { key: "reportedAt", title: "신고일시", width: 15 },
    {
      key: "attachments",
      title: "첨부파일 수",
      width: 10,
      render: (attachments: string[]) => attachments?.length || 0,
    },
  ];

  const importColumns = [
    { key: "title", title: "고장 제목", required: true },
    { key: "equipmentName", title: "설비명", required: true },
    { key: "type", title: "고장 유형", required: true },
    { key: "priority", title: "우선순위", required: true },
    { key: "reporterName", title: "신고자", required: true },
    { key: "description", title: "설명" },
  ];

  const handleImportComplete = async (data: Partial<Failure>[]) => {
    const newFailures = data.map((item) => ({
      id: `failure-${Date.now()}-${Math.random()}`,
      equipmentId: "",
      equipmentName: item.equipmentName || "",
      title: item.title || "",
      description: item.description || "",
      type: (item.type as FailureType) || FailureType.MECHANICAL,
      priority: (item.priority as FailurePriority) || FailurePriority.MEDIUM,
      status: FailureStatus.REPORTED,
      reportedAt: new Date().toISOString(),
      reporterName: item.reporterName || "",
      reporterContact: "",
      symptom: "",
      possibleCauses: "",
      recommendedActions: "",
      preventionMethods: "",
      attachments: [],
      estimatedCost: 0,
      actualCost: 0,
      downtimeHours: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setFailures((prev) => [...newFailures, ...prev]);
    toast({
      title: "가져오기 완료",
      description: `${newFailures.length}개의 고장 정보를 가져왔습니다.`,
    });
  };

  const sampleData: Partial<Failure>[] = [
    {
      title: "컨베이어 벨트 이상",
      equipmentName: "컨베이어 #1",
      type: FailureType.MECHANICAL,
      priority: FailurePriority.HIGH,
      reporterName: "김작업자",
      description: "벨트가 미끄러짐",
    },
  ];

  // 헤더 우측 버튼
  const HeaderRight = () => (
    <div className="flex items-center gap-2">
      <Button onClick={() => crud.setImportExportOpen(true)} variant="outline">
        <Icon name="upload_file" size="sm" className="mr-2" />
        가져오기/내보내기
      </Button>
      <Button onClick={crud.handleAdd}>
        <Icon name="add" size="sm" className="mr-2" />
        고장 등록
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">고장 등록 관리</h1>
        <p className="text-sm text-text-secondary mt-1">고장 정보를 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={failures}
        columns={columns}
        actions={rowActions}
        loading={false}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="고장 제목, 설비명, 신고자로 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: failures.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <FailureForm
        open={crud.formOpen}
        onOpenChange={crud.setFormOpen}
        failure={crud.selectedItem}
        onSave={handleSave}
        equipmentOptions={mockEquipment}
      />

      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title="고장 정보"
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={failures}
        onImportComplete={handleImportComplete}
        sampleData={sampleData}
      />
    </div>
  );
}
