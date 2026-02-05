/**
 * @file apps/web/components/preventive/preventive-order-management.tsx
 * @description 예방정비 오더 관리 컴포넌트 - 표준 DataTable 형식
 *
 * 초보자 가이드:
 * 1. **데이터 로딩**: useEffect에서 API를 통해 데이터를 가져옴
 * 2. **CRUD 작업**: useCrudState 훅으로 생성/수정/삭제 상태 관리
 * 3. **검색/필터**: DataTable 내장 검색 기능 사용
 */
"use client"

import { useState, useEffect } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Icon } from "@/components/ui/Icon"
import { ImportExportDialog } from "@/components/common/import-export-dialog"
import { PreventiveOrderForm } from "./preventive-order-form"
import { preventiveOrderStatusLabels, preventivePriorityLabels } from "@fms/types"
import type { PreventiveOrder, PreventiveMaster } from "@fms/types"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import { getTodayIsoDate } from "@fms/utils"

interface PreventiveOrderManagementProps {
  /** 예방정비 오더 목록 (외부에서 주입) */
  initialOrders?: PreventiveOrder[]
  /** 예방정비 마스터 목록 (외부에서 주입) */
  initialMasters?: PreventiveMaster[]
  /** 데이터 로딩 중 여부 */
  isLoading?: boolean
  /** 오더 저장 핸들러 */
  onSaveOrder?: (order: Partial<PreventiveOrder>) => Promise<void>
  /** 오더 삭제 핸들러 */
  onDeleteOrder?: (id: string) => Promise<void>
  /** 오더 가져오기 핸들러 */
  onImportOrders?: (orders: PreventiveOrder[]) => Promise<void>
}

