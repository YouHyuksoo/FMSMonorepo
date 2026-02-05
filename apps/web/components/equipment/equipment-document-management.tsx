/**
 * @file apps/web/components/equipment/equipment-document-management.tsx
 * @description 설비 문서 관리 컴포넌트 - 문서 업로드, 조회, 승인 워크플로우 관리
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 설비 관련 문서(매뉴얼, 도면, 인증서 등)의 CRUD 및 승인 워크플로우
 * 2. **사용 방법**: 설비 페이지에서 문서 탭으로 이동하여 사용
 * 3. **상태 관리**: useCrudState 훅으로 업로드/조회 다이얼로그 상태 관리
 * 4. **승인 프로세스**: draft -> review_requested -> review -> approved/rejected
 */

"use client"

import { useState, useMemo } from "react"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Badge } from "@fms/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog"
import { Textarea } from "@fms/ui/textarea"
import { Icon } from "@fms/ui/icon"
import { cn } from "@fms/utils"
import { DataTable, type Column, type DataTableAction } from "@/components/common/data-table"
import type { EquipmentDocument, DocumentFormData } from "@fms/types"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import DocumentApprovalWorkflow from "./document-approval-workflow"
import type { DocumentApproval } from "@fms/types"

// 빈 옵션 배열 (API에서 로드 필요)
const documentCategories: { value: string; label: string }[] = []
const documentStatuses: { value: string; label: string; color?: string }[] = []
const equipmentList: { id: string; code: string; name: string }[] = []
import { useTranslation } from "@/lib/language-context"

