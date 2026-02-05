/**
 * @file apps/web/components/maintenance-template/template-master-management.tsx
 * @description 보전템플릿 마스터 관리 컴포넌트 - 표준 DataTable 형식
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
import { type InspectionMaster, type InspectionMasterItem, PeriodType } from "@fms/types"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"

/** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 */
const getTodayIsoDate = () => {
  return new Date().toISOString().split("T")[0]
}

const periodTypeLabels: Record<string, string> = {
  DAILY: "매일",
  WEEKLY: "매주",
  MONTHLY: "매월",
  QUARTERLY: "분기",
  SEMI_ANNUALLY: "반기",
  ANNUALLY: "매년",
  ON_DEMAND: "필요시",
}

// 빈 옵션 배열 (API에서 로드 필요)
const equipmentTypes: { id: string; name: string }[] = []
const inspectionTypes: { id: string; name: string }[] = []
const departments: { id: string; name: string }[] = []
const users: { id: string; name: string }[] = []

export function TemplateMasterManagement() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [data, setData] = useState<InspectionMaster[]>([])

  // 마스터 템플릿 CRUD 상태
  const masterCrud = useCrudState<InspectionMaster>()

  // 점검 항목 CRUD 상태
  const itemCrud = useCrudState<InspectionMasterItem>()

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 폼 데이터 상태
  const [masterFormData, setMasterFormData] = useState<Partial<InspectionMaster>>({})
  const [itemFormData, setItemFormData] = useState<Partial<InspectionMasterItem>>({})

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

  const handleItemFormChange = (field: keyof InspectionMasterItem, value: any) => {
    setItemFormData((prev) => ({ ...prev, [field]: value }))
  }

  const columns: DataTableColumn<InspectionMaster>[] = [
    {
      key: "code",
      title: "템플릿코드",
      width: "120px",
      searchable: true,
      render: (_, record) => record.code,
    },
    {
      key: "name",
      title: "템플릿명",
      width: "minmax(200px, 1fr)",
      searchable: true,
      render: (_, record) => <span className="font-medium">{record.name}</span>,
    },
    {
      key: "equipmentType",
      title: "설비유형",
      width: "120px",
      searchable: true,
      render: (_, record) => record.equipmentType?.name || "-",
    },
    {
      key: "inspectionType",
      title: "점검유형",
      width: "120px",
      render: (_, record) => record.inspectionType?.name || "-",
    },
    {
      key: "period",
      title: "주기",
      width: "120px",
      render: (_, record) => `${periodTypeLabels[record.periodType] || record.periodType} (${record.periodValue || 1})`,
    },
    {
      key: "estimatedTime",
      title: "예상시간(분)",
      width: "100px",
      align: "right",
      sortable: true,
      render: (_, record) => record.estimatedTime || 0,
    },
    {
      key: "itemCount",
      title: "항목수",
      width: "80px",
      align: "right",
      render: (_, record) => record.items?.length || 0,
    },
    {
      key: "isActive",
      title: "상태",
      width: "90px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "활성", value: "true" },
        { label: "비활성", value: "false" },
      ],
      render: (_, record) => (
        <Badge variant={record.isActive ? "default" : "secondary"}>
          {record.isActive ? "활성" : "비활성"}
        </Badge>
      ),
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<InspectionMaster>[] = [
    {
      key: "view",
      label: "상세 보기",
      iconName: "visibility",
      onClick: (record) => {
        setMasterFormData({ ...record })
        masterCrud.handleView(record)
      },
    },
    {
      key: "edit",
      label: "수정",
      iconName: "edit",
      onClick: (record) => {
        setMasterFormData({
          ...record,
          effectiveDate: record.effectiveDate
            ? typeof record.effectiveDate === "string"
              ? record.effectiveDate.split("T")[0]
              : record.effectiveDate
            : getTodayIsoDate(),
          expiryDate: record.expiryDate
            ? typeof record.expiryDate === "string"
              ? record.expiryDate.split("T")[0]
              : record.expiryDate
            : undefined,
        } as any)
        masterCrud.handleEdit(record)
      },
    },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => {
        if (confirm(`${record.name} 템플릿을 삭제하시겠습니까?`)) {
          setData((prev) => prev.filter((i) => i.id !== record.id))
          toast({ title: "삭제 완료" })
        }
      },
    },
  ]

  // 항목 컬럼 정의
  const itemColumns: DataTableColumn<InspectionMasterItem>[] = [
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
      key: "checkMethod",
      title: "점검방법",
      width: "150px",
      render: (_, record) => record.checkMethod || "-",
    },
    {
      key: "expectedValue",
      title: "기준값",
      width: "100px",
      render: (_, record) => record.expectedValue || "-",
    },
    {
      key: "dataType",
      title: "데이터타입",
      width: "100px",
      render: (_, record) => record.dataType,
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
  const itemActions: DataTableAction<InspectionMasterItem>[] = [
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
        const updater = (prevData: Partial<InspectionMaster>) => ({
          ...prevData,
          items: prevData.items?.filter((i) => i.id !== record.id).map((it, idx) => ({ ...it, sequence: idx + 1 })) || [],
        })
        if (masterCrud.formMode === "create" || masterCrud.formMode === "edit") setMasterFormData(updater)
        else if (masterCrud.selectedItem) {
          const updatedMaster = updater(masterCrud.selectedItem) as InspectionMaster
          setData((prev) => prev.map((m) => (m.id === updatedMaster.id ? updatedMaster : m)))
        }
        toast({ title: "항목 삭제됨" })
      },
    },
  ]

  const handleSaveMaster = () => {
    const masterToSave = { ...masterFormData } as InspectionMaster

    masterToSave.equipmentType = equipmentTypes.find((et) => et.id === masterFormData.equipmentTypeId) || masterFormData.equipmentType
    masterToSave.inspectionType = inspectionTypes.find((it) => it.id === masterFormData.inspectionTypeId) || masterFormData.inspectionType
    masterToSave.department = departments.find((d) => d.id === masterFormData.departmentId) || masterFormData.department
    masterToSave.responsibleUser = users.find((u) => u.id === masterFormData.responsibleUserId) || masterFormData.responsibleUser
    masterToSave.updatedAt = new Date().toISOString()
    masterToSave.items = masterToSave.items || []

    if (masterCrud.formMode === "edit" && masterCrud.selectedItem) {
      setData((prev) => prev.map((item) => (item.id === masterToSave.id ? masterToSave : item)))
    } else {
      masterToSave.id = masterToSave.id || `tpl_${Date.now()}`
      masterToSave.createdAt = new Date().toISOString()
      setData((prev) => [masterToSave, ...prev])
    }
    masterCrud.setFormOpen(false)
    setMasterFormData({})
  }

  const handleSaveItem = () => {
    const itemToSave = { ...itemFormData } as InspectionMasterItem
    const updater = (prevData: Partial<InspectionMaster>) => {
      const items = prevData.items || []
      if (itemCrud.formMode === "create") {
        return { ...prevData, items: [...items, itemToSave].sort((a, b) => (a.sequence || 0) - (b.sequence || 0)) }
      } else {
        return {
          ...prevData,
          items: items.map((i) => (i.id === itemToSave.id ? itemToSave : i)).sort((a, b) => (a.sequence || 0) - (b.sequence || 0)),
        }
      }
    }

    if (masterCrud.formMode === "create" || masterCrud.formMode === "edit") {
      setMasterFormData(updater)
    } else if (masterCrud.selectedItem) {
      const updatedMaster = updater(masterCrud.selectedItem) as InspectionMaster
      setData((prev) => prev.map((m) => (m.id === updatedMaster.id ? updatedMaster : m)))
    }
    itemCrud.setFormOpen(false)
    setItemFormData({})
  }

  // 헤더 좌측 탭 버튼
  const HeaderLeft = () => (
    <div className="flex gap-1 bg-surface dark:bg-surface-dark p-1 rounded-lg border border-border">
      {[
        { id: "all", label: `전체 (${stats.total})` },
        { id: "active", label: `활성 (${stats.active})` },
        { id: "inactive", label: `비활성 (${stats.inactive})` },
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
      <Button variant="outline">
        <Icon name="upload_file" size="sm" className="mr-2" />
        가져오기/내보내기
      </Button>
      <Button
        onClick={() => {
          setMasterFormData({
            code: `TPL${String(data.length + 1).padStart(3, "0")}`,
            version: "1.0",
            isActive: true,
            effectiveDate: getTodayIsoDate(),
            items: [],
          })
          masterCrud.handleAdd()
        }}
      >
        <Icon name="add" size="sm" className="mr-2" />
        템플릿 등록
      </Button>
    </div>
  )

  const renderMasterFormFields = (
    targetFormData: Partial<InspectionMaster>,
    onChangeHandler: (field: keyof InspectionMaster, value: any) => void,
    isViewOnly: boolean = false
  ) => (
    <ScrollArea className="max-h-[70vh] pr-4">
      <div className="space-y-6 pt-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>템플릿 코드 *</Label>
            <Input disabled={isViewOnly} value={targetFormData.code || ""} onChange={(e) => onChangeHandler("code", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>버전</Label>
            <Input disabled={isViewOnly} value={targetFormData.version || ""} onChange={(e) => onChangeHandler("version", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>템플릿명 *</Label>
          <Input disabled={isViewOnly} value={targetFormData.name || ""} onChange={(e) => onChangeHandler("name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>설명</Label>
          <Textarea disabled={isViewOnly} value={targetFormData.description || ""} onChange={(e) => onChangeHandler("description", e.target.value)} rows={2} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>설비유형 *</Label>
            <select
              disabled={isViewOnly}
              value={targetFormData.equipmentTypeId || targetFormData.equipmentType?.id}
              onChange={(e) => onChangeHandler("equipmentTypeId", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark"
            >
              {equipmentTypes.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>점검유형 *</Label>
            <select
              disabled={isViewOnly}
              value={targetFormData.inspectionTypeId || targetFormData.inspectionType?.id}
              onChange={(e) => onChangeHandler("inspectionTypeId", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark"
            >
              {inspectionTypes.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>주기 유형 *</Label>
            <select
              disabled={isViewOnly}
              value={targetFormData.periodType}
              onChange={(e) => onChangeHandler("periodType", e.target.value as PeriodType)}
              className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark"
            >
              {Object.values(PeriodType).map((pt) => (
                <option key={pt} value={pt}>
                  {periodTypeLabels[pt] || pt}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>주기 값 *</Label>
            <Input disabled={isViewOnly} type="number" value={targetFormData.periodValue || 1} onChange={(e) => onChangeHandler("periodValue", parseInt(e.target.value))} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input disabled={isViewOnly} type="checkbox" id="isActive" checked={targetFormData.isActive} onChange={(e) => onChangeHandler("isActive", e.target.checked)} className="w-4 h-4" />
          <Label htmlFor="isActive">활성 상태 여부</Label>
        </div>

        <div className="pt-4 space-y-4">
          <div className="flex justify-between items-center bg-surface dark:bg-surface-dark p-3 rounded-lg border border-border">
            <h4 className="font-semibold text-primary">점검 항목 ({targetFormData.items?.length || 0})</h4>
            {!isViewOnly && (
              <Button
                size="sm"
                onClick={() => {
                  setItemFormData({ id: `item_${Date.now()}`, sequence: (targetFormData.items?.length || 0) + 1, isRequired: true, dataType: "TEXT" })
                  itemCrud.handleAdd()
                }}
              >
                <Icon name="add" size="sm" className="mr-1" />
                항목 추가
              </Button>
            )}
          </div>
          <DataTable
            data={targetFormData.items || []}
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
        <h1 className="text-2xl font-bold text-text dark:text-white">보전템플릿 마스터 관리</h1>
        <p className="text-sm text-text-secondary mt-1">보전 점검 템플릿을 등록하고 관리합니다.</p>
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
        searchPlaceholder="템플릿명, 코드, 설비유형 등으로 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: filteredData.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* 마스터 편집/생성 다이얼로그 */}
      <Dialog open={masterCrud.formOpen && (masterCrud.formMode === "create" || masterCrud.formMode === "edit")} onOpenChange={masterCrud.setFormOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{masterCrud.formMode === "create" ? "새 보전템플릿 등록" : "보전템플릿 수정"}</DialogTitle>
          </DialogHeader>
          {renderMasterFormFields(masterFormData, (f, v) => setMasterFormData((prev) => ({ ...prev, [f]: v })))}
          <DialogFooter>
            <Button variant="outline" onClick={() => masterCrud.setFormOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveMaster}>저장하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 마스터 상세보기 다이얼로그 */}
      <Dialog open={masterCrud.formOpen && masterCrud.formMode === "view"} onOpenChange={masterCrud.setFormOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{masterCrud.selectedItem?.name} 상세 정보</DialogTitle>
          </DialogHeader>
          {masterCrud.selectedItem && renderMasterFormFields(masterCrud.selectedItem, () => {}, true)}
          <DialogFooter>
            <Button variant="outline" onClick={() => masterCrud.setFormOpen(false)}>
              닫기
            </Button>
            <Button
              onClick={() => {
                const item = masterCrud.selectedItem!
                setMasterFormData({
                  ...item,
                  effectiveDate: item.effectiveDate ? (typeof item.effectiveDate === "string" ? item.effectiveDate.split("T")[0] : item.effectiveDate) : getTodayIsoDate(),
                } as any)
                masterCrud.handleEdit(item)
              }}
            >
              편집하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 항목 상세 편집 다이얼로그 */}
      <Dialog open={itemCrud.formOpen} onOpenChange={itemCrud.setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{itemCrud.formMode === "create" ? "새 점검항목 추가" : "점검항목 수정"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>순서 *</Label>
                <Input type="number" value={itemFormData.sequence || ""} onChange={(e) => handleItemFormChange("sequence", parseInt(e.target.value))} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>항목명 *</Label>
                <Input value={itemFormData.name || ""} onChange={(e) => handleItemFormChange("name", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>점검방법</Label>
              <Textarea value={itemFormData.checkMethod || ""} onChange={(e) => handleItemFormChange("checkMethod", e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>데이터 타입</Label>
                <select value={itemFormData.dataType} onChange={(e) => handleItemFormChange("dataType", e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-background dark:bg-background-dark">
                  <option value="TEXT">텍스트</option>
                  <option value="NUMBER">숫자</option>
                  <option value="BOOLEAN">예/아니오</option>
                  <option value="SELECT">선택</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>기준값</Label>
                <Input value={itemFormData.expectedValue || ""} onChange={(e) => handleItemFormChange("expectedValue", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="itemIsRequired" checked={itemFormData.isRequired} onChange={(e) => handleItemFormChange("isRequired", e.target.checked)} className="w-4 h-4" />
              <Label htmlFor="itemIsRequired">필수 항목 여부</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => itemCrud.setFormOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveItem}>항목 저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
