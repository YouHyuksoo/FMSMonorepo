"use client";

import { useState, useEffect, useMemo } from "react";
import {
  StandardForm,
  type FormField,
  type FormGroup,
} from "@fms/ui/standard-form";
import type { Code, CodeFormData, CodeGroup } from "@fms/types";
import { useTranslation } from "@/lib/language-context";

interface CodeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CodeFormData) => Promise<void>;
  initialData?: Code;
  codeGroups: CodeGroup[];
  parentCodes: Code[];
  mode: "create" | "edit" | "view";
  selectedGroupId?: string;
}

export function CodeForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  codeGroups,
  parentCodes,
  mode,
  selectedGroupId,
}: CodeFormProps) {
  const { t } = useTranslation("common");
  const [attributes, setAttributes] = useState<Record<string, any>>({});

  useEffect(() => {
    if (initialData?.attributes) {
      setAttributes(initialData.attributes);
    } else {
      setAttributes({});
    }
  }, [initialData, open]);

  const validateCode = (value: any) => {
    if (!value) return t("code.code_required");
    if (!/^[A-Z0-9_]+$/.test(value)) {
      return t("code.code_pattern");
    }
    return null;
  };

  const groupOptions = useMemo(
    () =>
      codeGroups
        .filter((group) => group.isActive)
        .map((group) => ({
          label: `${group.groupName} (${group.groupCode})`,
          value: group.id,
        })),
    [codeGroups]
  );

  const parentOptions = useMemo(
    () =>
      parentCodes
        .filter((code) => code.level === 1)
        .map((code) => ({
          label: `${code.name} (${code.code})`,
          value: code.code,
        })),
    [parentCodes]
  );

  const formFields: FormField[] = useMemo(
    () => [
      // 기본 정보
      {
        name: "groupId",
        label: t("code.group"),
        type: "select",
        required: true,
        options: groupOptions,
        defaultValue: selectedGroupId,
        disabled: mode === "edit" || !!selectedGroupId,
        group: "basic",
      },
      {
        name: "code",
        label: t("code.code"),
        type: "text",
        required: true,
        placeholder: t("code.code_placeholder"),
        disabled: mode === "edit",
        validation: { custom: validateCode },
        description: t("code.code_description"),
        group: "basic",
      },
      {
        name: "name",
        label: t("code.name"),
        type: "text",
        required: true,
        placeholder: t("code.name_placeholder"),
        group: "basic",
      },
      {
        name: "description",
        label: t("code.description"),
        type: "textarea",
        placeholder: t("code.description_placeholder"),
        group: "basic",
      },
      {
        name: "value",
        label: t("code.value"),
        type: "text",
        placeholder: t("code.value_placeholder"),
        description: t("code.value_description"),
        group: "basic",
      },

      // 계층 구조
      {
        name: "parentCode",
        label: t("code.parent_code"),
        type: "select",
        options: parentOptions,
        placeholder: t("code.parent_code_placeholder"),
        description: t("code.parent_code_description"),
        group: "hierarchy",
      },
      {
        name: "sortOrder",
        label: t("code.sort_order"),
        type: "number",
        defaultValue: 1,
        validation: { min: 1 },
        group: "hierarchy",
      },

      // 상태 및 속성
      {
        name: "isActive",
        label: t("code.is_active"),
        type: "switch",
        defaultValue: true,
        description: t("code.is_active_description"),
        group: "status",
      },

      // 확장 속성
      {
        name: "color",
        label: "색상",
        type: "text",
        placeholder: "#dc2626",
        description: "UI에서 표시할 색상 (HEX 코드)",
        group: "attributes",
        customRender: (field, value, onChange, error) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">색상</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={value || "#000000"}
                onChange={(e) => onChange(e.target.value)}
                className="w-12 h-10 border rounded"
              />
              <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#dc2626"
                className="flex-1 px-3 py-2 border rounded-md"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              UI에서 표시할 색상 (HEX 코드)
            </p>
          </div>
        ),
      },
      {
        name: "icon",
        label: "아이콘",
        type: "text",
        placeholder: "crown, shield, users 등",
        description: "Lucide 아이콘 이름",
        group: "attributes",
      },
      {
        name: "bgColor",
        label: "배경색",
        type: "text",
        placeholder: "#fef2f2",
        description: "배경 색상 (HEX 코드)",
        group: "attributes",
      },
    ],
    [mode, t, groupOptions, parentOptions, selectedGroupId]
  );

  const formGroups: FormGroup[] = [
    {
      name: "basic",
      title: "기본 정보",
      description: "코드의 기본 정보를 입력하세요",
    },
    {
      name: "hierarchy",
      title: "계층 구조",
      description: "코드의 계층 구조와 정렬을 설정하세요",
    },
    {
      name: "status",
      title: "상태 설정",
      description: "코드의 활성 상태를 설정하세요",
    },
    {
      name: "attributes",
      title: "확장 속성",
      description: "UI 표시를 위한 추가 속성을 설정하세요",
      collapsible: true,
      defaultCollapsed: true,
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    // 확장 속성 처리
    const { color, icon, bgColor, ...basicData } = data;
    const attributes: Record<string, any> = {};

    if (color) attributes.color = color;
    if (icon) attributes.icon = icon;
    if (bgColor) attributes.bgColor = bgColor;

    const codeFormData: CodeFormData = {
      groupId: data.groupId,
      code: data.code,
      name: data.name,
      description: data.description,
      value: data.value,
      parentCode: data.parentCode,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    };

    await onSubmit(codeFormData);
  };

  const formInitialData = useMemo(() => {
    if (!initialData) return { groupId: selectedGroupId };

    return {
      groupId: initialData.groupId,
      code: initialData.code,
      name: initialData.name,
      description: initialData.description,
      value: initialData.value,
      parentCode: initialData.parentCode,
      sortOrder: initialData.sortOrder,
      isActive: initialData.isActive,
      color: initialData.attributes?.color,
      icon: initialData.attributes?.icon,
      bgColor: initialData.attributes?.bgColor,
    };
  }, [initialData, selectedGroupId]);

  return (
    <StandardForm
      fields={formFields}
      groups={formGroups}
      initialData={formInitialData}
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
      mode={mode}
      title={
        mode === "create"
          ? "코드 추가"
          : mode === "edit"
          ? "코드 수정"
          : "코드 정보"
      }
      description={
        mode === "create"
          ? "새로운 코드를 추가합니다."
          : mode === "edit"
          ? "코드 정보를 수정합니다."
          : "코드 정보를 확인합니다."
      }
      submitText={
        mode === "create" ? "코드 추가" : mode === "edit" ? "수정 완료" : "확인"
      }
      open={open}
      onOpenChange={onOpenChange}
      showInDialog={true}
      layout="tabs"
      maxWidth="800px"
    />
  );
}
