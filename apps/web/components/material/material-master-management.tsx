/**
 * @file apps/web/components/material/material-master-management.tsx
 * @description 자재 마스터 관리 컴포넌트 - 표준 레이아웃 (탭+검색 같은 줄)
 *
 * 초보자 가이드:
 * 1. **레이아웃**: 탭이 검색/필터와 같은 줄에 배치
 * 2. **기능**: 검색, 필터, 컬럼설정, 정렬, 페이지네이션, 엑셀 다운로드
 * 3. **표준 패턴**: equipment/master 페이지 참고
 */

"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Textarea } from "@fms/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fms/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog"
import { Icon } from "@/components/ui/Icon"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import type { MaterialCategory } from "@fms/types"

// 타입 정의
interface MaterialCodeRule {
  id: string
  categoryId: string
  prefix: string
  pattern: string
  example: string
  isActive: boolean
}

interface MaterialAttributeTemplate {
  id: string
  categoryId: string
  name: string
  dataType: "text" | "number" | "select" | "date" | "boolean"
  isRequired: boolean
  description: string
}

interface ApprovalWorkflow {
  id: string
  name: string
  isActive: boolean
  steps: {
    id: string
    stepNumber: number
    name: string
    approverRole: string
    description: string
    isRequired: boolean
  }[]
}

