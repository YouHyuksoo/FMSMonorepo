import type { DocumentApproval } from "@fms/types"

export const mockDocumentApprovals: DocumentApproval[] = [
  {
    id: "approval-001",
    documentId: "doc-001",
    reviewerId: "user-002",
    reviewerName: "박관리",
    action: "approve",
    comment: "매뉴얼 내용이 상세하고 정확합니다. 승인합니다.",
    createdAt: "2024-01-16T14:30:00Z",
  },
  {
    id: "approval-002",
    documentId: "doc-001",
    reviewerId: "user-001",
    reviewerName: "김기술",
    action: "request_review",
    comment: "검토 요청드립니다.",
    createdAt: "2024-01-15T16:00:00Z",
  },
  {
    id: "approval-003",
    documentId: "doc-002",
    reviewerId: "user-002",
    reviewerName: "박관리",
    action: "approve",
    comment: "전기 회로도가 정확합니다.",
    createdAt: "2024-01-11T16:00:00Z",
  },
  {
    id: "approval-004",
    documentId: "doc-003",
    reviewerId: "user-002",
    reviewerName: "박관리",
    action: "approve",
    comment: "인증서 확인 완료.",
    createdAt: "2024-01-06T10:15:00Z",
  },
  {
    id: "approval-005",
    documentId: "doc-004",
    reviewerId: "user-002",
    reviewerName: "박관리",
    action: "approve",
    comment: "체크리스트 항목이 적절합니다.",
    createdAt: "2024-01-21T13:20:00Z",
  },
]
