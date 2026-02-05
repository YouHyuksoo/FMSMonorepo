export interface MaterialIssuanceRequest {
  id: string
  materialId: string
  materialCode: string
  materialName: string
  quantity: number
  unit: string
  requestedBy: string
  requestedAt: string
  purpose: string
  status: "pending" | "approved" | "rejected" | "issued" | "backordered" // 요청, 승인, 반려, 출고완료, 발주대기
  notes?: string
  approvedBy?: string
  approvedAt?: string
  issuedBy?: string
  issuedAt?: string
  referenceNo?: string // 관련 작업 지시 번호, PM 오더 번호 등
}
