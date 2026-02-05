/**
 * @file apps/web/components/preventive/preventive-master-management.tsx
 * @description 예방정비마스터 관리 컴포넌트 - 표준 DataTable 형식
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 예방정비마스터 데이터의 CRUD(생성, 조회, 수정, 삭제) 관리
 * 2. **사용 방법**: 이 컴포넌트는 예방정비마스터 목록을 표시하고,
 *    등록/수정/삭제 및 가져오기/내보내기 기능을 제공합니다.
 * 3. **상태 관리**: useCrudState 훅을 사용하여 폼 상태, 삭제 다이얼로그,
 *    가져오기/내보내기 다이얼로그 상태를 관리합니다.
 */

"use client"

import { useState } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Icon } from "@/components/ui/Icon"
import { ImportExportDialog } from "@/components/common/import-export-dialog"
import { PreventiveMasterForm } from "./preventive-master-form"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import { type PreventiveMaster, PreventivePeriodType, preventivePeriodTypeLabels } from "@fms/types"
import { mockPreventiveMasters } from "@/lib/mock-data/preventive"

import type { Equipment } from "@fms/types"
import { mockEquipment } from "@/lib/mock-data/equipment"
import type { InspectionMaster } from "@fms/types"
import { mockInspectionMasters } from "@/lib/mock-data/inspection-master"

