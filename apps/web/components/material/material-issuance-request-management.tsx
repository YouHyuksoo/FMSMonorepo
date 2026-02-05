/**
 * @file apps/web/components/material/material-issuance-request-management.tsx
 * @description 자재 출고 요청 관리 컴포넌트 - 표준 레이아웃
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 자재 출고 요청을 등록, 조회, 승인/반려하는 기능
 * 2. **사용 방법**: 자재 > 출고 요청 메뉴에서 접근
 * 3. **상태 관리**: useCrudState 훅을 사용하여 폼 열기/닫기 상태 관리
 */
"use client"

import { useState } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import MaterialIssuanceRequestForm from "./material-issuance-request-form"
import { mockMaterialIssuanceRequests } from "@/lib/mock-data/material-issuance"
import type { MaterialIssuanceRequest } from "@fms/types"

// 상태 설정
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "대기", variant: "secondary" },
  approved: { label: "승인", variant: "default" },
  rejected: { label: "반려", variant: "destructive" },
  issued: { label: "출고완료", variant: "default" },
  backordered: { label: "발주대기", variant: "outline" },
}

// 엑셀 다운로드 유틸
function downloadExcel<T extends Record<string, any>>(data: T[], columns: { key: string; title: string }[], filename: string) {
  const headers = columns.map((c) => c.title).join(",")
  const rows = data.map((item) => columns.map((c) => item[c.key] ?? "").join(","))
  const csv = [headers, ...rows].join("\n")
  const bom = "\uFEFF"
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function MaterialIssuanceRequestManagement() {
  const [requests, setRequests] = useState<MaterialIssuanceRequest[]>(mockMaterialIssuanceRequests)
  const { toast } = useToast()
  const crud = useCrudState<MaterialIssuanceRequest>()

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const handleApproveRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, status: "approved", approvedBy: "관리자", approvedAt: new Date().toISOString() }
          : req
      )
    )
    toast({ title: "요청 승인", description: "자재 출고 요청이 승인되었습니다." })
  }

  const handleRejectRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, status: "rejected", approvedBy: "관리자", approvedAt: new Date().toISOString() }
          : req
      )
    )
    toast({ title: "요청 반려", description: "자재 출고 요청이 반려되었습니다." })
  }

  const handleIssueRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "issued", issuedBy: "창고담당", issuedAt: new Date().toISOString() } : req
      )
    )
    toast({ title: "자재 출고", description: "자재가 성공적으로 출고되었습니다." })
  }

  const handleExport = () => {
    downloadExcel(requests, [
      { key: "id", title: "요청번호" },
      { key: "materialCode", title: "자재코드" },
      { key: "materialName", title: "자재명" },
      { key: "quantity", title: "수량" },
      { key: "requestedBy", title: "요청자" },
      { key: "requestedAt", title: "요청일시" },
      { key: "status", title: "상태" },
    ], "자재출고요청내역")
    toast({ title: "다운로드 완료", description: "출고 요청 목록이 다운로드되었습니다." })
  }

  const columns: DataTableColumn<MaterialIssuanceRequest>[] = [
    { key: "id", title: "요청번호", width: "100px", searchable: true },
    { key: "materialCode", title: "자재코드", width: "120px", searchable: true, render: (_, r) => <span className="font-mono">{r.materialCode}</span> },
    { key: "materialName", title: "자재명", width: "200px", searchable: true },
    { key: "quantity", title: "수량", width: "100px", align: "right", render: (_, r) => `${r.quantity.toLocaleString()} ${r.unit}` },
    { key: "requestedBy", title: "요청자", width: "100px", searchable: true },
    { key: "requestedAt", title: "요청일시", width: "150px", sortable: true, render: (_, r) => new Date(r.requestedAt).toLocaleString() },
    {
      key: "status",
      title: "상태",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: Object.entries(statusConfig).map(([value, { label }]) => ({ label, value })),
      render: (_, r) => {
        const config = statusConfig[r.status] || { label: r.status, variant: "outline" as const }
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<MaterialIssuanceRequest>[] = [
    { key: "approve", label: "승인", iconName: "check_circle", onClick: (r) => handleApproveRequest(r.id), hidden: (r) => r.status !== "pending" },
    { key: "reject", label: "반려", iconName: "cancel", variant: "destructive", onClick: (r) => handleRejectRequest(r.id), hidden: (r) => r.status !== "pending" },
    { key: "issue", label: "출고", iconName: "local_shipping", onClick: (r) => handleIssueRequest(r.id), hidden: (r) => r.status !== "approved" },
  ]

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">자재 출고 요청</h1>
        <p className="text-sm text-text-secondary mt-1">자재 출고 요청을 등록하고 승인/반려 처리합니다.</p>
      </div>

      {/* DataTable */}
      <DataTable
        data={requests}
        columns={columns}
        actions={rowActions}
        loading={false}
        showSearch
        showFilter
        showColumnSettings
        showExport
        onExport={handleExport}
        onAdd={() => crud.handleAdd()}
        addButtonText="새 요청 등록"
        searchPlaceholder="자재명, 요청자, 요청번호로 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: requests.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* 요청 등록 다이얼로그 */}
      <Dialog open={crud.formOpen} onOpenChange={crud.setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>자재 출고 요청 등록</DialogTitle>
          </DialogHeader>
          <MaterialIssuanceRequestForm
            onSubmit={(data) => {
              const newRequest = {
                id: `IR${String(requests.length + 1).padStart(3, "0")}`,
                ...data,
                requestedAt: new Date().toISOString(),
                status: "pending" as const,
              }
              setRequests((prev) => [...prev, newRequest])
              crud.setFormOpen(false)
              toast({ title: "요청 등록 완료", description: "자재 출고 요청이 등록되었습니다." })
            }}
            onCancel={() => crud.setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
