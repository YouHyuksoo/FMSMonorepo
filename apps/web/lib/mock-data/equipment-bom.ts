import type { EquipmentBOM, BOMItem, BOMTemplate } from "@fms/types"

const createBOMItems = (level = 1, parentId?: string): BOMItem[] => [
  {
    id: `bom-${parentId || "root"}-1-${Date.now() % 10000}`,
    partCode: "MOTOR-001",
    partName: "주구동모터",
    specification: "75kW, 380V, 60Hz",
    unit: "EA",
    quantity: 1,
    unitPrice: 5000000,
    totalPrice: 5000000,
    manufacturer: "현대중공업",
    model: "HMI-75K",
    partType: "standard",
    level: level,
    parentId: parentId,
    leadTime: 30,
    minStock: 1,
    currentStock: 2,
    supplier: "현대중공업",
    remarks: "주요 구동부",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
    isExpanded: false,
    children:
      level < 3
        ? [
            // Limit nesting for sanity
            {
              id: `bom-${parentId || "root"}-1-1-${Date.now() % 10000}`,
              partCode: "BEARING-001",
              partName: "베어링",
              specification: "SKF 6320",
              unit: "EA",
              quantity: 2,
              unitPrice: 150000,
              totalPrice: 300000,
              manufacturer: "SKF",
              model: "6320",
              partType: "replacement",
              level: level + 1,
              parentId: `bom-${parentId || "root"}-1-${Date.now() % 10000}`, // This ID needs to match parent
              leadTime: 14,
              minStock: 4,
              currentStock: 8,
              supplier: "SKF코리아",
              remarks: "정기교체 부품",
              createdAt: "2024-01-15",
              updatedAt: "2024-01-15",
              isExpanded: false,
            },
            {
              id: `bom-${parentId || "root"}-1-2-${Date.now() % 10000}`,
              partCode: "SEAL-001",
              partName: "오일씰",
              specification: "NBR 80x100x10",
              unit: "EA",
              quantity: 2,
              unitPrice: 25000,
              totalPrice: 50000,
              manufacturer: "NOK",
              model: "AB-80100",
              partType: "consumable",
              level: level + 1,
              parentId: `bom-${parentId || "root"}-1-${Date.now() % 10000}`, // This ID needs to match parent
              leadTime: 7,
              minStock: 10,
              currentStock: 15,
              supplier: "NOK코리아",
              remarks: "소모품",
              createdAt: "2024-01-15",
              updatedAt: "2024-01-15",
              isExpanded: false,
            },
          ]
        : [],
  },
  {
    id: `bom-${parentId || "root"}-2-${Date.now() % 10000}`,
    partCode: "REDUCER-001",
    partName: "감속기",
    specification: "1/30 기어비",
    unit: "EA",
    quantity: 1,
    unitPrice: 2000000,
    totalPrice: 2000000,
    manufacturer: "삼성중공업",
    model: "SGR-30",
    partType: "standard",
    level: level,
    parentId: parentId,
    leadTime: 45,
    minStock: 1,
    currentStock: 1,
    supplier: "삼성중공업",
    remarks: "감속장치",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
    isExpanded: false,
    children:
      level < 3
        ? [
            {
              id: `bom-${parentId || "root"}-2-1-${Date.now() % 10000}`,
              partCode: "GEAR-001",
              partName: "기어",
              specification: "SCM440, 모듈 3",
              unit: "EA",
              quantity: 4,
              unitPrice: 80000,
              totalPrice: 320000,
              manufacturer: "대한기어",
              model: "DG-M3-30",
              partType: "replacement",
              level: level + 1,
              parentId: `bom-${parentId || "root"}-2-${Date.now() % 10000}`, // This ID needs to match parent
              leadTime: 21,
              minStock: 8,
              currentStock: 12,
              supplier: "대한기어",
              remarks: "내마모성 기어",
              createdAt: "2024-01-15",
              updatedAt: "2024-01-15",
              isExpanded: false,
            },
          ]
        : [],
  },
]

// Helper to ensure parentId matches the actual ID of the parent for children
function assignCorrectParentIds(items: BOMItem[], parentId?: string): BOMItem[] {
  return items.map((item) => {
    const newItem = { ...item, parentId: parentId, isExpanded: item.isExpanded || false }
    if (newItem.children && newItem.children.length > 0) {
      newItem.children = assignCorrectParentIds(newItem.children, newItem.id)
    }
    return newItem
  })
}

const initialBOMItems = assignCorrectParentIds(createBOMItems(1))
// Fix parent IDs for the initial data
initialBOMItems.forEach((item) => {
  if (item.children) {
    item.children.forEach((child) => {
      child.parentId = item.id
      if (child.children) {
        child.children.forEach((grandchild) => {
          grandchild.parentId = child.id
        })
      }
    })
  }
})

export const mockEquipmentBOMs: EquipmentBOM[] = [
  {
    id: "eq-bom-1",
    equipmentId: "eq-1",
    equipmentCode: "COMP-A1-001",
    equipmentName: "공기압축기 #1",
    bomVersion: "v1.0",
    bomStatus: "active",
    items: initialBOMItems,
    totalCost: initialBOMItems.reduce((sum, item) => sum + item.totalPrice, 0),
    approvedBy: "김기술",
    approvedAt: "2024-01-20",
    createdBy: "이설비",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: "eq-bom-2",
    equipmentId: "eq-2",
    equipmentCode: "CONV-B1-001",
    equipmentName: "컨베이어 #1",
    bomVersion: "v1.1",
    bomStatus: "active",
    items: assignCorrectParentIds([
      {
        id: "bom-conv-1",
        partCode: "BELT-001",
        partName: "컨베이어벨트",
        specification: "1200mm x 10m",
        unit: "M",
        quantity: 10,
        unitPrice: 50000,
        totalPrice: 500000,
        manufacturer: "한국벨트",
        model: "KB-1200",
        partType: "consumable",
        level: 1,
        leadTime: 7,
        minStock: 20,
        currentStock: 25,
        supplier: "한국벨트",
        remarks: "정기교체 필요",
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15",
        isExpanded: false,
      },
    ]),
    totalCost: 500000,
    approvedBy: "박부장",
    approvedAt: "2024-01-25",
    createdBy: "최설비",
    createdAt: "2024-01-20",
    updatedAt: "2024-01-25",
  },
]

export const mockBOMTemplates: BOMTemplate[] = [
  {
    id: "template-1",
    templateName: "공기압축기 표준 BOM",
    equipmentType: "공기압축기",
    description: "75kW급 공기압축기 표준 부품 구성",
    items: initialBOMItems, // Use the same structure for simplicity
    isActive: true,
    createdBy: "김기술",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-10",
  },
]
