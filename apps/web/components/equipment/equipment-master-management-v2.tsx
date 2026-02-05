/**
 * @file apps/web/components/equipment/equipment-master-management-v2.tsx
 * @description 설비 마스터 관리 컴포넌트 - 표준 레이아웃 (탭+검색 같은 줄)
 *
 * 초보자 가이드:
 * 1. **레이아웃**: 탭이 검색/필터와 같은 줄에 배치
 * 2. **기능**: 검색, 필터, 컬럼설정, 정렬, 페이지네이션, 엑셀 다운로드
 * 3. **표준 패턴**: 다른 페이지 마이그레이션 시 참고
 */

"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table";
import { Badge } from "@fms/ui/badge";
import { Button } from "@fms/ui/button";
import { Input } from "@fms/ui/input";
import { Label } from "@fms/ui/label";
import { Textarea } from "@fms/ui/textarea";
import { Checkbox } from "@fms/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fms/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/hooks/use-toast";
import { useCrudState } from "@/hooks/use-crud-state";
import { useTranslation } from "@/lib/language-context";
import type {
  EquipmentType,
  EquipmentProperty,
  EquipmentCategory,
  EquipmentCodeRule,
} from "@fms/types";
import {
  mockEquipmentTypes,
  mockEquipmentCategories,
  mockEquipmentCodeRules,
} from "@/lib/mock-data/equipment-master";

// ============================================
// 초기값 정의
// ============================================
const initialEquipmentType: EquipmentType = {
  id: "",
  code: "",
  name: "",
  description: "",
  icon: "",
  properties: [],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: "system",
  updatedBy: "system",
};

const initialEquipmentProperty: EquipmentProperty = {
  id: "",
  code: "",
  name: "",
  dataType: "string",
  required: false,
  order: 0,
  isActive: true,
};

const initialCategory: EquipmentCategory = {
  id: "",
  code: "",
  name: "",
  description: "",
  level: 1,
  parentId: undefined,
  isActive: true,
  path: "",
};

