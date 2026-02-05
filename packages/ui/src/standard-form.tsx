"use client";

/**
 * @file packages/ui/src/standard-form.tsx
 * @description 범용 표준 폼 컴포넌트 - 다양한 필드 타입과 레이아웃 지원
 *
 * 초보자 가이드:
 * 1. **주요 개념**: FormField 배열로 폼 필드를 정의하고, StandardForm이 자동으로 렌더링
 * 2. **사용 방법**: fields 배열과 onSubmit 핸들러만 전달하면 폼 생성
 * 3. **레이아웃**: single(기본), tabs(탭 형식) 지원
 * 4. **모드**: create(생성), edit(수정), view(조회) 모드 지원
 */

import type React from "react";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { Switch } from "./switch";
import { Checkbox } from "./checkbox";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { DatePicker } from "./date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Alert, AlertDescription } from "./alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Badge } from "./badge";
import { Icon } from "./icon";

export interface StandardFormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "multiselect"
    | "radio"
    | "checkbox"
    | "switch"
    | "date"
    | "datetime"
    | "file"
    | "custom";
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  options?: Array<{ label: string; value: any; disabled?: boolean }>;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any, formData: Record<string, any>) => string | null;
  };
  defaultValue?: any;
  dependsOn?: string; // 다른 필드에 따라 표시/숨김
  dependsOnValue?: any;
  gridColumn?: string; // CSS grid column
  group?: string; // 필드 그룹
  customRender?: (
    field: StandardFormField,
    value: any,
    onChange: (value: any) => void,
    error?: string
  ) => React.ReactNode;
}

/** @deprecated Use StandardFormField instead */
export type FormField = StandardFormField;