export function EquipmentDocumentManagement() {
  const { toast } = useToast()
  const { t } = useTranslation("equipment")

  // useCrudState 훅으로 다이얼로그 상태 관리
  const crud = useCrudState<EquipmentDocument>()

  const [documents, setDocuments] = useState<EquipmentDocument[]>([])
  const [formData, setFormData] = useState<DocumentFormData>({
    equipmentId: "",
    title: "",
    description: "",
    category: "manual",
    tags: [],
    expiryDate: "",
  })
  const [approvals, setApprovals] = useState<DocumentApproval[]>([])
  const [currentUserRole] = useState<"author" | "reviewer" | "admin">("reviewer") // 실제로는 인증 컨텍스트에서 가져옴
  const [currentUserId] = useState("user-002") // 실제로는 인증 컨텍스트에서 가져옴


  // 파일 아이콘 반환
  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "doc":
      case "docx":
        return <Icon name="description" size="sm" />
      case "jpg":
      case "png":
        return <Icon name="image" size="sm" />
      default:
        return <Icon name="insert_drive_file" size="sm" />
    }
  }

  // 상태 아이콘 반환
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Icon name="check_circle" size="sm" className="text-green-500" />
      case "review_requested":
        return <Icon name="schedule" size="sm" className="text-blue-500" />
      case "review":
        return <Icon name="schedule" size="sm" className="text-yellow-500" />
      case "rejected":
        return <Icon name="error" size="sm" className="text-red-500" />
      case "expired":
        return <Icon name="error" size="sm" className="text-orange-500" />
      case "archived":
        return <Icon name="archive" size="sm" className="text-purple-500" />
      default:
        return <Icon name="schedule" size="sm" className="text-gray-500" />
    }
  }

  // 파일 크기 포맷
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // 문서 상태 변경
  const handleStatusChange = (documentId: string, newStatus: string, comment?: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              status: newStatus as any,
              updatedAt: new Date().toISOString(),
              updatedBy: t("doc_mgmt.current_user"),
              ...(newStatus === "approved" && {
                approvedAt: new Date().toISOString(),
                approvedBy: t("doc_mgmt.current_user"),
              }),
            }
          : doc,
      ),
    )

    // 승인 이력 추가
    const newApproval: DocumentApproval = {
      id: `approval-${Date.now()}`,
      documentId,
      reviewerId: currentUserId,
      reviewerName: t("doc_mgmt.current_user"),
      action: newStatus === "approved" ? "approve" : newStatus === "rejected" ? "reject" : "request_review",
      comment,
      createdAt: new Date().toISOString(),
    }

    setApprovals((prev) => [newApproval, ...prev])
  }

  // 문서 업로드
  const handleUpload = () => {
    if (!formData.equipmentId || !formData.title || !formData.file) {
      toast({
        title: t("doc_mgmt.error"),
        description: t("doc_mgmt.required_fields"),
        variant: "destructive",
      })
      return
    }

    const newDocument: EquipmentDocument = {
      id: `doc-${Date.now()}`,
      equipmentId: formData.equipmentId,
      equipmentCode: equipmentList.find((eq) => eq.id === formData.equipmentId)?.code || "",
      equipmentName: equipmentList.find((eq) => eq.id === formData.equipmentId)?.name || "",
      title: formData.title,
      description: formData.description,
      category: formData.category,
      type: (formData.file.name.split(".").pop()?.toLowerCase() as any) || "other",
      filename: formData.file.name,
      originalName: formData.file.name,
      fileSize: formData.file.size,
      mimeType: formData.file.type,
      url: `/documents/${formData.file.name}`,
      version: "1.0",
      status: "draft",
      tags: formData.tags,
      uploadedAt: new Date().toISOString(),
      uploadedBy: t("doc_mgmt.current_user"),
      updatedAt: new Date().toISOString(),
      updatedBy: t("doc_mgmt.current_user"),
      expiryDate: formData.expiryDate,
      isActive: true,
    }

    setDocuments((prev) => [newDocument, ...prev])
    crud.setFormOpen(false)
    setFormData({
      equipmentId: "",
      title: "",
      description: "",
      category: "manual",
      tags: [],
      expiryDate: "",
    })

    toast({
      title: t("workflow.success"),
      description: t("doc_mgmt.upload_success"),
    })
  }

  // 문서 다운로드
  const handleDownload = (document: EquipmentDocument) => {
    // 실제 구현에서는 파일 다운로드 로직 구현
    toast({
      title: t("doc_mgmt.download"),
      description: t("doc_mgmt.download_file", { filename: document.originalName }),
    })
  }

  // 문서 삭제 확인
  const confirmDelete = () => {
    if (crud.itemToDelete) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== crud.itemToDelete!.id))
      crud.closeDeleteDialog()
      toast({
        title: t("workflow.success"),
        description: t("doc_mgmt.delete_success"),
      })
    }
  }

  // 컬럼 정의
  const columns: Column<EquipmentDocument>[] = [
    {
      key: "title",
      title: "문서 정보",
      searchable: true,
      render: (value, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getFileIcon(record.type)}
            <span className="font-medium">{value}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {record.originalName} ({formatFileSize(record.fileSize)})
          </div>
          {record.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {record.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "equipmentCode",
      title: "설비",
      searchable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{record.equipmentName}</div>
        </div>
      ),
    },
    {
      key: "category",
      title: "카테고리",
      filterable: true,
      filterOptions: documentCategories.map((cat) => ({ label: cat.label, value: cat.value })),
      render: (value) => (
        <Badge variant="outline">
          {documentCategories.find((cat) => cat.value === value)?.label}
        </Badge>
      ),
    },
    {
      key: "status",
      title: "상태",
      filterable: true,
      filterOptions: documentStatuses.map((s) => ({ label: s.label, value: s.value })),
      render: (value) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <Badge
            variant="outline"
            className={cn(
              documentStatuses.find((s) => s.value === value)?.color === "green" && "border-green-500 text-green-700",
              documentStatuses.find((s) => s.value === value)?.color === "yellow" && "border-yellow-500 text-yellow-700",
              documentStatuses.find((s) => s.value === value)?.color === "red" && "border-red-500 text-red-700",
              documentStatuses.find((s) => s.value === value)?.color === "blue" && "border-blue-500 text-blue-700",
              documentStatuses.find((s) => s.value === value)?.color === "purple" && "border-purple-500 text-purple-700",
              documentStatuses.find((s) => s.value === value)?.color === "orange" && "border-orange-500 text-orange-700",
            )}
          >
            {documentStatuses.find((s) => s.value === value)?.label}
          </Badge>
        </div>
      ),
    },
    {
      key: "uploadedAt",
      title: "업로드일",
      sortable: true,
      render: (value, record) => (
        <div>
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-sm text-muted-foreground">{record.uploadedBy}</div>
        </div>
      ),
    },
  ]

  // 액션 정의
  const actions: DataTableAction<EquipmentDocument>[] = [
    {
      key: "view",
      label: "상세보기",
      icon: () => <Icon name="visibility" size="sm" />,
      onClick: crud.handleView,
    },
    {
      key: "download",
      label: "다운로드",
      icon: () => <Icon name="download" size="sm" />,
      onClick: handleDownload,
    },
    {
      key: "approve",
      label: "승인",
      icon: () => <Icon name="check_circle" size="sm" />,
      onClick: (record) => handleStatusChange(record.id, "approved", "승인되었습니다."),
      hidden: (record) => !(record.status === "review_requested" || record.status === "review") || currentUserRole === "author",
    },
    {
      key: "reject",
      label: "반려",
      icon: () => <Icon name="cancel" size="sm" />,
      onClick: (record) => {
        const reason = prompt("반려 사유를 입력하세요:")
        if (reason) handleStatusChange(record.id, "rejected", reason)
      },
      hidden: (record) => !(record.status === "review_requested" || record.status === "review") || currentUserRole === "author",
      variant: "destructive",
    },
    {
      key: "request_review",
      label: "검토요청",
      icon: () => <Icon name="send" size="sm" />,
      onClick: (record) => handleStatusChange(record.id, "review_requested", "검토를 요청합니다."),
      hidden: (record) => record.status !== "draft" && record.status !== "rejected",
    },
    {
      key: "delete",
      label: "삭제",
      icon: () => <Icon name="delete" size="sm" />,
      onClick: crud.handleDelete,
      variant: "destructive",
    },
  ]

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">설비 문서 관리</h1>
        <p className="text-sm text-text-secondary mt-1">설비 관련 문서를 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={documents}
        columns={columns}
        actions={actions}
        onAdd={crud.handleAdd}
        addButtonText={t("doc_mgmt.upload")}
        searchPlaceholder="문서 제목, 설비로 검색..."
        showExport={true}
        showImport={true}
        showFilter={true}
        stickyHeader={true}
      />

      {/* 문서 업로드 다이얼로그 */}
      <Dialog open={crud.formOpen && crud.formMode === "create"} onOpenChange={crud.setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("doc_mgmt.upload")}</DialogTitle>
            <DialogDescription>{t("doc_mgmt.upload_desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="equipment">{t("doc_mgmt.select_equipment")}</Label>
              <Select
                value={formData.equipmentId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, equipmentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("doc_mgmt.select_equipment_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {equipmentList.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id}>
                      {equipment.code} - {equipment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">{t("doc_mgmt.document_title")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder={t("doc_mgmt.document_title_placeholder")}
              />
            </div>
            <div>
              <Label htmlFor="category">{t("doc_mgmt.category")}</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("doc_mgmt.category_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">{t("doc_mgmt.description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t("doc_mgmt.description_placeholder")}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="file">{t("doc_mgmt.select_file")}</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFormData((prev) => ({ ...prev, file: e.target.files?.[0] }))}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.jpg,.png"
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">{t("doc_mgmt.expiry_date")}</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => crud.setFormOpen(false)}>
              {t("doc_mgmt.cancel")}
            </Button>
            <Button onClick={handleUpload}>{t("doc_mgmt.upload_btn")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 문서 상세 보기 다이얼로그 */}
      <Dialog open={crud.formOpen && crud.formMode === "view"} onOpenChange={crud.setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>문서 상세 정보</DialogTitle>
          </DialogHeader>
          {crud.selectedItem && (
            <div className="space-y-6">
              {/* 승인 워크플로우 */}
              <DocumentApprovalWorkflow
                document={crud.selectedItem}
                approvals={approvals}
                onStatusChange={handleStatusChange}
                currentUserRole={currentUserRole}
                currentUserId={currentUserId}
              />

              {/* 기존 문서 상세 정보... */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>문서 제목</Label>
                    <p className="font-medium">{crud.selectedItem.title}</p>
                  </div>
                  <div>
                    <Label>파일명</Label>
                    <p className="text-sm">{crud.selectedItem.originalName}</p>
                  </div>
                  <div>
                    <Label>설비</Label>
                    <p>
                      {crud.selectedItem.equipmentCode} - {crud.selectedItem.equipmentName}
                    </p>
                  </div>
                  <div>
                    <Label>카테고리</Label>
                    <Badge variant="outline">
                      {documentCategories.find((cat) => cat.value === crud.selectedItem!.category)?.label}
                    </Badge>
                  </div>
                  <div>
                    <Label>상태</Label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(crud.selectedItem.status)}
                      <Badge variant="outline">
                        {documentStatuses.find((s) => s.value === crud.selectedItem!.status)?.label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>버전</Label>
                    <p>{crud.selectedItem.version}</p>
                  </div>
                  <div>
                    <Label>파일 크기</Label>
                    <p>{formatFileSize(crud.selectedItem.fileSize)}</p>
                  </div>
                  <div>
                    <Label>업로드일</Label>
                    <p>{new Date(crud.selectedItem.uploadedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>업로드자</Label>
                    <p>{crud.selectedItem.uploadedBy}</p>
                  </div>
                  {crud.selectedItem.approvedBy && (
                    <div>
                      <Label>승인자</Label>
                      <p>{crud.selectedItem.approvedBy}</p>
                    </div>
                  )}
                  {crud.selectedItem.expiryDate && (
                    <div>
                      <Label>만료일</Label>
                      <p>{new Date(crud.selectedItem.expiryDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                {crud.selectedItem.description && (
                  <div>
                    <Label>설명</Label>
                    <p className="text-sm">{crud.selectedItem.description}</p>
                  </div>
                )}
                {crud.selectedItem.tags.length > 0 && (
                  <div>
                    <Label>태그</Label>
                    <div className="flex gap-1 flex-wrap">
                      {crud.selectedItem.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => crud.setFormOpen(false)}>
              닫기
            </Button>
            {crud.selectedItem && (
              <Button onClick={() => handleDownload(crud.selectedItem!)}>
                <Icon name="download" size="sm" className="mr-2" />
                다운로드
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={crud.deleteDialogOpen} onOpenChange={crud.setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>문서 삭제</DialogTitle>
            <DialogDescription>
              {crud.itemToDelete && (
                <>
                  <strong>{crud.itemToDelete.title}</strong> 문서를 삭제하시겠습니까?
                  <br />
                  이 작업은 되돌릴 수 없습니다.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={crud.closeDeleteDialog}>
              {t("doc_mgmt.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
