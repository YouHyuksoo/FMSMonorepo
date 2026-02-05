"use client";

import { useMemo, useState, useEffect } from "react";
import {
  StandardForm,
  type FormField,
  type FormGroup,
} from "@fms/ui/standard-form";
import type { Equipment, EquipmentFormData } from "@fms/types";
import type { EquipmentCategory } from "@fms/types";
import { useTranslation } from "@/lib/language-context";
import { Button } from "@fms/ui/button";
import { Icon } from "@fms/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface EquipmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EquipmentFormData) => Promise<void>;
  initialData?: Equipment;
  mode: "create" | "edit" | "view";
}

export function EquipmentForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: EquipmentFormProps) {
  const { t } = useTranslation("equipment");
  const { t: tCommon } = useTranslation("common");
  const { toast } = useToast();

  const [selectedTypeId, setSelectedTypeId] = useState<string>(
    initialData?.typeId || ""
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialData?.categoryId || ""
  );
  const [generatedCode, setGeneratedCode] = useState<string>(
    initialData?.code || ""
  );
  const [customProperties, setCustomProperties] = useState<Record<string, any>>(
    initialData?.customProperties || {}
  );

  // 마스터 데이터 조회
  const equipmentTypes: Array<{ id: string; name: string; description?: string; isActive: boolean; properties: Array<{ code: string; name: string; description?: string; dataType: string; required: boolean; isActive: boolean; order: number; options?: Array<{ label: string; value: string }>; regex?: string }> }> = [];
  const equipmentCategories: EquipmentCategory[] = [];
  const codeRules: Array<{ isActive: boolean; appliedTo: string[]; separator: string; segments: Array<{ type: string; value?: string; length?: number; padChar?: string }> }> = [];

  // 선택된 설비 유형 정보
  const selectedType = equipmentTypes.find(
    (type) => type.id === selectedTypeId
  );

  // 설비 유형 옵션
  const typeOptions = equipmentTypes
    .filter((type) => type.isActive)
    .map((type) => ({
      label: type.name,
      value: type.id,
      description: type.description,
    }));

  // 설비 분류 옵션 (플랫 구조로 변환)
  const categoryOptions = useMemo(() => {
    const flattenCategories = (
      categories: EquipmentCategory[],
      level = 0
    ): any[] => {
      return categories.reduce((acc, category) => {
        acc.push({
          label: `${"  ".repeat(level)}${category.name}`,
          value: category.id,
          description: category.description,
        });
        if (category.children) {
          acc.push(...flattenCategories(category.children, level + 1));
        }
        return acc;
      }, [] as any[]);
    };
    return flattenCategories(equipmentCategories.filter((cat) => cat.isActive));
  }, [equipmentCategories]);

  // 상태 옵션
  const statusOptions = [
    { label: t("status_running"), value: "running" },
    { label: t("status_stopped"), value: "stopped" },
    { label: t("status_maintenance"), value: "maintenance" },
    { label: t("status_failure"), value: "failure" },
  ];

  const priorityOptions = [
    { label: t("priority_critical"), value: "critical" },
    { label: t("priority_high"), value: "high" },
    { label: t("priority_normal"), value: "normal" },
    { label: t("priority_low"), value: "low" },
  ];

  const locationOptions = [
    { label: "A동 1층", value: "LOC-A1" },
    { label: "A동 2층", value: "LOC-A2" },
    { label: "B동 지하1층", value: "LOC-B1" },
    { label: "C동 1층", value: "LOC-C1" },
    { label: "D동 전체", value: "LOC-D" },
  ];

  const departmentOptions = [
    { label: "생산1팀", value: "3" },
    { label: "생산2팀", value: "4" },
    { label: "설비관리팀", value: "5" },
    { label: "정보시스템팀", value: "6" },
  ];

  // 설비 코드 자동 생성
  const generateEquipmentCode = () => {
    if (!selectedTypeId || !selectedCategoryId) return "";

    const selectedCategory = equipmentCategories
      .flatMap((cat) => [cat, ...(cat.children || [])])
      .find((cat) => cat.id === selectedCategoryId);

    const applicableRule = codeRules.find(
      (rule) => rule.isActive && rule.appliedTo.includes(selectedTypeId)
    );

    if (!applicableRule || !selectedCategory) return "";

    let code = "";
    applicableRule.segments.forEach((segment, index) => {
      if (index > 0) code += applicableRule.separator;

      switch (segment.type) {
        case "fixed":
          code += segment.value;
          break;
        case "category":
          code += selectedCategory.code;
          break;
        case "sequence":
          // 실제로는 DB에서 다음 시퀀스를 조회해야 함
          const nextSeq = "001";
          code += nextSeq.padStart(segment.length, segment.padChar || "0");
          break;
        case "location":
          // 선택된 위치 코드 사용
          code += "A1"; // 임시값
          break;
        case "year":
          code += new Date().getFullYear().toString().slice(-2);
          break;
        case "month":
          code += (new Date().getMonth() + 1).toString().padStart(2, "0");
          break;
        case "custom":
          code += segment.value || "XXX";
          break;
      }
    });

    return code;
  };

  // 설비 유형 변경 시 코드 자동 생성
  useEffect(() => {
    if (selectedTypeId && selectedCategoryId && mode === "create") {
      const newCode = generateEquipmentCode();
      setGeneratedCode(newCode);
    }
  }, [selectedTypeId, selectedCategoryId, mode]);

  // 코드 재생성 버튼 핸들러
  const handleRegenerateCode = () => {
    const newCode = generateEquipmentCode();
    setGeneratedCode(newCode);
    toast({
      title: "코드 생성 완료",
      description: `새로운 설비 코드가 생성되었습니다: ${newCode}`,
    });
  };

  // 기본 폼 필드 정의
  const baseFormFields: FormField[] = [
    // 설비 유형 선택
    {
      name: "typeId",
      label: t("equipment_type"),
      type: "select",
      required: true,
      options: typeOptions,
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    // 설비 분류 선택
    {
      name: "categoryId",
      label: t("category"),
      type: "select",
      required: true,
      options: categoryOptions,
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    // 설비 코드 (자동 생성)
    {
      name: "code",
      label: t("equipment_code"),
      type: "text",
      required: true,
      disabled: mode === "edit",
      group: "basic",
      gridColumn: "md:col-span-1",
      description: mode === "create" ? t("code_auto_generate_desc") : undefined,
    },
    // 설비명
    {
      name: "name",
      label: t("equipment_name"),
      type: "text",
      required: true,
      placeholder: selectedType
        ? t("equipment_name_placeholder", { type: selectedType.name })
        : t("equipment_name_placeholder_default"),
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    // 기본 정보
    {
      name: "model",
      label: t("model"),
      type: "text",
      required: true,
      placeholder: t("model_placeholder"),
      group: "technical",
      gridColumn: "md:col-span-1",
    },
    {
      name: "manufacturer",
      label: t("manufacturer"),
      type: "text",
      required: true,
      placeholder: t("manufacturer_placeholder"),
      group: "technical",
      gridColumn: "md:col-span-1",
    },
    {
      name: "serialNumber",
      label: t("serial_number"),
      type: "text",
      required: true,
      placeholder: t("serial_number_placeholder"),
      group: "technical",
      gridColumn: "md:col-span-1",
    },
    {
      name: "locationId",
      label: t("location"),
      type: "select",
      required: true,
      options: locationOptions,
      group: "technical",
      gridColumn: "md:col-span-1",
    },
    {
      name: "departmentId",
      label: t("department"),
      type: "select",
      required: true,
      options: departmentOptions,
      group: "technical",
      gridColumn: "md:col-span-1",
    },
    // 상태 정보
    {
      name: "status",
      label: tCommon("status"),
      type: "select",
      required: true,
      options: statusOptions,
      group: "status",
      gridColumn: "md:col-span-1",
    },
    {
      name: "priority",
      label: t("priority"),
      type: "select",
      required: true,
      options: priorityOptions,
      group: "status",
      gridColumn: "md:col-span-1",
    },
    {
      name: "installDate",
      label: t("install_date"),
      type: "date",
      required: true,
      group: "status",
      gridColumn: "md:col-span-1",
    },
    {
      name: "warrantyEndDate",
      label: t("warranty_end"),
      type: "date",
      group: "status",
      gridColumn: "md:col-span-1",
    },
    // 추가 정보
    {
      name: "description",
      label: tCommon("description"),
      type: "textarea",
      placeholder: t("description_placeholder"),
      group: "additional",
      gridColumn: "md:col-span-2",
    },
    {
      name: "isActive",
      label: tCommon("active"),
      type: "switch",
      defaultValue: true,
      description: t("inactive_desc"),
      group: "additional",
      gridColumn: "md:col-span-2",
    },
  ];

  // 선택된 유형의 커스텀 속성 필드 생성
  const customPropertyFields: FormField[] = useMemo(() => {
    if (!selectedType) return [];

    return selectedType.properties
      .filter((prop) => prop.isActive)
      .sort((a, b) => a.order - b.order)
      .map((prop) => {
        const field: FormField = {
          name: `customProperty_${prop.code}`,
          label: prop.name,
          type:
            prop.dataType === "select"
              ? "select"
              : prop.dataType === "multiselect"
              ? "multiselect"
              : prop.dataType === "boolean"
              ? "switch"
              : prop.dataType === "date"
              ? "date"
              : prop.dataType === "number"
              ? "number"
              : "text",
          required: prop.required,
          description: prop.description,
          group: "properties",
          gridColumn: "md:col-span-1",
        };

        if (prop.dataType === "select" || prop.dataType === "multiselect") {
          field.options = prop.options || [];
        }

        if (prop.dataType === "string" && prop.regex) {
          field.validation = {
            pattern: new RegExp(prop.regex),
          };
        }

        return field;
      });
  }, [selectedType, customProperties]);

  // 전체 폼 필드 결합
  const formFields = [...baseFormFields, ...customPropertyFields];

  // 폼 그룹 정의
  const formGroups: FormGroup[] = [
    {
      name: "basic",
      title: t("basic_info"),
      description: t("basic_info_description"),
    },
    {
      name: "technical",
      title: t("technical_info"),
      description: t("technical_info_description"),
    },
    {
      name: "properties",
      title: selectedType
        ? t("type_specific_properties", { type: selectedType.name })
        : t("properties"),
      description: selectedType
        ? t("type_specific_properties_description", { type: selectedType.name })
        : t("properties_description"),
    },
    {
      name: "status",
      title: t("status_info"),
      description: t("status_info_description"),
    },
    {
      name: "additional",
      title: t("additional_info"),
      description: t("additional_info_description"),
    },
  ];

  const getInitialData = () => {
    if (!initialData) return { code: generatedCode };

    const data: any = {
      typeId: initialData.typeId,
      categoryId: initialData.categoryId,
      code: initialData.code,
      name: initialData.name,
      model: initialData.model,
      manufacturer: initialData.manufacturer,
      serialNumber: initialData.serialNumber,
      locationId: initialData.locationId,
      departmentId: initialData.departmentId,
      status: initialData.status,
      priority: initialData.priority,
      installDate: initialData.installDate,
      warrantyEndDate: initialData.warrantyEndDate,
      description: initialData.description,
      isActive: initialData.isActive,
    };

    // 커스텀 속성값 추가
    if (initialData.customProperties) {
      Object.entries(initialData.customProperties).forEach(([key, value]) => {
        data[`customProperty_${key}`] = value;
      });
    }

    return data;
  };

  const handleSubmit = async (data: any) => {
    // 커스텀 속성 분리
    const customProps: Record<string, any> = {};
    const formData: any = { ...data };

    Object.keys(data).forEach((key) => {
      if (key.startsWith("customProperty_")) {
        const propKey = key.replace("customProperty_", "");
        customProps[propKey] = data[key];
        delete formData[key];
      }
    });

    // 최종 데이터 구성
    const finalData: EquipmentFormData = {
      ...formData,
      customProperties: customProps,
      autoGeneratedCode: mode === "create",
    };

    await onSubmit(finalData);
  };

  return (
    <StandardForm
      fields={formFields}
      groups={formGroups}
      initialData={getInitialData()}
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
      mode={mode}
      title={
        mode === "create"
          ? t("register_equipment")
          : mode === "edit"
          ? t("edit_equipment")
          : t("view_equipment")
      }
      description={
        mode === "create"
          ? t("register_equipment_desc")
          : mode === "edit"
          ? t("edit_equipment_desc")
          : t("view_equipment_desc")
      }
      submitText={
        mode === "create"
          ? t("register_equipment")
          : mode === "edit"
          ? t("edit_complete")
          : tCommon("confirm")
      }
      open={open}
      onOpenChange={onOpenChange}
      showInDialog={true}
      layout="tabs"
      maxWidth="1000px"
      showValidationSummary={true}
    />
  );
}
