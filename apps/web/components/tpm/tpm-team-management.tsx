/**
 * @file apps/web/components/tpm/tpm-team-management.tsx
 * @description TPM 분임조 관리 페이지 컴포넌트 - 표준 DataTable 형식
 *
 * 초보자 가이드:
 * 1. **주요 개념**: TPM(Total Productive Maintenance) 활동을 수행하는 분임조를
 *    생성, 조회, 수정, 삭제하는 CRUD 관리 페이지
 * 2. **사용 방법**:
 *    - 분임조 목록 조회 및 검색
 *    - 분임조 등록/수정/삭제
 *    - Excel 가져오기/내보내기
 * 3. **상태 관리**: useCrudState 훅을 사용하여 폼, 삭제 다이얼로그,
 *    가져오기/내보내기 상태를 통합 관리
 */
"use client"

import { useState } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Icon } from "@/components/ui/Icon"
import { ImportExportDialog } from "@/components/common/import-export-dialog"
import { TPMTeamForm } from "./tpm-team-form"
import { mockTPMTeams } from "@/lib/mock-data/tpm"
import { useTranslation } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import type { TPMTeam, TPMTeamFormData } from "@fms/types"

export function TPMTeamManagement() {
  const { t } = useTranslation("tpm")
  const { t: tCommon } = useTranslation("common")
  const { toast } = useToast()
  const [teams, setTeams] = useState<TPMTeam[]>(mockTPMTeams)

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // useCrudState 훅으로 CRUD 상태 통합 관리
  const crud = useCrudState<TPMTeam>()

  const columns: DataTableColumn<TPMTeam>[] = [
    {
      key: "code",
      title: "분임조 코드",
      width: "120px",
      searchable: true,
      render: (_, record) => <span className="font-medium">{record.code}</span>,
    },
    {
      key: "name",
      title: "분임조명",
      width: "150px",
      searchable: true,
      render: (_, record) => <span className="font-medium">{record.name}</span>,
    },
    {
      key: "department",
      title: "소속 부서",
      width: "120px",
      searchable: true,
      render: (_, record) => record.department,
    },
    {
      key: "leaderName",
      title: "분임조장",
      width: "100px",
      render: (_, record) => record.leaderName,
    },
    {
      key: "members",
      title: "구성원 수",
      width: "90px",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Icon name="group" size="sm" />
          {record.members?.length || 0}명
        </div>
      ),
    },
    {
      key: "equipmentArea",
      title: "담당 구역",
      width: "minmax(150px, 1fr)",
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Icon name="location_on" size="sm" />
          {record.equipmentArea}
        </div>
      ),
    },
    {
      key: "meetingDay",
      title: "정기 모임",
      width: "130px",
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Icon name="calendar_month" size="sm" />
          {record.meetingDay} {record.meetingTime}
        </div>
      ),
    },
    {
      key: "status",
      title: "상태",
      width: "80px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "활성", value: "active" },
        { label: "비활성", value: "inactive" },
      ],
      render: (_, record) => (
        <Badge variant={record.status === "active" ? "default" : "secondary"}>
          {record.status === "active" ? "활성" : "비활성"}
        </Badge>
      ),
    },
    {
      key: "establishedDate",
      title: "설립일",
      width: "100px",
      sortable: true,
      render: (_, record) => record.establishedDate,
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<TPMTeam>[] = [
    {
      key: "view",
      label: "보기",
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
      onClick: (record) => handleDeleteConfirm(record),
    },
  ]

  async function handleDeleteConfirm(team: TPMTeam) {
    try {
      setTeams(teams.filter((t) => t.id !== team.id))
      toast({
        title: "분임조 삭제 완료",
        description: `${team.name}이(가) 삭제되었습니다.`,
      })
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "분임조 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (data: TPMTeamFormData) => {
    try {
      if (crud.formMode === "create") {
        const newTeam: TPMTeam = {
          id: `temp-${Date.now()}`,
          ...data,
          status: "active",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "current-user",
          updatedBy: "current-user",
        }
        setTeams([...teams, newTeam])
        toast({
          title: "분임조 등록 완료",
          description: `${data.name}이(가) 등록되었습니다.`,
        })
      } else if (crud.formMode === "edit" && crud.selectedItem) {
        const updatedTeam: TPMTeam = {
          ...crud.selectedItem,
          ...data,
          updatedAt: new Date().toISOString(),
          updatedBy: "current-user",
        }
        setTeams(teams.map((t) => (t.id === crud.selectedItem!.id ? updatedTeam : t)))
        toast({
          title: "분임조 수정 완료",
          description: `${data.name}이(가) 수정되었습니다.`,
        })
      }
      crud.setFormOpen(false)
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "분임조 정보 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleImportComplete = async (data: TPMTeam[]) => {
    try {
      setTeams([...teams, ...data])
      toast({
        title: "가져오기 완료",
        description: `${data.length}개의 TPM 분임조가 가져와졌습니다.`,
      })
    } catch (error) {
      toast({
        title: "가져오기 실패",
        description: "데이터 가져오기 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // Export/Import 컬럼 정의
  const exportColumns = [
    { key: "code", title: "분임조코드", width: 15 },
    { key: "name", title: "분임조명", width: 20 },
    { key: "department", title: "소속부서", width: 15 },
    { key: "leaderName", title: "분임조장", width: 15 },
    { key: "facilitatorName", title: "촉진자", width: 15 },
    { key: "secretaryName", title: "간사", width: 15 },
    { key: "equipmentArea", title: "담당구역", width: 20 },
    { key: "meetingDay", title: "정기모임요일", width: 12 },
    { key: "meetingTime", title: "정기모임시간", width: 12 },
    { key: "meetingLocation", title: "모임장소", width: 15 },
    { key: "status", title: "상태", width: 10 },
    { key: "establishedDate", title: "설립일", width: 12 },
  ]

  const importColumns = [
    { key: "code", title: "분임조코드", required: true },
    { key: "name", title: "분임조명", required: true },
    { key: "department", title: "소속부서", required: true },
    { key: "leaderName", title: "분임조장", required: true },
    { key: "facilitatorName", title: "촉진자", required: false },
    { key: "secretaryName", title: "간사", required: false },
    { key: "equipmentArea", title: "담당구역", required: true },
    { key: "meetingDay", title: "정기모임요일", required: true },
    { key: "meetingTime", title: "정기모임시간", required: true },
    { key: "meetingLocation", title: "모임장소", required: false },
    { key: "establishedDate", title: "설립일", required: true },
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
        분임조 등록
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">TPM 분임조 관리</h1>
        <p className="text-sm text-text-secondary mt-1">TPM 활동을 수행하는 분임조를 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={teams}
        columns={columns}
        actions={rowActions}
        loading={false}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="분임조명, 코드, 부서로 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: teams.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* 분임조 폼 다이얼로그 */}
      <TPMTeamForm
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
        title="TPM 분임조"
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={teams}
        onImportComplete={handleImportComplete}
        exportOptions={{ filename: "TPM_분임조_목록" }}
        sampleData={[
          {
            code: "TPM-TEAM-001",
            name: "A팀",
            department: "생산부",
            leaderName: "김팀장",
            facilitatorName: "이촉진자",
            secretaryName: "박간사",
            equipmentArea: "생산라인 1",
            meetingDay: "화요일",
            meetingTime: "17:00",
            meetingLocation: "회의실 A",
            establishedDate: "2024-01-01",
          },
        ]}
      />
    </div>
  )
}
