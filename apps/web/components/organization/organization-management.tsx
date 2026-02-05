"use client"

/**
 * @file apps/web/components/organization/organization-management.tsx
 * @description 조직 관리 컴포넌트 - 표준 DataTable 형식
 */

import { useState, useEffect } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { OrganizationForm } from "./organization-form"
import { ImportExportDialog } from "@/components/common/import-export-dialog"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog"
import { Icon } from "@/components/ui/Icon"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import type { Organization, OrganizationFormData } from "@fms/types"
import { mockOrganizations } from "@/lib/mock-data/organizations"
import type { ExportColumn, ImportColumn } from "@/lib/utils/export-utils"
import { useTranslation } from "@/lib/language-context"

export function OrganizationManagement() {
  // 데이터 상태
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Organization[]>([])

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // CRUD 상태 관리 훅 사용
  const crud = useCrudState<Organization>()

  const { toast } = useToast()
  const { t } = useTranslation("organization")
  const { t: tCommon } = useTranslation("common")

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setOrganizations(mockOrganizations)
    } catch (error) {
      toast({
        title: t("toast.error"),
        description: t("toast.load_failed"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getParentOptions = () => {
    return organizations
      .filter((org) => org.type !== "team")
      .map((org) => ({
        id: org.id,
        name: org.name,
        level: org.level,
      }))
      .sort((a, b) => a.level - b.level)
  }

  const confirmDelete = async () => {
    if (!crud.itemToDelete) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setOrganizations((prev) => prev.filter((org) => org.id !== crud.itemToDelete?.id))
      toast({
        title: t("toast.success"),
        description: t("toast.delete_success"),
      })
    } catch (error) {
      toast({
        title: t("toast.error"),
        description: t("toast.delete_failed"),
        variant: "destructive",
      })
    } finally {
      crud.setDeleteDialogOpen(false)
    }
  }

  const handleFormSubmit = async (data: OrganizationFormData) => {
    try {
      if (crud.formMode === "create") {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const newOrganization: Organization = {
          id: Date.now().toString(),
          ...data,
          parentName: data.parentId ? organizations.find((org) => org.id === data.parentId)?.name : undefined,
          level: data.parentId ? (organizations.find((org) => org.id === data.parentId)?.level || 0) + 1 : 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "current-user",
          updatedBy: "current-user",
        }

        setOrganizations((prev) => [...prev, newOrganization])
        toast({
          title: t("toast.success"),
          description: t("toast.add_success"),
        })
      } else if (crud.formMode === "edit") {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setOrganizations((prev) =>
          prev.map((org) =>
            org.id === crud.selectedItem?.id
              ? {
                  ...org,
                  ...data,
                  parentName: data.parentId ? organizations.find((o) => o.id === data.parentId)?.name : undefined,
                  level: data.parentId ? (organizations.find((o) => o.id === data.parentId)?.level || 0) + 1 : 1,
                  updatedAt: new Date().toISOString(),
                  updatedBy: "current-user",
                }
              : org,
          ),
        )

        toast({
          title: t("toast.success"),
          description: t("toast.edit_success"),
        })
      }
    } catch (error) {
      toast({
        title: t("toast.error"),
        description: t("toast.save_failed", { mode: crud.formMode === "create" ? tCommon("common.add") : tCommon("common.edit") }),
        variant: "destructive",
      })
      throw error
    }
  }

  const handleImportComplete = async (importedData: Organization[]) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setOrganizations((prev) => [...prev, ...importedData])
      toast({
        title: t("toast.success"),
        description: t("toast.import_success", { count: importedData.length }),
      })
    } catch (error) {
      toast({
        title: t("toast.error"),
        description: t("toast.import_failed"),
        variant: "destructive",
      })
      throw error
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "company":
        return <Icon name="business" size="sm" />
      case "department":
        return <Icon name="group" size="sm" />
      case "team":
        return <Icon name="person_check" size="sm" />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "company":
        return t("type_company")
      case "department":
        return t("type_department")
      case "team":
        return t("type_team")
      default:
        return type
    }
  }

  const columns: DataTableColumn<Organization>[] = [
    {
      key: "code",
      title: t("code"),
      width: "120px",
      searchable: true,
      render: (_, record) => record.code,
    },
    {
      key: "name",
      title: t("name"),
      width: "minmax(200px, 1fr)",
      searchable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {"  ".repeat(record.level - 1)}
          {getTypeIcon(record.type)}
          <span className="font-medium">{record.name}</span>
        </div>
      ),
    },
    {
      key: "type",
      title: t("type"),
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: t("type_company"), value: "company" },
        { label: t("type_department"), value: "department" },
        { label: t("type_team"), value: "team" },
      ],
      render: (_, record) => <Badge variant="outline">{getTypeLabel(record.type)}</Badge>,
    },
    {
      key: "parentName",
      title: t("parent_name"),
      width: "150px",
      render: (_, record) => record.parentName || "-",
    },
    {
      key: "sortOrder",
      title: t("sort_order"),
      width: "80px",
      align: "center",
      sortable: true,
      render: (_, record) => record.sortOrder,
    },
    {
      key: "isActive",
      title: t("is_active"),
      width: "90px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: t("status_active"), value: "true" },
        { label: t("status_inactive"), value: "false" },
      ],
      render: (_, record) => <Badge variant={record.isActive ? "default" : "secondary"}>{record.isActive ? t("status_active") : t("status_inactive")}</Badge>,
    },
    {
      key: "updatedAt",
      title: t("updated_at"),
      width: "150px",
      sortable: true,
      render: (_, record) => new Date(record.updatedAt).toLocaleString("ko-KR"),
    },
  ]

  // 행 액션 정의
  const rowActions: DataTableAction<Organization>[] = [
    {
      key: "view",
      label: t("actions.view"),
      iconName: "visibility",
      onClick: (record) => crud.handleView(record),
    },
    {
      key: "edit",
      label: t("actions.edit"),
      iconName: "edit",
      onClick: (record) => crud.handleEdit(record),
    },
    {
      key: "delete",
      label: t("actions.delete"),
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => crud.handleDelete(record),
    },
  ]

  // Export/Import 설정
  const exportColumns: ExportColumn[] = [
    { key: "code", title: t("export.code"), width: 15 },
    { key: "name", title: t("export.name"), width: 25 },
    { key: "type", title: t("export.type"), width: 10, format: (value) => getTypeLabel(value) },
    { key: "parentName", title: t("export.parent_name"), width: 25 },
    { key: "description", title: t("export.description"), width: 30 },
    { key: "sortOrder", title: t("export.sort_order"), width: 10 },
    { key: "isActive", title: t("export.is_active"), width: 10, format: (value) => (value ? "Y" : "N") },
    { key: "createdAt", title: t("export.created_at"), width: 20, format: (value) => new Date(value).toLocaleString("ko-KR") },
  ]

  const importColumns: ImportColumn[] = [
    { key: "code", title: t("export.code"), required: true, type: "string" },
    { key: "name", title: t("export.name"), required: true, type: "string" },
    {
      key: "type",
      title: t("export.type"),
      required: true,
      type: "string",
      validate: (value) =>
        !["company", "department", "team"].includes(value)
          ? t("import.type_validation")
          : null,
    },
    { key: "parentName", title: t("export.parent_name"), type: "string" },
    { key: "description", title: t("export.description"), type: "string" },
    { key: "sortOrder", title: t("export.sort_order"), type: "number" },
    { key: "isActive", title: t("export.is_active"), type: "boolean" },
  ]

  const sampleData = [
    {
      code: "ABC-SAMPLE",
      name: t("sample.name"),
      type: "department",
      parentName: t("sample.parent_name"),
      description: t("sample.description"),
      sortOrder: 1,
      isActive: true,
    },
  ]

  // 헤더 우측 버튼
  const HeaderRight = () => (
    <div className="flex items-center gap-2">
      <Button onClick={() => crud.setImportExportOpen(true)} variant="outline">
        <Icon name="upload_file" size="sm" className="mr-2" />
        가져오기/내보내기
      </Button>
      <Button onClick={crud.handleAdd}>
        <Icon name="add" size="sm" className="mr-2" />
        {t("add_organization")}
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">조직 관리</h1>
        <p className="text-sm text-text-secondary mt-1">조직 구조를 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={organizations}
        columns={columns}
        actions={rowActions}
        loading={loading}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder={t("search_placeholder")}
        pagination={{
          page: currentPage,
          pageSize,
          total: organizations.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <OrganizationForm
        open={crud.formOpen}
        onOpenChange={crud.setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={crud.selectedItem ?? undefined}
        parentOptions={getParentOptions()}
        mode={crud.formMode}
      />

      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title={t("title")}
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={selectedRows.length > 0 ? selectedRows : organizations}
        onImportComplete={handleImportComplete}
        exportOptions={{ filename: "organizations" }}
        sampleData={sampleData}
      />

      <Dialog open={crud.deleteDialogOpen} onOpenChange={crud.setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialog.delete_title")}</DialogTitle>
            <DialogDescription>
              {t("dialog.delete_description", { name: crud.itemToDelete?.name })}
              <br />{t("dialog.delete_warning")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => crud.setDeleteDialogOpen(false)}>{t("dialog.cancel")}</Button>
            <Button variant="destructive" onClick={confirmDelete}>{t("dialog.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
