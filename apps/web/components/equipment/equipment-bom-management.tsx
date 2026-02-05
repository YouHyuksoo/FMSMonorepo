/**
 * @file apps/web/components/equipment/equipment-bom-management.tsx
 * @description 설비 BOM(Bill of Materials) 관리 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 설비의 부품 구성 정보(BOM)를 트리 구조로 관리
 *    - BOM 목록 조회 및 검색
 *    - BOM 상세 보기 (트리 구조)
 *    - BOM 템플릿 관리
 * 2. **상태 관리**: useCrudState 훅을 사용하여 CRUD 관련 상태 통합 관리
 *    - bomCrud: BOM 생성 다이얼로그 상태
 *    - itemCrud: 부품 편집/추가 다이얼로그 상태
 * 3. **컴포넌트 구조**:
 *    - BOMTreeItem: 개별 BOM 아이템을 트리 형태로 렌더링
 *    - EquipmentBOMManagement: 메인 관리 컴포넌트
 */
"use client"

import type React from "react"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Badge } from "@fms/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@fms/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { Label } from "@fms/ui/label"
import { Textarea } from "@fms/ui/textarea"
import { ScrollArea } from "@fms/ui/scroll-area"
import { Icon } from "@fms/ui/icon"
import type { EquipmentBOM, BOMItem, BOMTemplate } from "@fms/types"
import { cn } from "@fms/utils"
import { useTranslation } from "@/lib/language-context"
import { useCrudState } from "@/hooks/use-crud-state"
import { DataTable } from "@/components/common/data-table"

const partTypeColors: Record<BOMItem["partType"], string> = {
  consumable: "bg-orange-100 text-orange-800",
  replacement: "bg-blue-100 text-blue-800",
  spare: "bg-green-100 text-green-800",
  standard: "bg-gray-100 text-gray-800",
}

const bomStatusIcons: Record<EquipmentBOM["bomStatus"], string> = {
  draft: "description",
  approved: "check_circle",
  active: "check_circle",
  obsolete: "error",
}

const bomStatusColors: Record<EquipmentBOM["bomStatus"], string> = {
  draft: "bg-gray-100 text-gray-800",
  approved: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  obsolete: "bg-red-100 text-red-800",
}

// Hook to get translated labels
function usePartTypeLabels() {
  const { t } = useTranslation("equipment")
  return {
    consumable: { label: t("part_type_consumable"), color: partTypeColors.consumable },
    replacement: { label: t("part_type_replacement"), color: partTypeColors.replacement },
    spare: { label: t("part_type_spare"), color: partTypeColors.spare },
    standard: { label: t("part_type_standard"), color: partTypeColors.standard },
  }
}

function useBomStatusLabels() {
  const { t } = useTranslation("equipment")
  return {
    draft: { label: t("bom_status_draft"), ...bomStatusColors.draft },
    approved: { label: t("bom_status_approved"), ...bomStatusColors.approved },
    active: { label: t("bom_status_active"), ...bomStatusColors.active },
    obsolete: { label: t("bom_status_obsolete"), ...bomStatusColors.obsolete },
  }
}

