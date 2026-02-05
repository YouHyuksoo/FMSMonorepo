/**
 * @file apps/web/components/code/code-management.tsx
 * @description 공통코드 관리 컴포넌트 - 표준 DataTable 형식
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 코드 그룹과 코드를 탭으로 구분하여 관리
 * 2. **CRUD 상태**: useCrudState 훅으로 그룹/코드 각각의 CRUD 상태 관리
 * 3. **계층 구조**: 코드는 그룹에 속하며, 상위 코드를 가질 수 있음
 */
"use client"

import { useState, useEffect } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { CodeGroupForm } from "./code-group-form"
import { CodeForm } from "./code-form"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog"
import { Icon } from "@/components/ui/Icon"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import type { CodeGroup, Code, CodeGroupFormData, CodeFormData } from "@fms/types"

export function CodeManagement() {
  const [codeGroups, setCodeGroups] = useState<CodeGroup[]>([])
  const [codes, setCodes] = useState<Code[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("groups")
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")

  // 페이지네이션 상태 - 그룹
  const [groupCurrentPage, setGroupCurrentPage] = useState(1)
  const [groupPageSize, setGroupPageSize] = useState(20)

  // 페이지네이션 상태 - 코드
  const [codeCurrentPage, setCodeCurrentPage] = useState(1)
  const [codePageSize, setCodePageSize] = useState(20)

  // 그룹 CRUD 상태
  const groupCrud = useCrudState<CodeGroup>()

  // 코드 CRUD 상태
  const codeCrud = useCrudState<Code>()

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setCodeGroups([])
      setCodes([])
    } catch (error) {
      toast({
        title: "오류",
        description: "데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 그룹 코드 관리 핸들러
  const handleGroupManageCodes = (group: CodeGroup) => {
    setSelectedGroupId(group.id)
    setActiveTab("codes")
  }

  const confirmGroupDelete = async () => {
    if (!groupCrud.itemToDelete) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setCodeGroups((prev) => prev.filter((group) => group.id !== groupCrud.itemToDelete!.id))
      setCodes((prev) => prev.filter((code) => code.groupId !== groupCrud.itemToDelete!.id))
      toast({
        title: "성공",
        description: "코드 그룹이 삭제되었습니다.",
      })
    } catch (error) {
      toast({
        title: "오류",
        description: "코드 그룹 삭제에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      groupCrud.setDeleteDialogOpen(false)
    }
  }

  const handleGroupFormSubmit = async (data: CodeGroupFormData) => {
    try {
      if (groupCrud.formMode === "create") {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const newGroup: CodeGroup = {
          id: Date.now().toString(),
          ...data,
          codeCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "current-user",
          updatedBy: "current-user",
        }

        setCodeGroups((prev) => [...prev, newGroup])
        toast({
          title: "성공",
          description: "코드 그룹이 추가되었습니다.",
        })
      } else if (groupCrud.formMode === "edit") {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setCodeGroups((prev) =>
          prev.map((group) =>
            group.id === groupCrud.selectedItem?.id
              ? {
                  ...group,
                  ...data,
                  updatedAt: new Date().toISOString(),
                  updatedBy: "current-user",
                }
              : group,
          ),
        )

        toast({
          title: "성공",
          description: "코드 그룹이 수정되었습니다.",
        })
      }
    } catch (error) {
      toast({
        title: "오류",
        description: `코드 그룹 ${groupCrud.formMode === "create" ? "추가" : "수정"}에 실패했습니다.`,
        variant: "destructive",
      })
      throw error
    }
  }

  const confirmCodeDelete = async () => {
    if (!codeCrud.itemToDelete) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setCodes((prev) => prev.filter((code) => code.id !== codeCrud.itemToDelete!.id))

      // 그룹의 코드 수 업데이트
      setCodeGroups((prev) =>
        prev.map((group) =>
          group.id === codeCrud.itemToDelete!.groupId ? { ...group, codeCount: (group.codeCount || 0) - 1 } : group,
        ),
      )

      toast({
        title: "성공",
        description: "코드가 삭제되었습니다.",
      })
    } catch (error) {
      toast({
        title: "오류",
        description: "코드 삭제에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      codeCrud.setDeleteDialogOpen(false)
    }
  }

  const handleCodeFormSubmit = async (data: CodeFormData) => {
    try {
      if (codeCrud.formMode === "create") {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const group = codeGroups.find((g) => g.id === data.groupId)
        const parentCode = codes.find((c) => c.code === data.parentCode)

        const newCode: Code = {
          id: Date.now().toString(),
          ...data,
          groupCode: group?.groupCode || "",
          groupName: group?.groupName || "",
          parentName: parentCode?.name,
          level: parentCode ? parentCode.level + 1 : 1,
          isSystem: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "current-user",
          updatedBy: "current-user",
        }

        setCodes((prev) => [...prev, newCode])

        // 그룹의 코드 수 업데이트
        setCodeGroups((prev) =>
          prev.map((group) =>
            group.id === data.groupId ? { ...group, codeCount: (group.codeCount || 0) + 1 } : group,
          ),
        )

        toast({
          title: "성공",
          description: "코드가 추가되었습니다.",
        })
      } else if (codeCrud.formMode === "edit") {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setCodes((prev) =>
          prev.map((code) =>
            code.id === codeCrud.selectedItem?.id
              ? {
                  ...code,
                  ...data,
                  updatedAt: new Date().toISOString(),
                  updatedBy: "current-user",
                }
              : code,
          ),
        )

        toast({
          title: "성공",
          description: "코드가 수정되었습니다.",
        })
      }
    } catch (error) {
      toast({
        title: "오류",
        description: `코드 ${codeCrud.formMode === "create" ? "추가" : "수정"}에 실패했습니다.`,
        variant: "destructive",
      })
      throw error
    }
  }

  // 필터링된 코드 목록
  const filteredCodes = selectedGroupId ? codes.filter((code) => code.groupId === selectedGroupId) : codes

  // 상위 코드 목록 (계층 구조용)
  const parentCodes = selectedGroupId ? codes.filter((code) => code.groupId === selectedGroupId) : codes

  // 그룹 테이블 컬럼
  const groupColumns: DataTableColumn<CodeGroup>[] = [
    {
      key: "groupCode",
      title: "그룹코드",
      width: "120px",
      searchable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Icon name="tag" size="sm" className="text-muted-foreground" />
          <span className="font-mono font-medium">{record.groupCode}</span>
        </div>
      ),
    },
    {
      key: "groupName",
      title: "그룹명",
      width: "minmax(150px, 1fr)",
      searchable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Icon name="folder_open" size="sm" className="text-blue-600" />
          <span className="font-medium">{record.groupName}</span>
        </div>
      ),
    },
    {
      key: "description",
      title: "설명",
      width: "minmax(150px, 1fr)",
      render: (_, record) => record.description || "-",
    },
    {
      key: "codeCount",
      title: "코드 수",
      width: "80px",
      align: "center",
      render: (_, record) => (
        <Badge variant="secondary" className="font-mono">
          {record.codeCount || 0}
        </Badge>
      ),
    },
    {
      key: "sortOrder",
      title: "순서",
      width: "60px",
      align: "center",
      sortable: true,
      render: (_, record) => record.sortOrder,
    },
    {
      key: "isActive",
      title: "상태",
      width: "80px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "활성", value: "true" },
        { label: "비활성", value: "false" },
      ],
      render: (_, record) => <Badge variant={record.isActive ? "default" : "secondary"}>{record.isActive ? "활성" : "비활성"}</Badge>,
    },
  ]

  // 그룹 행 액션
  const groupActions: DataTableAction<CodeGroup>[] = [
    {
      key: "view",
      label: "보기",
      iconName: "visibility",
      onClick: (record) => groupCrud.handleView(record),
    },
    {
      key: "edit",
      label: "수정",
      iconName: "edit",
      onClick: (record) => groupCrud.handleEdit(record),
    },
    {
      key: "manageCodes",
      label: "코드 관리",
      iconName: "settings",
      onClick: (record) => handleGroupManageCodes(record),
    },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => groupCrud.handleDelete(record),
      hidden: (record) => (record.codeCount || 0) > 0,
    },
  ]

  // 코드 테이블 컬럼
  const codeColumns: DataTableColumn<Code>[] = [
    {
      key: "code",
      title: "코드",
      width: "120px",
      searchable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {"  ".repeat(record.level - 1)}
          <Icon name="code" size="sm" className="text-muted-foreground" />
          <span className="font-mono font-medium">{record.code}</span>
        </div>
      ),
    },
    {
      key: "name",
      title: "코드명",
      width: "minmax(150px, 1fr)",
      searchable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.attributes?.color && (
            <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: record.attributes.color }} />
          )}
          <span className="font-medium">{record.name}</span>
          {record.isSystem && <Badge variant="outline">시스템</Badge>}
        </div>
      ),
    },
    {
      key: "value",
      title: "값",
      width: "100px",
      render: (_, record) => (record.value ? <span className="font-mono text-sm">{record.value}</span> : "-"),
    },
    {
      key: "parentName",
      title: "상위코드",
      width: "100px",
      render: (_, record) => record.parentName || "-",
    },
    {
      key: "sortOrder",
      title: "순서",
      width: "60px",
      align: "center",
      sortable: true,
      render: (_, record) => record.sortOrder,
    },
    {
      key: "isActive",
      title: "상태",
      width: "80px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "활성", value: "true" },
        { label: "비활성", value: "false" },
      ],
      render: (_, record) => <Badge variant={record.isActive ? "default" : "secondary"}>{record.isActive ? "활성" : "비활성"}</Badge>,
    },
  ]

  // 코드 행 액션
  const codeActions: DataTableAction<Code>[] = [
    {
      key: "view",
      label: "보기",
      iconName: "visibility",
      onClick: (record) => codeCrud.handleView(record),
    },
    {
      key: "edit",
      label: "수정",
      iconName: "edit",
      onClick: (record) => codeCrud.handleEdit(record),
    },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => codeCrud.handleDelete(record),
      hidden: (record) => record.isSystem,
    },
  ]

  // 선택된 그룹 정보
  const selectedGroup = codeGroups.find((g) => g.id === selectedGroupId)

  // 그룹 헤더 우측 버튼
  const GroupHeaderRight = () => (
    <Button onClick={groupCrud.handleAdd}>
      <Icon name="add" size="sm" className="mr-2" />
      그룹 추가
    </Button>
  )

  // 코드 헤더 좌측
  const CodeHeaderLeft = () => (
    <>
      {selectedGroupId && (
        <Button variant="outline" size="sm" onClick={() => setSelectedGroupId("")}>
          전체 코드 보기
        </Button>
      )}
    </>
  )

  // 코드 헤더 우측 버튼
  const CodeHeaderRight = () => (
    <Button onClick={codeCrud.handleAdd}>
      <Icon name="add" size="sm" className="mr-2" />
      코드 추가
    </Button>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">공통코드 관리</h1>
        <p className="text-sm text-text-secondary mt-1">코드 그룹과 코드를 등록하고 관리합니다.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="groups">코드 그룹</TabsTrigger>
          <TabsTrigger value="codes">
            코드 목록
            {selectedGroupId && (
              <Badge variant="secondary" className="ml-2">
                {selectedGroup?.groupName}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-4">
          <DataTable
            data={codeGroups}
            columns={groupColumns}
            actions={groupActions}
            loading={loading}
            headerRight={<GroupHeaderRight />}
            showSearch
            showFilter
            showColumnSettings
            searchPlaceholder="그룹코드, 그룹명으로 검색..."
            pagination={{
              page: groupCurrentPage,
              pageSize: groupPageSize,
              total: codeGroups.length,
              onPageChange: setGroupCurrentPage,
              onPageSizeChange: setGroupPageSize,
            }}
          />
        </TabsContent>

        <TabsContent value="codes" className="mt-4">
          <DataTable
            data={filteredCodes}
            columns={codeColumns}
            actions={codeActions}
            loading={loading}
            headerLeft={<CodeHeaderLeft />}
            headerRight={<CodeHeaderRight />}
            showSearch
            showFilter
            showColumnSettings
            searchPlaceholder="코드, 코드명으로 검색..."
            pagination={{
              page: codeCurrentPage,
              pageSize: codePageSize,
              total: filteredCodes.length,
              onPageChange: setCodeCurrentPage,
              onPageSizeChange: setCodePageSize,
            }}
          />
        </TabsContent>
      </Tabs>

      {/* 그룹 폼 */}
      <CodeGroupForm
        open={groupCrud.formOpen}
        onOpenChange={groupCrud.setFormOpen}
        onSubmit={handleGroupFormSubmit}
        initialData={groupCrud.selectedItem ?? undefined}
        mode={groupCrud.formMode}
      />

      {/* 코드 폼 */}
      <CodeForm
        open={codeCrud.formOpen}
        onOpenChange={codeCrud.setFormOpen}
        onSubmit={handleCodeFormSubmit}
        initialData={codeCrud.selectedItem ?? undefined}
        codeGroups={codeGroups}
        parentCodes={parentCodes}
        mode={codeCrud.formMode}
        selectedGroupId={selectedGroupId}
      />

      {/* 그룹 삭제 확인 */}
      <Dialog open={groupCrud.deleteDialogOpen} onOpenChange={groupCrud.setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>코드 그룹 삭제</DialogTitle>
            <DialogDescription>
              "{groupCrud.itemToDelete?.groupName}" 그룹을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없으며, 그룹에 속한 모든 코드가 함께 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => groupCrud.setDeleteDialogOpen(false)}>취소</Button>
            <Button variant="destructive" onClick={confirmGroupDelete}>삭제</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 코드 삭제 확인 */}
      <Dialog open={codeCrud.deleteDialogOpen} onOpenChange={codeCrud.setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>코드 삭제</DialogTitle>
            <DialogDescription>
              "{codeCrud.itemToDelete?.name}" 코드를 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => codeCrud.setDeleteDialogOpen(false)}>취소</Button>
            <Button variant="destructive" onClick={confirmCodeDelete}>삭제</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
