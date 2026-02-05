/**
 * @file apps/web/components/material/material-outbound-management.tsx
 * @description 자재 출고 관리 컴포넌트 - 표준 레이아웃 (탭+검색 같은 줄)
 */
"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import { Icon } from "@/components/ui/Icon"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import MaterialOutboundForm from "./material-outbound-form"
import { mockMaterialOutboundTransactions } from "@/lib/mock-data/material-outbound"
import { mockMaterialIssuanceRequests } from "@/lib/mock-data/material-issuance"
import type { MaterialTransaction, MaterialIssuanceRequest } from "@fms/types"

// 상태 설정
const transactionStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "대기", variant: "secondary" },
  approved: { label: "승인", variant: "default" },
  completed: { label: "완료", variant: "default" },
  cancelled: { label: "취소", variant: "destructive" },
}

const requestStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
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

export function MaterialOutboundManagement() {
  const [outboundTransactions, setOutboundTransactions] = useState<MaterialTransaction[]>(mockMaterialOutboundTransactions)
  const [issuanceRequests, setIssuanceRequests] = useState<MaterialIssuanceRequest[]>(mockMaterialIssuanceRequests)
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("request-based")

  const { toast } = useToast()
  const crud = useCrudState<MaterialTransaction>()

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const approvedIssuanceRequests = useMemo(() => issuanceRequests.filter((r) => r.status === "approved"), [issuanceRequests])

  const handleDirectOutboundSubmit = (data: any) => {
    const newTransaction: MaterialTransaction = {
      id: `OUT${String(outboundTransactions.length + 1).padStart(3, "0")}`,
      transactionType: "out",
      requestedAt: new Date().toISOString(),
      status: "completed",
      ...data,
    }
    setOutboundTransactions((prev) => [...prev, newTransaction])
    crud.setFormOpen(false)
    toast({ title: "직접 출고 등록 완료", description: `${data.materialName} ${data.quantity}${data.unit} 직접 출고가 등록되었습니다.` })
  }

  const handleIssueSelectedRequests = () => {
    if (selectedRequestIds.length === 0) {
      toast({ title: "알림", description: "출고 처리할 요청을 선택해주세요.", variant: "destructive" })
      return
    }

    const newOutboundTransactions: MaterialTransaction[] = []

    setIssuanceRequests((prev) =>
      prev.map((req) => {
        if (selectedRequestIds.includes(req.id) && req.status === "approved") {
          const newOutboundTransaction: MaterialTransaction = {
            id: `OUT${String(outboundTransactions.length + newOutboundTransactions.length + 1).padStart(3, "0")}`,
            transactionType: "out",
            materialCode: req.materialCode,
            materialName: req.materialName,
            warehouseName: req.warehouseName || "주창고",
            quantity: req.quantity,
            unit: req.unit,
            totalAmount: 0,
            requestedBy: req.requestedBy,
            requestedAt: req.requestedAt,
            status: "completed",
            referenceNo: req.id,
            approvedBy: req.approvedBy,
            approvedAt: req.approvedAt,
            issuedBy: "창고담당",
            issuedAt: new Date().toLocaleString(),
          }
          newOutboundTransactions.push(newOutboundTransaction)
          return { ...req, status: "issued" as const, issuedBy: "창고담당", issuedAt: new Date().toLocaleString() }
        }
        return req
      })
    )

    setOutboundTransactions((prev) => [...prev, ...newOutboundTransactions])
    setSelectedRequestIds([])
    toast({ title: "자재 출고 완료", description: `${newOutboundTransactions.length}건의 요청이 출고 처리되었습니다.` })
  }

  const handleExport = () => {
    downloadExcel(outboundTransactions, [
      { key: "materialCode", title: "자재코드" },
      { key: "materialName", title: "자재명" },
      { key: "quantity", title: "수량" },
      { key: "warehouseName", title: "창고" },
      { key: "requestedBy", title: "요청자" },
      { key: "status", title: "상태" },
    ], "자재출고내역")
    toast({ title: "다운로드 완료", description: "출고 목록이 다운로드되었습니다." })
  }

  // 출고 이력 컬럼
  const outboundColumns: DataTableColumn<MaterialTransaction>[] = [
    { key: "materialCode", title: "자재코드", width: "100px", searchable: true, render: (_, r) => <span className="font-mono">{r.materialCode}</span> },
    { key: "materialName", title: "자재명", width: "180px", searchable: true },
    { key: "quantity", title: "수량", width: "100px", align: "right", render: (_, r) => `${r.quantity.toLocaleString()} ${r.unit}` },
    { key: "warehouseName", title: "창고", width: "120px" },
    { key: "requestedBy", title: "요청자", width: "100px" },
    { key: "requestedAt", title: "요청일시", width: "150px", sortable: true, render: (_, r) => new Date(r.requestedAt).toLocaleString() },
    {
      key: "status",
      title: "상태",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: Object.entries(transactionStatusConfig).map(([value, { label }]) => ({ label, value })),
      render: (_, r) => {
        const config = transactionStatusConfig[r.status] || { label: r.status, variant: "outline" as const }
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
    { key: "referenceNo", title: "참조번호", width: "120px", searchable: true },
  ]

  // 요청 기반 출고 컬럼
  const requestColumns: DataTableColumn<MaterialIssuanceRequest>[] = [
    {
      key: "selection",
      title: "",
      width: "40px",
      align: "center",
      render: (_, r) => (
        <input
          type="checkbox"
          checked={selectedRequestIds.includes(r.id)}
          onChange={(e) => {
            if (e.target.checked) setSelectedRequestIds((prev) => [...prev, r.id])
            else setSelectedRequestIds((prev) => prev.filter((id) => id !== r.id))
          }}
          className="w-4 h-4 rounded text-primary"
        />
      ),
    },
    { key: "id", title: "요청번호", width: "100px", searchable: true },
    { key: "materialCode", title: "자재코드", width: "100px", render: (_, r) => <span className="font-mono">{r.materialCode}</span> },
    { key: "materialName", title: "자재명", width: "180px", searchable: true },
    { key: "quantity", title: "요청수량", width: "100px", align: "right", render: (_, r) => `${r.quantity.toLocaleString()} ${r.unit}` },
    { key: "requestedBy", title: "요청자", width: "100px", searchable: true },
    { key: "requestedAt", title: "요청일시", width: "150px", sortable: true, render: (_, r) => new Date(r.requestedAt).toLocaleString() },
    {
      key: "status",
      title: "상태",
      width: "100px",
      align: "center",
      render: (_, r) => {
        const config = requestStatusConfig[r.status] || { label: r.status, variant: "outline" as const }
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
  ]

  const filteredHistory = useMemo(() => {
    if (activeTab === "direct-outbound") {
      return outboundTransactions.filter((t) => t.referenceNo?.startsWith("DIRECT-OUT") || !t.referenceNo)
    }
    return outboundTransactions
  }, [outboundTransactions, activeTab])

  // 탭 헤더
  const TabsHeader = () => (
    <TabsList className="bg-transparent p-0 h-auto">
      <TabsTrigger
        value="request-based"
        className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-lg"
      >
        <Icon name="assignment" size="sm" className="mr-2" />
        요청 기반 출고
        <Badge variant="secondary" className="ml-2 bg-primary/20">{approvedIssuanceRequests.length}</Badge>
      </TabsTrigger>
      <TabsTrigger
        value="direct-outbound"
        className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-lg"
      >
        <Icon name="local_shipping" size="sm" className="mr-2" />
        직접 출고
      </TabsTrigger>
      <TabsTrigger
        value="outbound-history"
        className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-lg"
      >
        <Icon name="history" size="sm" className="mr-2" />
        전체 출고 이력
        <Badge variant="secondary" className="ml-2 bg-primary/20">{outboundTransactions.length}</Badge>
      </TabsTrigger>
    </TabsList>
  )

  // 헤더 우측 버튼
  const HeaderRightRequest = () => (
    <Button disabled={selectedRequestIds.length === 0} onClick={handleIssueSelectedRequests}>
      <Icon name="check_circle" size="sm" className="mr-2" />
      선택 {selectedRequestIds.length}건 출고 처리
    </Button>
  )

  const HeaderRightDirect = () => (
    <Button onClick={crud.handleAdd}>
      <Icon name="add" size="sm" className="mr-2" />
      직접 출고 등록
    </Button>
  )

  return (
    <>
      <div className="p-6">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text dark:text-white">자재 출고 관리</h1>
          <p className="text-sm text-text-secondary mt-1">자재 출고 요청을 처리하고 출고 이력을 관리합니다.</p>
        </div>

        {/* 탭 + DataTable */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1) }}>
          {/* 요청 기반 출고 탭 */}
          <TabsContent value="request-based" className="mt-0">
            <DataTable
              data={approvedIssuanceRequests}
              columns={requestColumns}
              loading={false}
              headerLeft={<TabsHeader />}
              headerRight={<HeaderRightRequest />}
              showSearch
              showFilter
              showColumnSettings
              searchPlaceholder="검색어를 입력하세요..."
              pagination={{
                page: currentPage,
                pageSize,
                total: approvedIssuanceRequests.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize,
              }}
            />
          </TabsContent>

          {/* 직접 출고 탭 */}
          <TabsContent value="direct-outbound" className="mt-0">
            <DataTable
              data={filteredHistory}
              columns={outboundColumns}
              loading={false}
              headerLeft={<TabsHeader />}
              headerRight={<HeaderRightDirect />}
              showSearch
              showFilter
              showColumnSettings
              showExport
              onExport={handleExport}
              searchPlaceholder="검색어를 입력하세요..."
              pagination={{
                page: currentPage,
                pageSize,
                total: filteredHistory.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize,
              }}
            />
          </TabsContent>

          {/* 전체 출고 이력 탭 */}
          <TabsContent value="outbound-history" className="mt-0">
            <DataTable
              data={outboundTransactions}
              columns={outboundColumns}
              loading={false}
              headerLeft={<TabsHeader />}
              showSearch
              showFilter
              showColumnSettings
              showExport
              onExport={handleExport}
              searchPlaceholder="검색어를 입력하세요..."
              pagination={{
                page: currentPage,
                pageSize,
                total: outboundTransactions.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize,
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* 직접 출고 등록 다이얼로그 */}
      <Dialog open={crud.formOpen} onOpenChange={crud.setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>직접 자재 출고 등록</DialogTitle>
          </DialogHeader>
          <MaterialOutboundForm onSubmit={handleDirectOutboundSubmit} onCancel={() => crud.setFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
