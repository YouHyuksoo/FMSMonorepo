/**
 * @file apps/web/components/tpm/tpm-activity-management.tsx
 * @description TPM 활동 관리 컴포넌트 - 표준 DataTable 형식
 */

"use client"

import { useState } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Icon } from "@/components/ui/Icon"
import { ImportExportDialog } from "@/components/common/import-export-dialog"
import { TPMActivityForm } from "./tpm-activity-form"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import { type TPMActivity, type TPMActivityFormData, tpmPillarLabels } from "@fms/types"

// 빈 옵션 배열 (API에서 로드 필요)
const tpmTeams: { id: string; name: string }[] = []
const equipmentList: { id: string; name: string }[] = []

export function TPMActivityManagement() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<TPMActivity[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // CRUD 상태 관리 훅 사용
  const crud = useCrudState<TPMActivity>()

  const getStatusBadge = (status: string): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      planned: { label: "계획됨", variant: "secondary" },
      in_progress: { label: "진행중", variant: "default" },
      completed: { label: "완료됨", variant: "default" },
      cancelled: { label: "취소됨", variant: "destructive" },
    }
    return statusMap[status] || { label: status, variant: "secondary" }
  }

  const getPriorityBadge = (priority: string): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    const priorityMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      high: { label: "높음", variant: "destructive" },
      normal: { label: "보통", variant: "default" },
      low: { label: "낮음", variant: "secondary" },
    }
    return priorityMap[priority] || { label: priority, variant: "secondary" }
  }

  // 통계 계산
  const stats = {
    total: activities.length,
    planned: activities.filter((a) => a.status === "planned").length,
    inProgress: activities.filter((a) => a.status === "in_progress").length,
    completed: activities.filter((a) => a.status === "completed").length,
  }

  // 탭 필터링된 데이터
  const filteredActivities = activeTab === "all"
    ? activities
    : activities.filter((item) => item.status === activeTab)

  const columns: DataTableColumn<TPMActivity>[] = [
    {
      key: "activityNo",
      title: "활동 번호",
      width: "140px",
      searchable: true,
      render: (_, record) => <span className="font-mono text-xs">{record.activityNo}</span>,
    },
    {
      key: "title",
      title: "활동 제목",
      width: "minmax(250px, 1fr)",
      searchable: true,
      render: (_, record) => <span className="font-medium text-primary">{record.title}</span>,
    },
    {
      key: "teamName",
      title: "담당 분임조",
      width: "120px",
      searchable: true,
      render: (_, record) => record.teamName,
    },
    {
      key: "pillar",
      title: "TPM 기둥",
      width: "120px",
      filterable: true,
      filterOptions: Object.entries(tpmPillarLabels).map(([value, label]) => ({ label, value })),
      render: (_, record) => {
        const pillarLabel = tpmPillarLabels[record.pillar as keyof typeof tpmPillarLabels] || record.pillar
        return <Badge variant="outline">{pillarLabel}</Badge>
      },
    },
    {
      key: "priority",
      title: "우선순위",
      width: "90px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "높음", value: "high" },
        { label: "보통", value: "normal" },
        { label: "낮음", value: "low" },
      ],
      render: (_, record) => {
        const badge = getPriorityBadge(record.priority)
        return <Badge variant={badge.variant}>{badge.label}</Badge>
      },
    },
    {
      key: "status",
      title: "상태",
      width: "90px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "계획됨", value: "planned" },
        { label: "진행중", value: "in_progress" },
        { label: "완료됨", value: "completed" },
        { label: "취소됨", value: "cancelled" },
      ],
      render: (_, record) => {
        const badge = getStatusBadge(record.status)
        return <Badge variant={badge.variant}>{badge.label}</Badge>
      },
    },
    {
      key: "completionRate",
      title: "진행률",
      width: "120px",
      align: "center",
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 h-1.5 bg-border dark:bg-border-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${record.completionRate}%` }}
            />
          </div>
          <span className="text-[10px] font-medium w-8 text-right">{record.completionRate}%</span>
        </div>
      ),
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<TPMActivity>[] = [
    {
      key: "view",
      label: "상세 보기",
      iconName: "visibility",
      onClick: (record) => crud.handleView(record),
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
      onClick: (record) => handleDeleteActivity(record),
    },
  ]

  const handleDeleteActivity = (activity: TPMActivity) => {
    if (confirm(`${activity.title} 활동을 삭제하시겠습니까?`)) {
      setActivities(activities.filter((a) => a.id !== activity.id))
      toast({ title: "TPM 활동 삭제 완료" })
    }
  }

  const handleSubmit = async (data: TPMActivityFormData) => {
    try {
      if (crud.formMode === "create") {
        const newActivity: TPMActivity = {
          id: `temp-${Date.now()}`,
          activityNo: `TPM-ACT-${new Date().getFullYear()}-${String(activities.length + 1).padStart(3, "0")}`,
          ...data,
          teamName: tpmTeams.find((t) => t.id === data.teamId)?.name || "",
          equipmentNames: data.equipmentIds.map((id) => equipmentList.find((eq) => eq.id === id)?.name || ""),
          status: "planned",
          completionRate: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "current-user",
          updatedBy: "current-user",
          goals: (data as any).goals || [],
          activities: (data as any).activities || [],
        }
        setActivities([...activities, newActivity])
        toast({ title: "TPM 활동 등록 완료" })
      } else if (crud.formMode === "edit" && crud.selectedItem) {
        const updatedActivity: TPMActivity = {
          ...crud.selectedItem,
          ...(data as any),
          teamName: tpmTeams.find((t) => t.id === data.teamId)?.name || crud.selectedItem.teamName,
          equipmentNames: data.equipmentIds.map((id) => equipmentList.find((eq) => eq.id === id)?.name || ""),
          updatedAt: new Date().toISOString(),
          updatedBy: "current-user",
        }
        setActivities(activities.map((a) => (a.id === crud.selectedItem!.id ? updatedActivity : a)))
        toast({ title: "TPM 활동 수정 완료" })
      }
      crud.setFormOpen(false)
    } catch (error) {
      toast({ title: "저장 실패", variant: "destructive" })
    }
  }

  const handleImportComplete = (data: TPMActivity[]) => {
    setActivities([...activities, ...data])
  }

  const exportColumns = [
    { key: "activityNo", title: "활동번호" },
    { key: "title", title: "활동제목" },
    { key: "teamName", title: "담당분임조" },
    { key: "pillar", title: "TPM기둥" },
    { key: "activityType", title: "활동유형" },
    { key: "priority", title: "우선순위" },
    { key: "status", title: "상태" },
    { key: "completionRate", title: "진행률" },
    { key: "startDate", title: "시작일" },
    { key: "endDate", title: "종료일" },
  ]

  const importColumns = [
    { key: "activityNo", title: "활동번호", required: true },
    { key: "title", title: "활동제목", required: true },
    { key: "teamName", title: "담당분임조", required: true },
    { key: "pillar", title: "TPM기둥", required: true },
    { key: "activityType", title: "활동유형", required: true },
    { key: "startDate", title: "시작일", required: true },
    { key: "endDate", title: "종료일", required: true },
  ]

  // 헤더 좌측 탭 버튼
  const HeaderLeft = () => (
    <div className="flex gap-1 bg-surface dark:bg-surface-dark p-1 rounded-lg border border-border">
      {[
        { id: "all", label: "전체" },
        { id: "planned", label: "계획" },
        { id: "in_progress", label: "진행" },
        { id: "completed", label: "완료" },
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
      <Button onClick={() => crud.setImportExportOpen(true)} variant="outline">
        <Icon name="upload_file" size="sm" className="mr-2" />
        가져오기/내보내기
      </Button>
      <Button onClick={crud.handleAdd}>
        <Icon name="add" size="sm" className="mr-2" />
        활동 등록하기
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">TPM 활동 관리</h1>
        <p className="text-sm text-text-secondary mt-1">TPM 활동을 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={filteredActivities}
        columns={columns}
        actions={rowActions}
        loading={false}
        headerLeft={<HeaderLeft />}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="활동번호, 제목, 분임조 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: filteredActivities.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* TPM 활동 폼 다이얼로그 */}
      <TPMActivityForm
        open={crud.formOpen}
        onOpenChange={crud.setFormOpen}
        onSubmit={handleSubmit}
        initialData={crud.selectedItem || undefined}
        mode={crud.formMode}
      />

      {/* 가져오기/내보내기 다이얼로그 */}
      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title="TPM 활동"
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={activities}
        onImportComplete={handleImportComplete}
        exportOptions={{ filename: "TPM_활동_목록" }}
        sampleData={[
          {
            activityNo: "TPM-ACT-2024-001",
            title: "활동 예시",
            teamName: "A팀",
            pillar: "tpm.pillar.autonomous",
            activityType: "tpm.activity.autonomous",
            priority: "normal",
            status: "planned",
            startDate: "2024-01-01",
            endDate: "2024-12-31",
          },
        ]}
      />
    </div>
  )
}
