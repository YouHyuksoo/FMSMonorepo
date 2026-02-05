/**
 * @file apps/web/components/material/material-inbound-management.tsx
 * @description 자재 입고 관리 컴포넌트 - 표준 레이아웃
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 자재 입고 트랜잭션을 조회하고 새 입고를 등록하는 기능
 * 2. **사용 방법**: 자재 > 입고 관리 메뉴에서 접근
 * 3. **상태 관리**: useCrudState 훅을 사용하여 폼 열기/닫기 상태 관리
 */

"use client"

import { useState } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import { Icon } from "@/components/ui/Icon"
import { mockMaterialInboundTransactions } from "@/lib/mock-data/material-inbound"
import type { MaterialTransaction } from "@fms/types"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import MaterialForm from "./material-form"

// 상태 설정
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "대기", variant: "secondary" },
  approved: { label: "승인", variant: "default" },
  completed: { label: "완료", variant: "default" },
  cancelled: { label: "취소", variant: "destructive" },
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

export function MaterialInboundManagement() {
  const [transactions, setTransactions] = useState<MaterialTransaction[]>(mockMaterialInboundTransactions)
  const { toast } = useToast()
  const crud = useCrudState<MaterialTransaction>()

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 입고 데이터만 필터링
  const inboundTransactions = transactions.filter((t) => t.transactionType === "in")

  // 컬럼 정의
  const columns: DataTableColumn<MaterialTransaction>[] = [
    { key: "materialCode", title: "자재코드", width: "120px", searchable: true, sortable: true, render: (_, r) => <span className="font-mono">{r.materialCode}</span> },
    { key: "materialName", title: "자재명", width: "200px", searchable: true, sortable: true },
    { key: "warehouseName", title: "창고", width: "100px", searchable: true },
    { key: "quantity", title: "수량", width: "100px", align: "right", sortable: true, render: (_, r) => `${r.quantity.toLocaleString()} ${r.unit}` },
    { key: "totalAmount", title: "금액", width: "120px", align: "right", sortable: true, render: (_, r) => `₩${r.totalAmount.toLocaleString()}` },
    { key: "requestedBy", title: "요청자", width: "100px" },
    { key: "requestedAt", title: "요청일시", width: "150px", sortable: true, render: (_, r) => new Date(r.requestedAt).toLocaleString() },
    {
      key: "status",
      title: "상태",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "대기", value: "pending" },
        { label: "승인", value: "approved" },
        { label: "완료", value: "completed" },
        { label: "취소", value: "cancelled" },
      ],
      render: (_, r) => {
        const config = statusConfig[r.status] || { label: r.status, variant: "outline" as const }
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
    { key: "referenceNo", title: "참조번호", width: "120px", searchable: true },
  ]

  // 행 액션
  const rowActions: DataTableAction<MaterialTransaction>[] = [
    { key: "view", label: "상세", iconName: "visibility", onClick: (r) => crud.handleView(r) },
  ]

  const handleAddInbound = (data: any) => {
    const newTransaction: MaterialTransaction = {
      id: `IN${String(transactions.length + 1).padStart(3, "0")}`,
      transactionType: "in",
      requestedAt: new Date().toISOString(),
      status: "completed",
      ...data,
    }
    setTransactions((prev) => [...prev, newTransaction])
    crud.setFormOpen(false)
    toast({ title: "입고 등록 완료", description: `${data.materialName} ${data.quantity}${data.unit} 입고가 등록되었습니다.` })
  }

  const handleExport = () => {
    downloadExcel(inboundTransactions, [
      { key: "materialCode", title: "자재코드" },
      { key: "materialName", title: "자재명" },
      { key: "warehouseName", title: "창고" },
      { key: "quantity", title: "수량" },
      { key: "totalAmount", title: "금액" },
      { key: "requestedBy", title: "요청자" },
      { key: "status", title: "상태" },
    ], "자재입고내역")
    toast({ title: "다운로드 완료", description: "입고 목록이 다운로드되었습니다." })
  }

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">자재 입고 관리</h1>
        <p className="text-sm text-text-secondary mt-1">자재 입고 현황을 관리합니다.</p>
      </div>

      {/* DataTable */}
      <DataTable
        data={inboundTransactions}
        columns={columns}
        actions={rowActions}
        loading={false}
        showSearch
        showFilter
        showColumnSettings
        showExport
        onExport={handleExport}
        onAdd={() => crud.handleAdd()}
        addButtonText="새 입고 등록"
        searchPlaceholder="자재코드, 자재명, 참조번호로 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: inboundTransactions.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* 입고 등록 다이얼로그 */}
      <Dialog open={crud.formOpen} onOpenChange={crud.setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>자재 입고 등록</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <MaterialForm
              onSubmit={(data) => handleAddInbound({ ...data, transactionType: "in" })}
              onCancel={() => crud.setFormOpen(false)}
              initialData={{ transactionType: "in" }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
