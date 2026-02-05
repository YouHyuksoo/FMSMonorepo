export interface MaterialTransaction {
  id: string
  transactionType: "in" | "out"
  materialId: string
  materialCode: string
  materialName: string
  warehouseId: string
  warehouseName: string
  quantity: number
  unit: string
  unitPrice: number
  totalAmount: number
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  processedBy?: string
  processedAt?: string
  status: "pending" | "approved" | "completed" | "cancelled"
  purpose: string
  notes?: string
  referenceNo: string
}

export interface TransactionDetail {
  id: string
  transactionId: string
  materialId: string
  materialCode: string
  materialName: string
  quantity: number
  unit: string
  unitPrice: number
  totalAmount: number
  lotNumber?: string
  location?: string
}
