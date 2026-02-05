"use client"

import { useState } from "react"
import { Button } from "@fms/ui/button"
import { Badge } from "@fms/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog"
import { Textarea } from "@fms/ui/textarea"
import { Label } from "@fms/ui/label"
import { Icon } from "@fms/ui/icon"
import { cn } from "@fms/utils"
import type { EquipmentDocument, DocumentApproval, DocumentWorkflow } from "@fms/types"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/lib/language-context"

interface DocumentApprovalWorkflowProps {
  document: EquipmentDocument
  approvals: DocumentApproval[]
  onStatusChange: (documentId: string, newStatus: string, comment?: string) => void
  currentUserRole: "author" | "reviewer" | "admin"
  currentUserId: string
}

export default function DocumentApprovalWorkflow({
  document,
  approvals,
  onStatusChange,
  currentUserRole,
  currentUserId,
}: DocumentApprovalWorkflowProps) {
  const { toast } = useToast()
  const { t } = useTranslation("equipment")
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | "request_review" | null>(null)
  const [comment, setComment] = useState("")

  // 워크플로우 상태 계산
  const getWorkflowState = (): DocumentWorkflow => {
    const isAuthor = currentUserRole === "author"
    const isReviewer = currentUserRole === "reviewer" || currentUserRole === "admin"
    const isAdmin = currentUserRole === "admin"

    switch (document.status) {
      case "draft":
        return {
          currentStatus: "draft",
          canRequestReview: isAuthor || isAdmin,
          canApprove: false,
          canReject: false,
          canEdit: isAuthor || isAdmin,
          nextActions: isAuthor || isAdmin ? [t("workflow.request_review")] : [],
        }
      case "review_requested":
        return {
          currentStatus: "review_requested",
          canRequestReview: false,
          canApprove: isReviewer,
          canReject: isReviewer,
          canEdit: false,
          nextActions: isReviewer ? [t("workflow.approve"), t("workflow.reject")] : [],
        }
      case "review":
        return {
          currentStatus: "review",
          canRequestReview: false,
          canApprove: isReviewer,
          canReject: isReviewer,
          canEdit: false,
          nextActions: isReviewer ? [t("workflow.approve"), t("workflow.reject")] : [],
        }
      case "approved":
        return {
          currentStatus: "approved",
          canRequestReview: false,
          canApprove: false,
          canReject: false,
          canEdit: false,
          nextActions: [],
        }
      case "rejected":
        return {
          currentStatus: "rejected",
          canRequestReview: isAuthor || isAdmin,
          canApprove: false,
          canReject: false,
          canEdit: isAuthor || isAdmin,
          nextActions: isAuthor || isAdmin ? [t("workflow.re_request_review")] : [],
        }
      default:
        return {
          currentStatus: document.status,
          canRequestReview: false,
          canApprove: false,
          canReject: false,
          canEdit: false,
          nextActions: [],
        }
    }
  }

  const workflow = getWorkflowState()

  // 상태 아이콘 반환
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Icon name="description" size="sm" className="text-gray-500" />
      case "review_requested":
        return <Icon name="send" size="sm" className="text-blue-500" />
      case "review":
        return <Icon name="schedule" size="sm" className="text-yellow-500" />
      case "approved":
        return <Icon name="check_circle" size="sm" className="text-green-500" />
      case "rejected":
        return <Icon name="cancel" size="sm" className="text-red-500" />
      case "expired":
        return <Icon name="warning" size="sm" className="text-orange-500" />
      case "archived":
        return <Icon name="archive" size="sm" className="text-purple-500" />
      default:
        return <Icon name="schedule" size="sm" className="text-gray-500" />
    }
  }

  // 액션 아이콘 반환
  const getActionIcon = (action: string) => {
    switch (action) {
      case "approve":
        return <Icon name="check_circle" size="sm" className="text-green-500" />
      case "reject":
        return <Icon name="cancel" size="sm" className="text-red-500" />
      case "request_review":
        return <Icon name="send" size="sm" className="text-blue-500" />
      default:
        return <Icon name="chat" size="sm" />
    }
  }

  // 액션 실행
  const handleAction = (type: "approve" | "reject" | "request_review") => {
    setActionType(type)
    setComment("")
    setIsActionDialogOpen(true)
  }

  // 액션 확인
  const confirmAction = () => {
    if (!actionType) return

    let newStatus = document.status
    switch (actionType) {
      case "request_review":
        newStatus = "review_requested"
        break
      case "approve":
        newStatus = "approved"
        break
      case "reject":
        newStatus = "rejected"
        break
    }

    onStatusChange(document.id, newStatus, comment)
    setIsActionDialogOpen(false)
    setActionType(null)
    setComment("")

    const actionLabels = {
      request_review: t("workflow.request_review"),
      approve: t("workflow.approve"),
      reject: t("workflow.reject"),
    }

    toast({
      title: t("workflow.success"),
      description: t("workflow.document_actioned", { action: actionLabels[actionType] }),
    })
  }

  // 문서별 승인 이력 필터링
  const documentApprovals = approvals.filter((approval) => approval.documentId === document.id)

  return (
    <div className="space-y-4">
      {/* 현재 상태 및 액션 버튼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(document.status)}
              <span>{t("workflow.document_status")}</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                document.status === "approved" && "border-green-500 text-green-700",
                document.status === "rejected" && "border-red-500 text-red-700",
                document.status === "review_requested" && "border-blue-500 text-blue-700",
                document.status === "review" && "border-yellow-500 text-yellow-700",
                document.status === "draft" && "border-gray-500 text-gray-700",
              )}
            >
              {document.status === "draft" && t("workflow.status_draft")}
              {document.status === "review_requested" && t("workflow.status_review_requested")}
              {document.status === "review" && t("workflow.status_review")}
              {document.status === "approved" && t("workflow.status_approved")}
              {document.status === "rejected" && t("workflow.status_rejected")}
              {document.status === "expired" && t("workflow.status_expired")}
              {document.status === "archived" && t("workflow.status_archived")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {workflow.canRequestReview && (
              <Button onClick={() => handleAction("request_review")} size="sm">
                <Icon name="send" size="sm" className="mr-2" />
                {t("workflow.request_review")}
              </Button>
            )}
            {workflow.canApprove && (
              <Button onClick={() => handleAction("approve")} size="sm" variant="default">
                <Icon name="check_circle" size="sm" className="mr-2" />
                {t("workflow.approve")}
              </Button>
            )}
            {workflow.canReject && (
              <Button onClick={() => handleAction("reject")} size="sm" variant="destructive">
                <Icon name="cancel" size="sm" className="mr-2" />
                {t("workflow.reject")}
              </Button>
            )}
            {workflow.nextActions.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("workflow.no_actions")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 승인 이력 */}
      {documentApprovals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="chat" size="sm" />
              {t("workflow.approval_history")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentApprovals
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((approval) => (
                  <div key={approval.id} className="flex gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">{getActionIcon(approval.action)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon name="person" size="sm" className="text-muted-foreground" />
                        <span className="font-medium">{approval.reviewerName}</span>
                        <Badge variant="outline" className="text-xs">
                          {approval.action === "approve" && t("workflow.approve")}
                          {approval.action === "reject" && t("workflow.reject")}
                          {approval.action === "request_review" && t("workflow.status_review_requested")}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(approval.createdAt).toLocaleString()}
                      </div>
                      {approval.comment && <div className="text-sm bg-muted p-2 rounded">{approval.comment}</div>}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 액션 확인 다이얼로그 */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && t("workflow.approve_document")}
              {actionType === "reject" && t("workflow.reject_document")}
              {actionType === "request_review" && t("workflow.request_review")}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && t("workflow.confirm_approve")}
              {actionType === "reject" && t("workflow.confirm_reject")}
              {actionType === "request_review" && t("workflow.confirm_request_review")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comment">
                {actionType === "reject" ? t("workflow.reject_reason") : t("workflow.comment")}
                {actionType === "reject" && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? t("workflow.approve_comment_placeholder")
                    : actionType === "reject"
                      ? t("workflow.reject_reason_placeholder")
                      : t("workflow.request_review_placeholder")
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              {t("workflow.cancel")}
            </Button>
            <Button
              onClick={confirmAction}
              disabled={actionType === "reject" && !comment.trim()}
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {actionType === "approve" && t("workflow.approve")}
              {actionType === "reject" && t("workflow.reject")}
              {actionType === "request_review" && t("workflow.request")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