const initialCodeRule: EquipmentCodeRule = {
  id: "",
  name: "",
  prefix: "",
  separator: "-",
  segments: [],
  example: "",
  isActive: true,
  appliedTo: [],
  description: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// 엑셀 다운로드 유틸
// ============================================
function downloadExcel<T extends Record<string, any>>(
  data: T[],
  columns: { key: string; title: string }[],
  filename: string
) {
  // CSV 형식으로 변환 (간단한 구현)
  const headers = columns.map((c) => c.title).join(",");
  const rows = data.map((item) =>
    columns.map((c) => {
      const value = item[c.key];
      // 쉼표나 줄바꿈이 있으면 따옴표로 감싸기
      if (typeof value === "string" && (value.includes(",") || value.includes("\n"))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? "";
    }).join(",")
  );
  const csv = [headers, ...rows].join("\n");

  // BOM 추가 (한글 깨짐 방지)
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================
// 메인 컴포넌트
// ============================================
export function EquipmentMasterManagementV2() {
  const { t } = useTranslation("equipment");
  const { toast } = useToast();

  // 현재 탭 상태
  const [activeTab, setActiveTab] = useState("types");

  // 데이터 상태
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [codeRules, setCodeRules] = useState<EquipmentCodeRule[]>([]);
  const [loading, setLoading] = useState(true);

  // CRUD 상태
  const typeCrud = useCrudState<EquipmentType>();
  const categoryCrud = useCrudState<EquipmentCategory>();
  const codeRuleCrud = useCrudState<EquipmentCodeRule>();

  // 폼 데이터
  const [typeForm, setTypeForm] = useState<EquipmentType>(initialEquipmentType);
  const [categoryForm, setCategoryForm] = useState<EquipmentCategory>(initialCategory);
  const [codeRuleForm, setCodeRuleForm] = useState<EquipmentCodeRule>(initialCodeRule);

  // 페이지네이션
  const [typePage, setTypePage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [codeRulePage, setCodeRulePage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 데이터 로드
  useEffect(() => {
    setTypes(mockEquipmentTypes);
    setCategories(mockEquipmentCategories);
    setCodeRules(mockEquipmentCodeRules);
    setLoading(false);
  }, []);

  // 폼 데이터 동기화
  useEffect(() => {
    setTypeForm(typeCrud.selectedItem || initialEquipmentType);
  }, [typeCrud.selectedItem]);

  useEffect(() => {
    setCategoryForm(categoryCrud.selectedItem || initialCategory);
  }, [categoryCrud.selectedItem]);

  useEffect(() => {
    setCodeRuleForm(codeRuleCrud.selectedItem || initialCodeRule);
  }, [codeRuleCrud.selectedItem]);

  // ============================================
  // 설비 유형 관리
  // ============================================
  const typeColumns: DataTableColumn<EquipmentType>[] = [
    { key: "code", title: t("type_code"), width: "150px", sortable: true, searchable: true },
    { key: "name", title: t("type_name"), width: "200px", sortable: true, searchable: true },
    {
      key: "properties",
      title: t("type_property_count"),
      width: "120px",
      align: "center",
      render: (_, record) => <Badge variant="outline">{record.properties?.length || 0}개</Badge>,
    },
    {
      key: "isActive",
      title: t("active"),
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [{ label: t("yes"), value: true }, { label: t("no"), value: false }],
      render: (value) => <Badge variant={value ? "default" : "secondary"}>{value ? t("yes") : t("no")}</Badge>,
    },
  ];

  const typeActions: DataTableAction<EquipmentType>[] = [
    { key: "edit", label: t("master.edit"), iconName: "edit", onClick: (record) => typeCrud.handleEdit(record) },
    {
      key: "delete",
      label: t("master.delete"),
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => {
        setTypes(types.filter((t) => t.id !== record.id));
        toast({ title: t("master.success"), description: t("master.type_deleted") });
      },
    },
  ];

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeCrud.selectedItem) {
      setTypes(types.map((t) => t.id === typeCrud.selectedItem!.id ? { ...typeForm, updatedAt: new Date().toISOString() } : t));
      toast({ title: t("master.success"), description: t("master.type_updated") });
    } else {
      setTypes([...types, { ...typeForm, id: `type-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
      toast({ title: t("master.success"), description: t("master.type_added") });
    }
    typeCrud.setFormOpen(false);
  };

  const addProperty = () => {
    const newProperty: EquipmentProperty = { ...initialEquipmentProperty, id: `prop-${Date.now()}`, order: (typeForm.properties?.length || 0) + 1 };
    setTypeForm((prev) => ({ ...prev, properties: [...(prev.properties || []), newProperty] }));
  };

  const removeProperty = (index: number) => {
    setTypeForm((prev) => ({ ...prev, properties: (prev.properties || []).filter((_, i) => i !== index) }));
  };

  const updateProperty = (index: number, field: keyof EquipmentProperty, value: any) => {
    const newProperties = [...(typeForm.properties || [])];
    (newProperties[index] as any)[field] = value;
    setTypeForm((prev) => ({ ...prev, properties: newProperties }));
  };

  // ============================================
  // 설비 분류 관리
  // ============================================
  const categoryColumns: DataTableColumn<EquipmentCategory>[] = [
    { key: "code", title: t("master.code"), width: "150px", sortable: true, searchable: true },
    { key: "name", title: t("master.name"), width: "200px", sortable: true, searchable: true },
    { key: "level", title: t("master.level"), width: "100px", align: "center", sortable: true, render: (value) => <Badge variant="outline">Lv.{value}</Badge> },
    {
      key: "isActive",
      title: t("active"),
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [{ label: t("yes"), value: true }, { label: t("no"), value: false }],
      render: (value) => <Badge variant={value ? "default" : "secondary"}>{value ? t("yes") : t("no")}</Badge>,
    },
  ];

  const categoryActions: DataTableAction<EquipmentCategory>[] = [
    { key: "edit", label: t("master.edit"), iconName: "edit", onClick: (record) => categoryCrud.handleEdit(record) },
    {
      key: "delete",
      label: t("master.delete"),
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => {
        setCategories(categories.filter((c) => c.id !== record.id));
        toast({ title: t("master.success"), description: t("master.category_deleted") });
      },
    },
  ];

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryCrud.selectedItem) {
      setCategories(categories.map((c) => c.id === categoryCrud.selectedItem!.id ? { ...categoryForm, updatedAt: new Date().toISOString() } : c));
      toast({ title: t("master.success"), description: t("master.category_updated") });
    } else {
      setCategories([...categories, { ...categoryForm, id: `category-${Date.now()}` }]);
      toast({ title: t("master.success"), description: t("master.category_added") });
    }
    categoryCrud.setFormOpen(false);
  };

  // ============================================
  // 코드 규칙 관리
  // ============================================
  const codeRuleColumns: DataTableColumn<EquipmentCodeRule>[] = [
    { key: "name", title: t("master.name"), width: "200px", sortable: true, searchable: true },
    { key: "description", title: t("description"), width: "300px", searchable: true },
    { key: "segments", title: t("segment_count"), width: "120px", align: "center", render: (_, record) => <Badge variant="outline">{record.segments?.length || 0}개</Badge> },
    {
      key: "isActive",
      title: t("active"),
      width: "100px",
      align: "center",
      filterable: true,
      filterOptions: [{ label: t("yes"), value: true }, { label: t("no"), value: false }],
      render: (value) => <Badge variant={value ? "default" : "secondary"}>{value ? t("yes") : t("no")}</Badge>,
    },
  ];

  const codeRuleActions: DataTableAction<EquipmentCodeRule>[] = [
    { key: "edit", label: t("master.edit"), iconName: "edit", onClick: (record) => codeRuleCrud.handleEdit(record) },
    {
      key: "delete",
      label: t("master.delete"),
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => {
        setCodeRules(codeRules.filter((r) => r.id !== record.id));
        toast({ title: t("master.success"), description: t("master.code_rule_deleted") });
      },
    },
  ];

  const handleCodeRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeRuleCrud.selectedItem) {
      setCodeRules(codeRules.map((r) => r.id === codeRuleCrud.selectedItem!.id ? { ...codeRuleForm, updatedAt: new Date().toISOString() } : r));
      toast({ title: t("master.success"), description: t("master.code_rule_updated") });
    } else {
      setCodeRules([...codeRules, { ...codeRuleForm, id: `rule-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
      toast({ title: t("master.success"), description: t("master.code_rule_added") });
    }
    codeRuleCrud.setFormOpen(false);
  };

  // ============================================
  // 엑셀 다운로드 핸들러
  // ============================================
  const handleExportTypes = () => {
    downloadExcel(types, [
      { key: "code", title: "코드" },
      { key: "name", title: "이름" },
      { key: "description", title: "설명" },
      { key: "isActive", title: "활성화" },
    ], "설비유형");
    toast({ title: "다운로드 완료", description: "설비유형 목록이 다운로드되었습니다." });
  };

  const handleExportCategories = () => {
    downloadExcel(categories, [
      { key: "code", title: "코드" },
      { key: "name", title: "이름" },
      { key: "level", title: "레벨" },
      { key: "isActive", title: "활성화" },
    ], "설비분류");
    toast({ title: "다운로드 완료", description: "설비분류 목록이 다운로드되었습니다." });
  };

  const handleExportCodeRules = () => {
    downloadExcel(codeRules, [
      { key: "name", title: "이름" },
      { key: "description", title: "설명" },
      { key: "isActive", title: "활성화" },
    ], "코드규칙");
    toast({ title: "다운로드 완료", description: "코드규칙 목록이 다운로드되었습니다." });
  };

  // ============================================
  // 탭 목록 (headerLeft용)
  // ============================================
  const TabsHeader = () => (
    <TabsList className="bg-transparent p-0 h-auto">
      <TabsTrigger
        value="types"
        className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-lg"
      >
        <Icon name="settings" size="sm" className="mr-2" />
        {t("types_tab")}
        <Badge variant="secondary" className="ml-2 bg-primary/20">{types.length}</Badge>
      </TabsTrigger>
      <TabsTrigger
        value="categories"
        className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-lg"
      >
        <Icon name="account_tree" size="sm" className="mr-2" />
        {t("categories_tab")}
        <Badge variant="secondary" className="ml-2 bg-primary/20">{categories.length}</Badge>
      </TabsTrigger>
      <TabsTrigger
        value="code-rules"
        className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-lg"
      >
        <Icon name="description" size="sm" className="mr-2" />
        {t("code_rules_tab")}
        <Badge variant="secondary" className="ml-2 bg-primary/20">{codeRules.length}</Badge>
      </TabsTrigger>
    </TabsList>
  );

  // ============================================
  // 렌더링
  // ============================================
  return (
    <>
      <div className="p-6">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text dark:text-white">
            {t("master_management") || "설비마스터관리"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t("master_management_desc") || "시스템에서 사용되는 설비의 유형, 분류 체계, 코드 생성 규칙 등 기준 정보를 관리합니다."}
          </p>
        </div>

        {/* 탭 + DataTable */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* 설비 유형 탭 */}
          <TabsContent value="types" className="mt-0">
            <DataTable
              data={types}
              columns={typeColumns}
              actions={typeActions}
              loading={loading}
              headerLeft={<TabsHeader />}
              showSearch
              showFilter
              showColumnSettings
              showExport
              onExport={handleExportTypes}
              searchPlaceholder={`${t("type_code")}, ${t("type_name")}으로 검색...`}
              onAdd={() => typeCrud.handleAdd()}
              addButtonText={t("add_type")}
              pagination={{
                page: typePage,
                pageSize,
                total: types.length,
                onPageChange: setTypePage,
                onPageSizeChange: setPageSize,
              }}
            />
          </TabsContent>

          {/* 설비 분류 탭 */}
          <TabsContent value="categories" className="mt-0">
            <DataTable
              data={categories}
              columns={categoryColumns}
              actions={categoryActions}
              loading={loading}
              headerLeft={<TabsHeader />}
              showSearch
              showFilter
              showColumnSettings
              showExport
              onExport={handleExportCategories}
              searchPlaceholder={`${t("master.code")}, ${t("master.name")}으로 검색...`}
              onAdd={() => categoryCrud.handleAdd()}
              addButtonText={t("master.add")}
              pagination={{
                page: categoryPage,
                pageSize,
                total: categories.length,
                onPageChange: setCategoryPage,
                onPageSizeChange: setPageSize,
              }}
            />
          </TabsContent>

          {/* 코드 규칙 탭 */}
          <TabsContent value="code-rules" className="mt-0">
            <DataTable
              data={codeRules}
              columns={codeRuleColumns}
              actions={codeRuleActions}
              loading={loading}
              headerLeft={<TabsHeader />}
              showSearch
              showFilter
              showColumnSettings
              showExport
              onExport={handleExportCodeRules}
              searchPlaceholder={`${t("master.name")}, ${t("description")}으로 검색...`}
              onAdd={() => codeRuleCrud.handleAdd()}
              addButtonText={t("master.add")}
              pagination={{
                page: codeRulePage,
                pageSize,
                total: codeRules.length,
                onPageChange: setCodeRulePage,
                onPageSizeChange: setPageSize,
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* 설비 유형 폼 다이얼로그 */}
      <Dialog open={typeCrud.formOpen} onOpenChange={typeCrud.setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{typeCrud.selectedItem ? t("edit_type") : t("add_type_dialog")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTypeSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t("type_code")}</Label>
                <Input id="code" value={typeForm.code} onChange={(e) => setTypeForm((prev) => ({ ...prev, code: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t("type_name")}</Label>
                <Input id="name" value={typeForm.name} onChange={(e) => setTypeForm((prev) => ({ ...prev, name: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Textarea id="description" value={typeForm.description} onChange={(e) => setTypeForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isActive" checked={typeForm.isActive} onCheckedChange={(checked) => setTypeForm((prev) => ({ ...prev, isActive: checked as boolean }))} />
              <Label htmlFor="isActive">{t("active")}</Label>
            </div>

            {/* 속성 목록 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{t("type_properties")}</h4>
                <Button type="button" onClick={addProperty} variant="outline" size="sm">
                  <Icon name="add" size="sm" className="mr-1" />
                  {t("add_property")}
                </Button>
              </div>
              {typeForm.properties?.map((property, index) => (
                <div key={property.id} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>{t("property_code")}</Label>
                    <Input value={property.code} onChange={(e) => updateProperty(index, "code", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("property_name")}</Label>
                    <Input value={property.name} onChange={(e) => updateProperty(index, "name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("property_data_type")}</Label>
                    <Select value={property.dataType} onValueChange={(value) => updateProperty(index, "dataType", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">{t("data_type_string")}</SelectItem>
                        <SelectItem value="number">{t("data_type_number")}</SelectItem>
                        <SelectItem value="boolean">{t("data_type_boolean")}</SelectItem>
                        <SelectItem value="date">{t("data_type_date")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end space-x-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={property.required} onCheckedChange={(checked) => updateProperty(index, "required", checked)} />
                      <Label>{t("required")}</Label>
                    </div>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeProperty(index)}>
                      <Icon name="delete" size="sm" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => typeCrud.setFormOpen(false)}>취소</Button>
              <Button type="submit">{typeCrud.selectedItem ? t("master.edit") : t("master.add")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 설비 분류 폼 다이얼로그 */}
      <Dialog open={categoryCrud.formOpen} onOpenChange={categoryCrud.setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{categoryCrud.selectedItem ? t("edit_category") : t("add_category_dialog")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="catCode">{t("master.code")}</Label>
                <Input id="catCode" value={categoryForm.code} onChange={(e) => setCategoryForm((prev) => ({ ...prev, code: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catName">{t("master.name")}</Label>
                <Input id="catName" value={categoryForm.name} onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDescription">{t("description")}</Label>
              <Textarea id="catDescription" value={categoryForm.description} onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">{t("master.level")}</Label>
                <Input id="level" type="number" min={1} value={categoryForm.level} onChange={(e) => setCategoryForm((prev) => ({ ...prev, level: parseInt(e.target.value) || 1 }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentId">{t("master.select_parent")}</Label>
                <Select value={categoryForm.parentId || ""} onValueChange={(value) => setCategoryForm((prev) => ({ ...prev, parentId: value || undefined }))}>
                  <SelectTrigger><SelectValue placeholder={t("master.select_parent")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("no")}</SelectItem>
                    {categories.filter((c) => c.id !== categoryCrud.selectedItem?.id).map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="catIsActive" checked={categoryForm.isActive} onCheckedChange={(checked) => setCategoryForm((prev) => ({ ...prev, isActive: checked as boolean }))} />
              <Label htmlFor="catIsActive">{t("active")}</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => categoryCrud.setFormOpen(false)}>취소</Button>
              <Button type="submit">{categoryCrud.selectedItem ? t("master.edit") : t("master.add")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 코드 규칙 폼 다이얼로그 */}
      <Dialog open={codeRuleCrud.formOpen} onOpenChange={codeRuleCrud.setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{codeRuleCrud.selectedItem ? t("edit_code_rule") : t("add_code_rule_dialog")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCodeRuleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ruleName">{t("master.name")}</Label>
              <Input id="ruleName" value={codeRuleForm.name} onChange={(e) => setCodeRuleForm((prev) => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ruleDescription">{t("description")}</Label>
              <Textarea id="ruleDescription" value={codeRuleForm.description} onChange={(e) => setCodeRuleForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ruleIsActive" checked={codeRuleForm.isActive} onCheckedChange={(checked) => setCodeRuleForm((prev) => ({ ...prev, isActive: checked as boolean }))} />
              <Label htmlFor="ruleIsActive">{t("active")}</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => codeRuleCrud.setFormOpen(false)}>취소</Button>
              <Button type="submit">{codeRuleCrud.selectedItem ? t("master.edit") : t("master.add")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EquipmentMasterManagementV2;
