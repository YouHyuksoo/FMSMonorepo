export interface BOMItem {
  id: string
  partCode: string
  partName: string
  specification: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  manufacturer: string
  model: string
  partType: "consumable" | "replacement" | "spare" | "standard"
  level: number
  parentId?: string
  children?: BOMItem[]
  isExpanded?: boolean
  leadTime: number
  minStock: number
  currentStock: number
  supplier: string
  remarks: string
  createdAt: string
  updatedAt: string
}

export interface EquipmentBOM {
  id: string
  equipmentId: string
  equipmentCode: string
  equipmentName: string
  bomVersion: string
  bomStatus: "draft" | "approved" | "active" | "obsolete"
  items: BOMItem[]
  totalCost: number
  approvedBy?: string
  approvedAt?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface BOMTemplate {
  id: string
  templateName: string
  equipmentType: string
  description: string
  items: BOMItem[]
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface BOMSearchFilters {
  equipmentCode?: string
  equipmentName?: string
  partCode?: string
  partName?: string
  partType?: string
  bomStatus?: string
  manufacturer?: string
}
