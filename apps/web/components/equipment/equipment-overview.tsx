/**
 * @file components/equipment/equipment-overview.tsx
 * @description 설비 통합 조회 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 모든 설비 정보를 한 곳에서 조회하고 관리
 * 2. **탭 구성**:
 *    - 목록형: 설비 목록 테이블 조회
 *    - 통계형: 설비 유형별/상태별 통계
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { DataTable } from "@/components/common/data-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Equipment } from "@fms/types"
import type { Column } from "@/components/common/data-table"
import { Icon } from "@fms/ui/icon"

export function EquipmentOverview() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadEquipment()
  }, [])

  const loadEquipment = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setEquipment([])
    } catch (error) {
      toast({
        title: "오류",
        description: "설비 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (record: Equipment) => {
    setSelectedEquipment(record)
    setDetailDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Icon name="check_circle" size="sm" />
      case "stopped":
        return <Icon name="stop" size="sm" />
      case "maintenance":
        return <Icon name="build" size="sm" />
      case "failure":
        return <Icon name="warning" size="sm" />
      default:
        return <Icon name="schedule" size="sm" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      running: "가동중",
      stopped: "정지",
      maintenance: "정비중",
      failure: "고장",
    }
    return labels[status] || status
  }

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      running: "default",
      stopped: "outline",
      maintenance: "secondary",
      failure: "destructive",
    }
    return variants[status] || "outline"
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      critical: "중요",
      high: "높음",
      normal: "보통",
      low: "낮음",
    }
    return labels[priority] || priority
  }

  // 설비 목록 컬럼 정의
  const columns: Column<Equipment>[] = [
    {
      key: "code",
      title: "설비코드",
      width: "120px",
      sortable: true,
      searchable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Icon name="settings" size="sm" className="text-muted-foreground" />
          <span className="font-mono font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "name",
      title: "설비명",
      sortable: true,
      searchable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{record.model}</div>
        </div>
      ),
    },
    {
      key: "type",
      title: "설비유형",
      width: "100px",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "압축기", value: "압축기" },
        { label: "컨베이어", value: "컨베이어" },
        { label: "펌프", value: "펌프" },
        { label: "로봇", value: "로봇" },
        { label: "크레인", value: "크레인" },
      ],
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "status",
      title: "상태",
      width: "100px",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "가동중", value: "running" },
        { label: "정지", value: "stopped" },
        { label: "정비중", value: "maintenance" },
        { label: "고장", value: "failure" },
      ],
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          <div className="flex items-center gap-1">
            {getStatusIcon(value)}
            {getStatusLabel(value)}
          </div>
        </Badge>
      ),
    },
    {
      key: "priority",
      title: "중요도",
      width: "80px",
      sortable: true,
      render: (value) => <Badge variant="outline">{getPriorityLabel(value)}</Badge>,
    },
    {
      key: "location",
      title: "위치",
      searchable: true,
      filterable: true,
      filterOptions: [
        { label: "A동 1층", value: "A동 1층" },
        { label: "A동 2층", value: "A동 2층" },
        { label: "B동 1층", value: "B동 1층" },
        { label: "C동 1층", value: "C동 1층" },
      ],
      render: (value, record) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{record.department}</div>
        </div>
      ),
    },
    {
      key: "manufacturer",
      title: "제조사",
      searchable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{record.serialNumber}</div>
        </div>
      ),
    },
  ]

  // 액션 정의
  const actions = [
    {
      key: "view",
      icon: () => <Icon name="visibility" size="sm" />,
      label: "상세보기",
      onClick: handleViewDetail,
    },
  ]

  // 설비 상태 통계
  const statusStats = useMemo(() => ({
    total: equipment.length,
    running: equipment.filter((e) => e.status === "running").length,
    stopped: equipment.filter((e) => e.status === "stopped").length,
    maintenance: equipment.filter((e) => e.status === "maintenance").length,
    failure: equipment.filter((e) => e.status === "failure").length,
  }), [equipment])

  // 설비 유형 통계
  const typeStats = useMemo(() =>
    equipment.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  [equipment])

  const tabsList = (
    <TabsList>
      <TabsTrigger value="list">
        <Icon name="description" size="sm" className="mr-2" />
        목록형
      </TabsTrigger>
      <TabsTrigger value="stats">
        <Icon name="monitoring" size="sm" className="mr-2" />
        통계형
      </TabsTrigger>
    </TabsList>
  )

  return (
    <div className="p-6">
      <Tabs defaultValue="list">
        <TabsContent value="list">
          <DataTable
            data={equipment}
            columns={columns}
            actions={actions}
            headerLeft={tabsList}
            loading={loading}
            searchPlaceholder="설비코드, 설비명, 위치로 검색..."
            showExport={true}
            showFilter={true}
            stickyHeader={true}
            emptyMessage="등록된 설비가 없습니다."
          />
        </TabsContent>

        <TabsContent value="stats">
          <DataTable
            data={[]}
            columns={[]}
            headerLeft={tabsList}
            showSearch={false}
            showFilter={false}
            showExport={false}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* 설비 유형별 통계 */}
              <Card>
                <CardHeader>
                  <CardTitle>설비 유형별 통계</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(typeStats).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <Badge variant="outline">{type}</Badge>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{count}대</span>
                          <span className="text-sm text-muted-foreground">
                            ({statusStats.total > 0 ? ((count / statusStats.total) * 100).toFixed(1) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 설비 상태별 통계 */}
              <Card>
                <CardHeader>
                  <CardTitle>설비 상태별 통계</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon name="check_circle" size="sm" className="text-green-500" />
                        <span>가동중</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{statusStats.running}대</span>
                        <span className="text-sm text-muted-foreground">
                          ({statusStats.total > 0 ? ((statusStats.running / statusStats.total) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon name="stop" size="sm" className="text-gray-500" />
                        <span>정지</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{statusStats.stopped}대</span>
                        <span className="text-sm text-muted-foreground">
                          ({statusStats.total > 0 ? ((statusStats.stopped / statusStats.total) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon name="build" size="sm" className="text-blue-500" />
                        <span>정비중</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{statusStats.maintenance}대</span>
                        <span className="text-sm text-muted-foreground">
                          ({statusStats.total > 0 ? ((statusStats.maintenance / statusStats.total) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon name="warning" size="sm" className="text-red-500" />
                        <span>고장</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{statusStats.failure}대</span>
                        <span className="text-sm text-muted-foreground">
                          ({statusStats.total > 0 ? ((statusStats.failure / statusStats.total) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DataTable>
        </TabsContent>
      </Tabs>

      {/* 설비 상세 정보 다이얼로그 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>설비 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedEquipment.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono">{selectedEquipment.code}</span> | {selectedEquipment.model}
                  </p>
                </div>
                <Badge variant={getStatusVariant(selectedEquipment.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedEquipment.status)}
                    {getStatusLabel(selectedEquipment.status)}
                  </div>
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">설비 유형</h4>
                  <p>{selectedEquipment.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">제조사</h4>
                  <p>{selectedEquipment.manufacturer}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">모델명</h4>
                  <p>{selectedEquipment.model}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">시리얼 번호</h4>
                  <p>{selectedEquipment.serialNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">위치</h4>
                  <p>{selectedEquipment.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">부서</h4>
                  <p>{selectedEquipment.department}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">설치일</h4>
                  <p>{new Date(selectedEquipment.installDate).toLocaleDateString("ko-KR")}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">중요도</h4>
                  <p>{getPriorityLabel(selectedEquipment.priority)}</p>
                </div>
              </div>

              {selectedEquipment.description && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">설명</h4>
                  <p>{selectedEquipment.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
