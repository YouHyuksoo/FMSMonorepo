/**
 * @file apps/web/components/metering/calibration-management.tsx
 * @description 계측기 검교정 관리 컴포넌트 - 표준 DataTable 형식
 */
"use client"

import { useState } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Icon } from "@/components/ui/Icon"
import { CalibrationForm } from "./calibration-form"
import { ImportExportDialog } from "@/components/common/import-export-dialog"
import { useCrudState } from "@/hooks/use-crud-state"
import { useToast } from "@/hooks/use-toast"
import { mockCalibrationRecords } from "@/lib/mock-data/metering"
import type { CalibrationRecord } from "@fms/types"
import { calibrationResultLabels, calibrationStatusLabels } from "@fms/types"

export function CalibrationManagement() {
  const [records, setRecords] = useState<CalibrationRecord[]>(mockCalibrationRecords)
  const { toast } = useToast()

  // CRUD 상태 관리 훅 사용
  const crud = useCrudState<CalibrationRecord>()

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const handleSubmit = (data: Partial<CalibrationRecord>) => {
    if (crud.selectedItem) {
      setRecords((prev) => prev.map((record) => (record.id === crud.selectedItem!.id ? { ...record, ...data } as CalibrationRecord : record)))
      toast({ title: "수정 완료", description: "검교정 기록이 수정되었습니다." })
    } else {
      const newRecord: CalibrationRecord = {
        ...(data as CalibrationRecord),
        id: `CAL${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setRecords((prev) => [...prev, newRecord])
      toast({ title: "등록 완료", description: "검교정 기록이 등록되었습니다." })
    }
    crud.resetForm()
  }

  const handleDeleteConfirm = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id))
    toast({ title: "삭제 완료", description: "검교정 기록이 삭제되었습니다." })
  }

  const handleImportComplete = (data: CalibrationRecord[]) => {
    setRecords(data)
    toast({ title: "가져오기 완료", description: `${data.length}개의 검교정 기록을 가져왔습니다.` })
  }

  const columns: DataTableColumn<CalibrationRecord>[] = [
    {
      key: "equipmentName",
      title: "설비명",
      width: "minmax(150px, 1fr)",
      searchable: true,
      render: (_, record) => <span className="font-medium text-primary">{record.equipmentName || "-"}</span>,
    },
    {
      key: "instrumentType",
      title: "계측기 유형",
      width: "120px",
      searchable: true,
      render: (_, record) => record.instrumentType || "-",
    },
    {
      key: "serialNumber",
      title: "시리얼 번호",
      width: "120px",
      searchable: true,
      render: (_, record) => record.serialNumber || "-",
    },
    {
      key: "calibrationDate",
      title: "교정일자",
      width: "120px",
      sortable: true,
      render: (_, record) => record.calibrationDate ? new Date(record.calibrationDate).toLocaleDateString() : "-",
    },
    {
      key: "nextCalibrationDate",
      title: "다음 교정일",
      width: "120px",
      sortable: true,
      render: (_, record) => record.nextCalibrationDate ? new Date(record.nextCalibrationDate).toLocaleDateString() : "-",
    },
    {
      key: "result",
      title: "교정 결과",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "합격", value: "pass" },
        { label: "조건부", value: "conditional" },
        { label: "불합격", value: "fail" },
      ],
      render: (_, record) => (
        <Badge
          variant={record.result === "pass" ? "default" : record.result === "conditional" ? "secondary" : "destructive"}
        >
          {calibrationResultLabels[record.result as keyof typeof calibrationResultLabels] || record.result || "-"}
        </Badge>
      ),
    },
    {
      key: "status",
      title: "상태",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "완료", value: "completed" },
        { label: "예정", value: "scheduled" },
        { label: "지연", value: "overdue" },
      ],
      render: (_, record) => (
        <Badge
          variant={
            record.status === "completed" ? "default" : record.status === "overdue" ? "destructive" : "secondary"
          }
        >
          {calibrationStatusLabels[record.status as keyof typeof calibrationStatusLabels] || record.status || "-"}
        </Badge>
      ),
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<CalibrationRecord>[] = [
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
      onClick: (record) => {
        if (confirm("이 검교정 기록을 삭제하시겠습니까?")) {
          handleDeleteConfirm(record.id)
        }
      },
    },
  ]

  const exportColumns = [
    { key: "equipmentName", title: "설비명" },
    { key: "instrumentType", title: "계측기 유형" },
    { key: "serialNumber", title: "시리얼 번호" },
    { key: "calibrationDate", title: "교정일자" },
    { key: "nextCalibrationDate", title: "다음 교정일자" },
    { key: "accuracy", title: "정확도" },
    { key: "result", title: "교정 결과" },
    { key: "calibratedBy", title: "교정자" },
    { key: "calibrationAgency", title: "교정 기관" },
    { key: "certificateNumber", title: "인증서 번호" },
    { key: "status", title: "상태" },
  ]

  const importColumns = [
    { key: "equipmentName", title: "설비명", required: true },
    { key: "instrumentType", title: "계측기 유형", required: true },
    { key: "serialNumber", title: "시리얼 번호", required: true },
    { key: "calibrationDate", title: "교정일자", required: true },
    { key: "nextCalibrationDate", title: "다음 교정일자", required: true },
    { key: "accuracy", title: "정확도", required: false },
    { key: "result", title: "교정 결과", required: true },
    { key: "calibratedBy", title: "교정자", required: true },
    { key: "calibrationAgency", title: "교정 기관", required: true },
    { key: "certificateNumber", title: "인증서 번호", required: false },
    { key: "status", title: "상태", required: true },
  ]

  // 헤더 우측 버튼
  const HeaderRight = () => (
    <div className="flex items-center gap-2">
      <Button onClick={() => crud.setImportExportOpen(true)} variant="outline">
        <Icon name="upload_file" size="sm" className="mr-2" />
        가져오기/내보내기
      </Button>
      <Button onClick={crud.handleAdd}>
        <Icon name="add" size="sm" className="mr-2" />
        등록하기
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">검교정 관리</h1>
        <p className="text-sm text-text-secondary mt-1">계측기 검교정 기록을 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={records}
        columns={columns}
        actions={rowActions}
        loading={false}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="설비명, 계측기 유형, 시리얼 번호 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: records.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <CalibrationForm
        isOpen={crud.formOpen}
        onClose={() => crud.setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={crud.selectedItem}
      />

      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title="검교정 데이터"
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={records}
        onImportComplete={handleImportComplete}
        exportOptions={{ filename: "calibration_records" }}
        sampleData={[
          {
            equipmentName: "압력계 #1",
            instrumentType: "압력계",
            serialNumber: "PC-001",
            calibrationDate: new Date().toISOString(),
            nextCalibrationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            accuracy: 0.01,
            result: "pass",
            calibratedBy: "김철수",
            calibrationAgency: "한국계측기술원",
            certificateNumber: "CERT-2023-001",
            status: "completed",
          },
        ]}
      />
    </div>
  )
}