export function PreventiveMasterManagement() {
  const [masters, setMasters] = useState<PreventiveMaster[]>(mockPreventiveMasters)
  const [equipmentList] = useState<Equipment[]>(mockEquipment)
  const [templateList] = useState<InspectionMaster[]>(mockInspectionMasters)

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { toast } = useToast()

  // useCrudState 훅을 사용하여 CRUD 관련 상태 관리
  const crud = useCrudState<PreventiveMaster>()

  const columns: DataTableColumn<PreventiveMaster>[] = [
    {
      key: "equipmentName",
      title: "설비명",
      width: "minmax(150px, 1fr)",
      searchable: true,
      render: (_, record) => record.equipmentName || "-",
    },
    {
      key: "title",
      title: "정비명",
      width: "minmax(150px, 1fr)",
      searchable: true,
      render: (_, record) => record.title || "-",
    },
    {
      key: "periodType",
      title: "주기 유형",
      width: "minmax(200px, 1fr)",
      filterable: true,
      filterOptions: [
        { label: "시간 기반", value: PreventivePeriodType.TIME_BASED },
        { label: "사용량 기반", value: PreventivePeriodType.USAGE_BASED },
        { label: "상태 기반", value: PreventivePeriodType.CONDITION_BASED },
      ],
      render: (_, record) => {
        if (!record.periodType) return "-"
        let detailText = ""
        if (record.periodType === PreventivePeriodType.TIME_BASED) {
          if (record.intervalDays) detailText = `${record.intervalDays}일 마다`
          else if (record.intervalMonths) detailText = `${record.intervalMonths}개월 마다`
          else if (record.intervalYears) detailText = `${record.intervalYears}년 마다`
          else if (record.fixedDateDay && record.fixedDateMonth)
            detailText = `매년 ${record.fixedDateMonth}월 ${record.fixedDateDay}일`
          else if (record.fixedDateDay) detailText = `매월 ${record.fixedDateDay}일`
          else detailText = "시간 기반"
        } else if (record.periodType === PreventivePeriodType.USAGE_BASED) {
          detailText = `사용량 ${record.usageThreshold || ""}${record.usageUnit || ""} 도달 시`
        } else if (record.periodType === PreventivePeriodType.CONDITION_BASED) {
          const pm = record as any
          detailText = `조건 ${pm.conditionParameter || ""} ${pm.conditionOperator || ""} ${pm.conditionValue || ""}`
        }
        return `${preventivePeriodTypeLabels[record.periodType]}${detailText ? ` (${detailText})` : ""}`
      },
    },
    {
      key: "estimatedDuration",
      title: "예상시간",
      width: "100px",
      align: "right",
      sortable: true,
      render: (_, record) => (record.estimatedDuration ? `${record.estimatedDuration}분` : "-"),
    },
    {
      key: "estimatedCost",
      title: "예상비용",
      width: "120px",
      align: "right",
      sortable: true,
      render: (_, record) => {
        const pm = record as any
        return pm.estimatedCost ? `₩${pm.estimatedCost.toLocaleString()}` : "-"
      },
    },
    {
      key: "isActive",
      title: "상태",
      width: "80px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "활성", value: "true" },
        { label: "비활성", value: "false" },
      ],
      render: (_, record) => (
        <Badge variant={record.isActive ? "default" : "secondary"}>{record.isActive ? "활성" : "비활성"}</Badge>
      ),
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<PreventiveMaster>[] = [
    {
      key: "edit",
      label: "수정",
      iconName: "edit",
      onClick: (record) => crud.handleEdit(record),
    },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => confirmDelete(record.id),
    },
  ]

  const exportColumns = [
    { key: "equipmentName", title: "설비명", width: 20 },
    { key: "title", title: "정비명", width: 30 },
    { key: "description", title: "설명", width: 40 },
    { key: "frequency", title: "주기", width: 15 },
    { key: "frequencyValue", title: "주기값", width: 10 },
    { key: "estimatedDuration", title: "예상시간(분)", width: 15 },
    { key: "estimatedCost", title: "예상비용", width: 15 },
    { key: "isActive", title: "활성상태", width: 10 },
  ]

  const importColumns = [
    { key: "equipmentName", title: "설비명", required: true },
    { key: "title", title: "정비명", required: true },
    { key: "description", title: "설명", required: false },
    { key: "frequency", title: "주기", required: true },
    { key: "frequencyValue", title: "주기값", required: true },
    { key: "estimatedDuration", title: "예상시간(분)", required: true },
    { key: "estimatedCost", title: "예상비용", required: true },
    { key: "isActive", title: "활성상태", required: false },
  ]

  const sampleData = [
    {
      equipmentName: "CNC 밀링머신 #1",
      title: "주간 정밀도 점검",
      description: "CNC 밀링머신의 정밀도 및 진동 점검",
      frequency: "weekly",
      frequencyValue: 1,
      estimatedDuration: 120,
      estimatedCost: 50000,
      isActive: true,
    },
  ]

  const confirmDelete = (id: string) => {
    setMasters(masters.filter((master) => master.id !== id))
    toast({
      title: "삭제 완료",
      description: "예방정비마스터가 삭제되었습니다.",
    })
  }

  const handleSave = (data: Partial<PreventiveMaster>) => {
    if (crud.selectedItem) {
      setMasters(
        masters.map((master) =>
          master.id === crud.selectedItem!.id ? { ...master, ...data, updatedAt: new Date().toISOString() } : master,
        ),
      )
      toast({
        title: "수정 완료",
        description: "예방정비마스터가 수정되었습니다.",
      })
    } else {
      const newMaster: PreventiveMaster = {
        ...data,
        id: `pm-${Date.now()}`,
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        updatedBy: "admin",
        updatedAt: new Date().toISOString(),
      } as PreventiveMaster
      setMasters([...masters, newMaster])
      toast({
        title: "등록 완료",
        description: "예방정비마스터가 등록되었습니다.",
      })
    }
    crud.setFormOpen(false)
  }

  const handleImportComplete = async (data: PreventiveMaster[]) => {
    const newMasters = data.map((item, index) => ({
      ...item,
      id: `pm-import-${Date.now()}-${index}`,
      createdBy: "admin",
      createdAt: new Date().toISOString(),
      updatedBy: "admin",
      updatedAt: new Date().toISOString(),
    }))
    setMasters([...masters, ...newMasters])
    toast({
      title: "가져오기 완료",
      description: `${data.length}개의 예방정비마스터를 가져왔습니다.`,
    })
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
        <h1 className="text-2xl font-bold text-text dark:text-white">예방정비 마스터</h1>
        <p className="text-sm text-text-secondary mt-1">예방정비 마스터를 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={masters}
        columns={columns}
        actions={rowActions}
        loading={false}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="설비명, 정비명으로 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: masters.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <PreventiveMasterForm
        formMode={crud.formMode}
        initialData={crud.selectedItem}
        open={crud.formOpen}
        onOpenChange={crud.setFormOpen}
        onSave={handleSave}
        equipmentList={equipmentList}
        templateList={templateList}
      />

      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title="예방정비마스터 가져오기/내보내기"
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={masters}
        onImportComplete={handleImportComplete}
        sampleData={sampleData}
      />
    </div>
  )
}
