export interface MaterialStock {
  id: string
  materialId: string
  materialCode: string
  materialName: string
  warehouseId: string
  warehouseName: string
  location: string
  currentStock: number
  safetyStock: number
  minStock: number
  maxStock: number
  unit: string
  unitPrice: number
  totalValue: number
  lastUpdated: string
  status: "normal" | "low" | "out" | "excess"
}

export interface Warehouse {
  id: string
  code: string
  name: string
  location: string
  manager: string
  capacity: number
  currentUtilization: number
  status: "active" | "inactive"
  createdAt: string
}

export interface StockAdjustment {
  id: string
  materialId: string
  materialCode: string
  materialName: string
  warehouseId: string
  warehouseName: string
  adjustmentType: "increase" | "decrease"
  beforeQuantity: number
  afterQuantity: number
  adjustmentQuantity: number
  reason: string
  adjustedBy: string
  adjustedAt: string
  approvedBy?: string
  approvedAt?: string
  status: "pending" | "approved" | "rejected"
}
