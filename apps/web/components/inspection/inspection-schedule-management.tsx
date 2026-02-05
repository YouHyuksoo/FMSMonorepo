/**
 * @file apps/web/components/inspection/inspection-schedule-management.tsx
 * @description 점검 일정 관리 컴포넌트 - 표준 DataTable 형식
 */
"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Icon } from "@/components/ui/Icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@fms/ui/dialog"
import type { InspectionSchedule } from "@fms/types"
import { mockInspectionSchedules } from "@/lib/mock-data/inspection-schedule"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import { mockInspectionStandards } from "@/lib/mock-data/inspection-standard"
import { mockEquipments } from "@/lib/mock-data/equipment"
import { mockUsers } from "@/lib/mock-data/users"
import {
  useInspectionSchedules,
  useCreateInspectionSchedule,
} from "@/hooks/api/use-inspection"

// Mock/API 모드 전환
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

export function InspectionScheduleManagement() {
  // API 훅 (API 모드에서만 사용)
  const apiQuery = useInspectionSchedules(undefined)
  const createMutation = useCreateInspectionSchedule()

  // CRUD 상태 관리 훅
  const crud = useCrudState<InspectionSchedule>()

  // Mock 모드용 상태
  const [mockScheduleData, setMockScheduleData] = useState<InspectionSchedule[]>([])
  const [mockLoading, setMockLoading] = useState(USE_MOCK_API)

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    standardId: "",
    equipmentId: "",
    assignedToId: "",
    scheduledDate: "",
    scheduledTime: "",
    priority: "medium",
    estimatedDuration: 30,
    isRecurring: false,
    notes: "",
  })

  // Mock 모드 데이터 로드
  useEffect(() => {
    if (USE_MOCK_API) {
      setMockLoading(true)
      setTimeout(() => {
        setMockScheduleData(mockInspectionSchedules)
        setMockLoading(false)
      }, 500)
    }
  }, [])

  // 폼이 열릴 때 selectedItem 데이터로 폼 초기화 (수정 모드)
  useEffect(() => {
    if (crud.formOpen && crud.formMode === "edit" && crud.selectedItem) {
      setFormData({
        standardId: crud.selectedItem.standard?.id || "",
        equipmentId: crud.selectedItem.equipment?.id || "",
        assignedToId: crud.selectedItem.assignedTo?.id || "",
        scheduledDate: crud.selectedItem.scheduledDate || "",
        scheduledTime: crud.selectedItem.scheduledTime || "",
        priority: crud.selectedItem.priority || "medium",
        estimatedDuration: crud.selectedItem.estimatedDuration || 30,
        isRecurring: false,
        notes: crud.selectedItem.notes || "",
      })
    } else if (crud.formOpen && crud.formMode === "create") {
      setFormData({
        standardId: "",
        equipmentId: "",
        assignedToId: "",
        scheduledDate: "",
        scheduledTime: "",
        priority: "medium",
        estimatedDuration: 30,
        isRecurring: false,
        notes: "",
      })
    }
  }, [crud.formOpen, crud.formMode, crud.selectedItem])

  // 통합 데이터 및 로딩 상태
  const schedules = useMemo(() => {
    if (USE_MOCK_API) return mockScheduleData
    const data = apiQuery.data as any
    return data?.items || data || []
  }, [mockScheduleData, apiQuery.data])

  const loading = USE_MOCK_API ? mockLoading : apiQuery.isLoading

  // 스케줄 통계
  const scheduleStats = {
    total: schedules.length,
    scheduled: schedules.filter((s: InspectionSchedule) => s.status === "scheduled").length,
    inProgress: schedules.filter((s: InspectionSchedule) => s.status === "in-progress").length,
    completed: schedules.filter((s: InspectionSchedule) => s.status === "completed").length,
    missed: schedules.filter((s: InspectionSchedule) => s.status === "missed").length,
  }

  // 탭 필터링된 데이터
  const filteredSchedules = schedules.filter((schedule: InspectionSchedule) => {
    if (activeTab !== "all" && schedule.status !== activeTab) return false
    return true
  })

  // 상태에 따른 배지 변환
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "in-progress":
      case "completed":
        return "default"
      case "missed":
        return "destructive"
      case "rescheduled":
      case "canceled":
        return "secondary"
      default:
        return "outline"
    }
  }

  const statusLabels: Record<string, string> = {
    scheduled: "예정됨",
    "in-progress": "진행중",
    completed: "완료됨",
    missed: "누락됨",
    rescheduled: "일정변경",
    canceled: "취소됨",
  }

  // 우선순위에 따른 배지 변환
  const getPriorityBadgeVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case "high":
        return "default"
      case "critical":
        return "destructive"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const priorityLabels: Record<string, string> = {
    low: "낮음",
    medium: "보통",
    high: "높음",
    critical: "긴급",
  }

  const columns: DataTableColumn<InspectionSchedule>[] = [
    {
      key: "scheduledDate",
      title: "예정일자",
      width: "100px",
      sortable: true,
      render: (_, record) => record.scheduledDate ? new Date(record.scheduledDate).toLocaleDateString("ko-KR") : "-",
    },
    {
      key: "scheduledTime",
      title: "예정시간",
      width: "80px",
      render: (_, record) => record.scheduledTime || "-",
    },
    {
      key: "standard",
      title: "점검 기준서",
      width: "minmax(150px, 1fr)",
      searchable: true,
      render: (_, record) => record.standard?.name || "-",
    },
    {
      key: "equipment",
      title: "설비명",
      width: "minmax(120px, 1fr)",
      searchable: true,
      render: (_, record) => record.equipment?.name || "-",
    },
    {
      key: "location",
      title: "위치",
      width: "120px",
      render: (_, record) => record.equipment?.location || "-",
    },
    {
      key: "assignedTo",
      title: "담당자",
      width: "100px",
      searchable: true,
      render: (_, record) => record.assignedTo?.name || "-",
    },
    {
      key: "status",
      title: "상태",
      width: "90px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "예정됨", value: "scheduled" },
        { label: "진행중", value: "in-progress" },
        { label: "완료됨", value: "completed" },
        { label: "누락됨", value: "missed" },
      ],
      render: (_, record) => (
        <Badge variant={getStatusBadgeVariant(record.status || "")}>
          {statusLabels[record.status || ""] || record.status}
        </Badge>
      ),
    },
    {
      key: "priority",
      title: "우선순위",
      width: "80px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "낮음", value: "low" },
        { label: "보통", value: "medium" },
        { label: "높음", value: "high" },
        { label: "긴급", value: "critical" },
      ],
      render: (_, record) => (
        <Badge variant={getPriorityBadgeVariant(record.priority || "")}>
          {priorityLabels[record.priority || ""] || record.priority}
        </Badge>
      ),
    },
    {
      key: "estimatedDuration",
      title: "예상시간",
      width: "80px",
      align: "right",
      render: (_, record) => record.estimatedDuration ? `${record.estimatedDuration}분` : "-",
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<InspectionSchedule>[] = [
    {
      key: "view",
      label: "상세 보기",
      iconName: "visibility",
      onClick: (record) => crud.handleView(record),
    },
    {
      key: "start",
      label: "점검 시작",
      iconName: "schedule",
      onClick: (record) => {
        toast({
          title: "점검 시작",
          description: `${record.standard?.name || "점검"} 점검을 시작합니다.`,
        })
      },
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
      onClick: (record) => crud.handleDelete(record),
    },
  ]

  // 삭제 확인 핸들러
  const confirmDelete = () => {
    if (!crud.itemToDelete) return

    if (USE_MOCK_API) {
      setMockScheduleData((prev) => prev.filter((s) => s.id !== crud.itemToDelete?.id))
    }

    toast({
      title: "삭제 완료",
      description: "점검 스케줄이 삭제되었습니다.",
    })

    crud.closeDeleteDialog()
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (crud.formMode === "view") {
      crud.setFormOpen(false)
      return
    }

    if (
      !formData.standardId ||
      !formData.equipmentId ||
      !formData.assignedToId ||
      !formData.scheduledDate ||
      !formData.scheduledTime
    ) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const selectedStandard = mockInspectionStandards.find((s) => s.id === formData.standardId)
    const selectedEquipment = mockEquipments.find((e) => e.id === formData.equipmentId)
    const selectedUser = mockUsers.find((u) => u.id === formData.assignedToId)

    if (crud.formMode === "create") {
      const newSchedule: any = {
        id: `schedule_${Date.now()}`,
        standard: selectedStandard,
        equipment: selectedEquipment,
        assignedTo: selectedUser,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        status: "scheduled",
        priority: formData.priority,
        estimatedDuration: formData.estimatedDuration,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setMockScheduleData((prev) => [newSchedule, ...prev])
      toast({
        title: "등록 완료",
        description: "새 점검 스케줄이 등록되었습니다.",
      })
    } else if (crud.formMode === "edit" && crud.selectedItem) {
      const updatedSchedule: any = {
        ...crud.selectedItem,
        standard: selectedStandard,
        equipment: selectedEquipment,
        assignedTo: selectedUser,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        priority: formData.priority,
        estimatedDuration: formData.estimatedDuration,
        notes: formData.notes,
        updatedAt: new Date().toISOString(),
      }

      setMockScheduleData((prev) =>
        prev.map((s) => (s.id === crud.selectedItem?.id ? updatedSchedule : s))
      )
      toast({
        title: "수정 완료",
        description: "점검 스케줄이 수정되었습니다.",
      })
    }

    setFormData({
      standardId: "",
      equipmentId: "",
      assignedToId: "",
      scheduledDate: "",
      scheduledTime: "",
      priority: "medium",
      estimatedDuration: 30,
      isRecurring: false,
      notes: "",
    })
    crud.setFormOpen(false)
  }

  const getFormDialogTitle = () => {
    switch (crud.formMode) {
      case "create":
        return "새 점검 스케줄 등록"
      case "edit":
        return "점검 스케줄 수정"
      case "view":
        return "점검 스케줄 상세"
      default:
        return "점검 스케줄"
    }
  }

  const isReadOnly = crud.formMode === "view"

  // 헤더 좌측 탭 버튼
  const HeaderLeft = () => (
    <div className="flex gap-1 bg-surface dark:bg-surface-dark p-1 rounded-lg border border-border">
      {[
        { id: "all", label: `전체 (${scheduleStats.total})` },
        { id: "scheduled", label: `예정 (${scheduleStats.scheduled})` },
        { id: "in-progress", label: `진행 (${scheduleStats.inProgress})` },
        { id: "completed", label: `완료 (${scheduleStats.completed})` },
        { id: "missed", label: `누락 (${scheduleStats.missed})` },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id)
            setCurrentPage(1)
          }}
          className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === tab.id
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:text-text hover:bg-surface-dark/50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )

  // 헤더 우측 버튼
  const HeaderRight = () => (
    <div className="flex items-center gap-2">
      <Button onClick={crud.handleAdd}>
        <Icon name="add" size="sm" className="mr-2" />
        스케줄 등록
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">점검 일정 관리</h1>
        <p className="text-sm text-text-secondary mt-1">점검 일정을 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={filteredSchedules}
        columns={columns}
        actions={rowActions}
        loading={loading}
        headerLeft={<HeaderLeft />}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="점검 기준서, 설비, 담당자 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: filteredSchedules.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* 점검 스케줄 등록/수정/조회 다이얼로그 */}
      <Dialog open={crud.formOpen} onOpenChange={crud.setFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{getFormDialogTitle()}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 점검 기준서 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">점검 기준서 *</label>
                <select
                  value={formData.standardId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, standardId: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark text-text dark:text-white"
                >
                  <option value="">점검 기준서를 선택하세요</option>
                  {mockInspectionStandards.map((standard) => (
                    <option key={standard.id} value={standard.id}>
                      {standard.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 설비 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">설비 *</label>
                <select
                  value={formData.equipmentId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, equipmentId: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark text-text dark:text-white"
                >
                  <option value="">설비를 선택하세요</option>
                  {mockEquipments.map((equipment) => (
                    <option key={equipment.id} value={equipment.id}>
                      {equipment.name} ({equipment.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* 담당자 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">담당자 *</label>
                <select
                  value={formData.assignedToId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, assignedToId: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark text-text dark:text-white"
                >
                  <option value="">담당자를 선택하세요</option>
                  {mockUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* 우선순위 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">우선순위</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark text-text dark:text-white"
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                  <option value="critical">긴급</option>
                </select>
              </div>

              {/* 예정일자 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">예정일자 *</label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                  required={!isReadOnly}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark text-text dark:text-white"
                />
              </div>

              {/* 예정시간 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">예정시간 *</label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduledTime: e.target.value }))}
                  required={!isReadOnly}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark text-text dark:text-white"
                />
              </div>

              {/* 예상시간 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">예상시간 (분)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedDuration}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, estimatedDuration: Number.parseInt(e.target.value) || 30 }))
                  }
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark text-text dark:text-white"
                />
              </div>
            </div>

            {/* 비고 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">비고</label>
              <textarea
                placeholder="추가 설명이나 특이사항을 입력하세요"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark text-text dark:text-white"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => crud.setFormOpen(false)}>
                {isReadOnly ? "닫기" : "취소"}
              </Button>
              {!isReadOnly && (
                <Button type="submit">
                  {crud.formMode === "create" ? "등록" : "저장"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={crud.deleteDialogOpen} onOpenChange={crud.closeDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>점검 스케줄 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-text-secondary mb-4">
            정말 이 점검 스케줄을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          {crud.itemToDelete && (
            <div className="py-4 space-y-2 text-sm">
              <p><strong>점검 기준서:</strong> {crud.itemToDelete.standard?.name || "-"}</p>
              <p><strong>설비:</strong> {crud.itemToDelete.equipment?.name || "-"}</p>
              <p><strong>예정일자:</strong> {crud.itemToDelete.scheduledDate} {crud.itemToDelete.scheduledTime}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={crud.closeDeleteDialog}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
