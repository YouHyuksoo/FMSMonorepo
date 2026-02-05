/**
 * @file apps/web/components/metering/meter-reading-management.tsx
 * @description 검침 데이터 관리 컴포넌트 - 표준 DataTable 형식
 */
"use client"

import { useState } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Icon } from "@/components/ui/Icon"
import { MeterReadingForm } from "./meter-reading-form"
import { ImportExportDialog } from "@/components/common/import-export-dialog"
import { type MeterReading } from "@fms/types"
import { useCrudState } from "@/hooks/use-crud-state"
import { useToast } from "@/hooks/use-toast"

// 상수 정의
const meterTypeLabels: Record<string, string> = {
  electricity: "전력",
  water: "수도",
  gas: "가스",
  heat: "난방",
  steam: "스팀",
}

const meterReadingStatusLabels: Record<string, string> = {
  pending: "대기중",
  completed: "완료",
  confirmed: "확인됨",
  rejected: "반려",
}

export function MeterReadingManagement() {
  const [readings, setReadings] = useState<MeterReading[]>([])
  const { toast } = useToast()

  // useCrudState 훅을 사용하여 CRUD 상태 관리
  const crud = useCrudState<MeterReading>()

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const handleSubmit = (data: Partial<MeterReading>) => {
    if (crud.selectedItem) {
      setReadings((prev) =>
        prev.map((reading) => (reading.id === crud.selectedItem!.id ? { ...reading, ...data } as MeterReading : reading)),
      )
      toast({ title: "수정 완료", description: "검침 데이터가 수정되었습니다." })
    } else {
      const newReading: MeterReading = {
        ...(data as MeterReading),
        id: `MR${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setReadings((prev) => [...prev, newReading])
      toast({ title: "등록 완료", description: "검침 데이터가 등록되었습니다." })
    }
    crud.resetForm()
  }

  const handleDeleteConfirm = (id: string) => {
    setReadings((prev) => prev.filter((reading) => reading.id !== id))
    toast({ title: "삭제 완료", description: "검침 데이터가 삭제되었습니다." })
  }

  const handleImportComplete = (data: MeterReading[]) => {
    setReadings(data)
    toast({ title: "가져오기 완료", description: `${data.length}개의 검침 데이터를 가져왔습니다.` })
  }

  const columns: DataTableColumn<MeterReading>[] = [
    {
      key: "equipmentName",
      title: "설비명",
      width: "minmax(150px, 1fr)",
      searchable: true,
      render: (_, record) => <span className="font-medium text-primary">{record.equipmentName || "-"}</span>,
    },
    {
      key: "meterType",
      title: "유형",
      width: "100px",
      filterable: true,
      filterOptions: Object.entries(meterTypeLabels).map(([value, label]) => ({ label, value })),
      render: (_, record) => meterTypeLabels[record.meterType] || record.meterType || "-",
    },
    {
      key: "readingDate",
      title: "검침일자",
      width: "120px",
      sortable: true,
      render: (_, record) => record.readingDate ? new Date(record.readingDate).toLocaleDateString() : "-",
    },
    {
      key: "consumption",
      title: "사용량",
      width: "120px",
      align: "right",
      sortable: true,
      render: (_, record) => <span className="font-medium">{record.consumption || 0} {record.unit || ""}</span>,
    },
    {
      key: "cost",
      title: "비용",
      width: "120px",
      align: "right",
      sortable: true,
      render: (_, record) => (record.cost ? <span className="text-primary font-medium">₩{record.cost.toLocaleString()}</span> : "-"),
    },
    {
      key: "readBy",
      title: "검침자",
      width: "120px",
      searchable: true,
      render: (_, record) => record.readBy || "-",
    },
    {
      key: "status",
      title: "상태",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: Object.entries(meterReadingStatusLabels).map(([value, label]) => ({ label, value })),
      render: (_, record) => (
        <Badge
          variant={
            record.status === "confirmed" ? "default" : record.status === "pending" ? "secondary" : "destructive"
          }
        >
          {meterReadingStatusLabels[record.status] || record.status || "-"}
        </Badge>
      ),
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<MeterReading>[] = [
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
        if (confirm("정말 이 검침 데이터를 삭제하시겠습니까?")) {
          handleDeleteConfirm(record.id)
        }
      },
    },
  ]

  const exportColumns = [
    { key: "equipmentName", title: "설비명" },
    { key: "meterType", title: "계측기 유형" },
    { key: "readingDate", title: "검침일자" },
    { key: "previousReading", title: "이전 검침값" },
    { key: "currentReading", title: "현재 검침값" },
    { key: "consumption", title: "사용량" },
    { key: "unit", title: "단위" },
    { key: "cost", title: "비용" },
    { key: "readBy", title: "검침자" },
    { key: "status", title: "상태" },
  ]

  const importColumns = [
    { key: "equipmentName", title: "설비명", required: true },
    { key: "meterType", title: "계측기 유형", required: true },
    { key: "readingDate", title: "검침일자", required: true },
    { key: "previousReading", title: "이전 검침값", required: true },
    { key: "currentReading", title: "현재 검침값", required: true },
    { key: "consumption", title: "사용량", required: false },
    { key: "unit", title: "단위", required: true },
    { key: "cost", title: "비용", required: false },
    { key: "readBy", title: "검침자", required: true },
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
        데이터 등록
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">검침 데이터 관리</h1>
        <p className="text-sm text-text-secondary mt-1">계측기 검침 데이터를 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={readings}
        columns={columns}
        actions={rowActions}
        loading={false}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="설비명, 검침자 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: readings.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <MeterReadingForm
        isOpen={crud.formOpen}
        onClose={() => crud.setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={crud.selectedItem}
      />

      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title="검침 데이터"
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={readings}
        onImportComplete={handleImportComplete}
        exportOptions={{ filename: "meter_readings" }}
        sampleData={[
          {
            equipmentName: "냉각기 #1",
            meterType: "electricity",
            readingDate: new Date().toISOString(),
            previousReading: 1000,
            currentReading: 1200,
            consumption: 200,
            unit: "kWh",
            cost: 20000,
            readBy: "홍길동",
            status: "confirmed",
          },
        ]}
      />
    </div>
  )
}
