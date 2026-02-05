/**
 * @file apps/web/components/sensor/sensor-overview-management.tsx
 * @description 센서 개요 관리 컴포넌트 - 표준 DataTable 형식
 */
"use client"

import { useState } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Icon } from "@/components/ui/Icon"
import { ImportExportDialog } from "@/components/common/import-export-dialog"
import { mockSensors } from "@/lib/mock-data/sensor"
import { useTranslation } from "@/lib/language-context"
import { useCrudState } from "@/hooks/use-crud-state"
import { useToast } from "@/hooks/use-toast"
import type { Sensor } from "@fms/types"

// 상수 정의
const sensorTypeLabels: Record<string, string> = {
  temperature: "온도",
  humidity: "습도",
  vibration: "진동",
  power: "전력",
}

const sensorStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "정상", variant: "default" },
  warning: { label: "경고", variant: "secondary" },
  error: { label: "오류", variant: "destructive" },
  inactive: { label: "비활성", variant: "outline" },
}

export function SensorOverviewManagement() {
  const { t } = useTranslation("sensor")
  const [sensors, setSensors] = useState<Sensor[]>(mockSensors)
  const { toast } = useToast()

  // CRUD 상태 관리 훅 사용
  const crud = useCrudState<Sensor>()

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const columns: DataTableColumn<Sensor>[] = [
    {
      key: "id",
      title: "센서 ID",
      width: "120px",
      searchable: true,
      render: (_, record) => record.id,
    },
    {
      key: "name",
      title: "센서명",
      width: "150px",
      searchable: true,
      render: (_, record) => <span className="font-medium">{record.name}</span>,
    },
    {
      key: "type",
      title: "센서 유형",
      width: "100px",
      filterable: true,
      filterOptions: Object.entries(sensorTypeLabels).map(([value, label]) => ({ label, value })),
      render: (_, record) => sensorTypeLabels[record.type || ""] || record.type,
    },
    {
      key: "group",
      title: "그룹",
      width: "120px",
      searchable: true,
      render: (_, record) => record.group,
    },
    {
      key: "location",
      title: "위치",
      width: "150px",
      searchable: true,
      render: (_, record) => (
        <div className="flex items-center gap-1 text-text-secondary">
          <Icon name="location_on" size="sm" />
          {record.location}
        </div>
      ),
    },
    {
      key: "status",
      title: "상태",
      width: "90px",
      align: "center",
      filterable: true,
      filterOptions: Object.entries(sensorStatusLabels).map(([value, { label }]) => ({ label, value })),
      render: (_, record) => {
        const status = sensorStatusLabels[record.status || ""] || { label: record.status, variant: "outline" as const }
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    {
      key: "lastValue",
      title: "최근 측정값",
      width: "120px",
      align: "right",
      sortable: true,
      render: (_, record) => (
        <span className="font-semibold text-primary">
          {record.lastValue} {record.unit}
        </span>
      ),
    },
    {
      key: "lastUpdate",
      title: "최근 업데이트",
      width: "180px",
      sortable: true,
      render: (_, record) => {
        if (!record.lastUpdate) return "-"
        const date = new Date(record.lastUpdate)
        return date.toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      },
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<Sensor>[] = [
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
        if (confirm(`${record.name} 센서를 삭제하시겠습니까?`)) {
          setSensors(sensors.filter((s) => s.id !== record.id))
          toast({ title: "삭제 완료", description: "센서가 삭제되었습니다." })
        }
      },
    },
  ]

  const handleImportComplete = (data: Sensor[]) => {
    setSensors([...sensors, ...data])
    toast({ title: "가져오기 완료", description: `${data.length}개의 센서를 가져왔습니다.` })
  }

  const exportColumns = [
    { key: "id", title: "센서 ID" },
    { key: "name", title: "센서명" },
    { key: "type", title: "유형" },
    { key: "group", title: "그룹" },
    { key: "location", title: "위치" },
    { key: "status", title: "상태" },
    { key: "lastValue", title: "최근 측정값" },
    { key: "unit", title: "단위" },
  ]

  const importColumns = [
    { key: "name", title: "센서명", required: true },
    { key: "type", title: "유형", required: true },
    { key: "group", title: "그룹", required: true },
    { key: "location", title: "위치", required: true },
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
        센서 등록
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">센서 개요 관리</h1>
        <p className="text-sm text-text-secondary mt-1">센서 현황을 조회하고 관리합니다.</p>
      </div>

      <DataTable
        data={sensors}
        columns={columns}
        actions={rowActions}
        loading={false}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder={t("searchSensorName")}
        pagination={{
          page: currentPage,
          pageSize,
          total: sensors.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title="센서 데이터"
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={sensors}
        onImportComplete={handleImportComplete}
        exportOptions={{ filename: "sensors" }}
        sampleData={[
          {
            name: "온도센서 #1",
            type: "temperature",
            group: "1공장",
            location: "생산라인 A",
          },
        ]}
      />
    </div>
  )
}