// ============================================
// 엑셀 다운로드 유틸
// ============================================
function downloadExcel<T extends Record<string, any>>(
  data: T[],
  columns: { key: string; title: string }[],
  filename: string
) {
  const headers = columns.map((c) => c.title).join(",")
  const rows = data.map((item) =>
    columns.map((c) => {
      const value = item[c.key]
      if (typeof value === "string" && (value.includes(",") || value.includes("\n"))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ""
    }).join(",")
  )
  const csv = [headers, ...rows].join("\n")
  const bom = "\uFEFF"
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ============================================
// 초기값 정의
// ============================================
const initialCategory: MaterialCategory = {
  id: "",
  code: "",
  name: "",
  description: "",
  level: "major",
  parentId: undefined,
  isActive: true,
}

const initialCodeRule: MaterialCodeRule = {
  id: "",
  categoryId: "",
  prefix: "",
  pattern: "",
  example: "",
  isActive: true,
}

const initialAttributeTemplate: MaterialAttributeTemplate = {
  id: "",
  categoryId: "",
  name: "",
  dataType: "text",
  isRequired: false,
  description: "",
}

// ============================================
// 메인 컴포넌트
// ============================================
export function MaterialMasterManagement() {
  const { toast } = useToast()

  // 현재 탭 상태
  const [activeTab, setActiveTab] = useState("categories")

  // 데이터 상태
  const [categories, setCategories] = useState<MaterialCategory[]>([])
  const [codeRules, setCodeRules] = useState<MaterialCodeRule[]>([])
  const [attributeTemplates, setAttributeTemplates] = useState<MaterialAttributeTemplate[]>([])
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([])
  const [loading, setLoading] = useState(true)

  // CRUD 상태
  const categoryCrud = useCrudState<MaterialCategory>()
  const codeRuleCrud = useCrudState<MaterialCodeRule>()
  const attributeCrud = useCrudState<MaterialAttributeTemplate>()

  // 폼 데이터
  const [categoryForm, setCategoryForm] = useState<MaterialCategory>(initialCategory)
  const [codeRuleForm, setCodeRuleForm] = useState<MaterialCodeRule>(initialCodeRule)
  const [attributeForm, setAttributeForm] = useState<MaterialAttributeTemplate>(initialAttributeTemplate)

  // 페이지네이션
  const [categoryPage, setCategoryPage] = useState(1)
  const [codeRulePage, setCodeRulePage] = useState(1)
  const [attributePage, setAttributePage] = useState(1)
  const [workflowPage, setWorkflowPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 데이터 로드
  useEffect(() => {
    setCategories([])
    setCodeRules([])
    setAttributeTemplates([])
    setWorkflows([])
    setLoading(false)
  }, [])

  // 폼 데이터 동기화
  useEffect(() => {
    setCategoryForm(categoryCrud.selectedItem || initialCategory)
  }, [categoryCrud.selectedItem])

  useEffect(() => {
    setCodeRuleForm(codeRuleCrud.selectedItem || initialCodeRule)
  }, [codeRuleCrud.selectedItem])

  useEffect(() => {
    setAttributeForm(attributeCrud.selectedItem || initialAttributeTemplate)
  }, [attributeCrud.selectedItem])

  // ============================================
  // 분류 체계 관리
  // ============================================
  const categoryColumns: DataTableColumn<MaterialCategory>[] = [
    { key: "code", title: "분류 코드", width: "120px", sortable: true, searchable: true, render: (_, r) => <span className="font-mono">{r.code}</span> },
    { key: "name", title: "분류명", width: "200px", sortable: true, searchable: true },
    {
      key: "level",
      title: "레벨",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "대분류", value: "major" },
        { label: "중분류", value: "middle" },
        { label: "소분류", value: "minor" },
      ],
      render: (value) => {
        const config = { major: "default", middle: "secondary", minor: "outline" } as const
        const label = { major: "대분류", middle: "중분류", minor: "소분류" }
        return <Badge variant={config[value as keyof typeof config]}>{label[value as keyof typeof label]}</Badge>
      },
    },
    {
      key: "parentId",
      title: "상위 분류",
      width: "150px",
      render: (_, r) => {
        const parent = categories.find((c) => c.id === r.parentId)
        return parent?.name || "-"
      },
    },
    {
      key: "isActive",
      title: "상태",
      width: "80px",
      align: "center",
      filterable: true,
      filterOptions: [{ label: "활성", value: true }, { label: "비활성", value: false }],
      render: (value) => <Badge variant={value ? "default" : "secondary"}>{value ? "활성" : "비활성"}</Badge>,
    },
  ]

  const categoryActions: DataTableAction<MaterialCategory>[] = [
    { key: "edit", label: "수정", iconName: "edit", onClick: (r) => categoryCrud.handleEdit(r) },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (r) => {
        setCategories(categories.filter((c) => c.id !== r.id))
        toast({ title: "삭제 완료", description: "분류가 삭제되었습니다." })
      },
    },
  ]

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (categoryCrud.selectedItem) {
      setCategories(categories.map((c) => c.id === categoryCrud.selectedItem!.id ? { ...categoryForm } : c))
      toast({ title: "수정 완료", description: "분류가 수정되었습니다." })
    } else {
      setCategories([...categories, { ...categoryForm, id: `cat-${Date.now()}` }])
      toast({ title: "추가 완료", description: "분류가 추가되었습니다." })
    }
    categoryCrud.setFormOpen(false)
  }

  // ============================================
  // 코드 규칙 관리
  // ============================================
  const codeRuleColumns: DataTableColumn<MaterialCodeRule>[] = [
    {
      key: "categoryId",
      title: "분류",
      width: "150px",
      render: (_, r) => categories.find((c) => c.id === r.categoryId)?.name || "-",
    },
    { key: "prefix", title: "접두사", width: "100px", render: (_, r) => <span className="font-mono">{r.prefix}</span> },
    { key: "pattern", title: "패턴", width: "200px", searchable: true, render: (_, r) => <span className="font-mono text-sm">{r.pattern}</span> },
    { key: "example", title: "예시", width: "150px", render: (_, r) => <span className="font-mono text-sm text-primary">{r.example}</span> },
    {
      key: "isActive",
      title: "상태",
      width: "80px",
      align: "center",
      render: (value) => <Badge variant={value ? "default" : "secondary"}>{value ? "활성" : "비활성"}</Badge>,
    },
  ]

  const codeRuleActions: DataTableAction<MaterialCodeRule>[] = [
    { key: "edit", label: "수정", iconName: "edit", onClick: (r) => codeRuleCrud.handleEdit(r) },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (r) => {
        setCodeRules(codeRules.filter((c) => c.id !== r.id))
        toast({ title: "삭제 완료", description: "코드 규칙이 삭제되었습니다." })
      },
    },
  ]

  const handleCodeRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (codeRuleCrud.selectedItem) {
      setCodeRules(codeRules.map((r) => r.id === codeRuleCrud.selectedItem!.id ? { ...codeRuleForm } : r))
      toast({ title: "수정 완료", description: "코드 규칙이 수정되었습니다." })
    } else {
      setCodeRules([...codeRules, { ...codeRuleForm, id: `rule-${Date.now()}` }])
      toast({ title: "추가 완료", description: "코드 규칙이 추가되었습니다." })
    }
    codeRuleCrud.setFormOpen(false)
  }

  // ============================================
  // 속성 템플릿 관리
  // ============================================
  const attributeColumns: DataTableColumn<MaterialAttributeTemplate>[] = [
    {
      key: "categoryId",
      title: "분류",
      width: "150px",
      render: (_, r) => categories.find((c) => c.id === r.categoryId)?.name || "-",
    },
    { key: "name", title: "속성명", width: "150px", searchable: true },
    {
      key: "dataType",
      title: "데이터 타입",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "텍스트", value: "text" },
        { label: "숫자", value: "number" },
        { label: "선택", value: "select" },
        { label: "날짜", value: "date" },
        { label: "불린", value: "boolean" },
      ],
      render: (value) => {
        const label = { text: "텍스트", number: "숫자", select: "선택", date: "날짜", boolean: "불린" }
        return <Badge variant="outline">{label[value as keyof typeof label]}</Badge>
      },
    },
    {
      key: "isRequired",
      title: "필수 여부",
      width: "80px",
      align: "center",
      render: (value) => <Badge variant={value ? "destructive" : "secondary"}>{value ? "필수" : "선택"}</Badge>,
    },
    { key: "description", title: "설명", width: "250px", render: (_, r) => <span className="text-sm text-muted-foreground">{r.description}</span> },
  ]

  const attributeActions: DataTableAction<MaterialAttributeTemplate>[] = [
    { key: "edit", label: "수정", iconName: "edit", onClick: (r) => attributeCrud.handleEdit(r) },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (r) => {
        setAttributeTemplates(attributeTemplates.filter((a) => a.id !== r.id))
        toast({ title: "삭제 완료", description: "속성 템플릿이 삭제되었습니다." })
      },
    },
  ]

  const handleAttributeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (attributeCrud.selectedItem) {
      setAttributeTemplates(attributeTemplates.map((a) => a.id === attributeCrud.selectedItem!.id ? { ...attributeForm } : a))
      toast({ title: "수정 완료", description: "속성 템플릿이 수정되었습니다." })
    } else {
      setAttributeTemplates([...attributeTemplates, { ...attributeForm, id: `attr-${Date.now()}` }])
      toast({ title: "추가 완료", description: "속성 템플릿이 추가되었습니다." })
    }
    attributeCrud.setFormOpen(false)
  }

  // ============================================
  // 승인 워크플로우 관리 (읽기 전용)
  // ============================================
  const workflowColumns: DataTableColumn<ApprovalWorkflow>[] = [
    { key: "name", title: "워크플로우명", width: "200px", searchable: true },
    { key: "steps", title: "단계 수", width: "100px", align: "center", render: (_, r) => <Badge variant="outline">{r.steps.length}단계</Badge> },
    {
      key: "isActive",
      title: "상태",
      width: "80px",
      align: "center",
      render: (value) => <Badge variant={value ? "default" : "secondary"}>{value ? "활성" : "비활성"}</Badge>,
    },
  ]

  // ============================================
  // 엑셀 다운로드 핸들러
  // ============================================
  const handleExportCategories = () => {
    downloadExcel(categories, [
      { key: "code", title: "코드" },
      { key: "name", title: "이름" },
      { key: "level", title: "레벨" },
      { key: "isActive", title: "활성화" },
    ], "자재분류")
    toast({ title: "다운로드 완료", description: "자재분류 목록이 다운로드되었습니다." })
  }

  const handleExportCodeRules = () => {
    downloadExcel(codeRules, [
      { key: "prefix", title: "접두사" },
      { key: "pattern", title: "패턴" },
      { key: "example", title: "예시" },
      { key: "isActive", title: "활성화" },
    ], "코드규칙")
    toast({ title: "다운로드 완료", description: "코드규칙 목록이 다운로드되었습니다." })
  }

  const handleExportAttributes = () => {
    downloadExcel(attributeTemplates, [
      { key: "name", title: "속성명" },
      { key: "dataType", title: "데이터타입" },
      { key: "isRequired", title: "필수여부" },
      { key: "description", title: "설명" },
    ], "속성템플릿")
    toast({ title: "다운로드 완료", description: "속성템플릿 목록이 다운로드되었습니다." })
  }

  // ============================================
  // 탭 목록 (headerLeft용)
  // ============================================
  const TabsHeader = () => (
    <TabsList className="bg-transparent p-0 h-auto">
      <TabsTrigger
        value="categories"
        className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-lg"
      >
        <Icon name="category" size="sm" className="mr-2" />
        분류 체계
        <Badge variant="secondary" className="ml-2 bg-primary/20">{categories.length}</Badge>
      </TabsTrigger>
      <TabsTrigger
        value="code-rules"
        className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-lg"
      >
        <Icon name="tag" size="sm" className="mr-2" />
        코드 규칙
        <Badge variant="secondary" className="ml-2 bg-primary/20">{codeRules.length}</Badge>
      </TabsTrigger>
      <TabsTrigger
        value="attributes"
        className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-lg"
      >
        <Icon name="list_alt" size="sm" className="mr-2" />
        속성 템플릿
        <Badge variant="secondary" className="ml-2 bg-primary/20">{attributeTemplates.length}</Badge>
      </TabsTrigger>
      <TabsTrigger
        value="workflows"
        className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-lg"
      >
        <Icon name="account_tree" size="sm" className="mr-2" />
        승인 워크플로우
        <Badge variant="secondary" className="ml-2 bg-primary/20">{workflows.length}</Badge>
      </TabsTrigger>
    </TabsList>
  )

  // ============================================
  // 렌더링
  // ============================================
  return (
    <>
      <div className="p-6">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text dark:text-white">자재마스터관리</h1>
          <p className="text-sm text-text-secondary mt-1">
            자재 분류 체계, 코드 규칙, 속성 템플릿, 승인 워크플로우를 관리합니다.
          </p>
        </div>

        {/* 탭 + DataTable */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* 분류 체계 탭 */}
          <TabsContent value="categories" className="mt-0">
            <DataTable
              data={categories}
              columns={categoryColumns}
              actions={categoryActions}
              loading={loading}
              headerLeft={<TabsHeader />}
              showSearch
              showFilter
              showColumnSettings
              showExport
              onExport={handleExportCategories}
              searchPlaceholder="분류 코드, 분류명으로 검색..."
              onAdd={() => categoryCrud.handleAdd()}
              addButtonText="분류 추가"
              pagination={{
                page: categoryPage,
                pageSize,
                total: categories.length,
                onPageChange: setCategoryPage,
                onPageSizeChange: setPageSize,
              }}
            />
          </TabsContent>

          {/* 코드 규칙 탭 */}
          <TabsContent value="code-rules" className="mt-0">
            <DataTable
              data={codeRules}
              columns={codeRuleColumns}
              actions={codeRuleActions}
              loading={loading}
              headerLeft={<TabsHeader />}
              showSearch
              showFilter
              showColumnSettings
              showExport
              onExport={handleExportCodeRules}
              searchPlaceholder="패턴으로 검색..."
              onAdd={() => codeRuleCrud.handleAdd()}
              addButtonText="코드 규칙 추가"
              pagination={{
                page: codeRulePage,
                pageSize,
                total: codeRules.length,
                onPageChange: setCodeRulePage,
                onPageSizeChange: setPageSize,
              }}
            />
          </TabsContent>

          {/* 속성 템플릿 탭 */}
          <TabsContent value="attributes" className="mt-0">
            <DataTable
              data={attributeTemplates}
              columns={attributeColumns}
              actions={attributeActions}
              loading={loading}
              headerLeft={<TabsHeader />}
              showSearch
              showFilter
              showColumnSettings
              showExport
              onExport={handleExportAttributes}
              searchPlaceholder="속성명으로 검색..."
              onAdd={() => attributeCrud.handleAdd()}
              addButtonText="속성 추가"
              pagination={{
                page: attributePage,
                pageSize,
                total: attributeTemplates.length,
                onPageChange: setAttributePage,
                onPageSizeChange: setPageSize,
              }}
            />
          </TabsContent>

          {/* 승인 워크플로우 탭 */}
          <TabsContent value="workflows" className="mt-0">
            <DataTable
              data={workflows}
              columns={workflowColumns}
              loading={loading}
              headerLeft={<TabsHeader />}
              showSearch
              showColumnSettings
              searchPlaceholder="워크플로우명으로 검색..."
              pagination={{
                page: workflowPage,
                pageSize,
                total: workflows.length,
                onPageChange: setWorkflowPage,
                onPageSizeChange: setPageSize,
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* 분류 폼 다이얼로그 */}
      <Dialog open={categoryCrud.formOpen} onOpenChange={categoryCrud.setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{categoryCrud.selectedItem ? "분류 수정" : "새 분류 추가"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">분류 코드</Label>
              <Input id="code" value={categoryForm.code} onChange={(e) => setCategoryForm((prev) => ({ ...prev, code: e.target.value }))} placeholder="예: MEC" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">분류명</Label>
              <Input id="name" value={categoryForm.name} onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="예: 기계부품" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">분류 레벨</Label>
              <Select value={categoryForm.level} onValueChange={(value) => setCategoryForm((prev) => ({ ...prev, level: value as any }))}>
                <SelectTrigger><SelectValue placeholder="분류 레벨 선택" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="major">대분류</SelectItem>
                  <SelectItem value="middle">중분류</SelectItem>
                  <SelectItem value="minor">소분류</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">상위 분류</Label>
              <Select value={categoryForm.parentId || ""} onValueChange={(value) => setCategoryForm((prev) => ({ ...prev, parentId: value || undefined }))}>
                <SelectTrigger><SelectValue placeholder="상위 분류 선택 (선택사항)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">없음</SelectItem>
                  {categories.filter((c) => c.id !== categoryCrud.selectedItem?.id).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => categoryCrud.setFormOpen(false)}>취소</Button>
              <Button type="submit">{categoryCrud.selectedItem ? "수정" : "추가"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 코드 규칙 폼 다이얼로그 */}
      <Dialog open={codeRuleCrud.formOpen} onOpenChange={codeRuleCrud.setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{codeRuleCrud.selectedItem ? "코드 규칙 수정" : "새 코드 규칙 추가"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCodeRuleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">분류</Label>
              <Select value={codeRuleForm.categoryId} onValueChange={(value) => setCodeRuleForm((prev) => ({ ...prev, categoryId: value }))}>
                <SelectTrigger><SelectValue placeholder="분류 선택" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prefix">접두사</Label>
              <Input id="prefix" value={codeRuleForm.prefix} onChange={(e) => setCodeRuleForm((prev) => ({ ...prev, prefix: e.target.value }))} placeholder="예: MEC-" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pattern">패턴</Label>
              <Input id="pattern" value={codeRuleForm.pattern} onChange={(e) => setCodeRuleForm((prev) => ({ ...prev, pattern: e.target.value }))} placeholder="예: {PREFIX}-{YYYYMM}-{SEQ:4}" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="example">예시</Label>
              <Input id="example" value={codeRuleForm.example} onChange={(e) => setCodeRuleForm((prev) => ({ ...prev, example: e.target.value }))} placeholder="예: MEC-202401-0001" />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => codeRuleCrud.setFormOpen(false)}>취소</Button>
              <Button type="submit">{codeRuleCrud.selectedItem ? "수정" : "추가"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 속성 템플릿 폼 다이얼로그 */}
      <Dialog open={attributeCrud.formOpen} onOpenChange={attributeCrud.setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{attributeCrud.selectedItem ? "속성 템플릿 수정" : "새 속성 템플릿 추가"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAttributeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attrCategoryId">분류</Label>
              <Select value={attributeForm.categoryId} onValueChange={(value) => setAttributeForm((prev) => ({ ...prev, categoryId: value }))}>
                <SelectTrigger><SelectValue placeholder="분류 선택" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attrName">속성명</Label>
              <Input id="attrName" value={attributeForm.name} onChange={(e) => setAttributeForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="예: 규격" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataType">데이터 타입</Label>
              <Select value={attributeForm.dataType} onValueChange={(value) => setAttributeForm((prev) => ({ ...prev, dataType: value as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">텍스트</SelectItem>
                  <SelectItem value="number">숫자</SelectItem>
                  <SelectItem value="select">선택</SelectItem>
                  <SelectItem value="date">날짜</SelectItem>
                  <SelectItem value="boolean">불린</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attrDescription">설명</Label>
              <Textarea id="attrDescription" value={attributeForm.description} onChange={(e) => setAttributeForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="속성에 대한 설명..." />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => attributeCrud.setFormOpen(false)}>취소</Button>
              <Button type="submit">{attributeCrud.selectedItem ? "수정" : "추가"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
