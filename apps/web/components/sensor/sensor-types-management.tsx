/**
 * @file apps/web/components/sensor/sensor-types-management.tsx
 * @description 센서 유형 관리 컴포넌트 - 표준 DataTable 형식
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 시스템에서 사용되는 센서 유형을 관리하는 컴포넌트
 * 2. **사용 방법**: SensorTypesManagement 컴포넌트를 페이지에 배치
 * 3. **기능**: 유형 목록 조회, 검색, 추가, 수정, 삭제
 */
"use client"

import { useState } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Icon } from "@/components/ui/Icon"
import { useCrudState } from "@/hooks/use-crud-state"
import { useToast } from "@/hooks/use-toast"

interface SensorType {
  id: number
  name: string
  type: string
  unit: string
  description: string
  count: number
}

const mockSensorTypes: SensorType[] = [
  { id: 1, name: "Temperature", type: "temperature", unit: "°C", description: "온도 측정 센서", count: 15 },
  { id: 2, name: "Humidity", type: "humidity", unit: "%", description: "습도 측정 센서", count: 12 },
  { id: 3, name: "Pressure", type: "pressure", unit: "kPa", description: "압력 측정 센서", count: 8 },
  { id: 4, name: "Vibration", type: "vibration", unit: "mm/s²", description: "진동 측정 센서", count: 10 },
  { id: 5, name: "Current", type: "current", unit: "A", description: "전류 측정 센서", count: 5 },
  { id: 6, name: "Voltage", type: "voltage", unit: "V", description: "전압 측정 센서", count: 5 },
  { id: 7, name: "Power", type: "power", unit: "kW", description: "전력 측정 센서", count: 5 },
]

/** 센서 유형에 따른 아이콘 컴포넌트 */
const SensorTypeIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case "temperature":
      return <Icon name="thermostat" size="sm" className="text-red-500" />
    case "humidity":
      return <Icon name="water_drop" size="sm" className="text-blue-500" />
    case "pressure":
      return <Icon name="speed" size="sm" className="text-purple-500" />
    case "current":
    case "voltage":
    case "power":
      return <Icon name="bolt" size="sm" className="text-yellow-500" />
    case "vibration":
      return <Icon name="cell_tower" size="sm" className="text-green-500" />
    case "wifi":
      return <Icon name="wifi" size="sm" className="text-indigo-500" />
    default:
      return <Icon name="hard_drive" size="sm" className="text-gray-500" />
  }
}

/** 센서 유형에 따른 배지 색상 */
const getBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    temperature: "destructive",
    humidity: "default",
    pressure: "secondary",
    current: "outline",
    voltage: "outline",
    power: "outline",
    vibration: "default",
    wifi: "secondary",
  }
  return variants[type.toLowerCase()] || "outline"
}

export function SensorTypesManagement() {
  const [sensorTypes, setSensorTypes] = useState<SensorType[]>(mockSensorTypes)
  const { toast } = useToast()

  // CRUD 상태 관리 훅 사용
  const crud = useCrudState<SensorType>()

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const columns: DataTableColumn<SensorType>[] = [
    {
      key: "type",
      title: "유형",
      width: "150px",
      filterable: true,
      filterOptions: [
        { label: "온도", value: "temperature" },
        { label: "습도", value: "humidity" },
        { label: "압력", value: "pressure" },
        { label: "진동", value: "vibration" },
        { label: "전류", value: "current" },
        { label: "전압", value: "voltage" },
        { label: "전력", value: "power" },
      ],
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <SensorTypeIcon type={record.type} />
          <Badge variant={getBadgeVariant(record.type)}>{record.type}</Badge>
        </div>
      ),
    },
    {
      key: "name",
      title: "이름",
      width: "minmax(150px, 1fr)",
      searchable: true,
      render: (_, record) => record.name,
    },
    {
      key: "unit",
      title: "단위",
      width: "80px",
      align: "center",
      render: (_, record) => record.unit,
    },
    {
      key: "description",
      title: "설명",
      width: "minmax(200px, 1fr)",
      searchable: true,
      render: (_, record) => record.description,
    },
    {
      key: "count",
      title: "센서 수",
      width: "100px",
      align: "right",
      sortable: true,
      render: (_, record) => <Badge variant="secondary">{record.count}개</Badge>,
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<SensorType>[] = [
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
        if (confirm(`${record.name} 유형을 삭제하시겠습니까?`)) {
          setSensorTypes(sensorTypes.filter((t) => t.id !== record.id))
          toast({ title: "삭제 완료", description: "센서 유형이 삭제되었습니다." })
        }
      },
    },
  ]

  // 헤더 우측 버튼
  const HeaderRight = () => (
    <div className="flex items-center gap-2">
      <Button onClick={crud.handleAdd}>
        <Icon name="add" size="sm" className="mr-2" />
        유형 추가
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">센서 유형 관리</h1>
        <p className="text-sm text-text-secondary mt-1">센서 유형을 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={sensorTypes}
        columns={columns}
        actions={rowActions}
        loading={false}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="유형명, 설명으로 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: sensorTypes.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  )
}
