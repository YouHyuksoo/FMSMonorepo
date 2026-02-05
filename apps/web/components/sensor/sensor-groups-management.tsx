/**
 * @file apps/web/components/sensor/sensor-groups-management.tsx
 * @description 센서 그룹 관리 컴포넌트 - 표준 DataTable 형식
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 센서 그룹을 관리하는 컴포넌트
 * 2. **사용 방법**: SensorGroupsManagement 컴포넌트를 페이지에 배치
 * 3. **기능**: 그룹 목록 조회, 검색, 추가, 수정, 삭제
 */
"use client"

import { useState } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Icon } from "@/components/ui/Icon"
import { useCrudState } from "@/hooks/use-crud-state"
import { useToast } from "@/hooks/use-toast"

interface SensorGroup {
  id: number
  name: string
  description: string
  sensorCount: number
}

const mockGroups: SensorGroup[] = [
  { id: 1, name: "1공장", description: "1공장 생산라인", sensorCount: 24 },
  { id: 2, name: "2공장", description: "2공장 생산라인", sensorCount: 18 },
  { id: 3, name: "창고", description: "창고 환경 모니터링", sensorCount: 8 },
  { id: 4, name: "사무실", description: "사무실 환경 모니터링", sensorCount: 5 },
]

export function SensorGroupsManagement() {
  const [groups, setGroups] = useState<SensorGroup[]>(mockGroups)
  const { toast } = useToast()

  // CRUD 상태 관리 훅 사용
  const crud = useCrudState<SensorGroup>()

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const columns: DataTableColumn<SensorGroup>[] = [
    {
      key: "name",
      title: "그룹명",
      width: "minmax(150px, 1fr)",
      searchable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Icon name="folder" size="sm" className="text-primary" />
          <span className="font-medium">{record.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      title: "설명",
      width: "minmax(200px, 1fr)",
      searchable: true,
      render: (_, record) => record.description,
    },
    {
      key: "sensorCount",
      title: "센서 수",
      width: "100px",
      align: "right",
      sortable: true,
      render: (_, record) => <Badge variant="secondary">{record.sensorCount}개</Badge>,
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<SensorGroup>[] = [
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
        if (confirm(`${record.name} 그룹을 삭제하시겠습니까?`)) {
          setGroups(groups.filter((g) => g.id !== record.id))
          toast({ title: "삭제 완료", description: "센서 그룹이 삭제되었습니다." })
        }
      },
    },
  ]

  // 헤더 우측 버튼
  const HeaderRight = () => (
    <div className="flex items-center gap-2">
      <Button onClick={crud.handleAdd}>
        <Icon name="add" size="sm" className="mr-2" />
        그룹 추가
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">센서 그룹 관리</h1>
        <p className="text-sm text-text-secondary mt-1">센서 그룹을 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={groups}
        columns={columns}
        actions={rowActions}
        loading={false}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="그룹명, 설명으로 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: groups.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  )
}