export interface StandardFormGroup {
  name: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/** @deprecated Use StandardFormGroup instead */
export type FormGroup = StandardFormGroup;

export interface StandardFormProps {
  fields: StandardFormField[];
  groups?: StandardFormGroup[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  onCancel?: () => void;
  mode: "create" | "edit" | "view";
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showInDialog?: boolean;
  layout?: "single" | "tabs" | "accordion";
  maxWidth?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
  showValidationSummary?: boolean;
}

export function StandardForm({
  fields,
  groups = [],
  initialData = {},
  onSubmit,
  onCancel,
  mode,
  title,
  description,
  submitText = mode === "create" ? "추가" : mode === "edit" ? "수정" : "확인",
  cancelText = "취소",
  loading = false,
  open = true,
  onOpenChange,
  showInDialog = false,
  layout = "single",
  maxWidth = "800px",
  autoSave = false,
  autoSaveDelay = 2000,
  showValidationSummary = true,
}: StandardFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("");

  const isViewMode = mode === "view";

  // 이전 initialData를 추적하기 위한 ref
  const prevInitialDataRef = useRef<string>("");
  const prevGroupsRef = useRef<string>("");
  const isFirstRender = useRef(true);

  // formData 초기화 - initialData가 실제로 변경될 때만 실행
  useEffect(() => {
    const currentInitialDataStr = JSON.stringify(initialData);

    // 처음 렌더링이거나 initialData가 실제로 변경된 경우에만 실행
    if (isFirstRender.current || prevInitialDataRef.current !== currentInitialDataStr) {
      const newFormData: Record<string, any> = {};
      fields.forEach((field) => {
        if (initialData && initialData[field.name] !== undefined) {
          newFormData[field.name] = initialData[field.name];
        } else if (field.defaultValue !== undefined) {
          newFormData[field.name] = field.defaultValue;
        } else {
          newFormData[field.name] = getDefaultValue(field.type);
        }
      });
      setFormData(newFormData);
      setErrors({});
      setTouchedFields(new Set());
      prevInitialDataRef.current = currentInitialDataStr;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // collapsedGroups 초기화 - groups가 실제로 변경될 때만
  useEffect(() => {
    const currentGroupsStr = JSON.stringify(groups.map(g => g.name));

    if (prevGroupsRef.current !== currentGroupsStr) {
      const defaultCollapsed = new Set(
        groups
          .filter((group) => group.defaultCollapsed)
          .map((group) => group.name)
      );
      setCollapsedGroups(defaultCollapsed);
      prevGroupsRef.current = currentGroupsStr;
    }
  }, [groups]);

  // activeTab 초기화 - 한 번만 실행
  useEffect(() => {
    if (isFirstRender.current && layout === "tabs" && groups.length > 0 && groups[0]) {
      setActiveTab(groups[0].name);
    }
    isFirstRender.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoSave || isViewMode || touchedFields.size === 0) return;

    const timer = setTimeout(() => {
      if (Object.keys(errors).length === 0) {
        handleAutoSave();
      }
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [formData, autoSave, autoSaveDelay, errors, isViewMode, touchedFields]);

  const getDefaultValue = (type: string) => {
    switch (type) {
      case "checkbox":
      case "switch":
        return false;
      case "multiselect":
        return [];
      case "number":
        return "";
      default:
        return "";
    }
  };

  const validateField = useCallback(
    (field: StandardFormField, value: any): string | null => {
      if (
        field.required &&
        (value === "" ||
          value == null ||
          (Array.isArray(value) && value.length === 0))
      ) {
        return `${field.label}은(는) 필수입니다.`;
      }

      if (field.validation) {
        const { min, max, minLength, maxLength, pattern, custom } =
          field.validation;

        if (field.type === "number" && value !== "") {
          const numValue = Number(value);
          if (min !== undefined && numValue < min)
            return `${field.label}은(는) ${min} 이상이어야 합니다.`;
          if (max !== undefined && numValue > max)
            return `${field.label}은(는) ${max} 이하여야 합니다.`;
        }

        if (typeof value === "string") {
          if (minLength !== undefined && value.length < minLength)
            return `${field.label}은(는) ${minLength}자 이상이어야 합니다.`;
          if (maxLength !== undefined && value.length > maxLength)
            return `${field.label}은(는) ${maxLength}자 이하여야 합니다.`;
          if (pattern && !pattern.test(value))
            return `${field.label} 형식이 올바르지 않습니다.`;
        }

        if (custom) {
          const customError = custom(value, formData);
          if (customError) return customError;
        }
      }

      return null;
    },
    [formData]
  );

  const shouldShowField = useCallback(
    (field: StandardFormField): boolean => {
      if (field.hidden) return false;
      if (field.dependsOn && field.dependsOnValue !== undefined) {
        return formData[field.dependsOn] === field.dependsOnValue;
      }
      return true;
    },
    [formData]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let firstErrorField: string | null = null;

    fields.forEach((field) => {
      if (shouldShowField(field)) {
        const error = validateField(field, formData[field.name]);
        if (error) {
          newErrors[field.name] = error;
          if (!firstErrorField) {
            firstErrorField = field.name;
          }
        }
      }
    });

    setErrors(newErrors);
    // Focus on the first field with an error
    if (firstErrorField) {
      const fieldElement = document.getElementsByName(firstErrorField)[0];
      fieldElement?.focus();
    }
    return Object.keys(newErrors).length === 0;
  }, [fields, formData, validateField, shouldShowField]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setTouchedFields((prev) => new Set(prev.add(fieldName)));

    const field = fields.find((f) => f.name === fieldName);
    if (field) {
      const error = validateField(field, value);
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
    }
  };

  const handleAutoSave = useCallback(async () => {
    try {
      console.log("Auto saving...", formData);
    } catch (error) {
      console.error("Auto save failed:", error);
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode) {
      onCancel?.();
      return;
    }
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    const resetData: Record<string, any> = {};
    fields.forEach((field) => {
      resetData[field.name] = field.defaultValue ?? getDefaultValue(field.type);
    });
    setFormData(resetData);
    setErrors({});
    setTouchedFields(new Set());
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fieldName)) newSet.delete(fieldName);
      else newSet.add(fieldName);
      return newSet;
    });
  };

  const renderField = (field: StandardFormField) => {
    if (!shouldShowField(field)) return null;

    const value = formData[field.name];
    const error = errors[field.name];
    const isDisabled = field.disabled || isViewMode;

    if (field.customRender) {
      return field.customRender(
        field,
        value,
        (newValue) => handleInputChange(field.name, newValue),
        error
      );
    }

    const commonProps = {
      id: field.name,
      name: field.name,
      value: value ?? "",
      disabled: isDisabled,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => handleInputChange(field.name, e.target.value),
      placeholder: field.placeholder,
      className: error ? "border-red-500" : "",
    };

    const fieldComponent = (() => {
      switch (field.type) {
        case "text":
        case "email":
          return <Input type={field.type} {...commonProps} />;
        case "password":
          return (
            <div className="relative">
              <Input
                type={showPasswords.has(field.name) ? "text" : "password"}
                {...commonProps}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility(field.name)}
                aria-label={
                  showPasswords.has(field.name)
                    ? "비밀번호 숨기기"
                    : "비밀번호 보기"
                }
              >
                {showPasswords.has(field.name) ? (
                  <Icon name="visibility_off" size="sm" />
                ) : (
                  <Icon name="visibility" size="sm" />
                )}
              </Button>
            </div>
          );
        case "number":
          return (
            <Input
              type="number"
              {...commonProps}
              value={value ?? ""}
              onChange={(e) =>
                handleInputChange(
                  field.name,
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              min={field.validation?.min}
              max={field.validation?.max}
            />
          );
        case "textarea":
          return <Textarea {...commonProps} rows={4} />;
        case "select":
          return (
            <Select
              value={value || ""}
              onValueChange={(newValue) =>
                handleInputChange(field.name, newValue)
              }
              disabled={isDisabled}
              name={field.name}
            >
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem
                    key={String(option.value)}
                    value={String(option.value)}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case "radio":
          return (
            <RadioGroup
              value={value || ""}
              onValueChange={(newValue) =>
                handleInputChange(field.name, newValue)
              }
              disabled={isDisabled}
              name={field.name}
              className="flex flex-col space-y-1"
            >
              {field.options?.map((option) => (
                <div
                  key={String(option.value)}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem
                    value={String(option.value)}
                    id={`${field.name}-${option.value}`}
                  />
                  <Label htmlFor={`${field.name}-${option.value}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          );
        case "checkbox":
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.name}
                name={field.name}
                checked={!!value}
                onCheckedChange={(checked) =>
                  handleInputChange(field.name, checked)
                }
                disabled={isDisabled}
              />
              <Label htmlFor={field.name} className="font-normal">
                {field.description || field.label}
              </Label>
            </div>
          );
        case "switch":
          return (
            <div className="flex items-center space-x-2">
              <Switch
                id={field.name}
                name={field.name}
                checked={!!value}
                onCheckedChange={(checked) =>
                  handleInputChange(field.name, checked)
                }
                disabled={isDisabled}
              />
              <Label htmlFor={field.name} className="font-normal">
                {field.description || field.label}
              </Label>
            </div>
          );
        case "date":
          return (
            <DatePicker
              value={value ? new Date(value) : undefined}
              onChange={(date) =>
                handleInputChange(
                  field.name,
                  date ? date.toISOString().split("T")[0] : undefined
                )
              }
              disabled={isDisabled}
              placeholder={field.placeholder}
            />
          );
        default:
          return <p>Unsupported field type: {field.type}</p>;
      }
    })();

    return (
      <div key={field.name} className={`space-y-1.5 ${field.gridColumn || ""}`}>
        {field.type !== "checkbox" && field.type !== "switch" && (
          <Label
            htmlFor={field.name}
            className="flex items-center gap-1 text-sm font-medium"
          >
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
        )}
        {fieldComponent}
        {field.description &&
          field.type !== "checkbox" &&
          field.type !== "switch" && (
            <p className="text-xs text-muted-foreground pt-1">
              {field.description}
            </p>
          )}
        {error && (
          <Alert variant="destructive" className="mt-1 p-2 text-xs">
            <Icon name="error" size="xs" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  const renderFieldsByGroup = (groupName?: string) => {
    const groupFields = fields.filter((field) =>
      groupName ? field.group === groupName : !field.group
    );
    if (groupFields.length === 0 && groupName) return null;

    const content = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
        {groupFields.map(renderField)}
      </div>
    );

    if (!groupName) return content;

    const groupInfo = groups.find((g) => g.name === groupName);

    return (
      <Card key={groupName}>
        <CardHeader>
          <CardTitle>{groupInfo?.title || groupName}</CardTitle>
          {groupInfo?.description && (
            <CardDescription>{groupInfo.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  };

  const allGroups = [
    ...groups,
    ...(fields.some((f) => !f.group)
      ? [{ name: "__ungrouped__", title: "기타 정보" }]
      : []),
  ];

  const validationErrors = Object.entries(errors).filter(([_, error]) => error);

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showValidationSummary && validationErrors.length > 0 && (
        <Alert variant="destructive">
          <Icon name="error" size="sm" />
          <AlertDescription>
            <div className="font-medium mb-1">다음 문제를 해결해주세요:</div>
            <ul className="list-disc list-inside space-y-0.5 text-sm">
              {validationErrors.map(([fieldName, error]) => {
                const fieldLabel =
                  fields.find((f) => f.name === fieldName)?.label || fieldName;
                return (
                  <li key={fieldName}>
                    {fieldLabel}: {error}
                  </li>
                );
              })}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {layout === "single" && (
        <div className="space-y-6">
          {
            groups.length > 0
              ? groups.map((group) => renderFieldsByGroup(group.name))
              : renderFieldsByGroup()
          }
          {groups.length > 0 && fields.some((f) => !f.group) && (
            <Card>
              <CardHeader>
                <CardTitle>기타 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                  {fields.filter((f) => !f.group).map(renderField)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {layout === "tabs" && allGroups.length > 0 && allGroups[0] && (
        <Tabs
          value={activeTab || allGroups[0].name}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList
            className={`grid w-full grid-cols-${Math.min(allGroups.length, 5)}`}
          >
            {allGroups.map((group) => (
              <TabsTrigger key={group.name} value={group.name}>
                {group.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {allGroups.map((group) => (
            <TabsContent
              key={group.name}
              value={group.name}
              className="space-y-4 pt-4"
            >
              {group.description && (
                <p className="text-muted-foreground text-sm">
                  {group.description}
                </p>
              )}
              {renderFieldsByGroup(
                group.name === "__ungrouped__" ? undefined : group.name
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <div className="flex items-center justify-between pt-4 border-t mt-6">
        <div className="flex items-center gap-2">
          {!isViewMode && autoSave && (
            <Badge variant="outline" className="text-xs font-normal">
              자동 저장 활성화
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isViewMode && (
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              <Icon name="refresh" size="sm" className="mr-2" />
              초기화
            </Button>
          )}
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {cancelText}
            </Button>
          )}
          {!isViewMode && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <Icon name="save" size="sm" className="mr-2" />
                  {submitText}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );

  if (showInDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto p-6"
          style={{ maxWidth }}
        >
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6 p-1" style={{ maxWidth }}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {formContent}
    </div>
  );
}