export function PreventiveOrderManagement({
  initialOrders = [],
  initialMasters = [],
  isLoading = false,
  onSaveOrder,
  onDeleteOrder,
  onImportOrders,
}: PreventiveOrderManagementProps) {
  const [orders, setOrders] = useState<PreventiveOrder[]>(initialOrders)
  const [preventiveMasters, setPreventiveMasters] = useState<PreventiveMaster[]>(initialMasters)
  const { toast } = useToast()

  // useCrudState 훅 사용
  const crud = useCrudState<PreventiveOrder>()

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // props 변경 시 상태 업데이트
  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  useEffect(() => {
    setPreventiveMasters(initialMasters)
  }, [initialMasters])

  // 마스터 정보로 표시용 필드 채우기
  useEffect(() => {
    if (orders.length === 0 || preventiveMasters.length === 0) return

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        const pm = preventiveMasters.find((m) => m.id === order.masterId)
        return {
          ...order,
          masterTitle: order.masterTitle || pm?.name || "",
          taskDescription: order.taskDescription || pm?.taskDescription || pm?.description || "",
          equipmentName: order.equipmentName || pm?.equipmentName || "",
          assignedToName: order.assignedToName || "",
        }
      }),
    )
  }, [preventiveMasters])

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
        return "default"
      case "in_progress":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPriorityBadgeVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  const columns: DataTableColumn<PreventiveOrder>[] = [
    {
      key: "masterTitle",
      title: "정비명",
      width: "minmax(150px, 1fr)",
      searchable: true,
      render: (_, record) => record.masterTitle || "-",
    },
    {
      key: "taskDescription",
      title: "작업설명",
      width: "minmax(200px, 1fr)",
      searchable: true,
      render: (_, record) => (
        <span className="line-clamp-2" title={record.taskDescription || ""}>
          {record.taskDescription || "-"}
        </span>
      ),
    },
    {
      key: "equipmentName",
      title: "설비명",
      width: "150px",
      searchable: true,
      render: (_, record) => record.equipmentName || "-",
    },
    {
      key: "scheduledDate",
      title: "예정일",
      width: "120px",
      sortable: true,
      render: (_, record) => record.scheduledDate ? new Date(record.scheduledDate).toLocaleDateString("ko-KR") : "-",
    },
    {
      key: "actualEndDate",
      title: "완료일",
      width: "120px",
      sortable: true,
      render: (_, record) => record.actualEndDate ? new Date(record.actualEndDate).toLocaleDateString("ko-KR") : "-",
    },
    {
      key: "assignedToName",
      title: "담당자",
      width: "120px",
      searchable: true,
      render: (_, record) => record.assignedToName || "-",
    },
    {
      key: "status",
      title: "상태",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "대기", value: "pending" },
        { label: "진행중", value: "in_progress" },
        { label: "완료", value: "completed" },
        { label: "지연", value: "overdue" },
      ],
      render: (_, record) => (
        <Badge variant={getStatusBadgeVariant(record.status || "")}>
          {record.status ? preventiveOrderStatusLabels[record.status] : "-"}
        </Badge>
      ),
    },
    {
      key: "priority",
      title: "우선순위",
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "긴급", value: "critical" },
        { label: "높음", value: "high" },
        { label: "보통", value: "medium" },
        { label: "낮음", value: "low" },
      ],
      render: (_, record) => (
        <Badge variant={getPriorityBadgeVariant(record.priority || "")}>
          {record.priority ? preventivePriorityLabels[record.priority] : "-"}
        </Badge>
      ),
    },
    {
      key: "estimatedCost",
      title: "예상비용",
      width: "120px",
      align: "right",
      sortable: true,
      render: (_, record) => record.estimatedCost !== undefined && record.estimatedCost !== null
          ? `₩${record.estimatedCost.toLocaleString()}`
          : "-",
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<PreventiveOrder>[] = [
    {
      key: "edit",
      label: "수정",
      iconName: "edit",
      onClick: (record) => crud.handleEdit(record),
    },
  ]

  const exportColumns = [
    { key: "masterTitle", title: "정비명", width: 30 },
    { key: "taskDescription", title: "작업설명", width: 40 },
    { key: "equipmentName", title: "설비명", width: 20 },
    { key: "scheduledDate", title: "예정일", width: 15 },
    { key: "actualEndDate", title: "완료일", width: 15 },
    { key: "assignedToName", title: "담당자", width: 15 },
    { key: "status", title: "상태", width: 10 },
    { key: "estimatedCost", title: "예상비용", width: 15 },
  ]

  const importColumns = [
    { key: "masterTitle", title: "정비명", required: true },
    { key: "taskDescription", title: "작업설명" },
    { key: "equipmentName", title: "설비명", required: true },
    { key: "scheduledDate", title: "예정일", required: true },
    { key: "actualEndDate", title: "완료일" },
    { key: "assignedToName", title: "담당자", required: true },
    { key: "estimatedCost", title: "예상비용", required: true },
  ]

  const sampleData = [
    {
      masterTitle: "주간 정밀도 점검",
      taskDescription: "CNC 밀링머신 정밀도 점검 및 교정 작업",
      equipmentName: "CNC 밀링머신 #1",
      scheduledDate: getTodayIsoDate(),
      actualEndDate: "",
      assignedToName: "김정비",
      estimatedCost: 50000,
    },
  ]

  const handleSave = async (orderData: Partial<PreventiveOrder>) => {
    try {
      if (onSaveOrder) {
        await onSaveOrder(orderData)
        toast({
          title: crud.selectedItem ? "수정 완료" : "등록 완료",
          description: crud.selectedItem ? "정비오더가 수정되었습니다." : "정비오더가 등록되었습니다.",
        })
      } else {
        // 외부 핸들러 없을 경우 로컬 상태만 업데이트
        if (crud.selectedItem) {
          const updatedOrder = { ...crud.selectedItem, ...orderData, updatedAt: new Date().toISOString() }
          setOrders(orders.map((o) => (o.id === crud.selectedItem!.id ? updatedOrder : o)))
          toast({
            title: "수정 완료",
            description: "정비오더가 수정되었습니다.",
          })
        } else {
          const newOrder: PreventiveOrder = {
            ...orderData,
            id: `po-${Date.now()}`,
            masterId: orderData.masterId || "",
            equipmentId: orderData.equipmentId || "",
            assignedTo: orderData.assignedTo || "",
            createdBy: "admin",
            createdAt: new Date().toISOString(),
            updatedBy: "admin",
            updatedAt: new Date().toISOString(),
            attachments: [],
          } as PreventiveOrder
          setOrders([...orders, newOrder])
          toast({
            title: "등록 완료",
            description: "정비오더가 등록되었습니다.",
          })
        }
      }
      crud.setFormOpen(false)
    } catch (error) {
      toast({
        title: "오류",
        description: "저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleImportComplete = async (data: PreventiveOrder[]) => {
    try {
      if (onImportOrders) {
        await onImportOrders(data)
      } else {
        // 외부 핸들러 없을 경우 로컬 상태만 업데이트
        const newOrders = data.map(
          (item) =>
            ({
              ...item,
              id: `po-imported-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              masterId: item.masterId || "",
              equipmentId: item.equipmentId || "",
              assignedTo: item.assignedTo || "",
              createdBy: "system",
              createdAt: new Date().toISOString(),
              updatedBy: "system",
              updatedAt: new Date().toISOString(),
              attachments: [],
            }) as PreventiveOrder,
        )
        setOrders([...orders, ...newOrders])
      }
      toast({
        title: "가져오기 완료",
        description: `${data.length}개의 정비오더를 가져왔습니다.`,
      })
    } catch (error) {
      toast({
        title: "오류",
        description: "가져오기 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 헤더 우측 버튼
  const HeaderRight = () => (
    <div className="flex items-center gap-2">
      <Button onClick={() => crud.setImportExportOpen(true)} variant="outline">
        <Icon name="upload_file" size="sm" className="mr-2" />
        가져오기/내보내기
      </Button>
      <Button onClick={crud.handleAdd}>
        <Icon name="add" size="sm" className="mr-2" />
        등록
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">예방정비 오더</h1>
        <p className="text-sm text-text-secondary mt-1">예방정비 오더를 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        actions={rowActions}
        loading={isLoading}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="정비명, 설비명, 담당자로 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: orders.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <PreventiveOrderForm
        order={crud.selectedItem}
        open={crud.formOpen}
        onOpenChange={crud.setFormOpen}
        onSave={handleSave}
        preventiveMasters={preventiveMasters}
      />

      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title="정비오더"
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={orders}
        onImportComplete={handleImportComplete}
        sampleData={sampleData}
      />
    </div>
  )
}