// --- Helper Functions ---
const generateNewBOMItemId = () => `bom-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

const calculateBOMItemTotalPrice = (item: Partial<BOMItem>): number => {
  return (item.quantity || 0) * (item.unitPrice || 0)
}

const calculateBOMTotalCost = (items: BOMItem[]): number => {
  let total = 0
  const calculate = (currentItems: BOMItem[]) => {
    for (const item of currentItems) {
      total += item.totalPrice
      if (item.children && item.children.length > 0) {
        calculate(item.children)
      }
    }
  }
  calculate(items)
  return total
}

// Recursive function to find and update/delete/add an item
const updateBOMItemsRecursive = (
  items: BOMItem[],
  targetId: string | null, // null for adding top-level
  action: "add" | "edit" | "delete" | "toggleExpand",
  payload?: Partial<BOMItem> | string, // payload is BOMItem for add/edit, parentId for add, itemId for delete/toggle
  parentIdForItemAdd?: string,
): BOMItem[] => {
  return items
    .map((item) => {
      if (item.id === targetId && (action === "edit" || action === "delete" || action === "toggleExpand")) {
        if (action === "edit" && payload && typeof payload === "object") {
          return { ...item, ...payload, totalPrice: calculateBOMItemTotalPrice({ ...item, ...payload }) }
        }
        if (action === "delete") {
          return null // Mark for deletion
        }
        if (action === "toggleExpand") {
          return { ...item, isExpanded: !item.isExpanded }
        }
      }

      if (item.id === parentIdForItemAdd && action === "add" && payload && typeof payload === "object") {
        const newItem: BOMItem = {
          id: generateNewBOMItemId(),
          partCode: "",
          partName: "",
          specification: "",
          unit: "EA",
          quantity: 1,
          unitPrice: 0,
          manufacturer: "",
          model: "",
          partType: "standard",
          level: item.level + 1,
          parentId: item.id,
          leadTime: 0,
          minStock: 0,
          currentStock: 0,
          supplier: "",
          remarks: "",
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
          isExpanded: false,
          children: [],
          ...payload, // Apply payload, which might override defaults
          totalPrice: calculateBOMItemTotalPrice(payload),
        }
        return { ...item, children: [...(item.children || []), newItem] }
      }

      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: updateBOMItemsRecursive(item.children, targetId, action, payload, parentIdForItemAdd),
        }
      }
      return item
    })
    .filter((item) => item !== null) as BOMItem[]
}

// --- BOMTreeItem Component ---
interface BOMTreeItemProps {
  item: BOMItem
  onEdit: (item: BOMItem) => void
  onDelete: (id: string) => void
  onAddChild: (parentId: string) => void
  onToggleExpand: (id: string) => void
}

function BOMTreeItem({ item, onEdit, onDelete, onAddChild, onToggleExpand }: BOMTreeItemProps) {
  const { t } = useTranslation("equipment")
  const partTypeLabels = usePartTypeLabels()
  const hasChildren = item.children && item.children.length > 0
  const partTypeInfo = partTypeLabels[item.partType]

  return (
    <div className={cn("border rounded-lg p-3 mb-2", `ml-${(item.level - 1) * 4}`)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 md:space-x-3 flex-1 min-w-0">
          {item.level > 1 && <div className="w-1 md:w-3" />} {/* Indentation spacer */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpand(item.id)}
            className="p-1 h-6 w-6"
            disabled={!hasChildren}
          >
            {hasChildren ? (
              item.isExpanded ? (
                <Icon name="expand_more" size="sm" />
              ) : (
                <Icon name="chevron_right" size="sm" />
              )
            ) : (
              <span className="w-4" />
            )}
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium truncate" title={item.partCode}>
                {item.partCode}
              </span>
              <Badge className={cn(partTypeInfo.color, "whitespace-nowrap")}>{partTypeInfo.label}</Badge>
              {item.currentStock < item.minStock && (
                <Badge variant="destructive" className="whitespace-nowrap">
                  재고부족
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground truncate" title={item.partName + " | " + item.specification}>
              {item.partName} | {item.specification}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
              <span>
                수량: {item.quantity}
                {item.unit}
              </span>
              <span>단가: ₩{item.unitPrice.toLocaleString()}</span>
              <span>총액: ₩{item.totalPrice.toLocaleString()}</span>
              <span>
                재고: {item.currentStock}/{item.minStock}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => onAddChild(item.id)} title={t("add_child_part")}>
            <Icon name="add" size="sm" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)} title={t("edit_part")}>
            <Icon name="edit" size="sm" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} title={t("delete_part")}>
            <Icon name="delete" size="sm" />
          </Button>
        </div>
      </div>

      {hasChildren && item.isExpanded && (
        <div className="mt-3 space-y-2">
          {item.children?.map((child) => (
            <BOMTreeItem
              key={child.id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 편집 중인 BOM 아이템 타입
 * - BOMItem의 일부 필드와 함께 parentId, isNew 추가
 */
type EditingBOMItem = Partial<BOMItem> & { parentId?: string; isNew?: boolean }

// --- Main BOM Management Component ---
export function EquipmentBOMManagement() {
  const { t } = useTranslation("equipment")
  const partTypeLabels = usePartTypeLabels()
  const bomStatusLabels = useBomStatusLabels()
  const [boms, setBOMs] = useState<EquipmentBOM[]>([])
  const [templates, setTemplates] = useState<BOMTemplate[]>([])
  const [selectedBOMId, setSelectedBOMId] = useState<string | null>(null)

  // BOM 생성 다이얼로그용 CRUD 상태
  const bomCrud = useCrudState<EquipmentBOM>()

  // 부품 편집/추가 다이얼로그용 CRUD 상태
  const itemCrud = useCrudState<EditingBOMItem>()

  const selectedBOM = useMemo(() => {
    return boms.find((bom) => bom.id === selectedBOMId) || null
  }, [boms, selectedBOMId])

  const updateSelectedBOM = useCallback(
    (updatedItems: BOMItem[]) => {
      if (!selectedBOMId) return
      const newTotalCost = calculateBOMTotalCost(updatedItems)
      setBOMs((prevBOMs) =>
        prevBOMs.map((b) => (b.id === selectedBOMId ? { ...b, items: updatedItems, totalCost: newTotalCost } : b)),
      )
    },
    [selectedBOMId],
  )

  const handleToggleExpandItem = (itemId: string) => {
    if (!selectedBOM) return
    const updatedItems = updateBOMItemsRecursive(selectedBOM.items, itemId, "toggleExpand")
    updateSelectedBOM(updatedItems)
  }

  const handleEditBOMItem = (item: BOMItem) => {
    itemCrud.handleEdit({ ...item, isNew: false })
  }

  const handleDeleteBOMItem = (itemId: string) => {
    if (!selectedBOM) return
    // Confirmation dialog would be good here
    const updatedItems = updateBOMItemsRecursive(selectedBOM.items, itemId, "delete")
    updateSelectedBOM(updatedItems)
  }

  const handleAddTopLevelBOMItem = () => {
    if (!selectedBOM) return
    itemCrud.handleEdit({
      partCode: "",
      partName: "",
      quantity: 1,
      unitPrice: 0,
      level: 1,
      isNew: true,
      partType: "standard",
      unit: "EA",
    })
  }

  const handleAddChildBOMItem = (parentId: string) => {
    if (!selectedBOM) return
    const parentItem = findItemRecursive(selectedBOM.items, parentId)
    if (!parentItem) return

    itemCrud.handleEdit({
      partCode: "",
      partName: "",
      quantity: 1,
      unitPrice: 0,
      level: parentItem.level + 1,
      parentId: parentId,
      isNew: true,
      partType: "standard",
      unit: "EA",
    })
  }

  const findItemRecursive = (items: BOMItem[], itemId: string): BOMItem | null => {
    for (const item of items) {
      if (item.id === itemId) return item
      if (item.children) {
        const found = findItemRecursive(item.children, itemId)
        if (found) return found
      }
    }
    return null
  }

  const handleSaveBOMItem = (itemData: Partial<BOMItem>) => {
    if (!selectedBOM || !itemCrud.selectedItem) return

    const editingItem = itemCrud.selectedItem
    let updatedItems
    if (editingItem.isNew) {
      // Adding new item
      if (editingItem.parentId) {
        // Adding child item
        updatedItems = updateBOMItemsRecursive(selectedBOM.items, null, "add", itemData, editingItem.parentId)
      } else {
        // Adding top-level item
        const newItem: BOMItem = {
          id: generateNewBOMItemId(),
          partCode: "",
          partName: "",
          specification: "",
          unit: "EA",
          quantity: 1,
          unitPrice: 0,
          manufacturer: "",
          model: "",
          partType: "standard",
          level: 1, // Top level
          leadTime: 0,
          minStock: 0,
          currentStock: 0,
          supplier: "",
          remarks: "",
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
          isExpanded: false,
          children: [],
          ...itemData,
          totalPrice: calculateBOMItemTotalPrice(itemData),
        }
        updatedItems = [...selectedBOM.items, newItem]
      }
    } else {
      // Editing existing item
      updatedItems = updateBOMItemsRecursive(selectedBOM.items, editingItem.id!, "edit", itemData)
    }
    updateSelectedBOM(updatedItems)
    itemCrud.setFormOpen(false)
  }

  const filteredBOMs = useMemo(() => boms, [boms])

  const handleCreateBOM = () => {
    // Placeholder for BOM creation logic
    // For now, let's just create a new BOM with a unique ID and add it to the list
    const newBOMId = `eq-bom-${Date.now()}`
    const newBOM: EquipmentBOM = {
      id: newBOMId,
      equipmentId: `eq-${Date.now()}`, // Needs to be selectable or generated
      equipmentCode: `NEW-EQ-${Date.now() % 1000}`,
      equipmentName: t("doc_mgmt.sample_equipment"),
      bomVersion: "v1.0",
      bomStatus: "draft",
      items: [],
      totalCost: 0,
      createdBy: t("doc_mgmt.current_user"), // Placeholder
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    setBOMs((prev) => [...prev, newBOM])
    setSelectedBOMId(newBOMId) // Select the newly created BOM
    bomCrud.setFormOpen(false) // Close dialog
  }

  // Effect to select the first BOM if none is selected and BOMs exist
  useEffect(() => {
    if (!selectedBOMId && boms.length > 0) {
      setSelectedBOMId(boms[0].id)
    }
  }, [boms, selectedBOMId])

  const tabsList = (
    <TabsList>
      <TabsTrigger value="bom-list">{t("bom_list_tab")}</TabsTrigger>
      <TabsTrigger value="bom-detail">{t("bom_detail_tab")}</TabsTrigger>
      <TabsTrigger value="templates">{t("bom_template_tab")}</TabsTrigger>
    </TabsList>
  )

  // BOM 목록 컬럼 정의
  const bomColumns = [
    {
      key: "equipmentCode",
      title: t("equipment_code"),
      searchable: true,
      render: (value: string, record: EquipmentBOM) => {
        const statusInfo = bomStatusLabels[record.bomStatus]
        return (
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{value}</span>
            <Badge className={bomStatusColors[record.bomStatus]}>
              <Icon name={bomStatusIcons[record.bomStatus]} size="xs" className="mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        )
      },
    },
    {
      key: "equipmentName",
      title: t("equipment_name"),
      searchable: true,
    },
    {
      key: "bomVersion",
      title: t("bom_version"),
    },
    {
      key: "items",
      title: "부품수",
      render: (items: BOMItem[]) => `${items.length}개`,
    },
    {
      key: "totalCost",
      title: "총 비용",
      render: (value: number) => `₩${value.toLocaleString()}`,
    },
    {
      key: "bomStatus",
      title: "상태",
      filterable: true,
      filterOptions: [
        { label: t("bom_status_draft"), value: "draft" },
        { label: t("bom_status_approved"), value: "approved" },
        { label: t("bom_status_active"), value: "active" },
        { label: t("bom_status_obsolete"), value: "obsolete" },
      ],
    },
  ]

  const bomActions = [
    {
      key: "view",
      label: "상세보기",
      icon: () => <Icon name="edit" size="sm" />,
      onClick: (record: EquipmentBOM) => setSelectedBOMId(record.id),
    },
    {
      key: "copy",
      label: "복사",
      icon: () => <Icon name="content_copy" size="sm" />,
      onClick: () => {},
    },
    {
      key: "download",
      label: "다운로드",
      icon: () => <Icon name="download" size="sm" />,
      onClick: () => {},
    },
  ]

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">설비 BOM 관리</h1>
        <p className="text-sm text-text-secondary mt-1">설비 부품 구성(BOM) 정보를 등록하고 관리합니다.</p>
      </div>

      <Tabs defaultValue="bom-list">
        <TabsContent value="bom-list">
          <DataTable
            data={filteredBOMs}
            columns={bomColumns}
            actions={bomActions}
            headerLeft={tabsList}
            onAdd={bomCrud.handleAdd}
            addButtonText="BOM 생성"
            searchPlaceholder="설비코드, 설비명으로 검색..."
            showExport={true}
            showImport={true}
            showFilter={true}
            stickyHeader={true}
          />
        </TabsContent>

        <TabsContent value="bom-detail">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {tabsList}
              {selectedBOM && (
                <div className="flex space-x-2">
                  <Button onClick={handleAddTopLevelBOMItem}>
                    <Icon name="add" size="sm" className="mr-2" /> 최상위 부품 추가
                  </Button>
                </div>
              )}
            </div>
            {selectedBOM ? (
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                    <div>
                      <CardTitle>{selectedBOM.equipmentCode} - BOM 상세</CardTitle>
                      <p className="text-muted-foreground">
                        {selectedBOM.equipmentName} (버전: {selectedBOM.bomVersion}) | 총 비용: ₩{selectedBOM.totalCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-3">
                    {selectedBOM.items.length > 0 ? (
                      selectedBOM.items.map((item) => (
                        <BOMTreeItem
                          key={item.id}
                          item={item}
                          onEdit={handleEditBOMItem}
                          onDelete={handleDeleteBOMItem}
                          onAddChild={handleAddChildBOMItem}
                          onToggleExpand={handleToggleExpandItem}
                        />
                      ))
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <Icon name="inventory_2" size="md" className="h-12 w-12 mx-auto mb-4 opacity-50" />이 BOM에 등록된 부품이 없습니다. <br />
                        버튼을 클릭하여 새 부품을 추가하세요.
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Icon name="account_tree" size="md" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">BOM 목록에서 BOM을 선택하여 상세 정보를 확인하고 편집하세요.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {tabsList}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.templateName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{template.equipmentType}</p>
                      </div>
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? t("bom_status_active") : t("active")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span>부품수: {template.items.length}개</span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled>
                          편집
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          복사하여 사용
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {templates.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    등록된 BOM 템플릿이 없습니다.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* BOM 생성 다이얼로그 */}
      <Dialog open={bomCrud.formOpen} onOpenChange={bomCrud.setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>새 BOM 생성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Simplified for now, needs proper form fields */}
            <p className="text-sm text-muted-foreground">
              새로운 설비 BOM을 생성합니다. 설비 정보, 버전 등을 입력하고, 필요시 템플릿을 선택할 수 있습니다. (세부
              구현 필요)
            </p>
            <div>
              <Label>설비 코드</Label>
              <Input defaultValue={`NEW-EQ-${Date.now() % 1000}`} />
            </div>
            <div>
              <Label>{t("equipment_name")}</Label>
              <Input defaultValue={t("doc_mgmt.sample_equipment")} />
            </div>
            <div>
              <Label>{t("bom_version")}</Label>
              <Input defaultValue="v1.0" />
            </div>
            <div>
              <Label>{t("use_template")}</Label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder={t("select_template")} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.templateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("doc_mgmt.cancel")}</Button>
            </DialogClose>
            <Button onClick={handleCreateBOM}>{t("bom_create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 부품 편집/추가 다이얼로그 */}
      <Dialog
        open={itemCrud.formOpen}
        onOpenChange={(open) => {
          itemCrud.setFormOpen(open)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{itemCrud.selectedItem?.isNew ? t("add_child_part") : t("edit_part")}</DialogTitle>
          </DialogHeader>
          {itemCrud.selectedItem && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const data: Partial<BOMItem> = {
                  partCode: formData.get("partCode") as string,
                  partName: formData.get("partName") as string,
                  specification: formData.get("specification") as string,
                  quantity: Number(formData.get("quantity")),
                  unit: formData.get("unit") as string,
                  unitPrice: Number(formData.get("unitPrice")),
                  manufacturer: formData.get("manufacturer") as string,
                  model: formData.get("model") as string,
                  partType: formData.get("partType") as BOMItem["partType"],
                  leadTime: Number(formData.get("leadTime")),
                  minStock: Number(formData.get("minStock")),
                  currentStock: Number(formData.get("currentStock")),
                  supplier: formData.get("supplier") as string,
                  remarks: formData.get("remarks") as string,
                }
                handleSaveBOMItem(data)
              }}
            >
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partCode">부품코드</Label>
                    <Input id="partCode" name="partCode" defaultValue={itemCrud.selectedItem.partCode} required />
                  </div>
                  <div>
                    <Label htmlFor="partName">부품명</Label>
                    <Input id="partName" name="partName" defaultValue={itemCrud.selectedItem.partName} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="specification">사양</Label>
                  <Input id="specification" name="specification" defaultValue={itemCrud.selectedItem.specification} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">수량</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      defaultValue={itemCrud.selectedItem.quantity}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">단위</Label>
                    <Input id="unit" name="unit" defaultValue={itemCrud.selectedItem.unit} required />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">단가</Label>
                    <Input
                      id="unitPrice"
                      name="unitPrice"
                      type="number"
                      defaultValue={itemCrud.selectedItem.unitPrice}
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partType">부품 유형</Label>
                    <Select name="partType" defaultValue={itemCrud.selectedItem.partType || "standard"}>
                      <SelectTrigger id="partType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(partTypeLabels).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manufacturer">제조사</Label>
                    <Input id="manufacturer" name="manufacturer" defaultValue={itemCrud.selectedItem.manufacturer} />
                  </div>
                  <div>
                    <Label htmlFor="model">모델</Label>
                    <Input id="model" name="model" defaultValue={itemCrud.selectedItem.model} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="leadTime">리드타임(일)</Label>
                    <Input
                      id="leadTime"
                      name="leadTime"
                      type="number"
                      defaultValue={itemCrud.selectedItem.leadTime || 0}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStock">최소재고</Label>
                    <Input
                      id="minStock"
                      name="minStock"
                      type="number"
                      defaultValue={itemCrud.selectedItem.minStock || 0}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentStock">현재재고</Label>
                    <Input
                      id="currentStock"
                      name="currentStock"
                      type="number"
                      defaultValue={itemCrud.selectedItem.currentStock || 0}
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="supplier">공급처</Label>
                  <Input id="supplier" name="supplier" defaultValue={itemCrud.selectedItem.supplier} />
                </div>
                <div>
                  <Label htmlFor="remarks">비고</Label>
                  <Textarea id="remarks" name="remarks" defaultValue={itemCrud.selectedItem.remarks} />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => itemCrud.setFormOpen(false)}>
                  취소
                </Button>
                <Button type="submit">
                  <Icon name="save" size="sm" className="mr-2" /> 저장
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
