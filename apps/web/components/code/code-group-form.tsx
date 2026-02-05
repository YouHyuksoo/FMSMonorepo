"use client";

import {
  StandardForm,
  type FormField,
} from "@fms/ui/standard-form";
import type { CodeGroup, CodeGroupFormData } from "@fms/types";
import { useMemo } from "react";
import { useTranslation } from "@/lib/language-context";

interface CodeGroupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CodeGroupFormData) => Promise<void>;
  initialData?: CodeGroup;
  mode: "create" | "edit" | "view";
}

export function CodeGroupForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: CodeGroupFormProps) {
  const { t } = useTranslation("common");

  const validateGroupCode = (value: any) => {
    if (!value) return t("code.group_code_required");
    if (!/^[A-Z0-9_]+$/.test(value)) {
      return t("code.group_code_pattern");
    }
    if (value.length < 2) {
      return t("code.group_code_min");
    }
    return null;
  };

  const formFields: FormField[] = useMemo(
    () => [
      {
        name: "groupCode",
        label: t("code.group_code"),
        type: "text",
        required: true,
        placeholder: t("code.group_code_placeholder"),
        disabled: mode === "edit", // 수정 시 코드 변경 불가
        validation: { custom: validateGroupCode },
        description: t("code.group_code_description"),
      },
      {
        name: "groupName",
        label: t("code.group_name"),
        type: "text",
        required: true,
        placeholder: t("code.group_name_placeholder"),
      },
      {
        name: "description",
        label: t("code.description"),
        type: "textarea",
        placeholder: t("code.description_placeholder"),
      },
      {
        name: "sortOrder",
        label: t("code.sort_order"),
        type: "number",
        defaultValue: 1,
        validation: { min: 1 },
      },
      {
        name: "isActive",
        label: t("code.is_active"),
        type: "switch",
        defaultValue: true,
        description: t("code.is_active_description"),
      },
    ],
    [mode, t]
  );

  const formInitialData = useMemo(() => {
    if (!initialData) return {};

    return {
      groupCode: initialData.groupCode,
      groupName: initialData.groupName,
      description: initialData.description,
      sortOrder: initialData.sortOrder,
      isActive: initialData.isActive,
    };
  }, [initialData]);

  const handleSubmit = async (data: Record<string, any>) => {
    const formData: CodeGroupFormData = {
      groupCode: data.groupCode,
      groupName: data.groupName,
      description: data.description,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    };
    await onSubmit(formData);
  };

  return (
    <StandardForm
      fields={formFields}
      initialData={formInitialData}
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
      mode={mode}
      title={
        mode === "create"
          ? "코드 그룹 추가"
          : mode === "edit"
          ? "코드 그룹 수정"
          : "코드 그룹 정보"
      }
      description={
        mode === "create"
          ? "새로운 코드 그룹을 추가합니다."
          : mode === "edit"
          ? "코드 그룹 정보를 수정합니다."
          : "코드 그룹 정보를 확인합니다."
      }
      submitText={
        mode === "create" ? "그룹 추가" : mode === "edit" ? "수정 완료" : "확인"
      }
      open={open}
      onOpenChange={onOpenChange}
      showInDialog={true}
      maxWidth="600px"
    />
  );
}
