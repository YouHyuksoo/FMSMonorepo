/**
 * @file apps/web/components/material/material-management.tsx
 * @description 자재 등록 및 관리 페이지 컴포넌트 - 표준 DataTable 형식
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 자재(Material)의 CRUD(생성/조회/수정/삭제) 작업을 관리하는 메인 컴포넌트
 * 2. **사용 방법**: /materials 페이지에서 자동으로 렌더링됨
 * 3. **상태 관리**: useCrudState 훅을 사용하여 폼 열기/닫기, 모드 전환 등을 관리
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog"
import { Icon } from "@/components/ui/Icon"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import MaterialForm from "./material-form"
import { useMaterials, useCreateMaterial } from "@/hooks/api/use-materials"

// Mock/API 모드 전환
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 자재 타입 정의
interface Material {
  id: string
  code: string
  name: string
  specification: string
  unit: string
  category: string
  manufacturer: string
  price: number
  stockQuantity: number
  safetyStock: number
  location: string
  status: "active" | "inactive" | "discontinued"
}

// 목업 데이터
export const mockMaterials: Material[] = [
  { id: "1", code: "MAT-001", name: "베어링", specification: "6205-2RS", unit: "EA", category: "소모품", manufacturer: "SKF", price: 15000, stockQuantity: 25, safetyStock: 10, location: "A-01-01", status: "active" },
  { id: "2", code: "MAT-002", name: "모터", specification: "3HP, 220V", unit: "EA", category: "교체품", manufacturer: "Siemens", price: 450000, stockQuantity: 3, safetyStock: 2, location: "B-02-03", status: "active" },
  { id: "3", code: "MAT-003", name: "오일", specification: "ISO VG 68", unit: "L", category: "소모품", manufacturer: "Shell", price: 8000, stockQuantity: 50, safetyStock: 20, location: "C-01-02", status: "active" },
  { id: "4", code: "MAT-004", name: "벨트", specification: "A-45", unit: "EA", category: "소모품", manufacturer: "Gates", price: 12000, stockQuantity: 15, safetyStock: 8, location: "A-03-01", status: "active" },
  { id: "5", code: "MAT-005", name: "센서", specification: "근접센서, PNP", unit: "EA", category: "교체품", manufacturer: "Omron", price: 85000, stockQuantity: 7, safetyStock: 5, location: "B-01-04", status: "active" },
]

// 상태 설정
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "정상", variant: "default" },
  inactive: { label: "비활성", variant: "secondary" },
  discontinued: { label: "단종", variant: "destructive" },
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

export function MaterialManagement() {
  // API 훅 (API 모드에서만 사용)
  const apiQuery = useMaterials(undefined, { enabled: !USE_MOCK_API })
  const createMutation = useCreateMaterial()

  // Mock 모드용 상태
  const [mockMaterialData, setMockMaterialData] = useState<Material[]>([])
  const [mockLoading, setMockLoading] = useState(USE_MOCK_API)

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { toast } = useToast()
  const crud = useCrudState<Material>()

  // QR 다이얼로그 상태
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrMaterial, setQrMaterial] = useState<Material | null>(null)

  // Mock 모드 데이터 로드
  useEffect(() => {
    if (USE_MOCK_API) {
      setMockLoading(true)
      setTimeout(() => {
        setMockMaterialData(mockMaterials)
        setMockLoading(false)
      }, 500)
    }
  }, [])

  // 통합 데이터 및 로딩 상태
  const materials = useMemo(() => {
    if (USE_MOCK_API) return mockMaterialData
    const data = apiQuery.data as any
    return data?.items || data || []
  }, [mockMaterialData, apiQuery.data])

  const loading = USE_MOCK_API ? mockLoading : apiQuery.isLoading

  // 재고 상태 배지
  const getStockStatusBadge = (current: number, safety: number) => {
    if (current <= 0) return <Badge variant="destructive">재고없음</Badge>
    if (current < safety) return <Badge variant="secondary">부족</Badge>
    if (current >= safety * 3) return <Badge variant="outline">과다</Badge>
    return <Badge variant="default">정상</Badge>
  }

  // 엑셀 내보내기 핸들러
  const handleExport = () => {
    downloadExcel(materials, [
      { key: "code", title: "자재코드" },
      { key: "name", title: "자재명" },
      { key: "specification", title: "규격" },
      { key: "unit", title: "단위" },
      { key: "category", title: "분류" },
      { key: "manufacturer", title: "제조사" },
      { key: "price", title: "단가" },
      { key: "stockQuantity", title: "재고수량" },
      { key: "location", title: "위치" },
      { key: "status", title: "상태" },
    ], "자재목록")
    toast({ title: "다운로드 완료", description: "자재 목록이 다운로드되었습니다." })
  }

  const handleMaterialSubmit = async (data: any) => {
    try {
      if (USE_MOCK_API) {
        const newMaterial = { id: (materials.length + 1).toString(), ...data, stockQuantity: 0 }
        setMockMaterialData((prev) => [...prev, newMaterial])
      } else {
        await createMutation.mutateAsync(data)
      }
      crud.setFormOpen(false)
      toast({ title: "자재 등록 완료", description: `${data.name}이(가) 성공적으로 등록되었습니다.` })
    } catch (error) {
      toast({ title: "오류", description: "자재 등록에 실패했습니다.", variant: "destructive" })
    }
  }

  const handleShowQR = (material: Material) => {
    setQrMaterial(material)
    setQrDialogOpen(true)
  }

  // 컬럼 정의
  const columns: DataTableColumn<Material>[] = [
    { key: "code", title: "자재코드", width: "120px", searchable: true, sortable: true, render: (_, r) => <span className="font-mono font-medium">{r.code}</span> },
    { key: "name", title: "자재명", width: "150px", searchable: true, sortable: true },
    { key: "specification", title: "규격", width: "150px" },
    { key: "unit", title: "단위", width: "60px", align: "center" },
    {
      key: "category",
      title: "분류",
      width: "80px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "소모품", value: "소모품" },
        { label: "교체품", value: "교체품" },
      ],
    },
    { key: "manufacturer", title: "제조사", width: "100px", searchable: true },
    { key: "price", title: "단가", width: "100px", align: "right", sortable: true, render: (_, r) => `${r.price.toLocaleString()}원` },
    { key: "stockQuantity", title: "재고수량", width: "80px", align: "right", sortable: true },
    { key: "stockStatus", title: "재고상태", width: "90px", align: "center", render: (_, r) => getStockStatusBadge(r.stockQuantity, r.safetyStock) },
    { key: "location", title: "위치", width: "80px" },
    {
      key: "status",
      title: "상태",
      width: "80px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "정상", value: "active" },
        { label: "비활성", value: "inactive" },
        { label: "단종", value: "discontinued" },
      ],
      render: (_, r) => {
        const config = statusConfig[r.status] || { label: r.status, variant: "outline" as const }
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<Material>[] = [
    { key: "qr", label: "QR 코드", iconName: "qr_code", onClick: (r) => handleShowQR(r) },
    { key: "edit", label: "수정", iconName: "edit", onClick: (r) => crud.handleEdit(r) },
    { key: "delete", label: "삭제", iconName: "delete", variant: "destructive", onClick: (r) => crud.handleDelete(r) },
  ]

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">자재관리</h1>
        <p className="text-sm text-text-secondary mt-1">
          자재를 등록하고 관리합니다.
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        data={materials}
        columns={columns}
        actions={rowActions}
        loading={loading}
        showSearch
        showFilter
        showColumnSettings
        showExport
        onExport={handleExport}
        onAdd={() => crud.handleAdd()}
        addButtonText="자재 등록"
        searchPlaceholder="자재코드, 자재명, 제조사 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: materials.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* 자재 등록/수정 다이얼로그 */}
      <Dialog open={crud.formOpen} onOpenChange={crud.setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {crud.formMode === "create" ? "자재 등록" : crud.formMode === "edit" ? "자재 수정" : "자재 상세"}
            </DialogTitle>
          </DialogHeader>
          <MaterialForm
            onSubmit={handleMaterialSubmit}
            onCancel={() => crud.setFormOpen(false)}
            initialData={crud.selectedItem || undefined}
            mode={crud.formMode}
          />
        </DialogContent>
      </Dialog>

      {/* QR 코드 다이얼로그 */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>자재 QR 코드</DialogTitle>
          </DialogHeader>
          {qrMaterial && (
            <div className="flex flex-col items-center justify-center p-4">
              <div className="bg-gray-200 w-48 h-48 flex items-center justify-center mb-4 rounded-lg">
                <Icon name="qr_code_2" className="text-6xl text-gray-400" />
              </div>
              <p className="text-center font-medium">{qrMaterial.code}</p>
              <p className="text-center text-sm text-text-secondary">{qrMaterial.name}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
