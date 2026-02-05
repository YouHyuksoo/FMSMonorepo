export interface EquipmentDocument {
  id: string
  equipmentId: string
  equipmentCode: string
  equipmentName: string
  title: string
  description?: string
  category: DocumentCategory
  type: DocumentType
  filename: string
  originalName: string
  fileSize: number
  mimeType: string
  url: string
  version: string
  status: DocumentStatus
  tags: string[]
  uploadedAt: string
  uploadedBy: string
  updatedAt: string
  updatedBy: string
  approvedAt?: string
  approvedBy?: string
  expiryDate?: string
  isActive: boolean
}

export type DocumentCategory =
  | "manual" // 매뉴얼
  | "drawing" // 도면
  | "certificate" // 인증서
  | "specification" // 사양서
  | "maintenance" // 정비지침서
  | "safety" // 안전수칙
  | "other" // 기타

export type DocumentType = "pdf" | "doc" | "docx" | "xls" | "xlsx" | "dwg" | "jpg" | "png" | "other"

export type DocumentStatus =
  | "draft" // 초안
  | "review_requested" // 검토 요청됨
  | "review" // 검토중
  | "approved" // 승인됨
  | "rejected" // 반려됨
  | "expired" // 만료됨
  | "archived" // 보관됨

export interface DocumentFilter {
  equipmentId?: string
  category?: DocumentCategory
  status?: DocumentStatus
  searchTerm?: string
  uploadedBy?: string
  dateFrom?: string
  dateTo?: string
}

export interface DocumentFormData {
  equipmentId: string
  title: string
  description?: string
  category: DocumentCategory
  tags: string[]
  expiryDate?: string
  file?: File
}

export interface DocumentApproval {
  id: string
  documentId: string
  reviewerId: string
  reviewerName: string
  action: "approve" | "reject" | "request_review"
  comment?: string
  createdAt: string
}

export interface DocumentWorkflow {
  currentStatus: DocumentStatus
  canRequestReview: boolean
  canApprove: boolean
  canReject: boolean
  canEdit: boolean
  nextActions: string[]
}
