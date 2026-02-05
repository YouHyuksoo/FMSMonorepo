/**
 * @file apps/web/components/equipment/equipment-management.tsx
 * @description 설비 관리 컴포넌트 - useCrudState 훅을 사용한 CRUD 상태 관리
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 설비(Equipment) 데이터의 CRUD 작업을 관리하는 메인 컴포넌트
 * 2. **상태 관리**: useCrudState 훅을 사용하여 폼, 삭제 다이얼로그, 가져오기/내보내기 상태를 통합 관리
 * 3. **API 모드**: USE_MOCK_API 환경변수에 따라 Mock 데이터 또는 실제 API 사용
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table";
import { EquipmentForm } from "./equipment-form";
import { EquipmentQRCodeDialog } from "./equipment-qr-code-dialog";
import { ImportExportDialog } from "@/components/common/import-export-dialog";
import { Badge } from "@fms/ui/badge";
import { Button } from "@fms/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@fms/ui/dialog";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/hooks/use-toast";
import { useCrudState } from "@/hooks/use-crud-state";
import type { Equipment, EquipmentFormData } from "@fms/types";
import type { ExportColumn } from "@/lib/utils/export-utils";
import {
  useEquipments,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
} from "@/hooks/api/use-equipments";

// Mock/API 모드 전환
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
import { useTranslation } from "@/lib/language-context";

// 상태 라벨 및 색상 정의
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  running: { label: "가동중", variant: "default" },
  stopped: { label: "정지", variant: "secondary" },
  maintenance: { label: "정비중", variant: "outline" },
  failure: { label: "고장", variant: "destructive" },
};

const priorityConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  critical: { label: "긴급", variant: "destructive" },
  high: { label: "높음", variant: "destructive" },
  normal: { label: "보통", variant: "default" },
  low: { label: "낮음", variant: "outline" },
};

export function EquipmentManagement() {
  // API 훅 (API 모드에서만 사용)
  const apiQuery = useEquipments(USE_MOCK_API ? undefined : {});
  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();
  const deleteMutation = useDeleteEquipment();

  // Mock 모드용 상태
  const [mockEquipmentData, setMockEquipmentData] = useState<Equipment[]>([]);
  const [mockLoading, setMockLoading] = useState(USE_MOCK_API);

  // CRUD 상태 관리 훅 사용
  const crud = useCrudState<Equipment>();

  const [selectedRows, setSelectedRows] = useState<Equipment[]>([]);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrEquipment, setQrEquipment] = useState<Equipment | null>(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { toast } = useToast();
  const { t } = useTranslation("equipment");
  const { t: tCommon } = useTranslation("common");

  // Mock 모드 데이터 로드
  useEffect(() => {
    if (USE_MOCK_API) {
      const loadMockData = async () => {
        setMockLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMockEquipmentData([]);
        setMockLoading(false);
      };
      loadMockData();
    }
  }, []);

  // 통합 데이터 및 로딩 상태
  const equipment = useMemo(() => {
    if (USE_MOCK_API) return mockEquipmentData;
    const data = apiQuery.data as any;
    return data?.items || data || [];
  }, [mockEquipmentData, apiQuery.data]);

  const loading = USE_MOCK_API ? mockLoading : apiQuery.isLoading;

  const handleQRCode = (equipment: Equipment) => {
    setQrEquipment(equipment);
    setQrDialogOpen(true);
  };

  const handleBatchQRPrint = () => {
    if (selectedRows.length === 0) {
      toast({
        title: tCommon("alert"),
        description: t("select_equipment_for_qr"),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("batch_qr_print"),
      description: t("batch_qr_print_desc", {
        count: selectedRows.length,
        names: selectedRows.map((eq) => eq.name).join(", "),
      }),
    });
  };

  const handleMaintenanceHistory = (equipment: Equipment) => {
    toast({
      title: t("maintenance_history"),
      description: t("view_maintenance_history", { name: equipment.name }),
    });
  };

  const confirmDelete = async () => {
    if (!crud.itemToDelete) return;

    try {
      if (USE_MOCK_API) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMockEquipmentData((prev) =>
          prev.filter((eq) => eq.id !== crud.itemToDelete!.id)
        );
      } else {
        await deleteMutation.mutateAsync(crud.itemToDelete.id);
      }
      toast({
        title: tCommon("success"),
        description: t("equipment_deleted"),
      });
    } catch (error) {
      toast({
        title: tCommon("error"),
        description: t("delete_equipment_failed"),
        variant: "destructive",
      });
    } finally {
      crud.setDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = async (data: EquipmentFormData) => {
    try {
      if (crud.formMode === "create") {
        if (USE_MOCK_API) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const newEquipment: Equipment = {
            id: Date.now().toString(),
            ...data,
            type: getTypeLabel(data.typeCode),
            location: t("sample_location"),
            department: t("sample_department"),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: "current-user",
            updatedBy: "current-user",
          };
          setMockEquipmentData((prev) => [...prev, newEquipment]);
        } else {
          await createMutation.mutateAsync(data as any);
        }
        toast({
          title: tCommon("success"),
          description: t("equipment_added"),
        });
      } else if (crud.formMode === "edit") {
        if (USE_MOCK_API) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setMockEquipmentData((prev) =>
            prev.map((eq) =>
              eq.id === crud.selectedItem?.id
                ? {
                    ...eq,
                    ...data,
                    type: getTypeLabel(data.typeCode),
                    updatedAt: new Date().toISOString(),
                    updatedBy: "current-user",
                  }
                : eq
            )
          );
        } else {
          await updateMutation.mutateAsync({
            id: crud.selectedItem!.id,
            data: data as any,
          });
        }
        toast({
          title: tCommon("success"),
          description: t("equipment_updated"),
        });
      }
    } catch (error) {
      toast({
        title: tCommon("error"),
        description: t("equipment_save_failed", {
          mode: crud.formMode === "create" ? t("add") : t("edit"),
        }),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleImportComplete = async (importedData: Equipment[]) => {
    try {
      if (USE_MOCK_API) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setMockEquipmentData((prev) => [...prev, ...importedData]);
      } else {
        for (const item of importedData) {
          await createMutation.mutateAsync(item as any);
        }
      }
      toast({
        title: tCommon("success"),
        description: t("equipment_imported", { count: importedData.length }),
      });
    } catch (error) {
      toast({
        title: tCommon("error"),
        description: t("import_failed"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Icon name="check_circle" size="sm" />;
      case "stopped":
        return <Icon name="stop" size="sm" />;
      case "maintenance":
        return <Icon name="build" size="sm" />;
      case "failure":
        return <Icon name="warning" size="sm" />;
      default:
        return <Icon name="schedule" size="sm" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`status_${status}`);
  };

  const getPriorityLabel = (priority: string) => {
    return t(`priority_${priority}`);
  };

  const getTypeLabel = (typeCode: string) => {
    return t(`type_${typeCode.toLowerCase()}`);
  };

  // 컬럼 정의
  const columns: DataTableColumn<Equipment>[] = [
    {
      key: "code",
      title: t("equipment_code"),
      width: "150px",
      searchable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Icon name="settings" size="sm" className="text-muted-foreground" />
          <span className="font-mono font-medium">{record.code}</span>
        </div>
      ),
    },
    {
      key: "name",
      title: t("equipment_name"),
      width: "200px",
      searchable: true,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="text-sm text-text-secondary">{record.model}</div>
        </div>
      ),
    },
    {
      key: "type",
      title: t("equipment_type"),
      width: "120px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "컴프레서", value: "compressor" },
        { label: "펌프", value: "pump" },
        { label: "모터", value: "motor" },
        { label: "컨베이어", value: "conveyor" },
      ],
      render: (_, record) => <Badge variant="outline">{record.type}</Badge>,
    },
    {
      key: "status",
      title: tCommon("status"),
      width: "120px",
      align: "center",
      filterable: true,
      filterOptions: Object.entries(statusConfig).map(([value, { label }]) => ({ label, value })),
      render: (_, record) => {
        const config = statusConfig[record.status] || { label: record.status, variant: "outline" as const };
        return (
          <div className="flex items-center justify-center gap-1">
            {getStatusIcon(record.status)}
            <Badge variant={config.variant}>{getStatusLabel(record.status)}</Badge>
          </div>
        );
      },
    },
    {
      key: "priority",
      title: t("priority"),
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: Object.entries(priorityConfig).map(([value, { label }]) => ({ label, value })),
      render: (_, record) => {
        const config = priorityConfig[record.priority] || { label: record.priority, variant: "outline" as const };
        return <Badge variant={config.variant}>{getPriorityLabel(record.priority)}</Badge>;
      },
    },
    {
      key: "location",
      title: t("location"),
      width: "150px",
      searchable: true,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.location}</div>
          <div className="text-xs text-text-secondary">{record.department}</div>
        </div>
      ),
    },
    {
      key: "manufacturer",
      title: t("manufacturer"),
      width: "150px",
      searchable: true,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.manufacturer}</div>
          <div className="text-xs text-text-secondary">{record.serialNumber}</div>
        </div>
      ),
    },
    {
      key: "nextMaintenanceDate",
      title: t("next_maintenance"),
      width: "120px",
      align: "center",
      sortable: true,
      render: (_, record) => {
        if (!record.nextMaintenanceDate) return "-";
        const date = new Date(record.nextMaintenanceDate);
        const isOverdue = date < new Date();
        return (
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            {date.toLocaleDateString("ko-KR")}
          </span>
        );
      },
    },
  ];

  // 행 액션 정의
  const rowActions: DataTableAction<Equipment>[] = [
    {
      key: "view",
      label: tCommon("view"),
      iconName: "visibility",
      onClick: (record) => crud.handleView(record),
    },
    {
      key: "edit",
      label: tCommon("edit"),
      iconName: "edit",
      onClick: (record) => crud.handleEdit(record),
    },
    {
      key: "qrcode",
      label: "QR 코드",
      iconName: "qr_code_2",
      onClick: (record) => handleQRCode(record),
    },
    {
      key: "history",
      label: t("maintenance_history"),
      iconName: "monitoring",
      onClick: (record) => handleMaintenanceHistory(record),
    },
    {
      key: "delete",
      label: tCommon("delete"),
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => crud.handleDelete(record),
    },
  ];

  // Export/Import 설정
  const exportColumns: ExportColumn[] = [
    { key: "code", title: t("equipment_code"), width: 15 },
    { key: "name", title: t("equipment_name"), width: 25 },
    { key: "type", title: t("equipment_type"), width: 15 },
    { key: "model", title: t("model"), width: 15 },
    { key: "manufacturer", title: t("manufacturer"), width: 20 },
    { key: "serialNumber", title: t("serial_number"), width: 20 },
    { key: "location", title: t("location"), width: 15 },
    { key: "department", title: t("department"), width: 15 },
    {
      key: "status",
      title: tCommon("status"),
      width: 10,
      format: (value) => getStatusLabel(value),
    },
    {
      key: "priority",
      title: t("priority"),
      width: 10,
      format: (value) => getPriorityLabel(value),
    },
    {
      key: "installDate",
      title: t("install_date"),
      width: 15,
      format: (value) => new Date(value).toLocaleDateString("ko-KR"),
    },
    {
      key: "nextMaintenanceDate",
      title: t("next_maintenance"),
      width: 15,
      format: (value) =>
        value ? new Date(value).toLocaleDateString("ko-KR") : "",
    },
  ];

  const importColumns = [
    { key: "code", title: t("equipment_code"), required: true, type: "string" as const },
    { key: "name", title: t("equipment_name"), required: true, type: "string" as const },
    { key: "typeCode", title: t("equipment_type"), required: true, type: "string" as const },
    { key: "model", title: t("model"), required: true, type: "string" as const },
    { key: "manufacturer", title: t("manufacturer"), required: true, type: "string" as const },
    { key: "serialNumber", title: t("serial_number"), required: true, type: "string" as const },
    { key: "locationId", title: t("location"), required: true, type: "string" as const },
    { key: "departmentId", title: t("department"), required: true, type: "string" as const },
    { key: "status", title: tCommon("status"), required: true, type: "string" as const },
    { key: "priority", title: t("priority"), required: true, type: "string" as const },
    { key: "installDate", title: t("install_date"), required: true, type: "date" as const },
    { key: "description", title: tCommon("description"), type: "string" as const },
  ];

  const sampleData: Partial<Equipment>[] = [
    {
      code: "EQ-SAMPLE-001",
      name: "샘플 설비",
      typeCode: "COMPRESSOR",
      model: "SM-100",
      manufacturer: "샘플제조사",
      serialNumber: "SM2024001",
      locationId: "LOC-A1",
      departmentId: "3",
      status: "running" as "running",
      priority: "normal",
      installDate: "2024-01-01",
      description: "샘플 설비입니다",
    },
  ];

  // 헤더 우측 버튼
  const HeaderRight = () => (
    <div className="flex items-center gap-2">
      {selectedRows.length > 0 && (
        <Button variant="outline" onClick={handleBatchQRPrint}>
          <Icon name="print" size="sm" className="mr-2" />
          {t("doc_mgmt.batch_qr_print")} ({selectedRows.length})
        </Button>
      )}
      <Button onClick={() => crud.setImportExportOpen(true)} variant="outline">
        <Icon name="upload_file" size="sm" className="mr-2" />
        가져오기/내보내기
      </Button>
      <Button onClick={crud.handleAdd}>
        <Icon name="add" size="sm" className="mr-2" />
        {t("add_equipment")}
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">{t("title")}</h1>
        <p className="text-sm text-text-secondary mt-1">설비를 등록하고 관리합니다.</p>
      </div>

      <DataTable
        data={equipment}
        columns={columns}
        actions={rowActions}
        loading={loading}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder={t("search.placeholder")}
        pagination={{
          page: currentPage,
          pageSize,
          total: equipment.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <EquipmentForm
        open={crud.formOpen}
        onOpenChange={crud.setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={crud.selectedItem ?? undefined}
        mode={crud.formMode}
      />

      <EquipmentQRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        equipment={qrEquipment}
      />

      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title={t("title")}
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={selectedRows.length > 0 ? selectedRows : equipment}
        onImportComplete={handleImportComplete}
        exportOptions={{ filename: "equipment" }}
        sampleData={sampleData}
      />

      <Dialog open={crud.deleteDialogOpen} onOpenChange={crud.setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`${tCommon("delete")} ${t("title")}`}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              "{crud.itemToDelete?.name}" {t("confirm_delete")}
              <br />이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={crud.closeDeleteDialog}>
              {tCommon("cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EquipmentManagement;
