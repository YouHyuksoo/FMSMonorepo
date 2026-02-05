/**
 * @file apps/web/components/material/material-stock-management.tsx
 * @description 자재 재고 관리 컴포넌트 - 표준 레이아웃
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 자재 재고 현황을 조회하고 재고 조정을 수행하는 기능
 * 2. **사용 방법**: 자재 > 재고 관리 메뉴에서 접근
 * 3. **상태 관리**: useCrudState 훅을 사용하여 폼 열기/닫기 상태 관리
 */
"use client"

import { useState } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog"
import { Input } from "@fms/ui/input"
import { Icon } from "@/components/ui/Icon"
import { useCrudState } from "@/hooks/use-crud-state"
import { useToast } from "@/hooks/use-toast"
import type { MaterialStock } from "@fms/types"

// 상태 설정
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  normal: { label: "정상", variant: "default" },
  low: { label: "부족", variant: "secondary" },
  out: { label: "품절", variant: "destructive" },
  excess: { label: "과다", variant: "outline" },
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

export function MaterialStockManagement() {
  const [stocks, setStocks] = useState<MaterialStock[]>([])
  const { toast } = useToast()
  const crud = useCrudState<MaterialStock>()

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 조정 수량 및 사유 상태
  const [adjustQuantity, setAdjustQuantity] = useState("")
  const [adjustReason, setAdjustReason] = useState("")

  // 컬럼 정의
  const columns: DataTableColumn<MaterialStock>[] = [
    { key: "materialCode", title: "자재코드", width: "120px", searchable: true, sortable: true, render: (_, r) => <span className="font-mono">{r.materialCode}</span> },
    { key: "materialName", title: "자재명", width: "200px", searchable: true, sortable: true },
    { key: "warehouseName", title: "창고", width: "120px", searchable: true },
    { key: "location", title: "위치", width: "100px" },
    { key: "currentStock", title: "현재재고", width: "100px", align: "right", sortable: true, render: (_, r) => `${r.currentStock.toLocaleString()} ${r.unit}` },
    { key: "safetyStock", title: "안전재고", width: "100px", align: "right", render: (_, r) => `${r.safetyStock.toLocaleString()} ${r.unit}` },
    { key: "totalValue", title: "재고금액", width: "120px", align: "right", sortable: true, render: (_, r) => `₩${r.totalValue.toLocaleString()}` },
    {
      key: "status",
      title: "상태",
      width: "90px",
      align: "center",
      filterable: true,
      filterOptions: Object.entries(statusConfig).map(([value, { label }]) => ({ label, value })),
      render: (_, r) => {
        const config = statusConfig[r.status] || { label: r.status, variant: "outline" as const }
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
    { key: "lastUpdated", title: "최종수정일", width: "120px", sortable: true, render: (_, r) => new Date(r.lastUpdated).toLocaleDateString() },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<MaterialStock>[] = [
    { key: "edit", label: "재고 조정", iconName: "edit", onClick: (r) => crud.handleEdit(r) },
  ]

  // 재고 조정 처리
  const handleAdjustStock = () => {
    if (!crud.selectedItem || !adjustQuantity) {
      toast({ title: "오류", description: "조정 수량을 입력해주세요.", variant: "destructive" })
      return
    }

    const quantity = parseInt(adjustQuantity, 10)
    setStocks((prev) =>
      prev.map((s) =>
        s.id === crud.selectedItem?.id
          ? { ...s, currentStock: s.currentStock + quantity, lastUpdated: new Date().toISOString() }
          : s
      )
    )
    toast({ title: "재고 조정 완료", description: `${crud.selectedItem.materialName} 재고가 ${quantity > 0 ? "+" : ""}${quantity} 조정되었습니다.` })
    crud.setFormOpen(false)
    setAdjustQuantity("")
    setAdjustReason("")
  }

  const handleExport = () => {
    downloadExcel(stocks, [
      { key: "materialCode", title: "자재코드" },
      { key: "materialName", title: "자재명" },
      { key: "warehouseName", title: "창고" },
      { key: "location", title: "위치" },
      { key: "currentStock", title: "현재재고" },
      { key: "safetyStock", title: "안전재고" },
      { key: "totalValue", title: "재고금액" },
      { key: "status", title: "상태" },
    ], "자재재고현황")
    toast({ title: "다운로드 완료", description: "재고 목록이 다운로드되었습니다." })
  }

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">자재 재고 관리</h1>
        <p className="text-sm text-text-secondary mt-1">자재 재고 현황을 조회하고 재고를 조정합니다.</p>
      </div>

      {/* DataTable */}
      <DataTable
        data={stocks}
        columns={columns}
        actions={rowActions}
        loading={false}
        showSearch
        showFilter
        showColumnSettings
        showExport
        onExport={handleExport}
        onAdd={() => crud.handleAdd()}
        addButtonText="재고 조정"
        searchPlaceholder="자재코드, 자재명, 창고로 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: stocks.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* 재고 조정 다이얼로그 */}
      <Dialog open={crud.formOpen} onOpenChange={crud.setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>재고 조정</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-surface p-4 rounded-xl border border-border">
              <p className="text-sm text-text-secondary mb-1">선택된 자재</p>
              <p className="font-bold text-lg">{crud.selectedItem?.materialName || "자재를 선택해주세요"}</p>
              <p className="text-xs text-text-secondary mt-1">
                {crud.selectedItem?.materialCode} | 현재고: {crud.selectedItem?.currentStock} {crud.selectedItem?.unit}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">조정 수량</label>
              <Input
                type="number"
                placeholder="조정할 수량을 입력하세요 (음수 가능)"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">조정 사유</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg bg-background resize-none h-24"
                placeholder="조정 사유를 입력하세요 (실사 결과, 파손 등)"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => crud.setFormOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAdjustStock}>적용하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
