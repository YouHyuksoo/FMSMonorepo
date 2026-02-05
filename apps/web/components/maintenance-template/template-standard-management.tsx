/**
 * @file apps/web/components/maintenance-template/template-standard-management.tsx
 * @description 보전기준서 관리 컴포넌트 - 표준 DataTable 형식
 */
"use client"

import { useState, useMemo } from "react"
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
import { Label } from "@fms/ui/label"
import { Input } from "@fms/ui/input"
import { Textarea } from "@fms/ui/textarea"
import { ScrollArea } from "@fms/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { type InspectionStandard, type InspectionStandardItem } from "@fms/types"
import {
  mockInspectionStandards,
  mockEquipmentTypes,
  mockInspectionMasters,
} from "@/lib/mock-data/inspection-standard"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"

/** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 */
const getTodayIsoDate = () => {
  return new Date().toISOString().split("T")[0]
}

export function TemplateStandardManagement() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [data, setData] = useState<InspectionStandard[]>(mockInspectionStandards)

  // 기준서 CRUD 상태
  const standardCrud = useCrudState<InspectionStandard>()

  // 상세 항목 CRUD 상태
  const itemCrud = useCrudState<InspectionStandardItem>()

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [standardFormData, setStandardFormData] = useState<Partial<InspectionStandard>>({})
  const [itemFormData, setItemFormData] = useState<Partial<InspectionStandardItem>>({})

  const filteredData = useMemo(() => {
    let result = data
    if (activeTab === "active") result = result.filter((item) => item.isActive)
    else if (activeTab === "inactive") result = result.filter((item) => !item.isActive)
    return result
  }, [data, activeTab])

  const stats = {
    total: data.length,
    active: data.filter((item) => item.isActive).length,
    inactive: data.filter((item) => !item.isActive).length,
  }

  const columns: DataTableColumn<InspectionStandard>[] = [
    {
      key: "code",
      title: "기준서코드",
      width: "150px",
      searchable: true,
      render: (_, record) => record.code,
    },
    {
      key: "name",
      title: "기준서명",
      width: "minmax(250px, 1fr)",
      searchable: true,
      render: (_, record) => <span className="font-medium text-primary">{record.name}</span>,
    },
    {
      key: "version",
      title: "버전",
      width: "80px",
      render: (_, record) => record.version,
    },
    {
      key: "equipmentType",
      title: "설비유형",
      width: "150px",
      searchable: true,
      render: (_, record) => record.equipmentType?.name || "-",
    },
    {
      key: "effectiveDate",
      title: "적용시작일",
      width: "120px",
      sortable: true,
      render: (_, record) => record.effectiveDate,
    },
    {
      key: "isActive",
      title: "상태",
      width: "90px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "사용중", value: "true" },
        { label: "미사용", value: "false" },
      ],
      render: (_, record) => (
        <Badge variant={record.isActive ? "default" : "secondary"}>
          {record.isActive ? "사용중" : "미사용"}
        </Badge>
      ),
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<InspectionStandard>[] = [
    {
      key: "view",
      label: "상세 보기",
      iconName: "visibility",
      onClick: (record) => {
        setStandardFormData({ ...record })
        standardCrud.handleView(record)
      },
    },
    {
      key: "edit",
      label: "수정",
      iconName: "edit",
      onClick: (record) => {
        setStandardFormData({
          ...record,
          effectiveDate: record.effectiveDate ? record.effectiveDate.split("T")[0] : getTodayIsoDate(),
        } as any)
        standardCrud.handleEdit(record)
      },
    },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => {
        if (confirm("정말 이 기준서를 삭제하시겠습니까?")) {
          setData((prev) => prev.filter((i) => i.id !== record.id))
          toast({ title: "삭제 완료" })
        }
      },
    },
  ]

  // 항목 컬럼 정의
  const itemColumns: DataTableColumn<InspectionStandardItem>[] = [
    {
      key: "sequence",
      title: "순서",
      width: "60px",
      render: (_, record) => record.sequence,
    },
    {
      key: "name",
      title: "항목명",
      width: "minmax(150px, 1fr)",
      render: (_, record) => record.name,
    },
    {
      key: "passFailCriteria",
      title: "합/부 기준",
      width: "200px",
      render: (_, record) => record.passFailCriteria || "-",
    },
    {
      key: "expectedValue",
      title: "기준값",
      width: "100px",
      render: (_, record) => record.expectedValue || "-",
    },
    {
      key: "isRequired",
      title: "필수",
      width: "60px",
      align: "center",
      render: (_, record) =>
        record.isRequired ? (
          <Icon name="check_circle" size="sm" className="text-green-500" />
        ) : (
          <Icon name="cancel" size="sm" className="text-text-secondary opacity-30" />
        ),
    },
  ]

  // 편집용 항목 액션
  const itemActions: DataTableAction<InspectionStandardItem>[] = [
    {
      key: "edit",
      label: "수정",
      iconName: "edit",
      onClick: (record) => {
        setItemFormData({ ...record })
        itemCrud.handleEdit(record)
      },
    },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => {
        setStandardFormData((prev) => ({
          ...prev,
          items: prev.items?.filter((i) => i.id !== record.id).map((it, idx) => ({ ...it, sequence: idx + 1 })) || [],
        }))
        toast({ title: "항목 삭제됨" })
      },
    },
  ]

  const handleSaveStandard = () => {
    const standardToSave = { ...standardFormData } as InspectionStandard
    standardToSave.equipmentType = mockEquipmentTypes.find((et) => et.id === standardFormData.equipmentTypeId) || standardFormData.equipmentType
    standardToSave.master = mockInspectionMasters.find((m) => m.id === standardFormData.masterId) || standardFormData.master
    standardToSave.updatedAt = new Date().toISOString()
    standardToSave.items = standardToSave.items || []

    if (standardCrud.formMode === "edit" && standardCrud.selectedItem) {
      setData((prev) => prev.map((item) => (item.id === standardToSave.id ? standardToSave : item)))
    } else {
      standardToSave.id = standardToSave.id || `std_${Date.now()}`
      standardToSave.createdAt = new Date().toISOString()
      setData((prev) => [standardToSave, ...prev])
    }
    standardCrud.setFormOpen(false)
  }

  const handleSaveItem = () => {
    const itemToSave = { ...itemFormData } as InspectionStandardItem
    setStandardFormData((prev) => {
      const items = prev.items || []
      if (itemCrud.formMode === "create") {
        return { ...prev, items: [...items, itemToSave].sort((a, b) => a.sequence - b.sequence) }
      } else {
        return { ...prev, items: items.map((i) => (i.id === itemToSave.id ? itemToSave : i)).sort((a, b) => a.sequence - b.sequence) }
      }
    })
    itemCrud.setFormOpen(false)
  }

  // 헤더 좌측 탭 버튼
  const HeaderLeft = () => (
    <div className="flex gap-1 bg-surface dark:bg-surface-dark p-1 rounded-lg border border-border">
      {[
        { id: "all", label: `전체 (${stats.total})` },
        { id: "active", label: `사용중 (${stats.active})` },
        { id: "inactive", label: `미사용 (${stats.inactive})` },
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
      <Button variant="outline" onClick={() => toast({ title: "내보내기 준비 중" })}>
        <Icon name="file_download" size="sm" className="mr-2" />
        내보내기
      </Button>
      <Button
        onClick={() => {
          setStandardFormData({
            code: `STD-00${data.length + 1}`,
            version: "1.0",
            isActive: true,
            effectiveDate: getTodayIsoDate(),
            items: [],
            targetType: "EQUIPMENT_TYPE",
          })
          standardCrud.handleAdd()
        }}
      >
        <Icon name="add" size="sm" className="mr-2" />
        기준서 작성
      </Button>
    </div>
  )

  const renderStandardFormFields = (
    targetData: Partial<InspectionStandard>,
    onChange: (field: keyof InspectionStandard, value: any) => void,
    isViewOnly = false
  ) => (
    <ScrollArea className="max-h-[70vh] pr-4">
      <div className="space-y-6 pt-2 pb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>기준서 코드 *</Label>
            <Input disabled={isViewOnly} value={targetData.code || ""} onChange={(e) => onChange("code", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>버전 *</Label>
            <Input disabled={isViewOnly} value={targetData.version || ""} onChange={(e) => onChange("version", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>기준서명 *</Label>
          <Input disabled={isViewOnly} value={targetData.name || ""} onChange={(e) => onChange("name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>설명</Label>
          <Textarea disabled={isViewOnly} value={targetData.description || ""} onChange={(e) => onChange("description", e.target.value)} rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>기본 템플릿 *</Label>
            <select disabled={isViewOnly} value={targetData.masterId} onChange={(e) => onChange("masterId", e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark">
              {mockInspectionMasters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>설비유형 *</Label>
            <select disabled={isViewOnly} value={targetData.equipmentTypeId} onChange={(e) => onChange("equipmentTypeId", e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark">
              {mockEquipmentTypes.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>적용시작일 *</Label>
            <Input disabled={isViewOnly} type="date" value={targetData.effectiveDate || ""} onChange={(e) => onChange("effectiveDate", e.target.value)} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input disabled={isViewOnly} type="checkbox" id="isActive" checked={targetData.isActive} onChange={(e) => onChange("isActive", e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="isActive">사용 여부</Label>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <div className="flex justify-between items-center bg-surface dark:bg-surface-dark p-3 rounded-lg border border-border">
            <h4 className="font-semibold text-primary">항목 정의 ({targetData.items?.length || 0})</h4>
            {!isViewOnly && (
              <Button
                size="sm"
                onClick={() => {
                  setItemFormData({ id: `item_${Date.now()}`, sequence: (targetData.items?.length || 0) + 1, isRequired: true, isActive: true })
                  itemCrud.handleAdd()
                }}
              >
                <Icon name="add" size="sm" className="mr-1" />
                항목 추가
              </Button>
            )}
          </div>
          <DataTable
            data={targetData.items || []}
            columns={itemColumns}
            actions={isViewOnly ? undefined : itemActions}
            loading={false}
          />
        </div>
      </div>
    </ScrollArea>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">보전기준서 관리</h1>
        <p className="text-sm text-text-secondary mt-1">보전 기준서를 등록하고 관리합니다.</p>
      </div>

      <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">전체 기준서</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-green-50 dark:bg-green-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">사용 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-50 dark:bg-slate-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">미사용</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        actions={rowActions}
        loading={false}
        headerLeft={<HeaderLeft />}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="기준서명, 코드, 설비유형 등으로 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: filteredData.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />
      </div>

      {/* 기준서 작성/수정 다이얼로그 */}
      <Dialog open={standardCrud.formOpen && (standardCrud.formMode === "create" || standardCrud.formMode === "edit")} onOpenChange={standardCrud.setFormOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{standardCrud.formMode === "create" ? "기준서 신규 작성" : "기준서 내용 수정"}</DialogTitle>
          </DialogHeader>
          {renderStandardFormFields(standardFormData, (f, v) => setStandardFormData((prev) => ({ ...prev, [f]: v })))}
          <DialogFooter>
            <Button variant="outline" onClick={() => standardCrud.setFormOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveStandard}>저장하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 기준서 상세보기 다이얼로그 */}
      <Dialog open={standardCrud.formOpen && standardCrud.formMode === "view"} onOpenChange={standardCrud.setFormOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{standardCrud.selectedItem?.name} 상세보기</DialogTitle>
          </DialogHeader>
          {standardCrud.selectedItem && renderStandardFormFields(standardCrud.selectedItem, () => {}, true)}
          <DialogFooter>
            <Button variant="outline" onClick={() => standardCrud.setFormOpen(false)}>
              닫기
            </Button>
            <Button
              onClick={() => {
                const item = standardCrud.selectedItem!
                setStandardFormData({ ...item })
                standardCrud.handleEdit(item)
              }}
            >
              편집 모드로 전환
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 항목 상세 설정 다이얼로그 */}
      <Dialog open={itemCrud.formOpen} onOpenChange={itemCrud.setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>항목 상세 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>순서 *</Label>
                <Input type="number" value={itemFormData.sequence || ""} onChange={(e) => setItemFormData((prev) => ({ ...prev, sequence: parseInt(e.target.value) }))} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>항목명 *</Label>
                <Input value={itemFormData.name || ""} onChange={(e) => setItemFormData((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>합/부 판단 기준 *</Label>
              <Textarea value={itemFormData.passFailCriteria || ""} onChange={(e) => setItemFormData((prev) => ({ ...prev, passFailCriteria: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>상세 설명</Label>
              <Textarea value={itemFormData.description || ""} onChange={(e) => setItemFormData((prev) => ({ ...prev, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>기준값</Label>
                <Input value={itemFormData.expectedValue || ""} onChange={(e) => setItemFormData((prev) => ({ ...prev, expectedValue: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="itemIsReq" checked={itemFormData.isRequired} onChange={(e) => setItemFormData((prev) => ({ ...prev, isRequired: e.target.checked }))} className="w-4 h-4" />
                <Label htmlFor="itemIsReq">필수 여부</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => itemCrud.setFormOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveItem}>설정 적용</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
