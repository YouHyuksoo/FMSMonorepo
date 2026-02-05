/**
 * @file apps/web/components/preventive/preventive-master-form.tsx
 * @description 예방정비 마스터 등록/수정 폼 컴포넌트
 */
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import { type PreventiveMaster, PreventivePeriodType, PreventivePriority } from "@fms/types"
import type { Equipment, InspectionMaster } from "@fms/types"
import { periodTypeLabels } from "@fms/types"
import { StandardForm, type StandardFormField, type StandardFormGroup } from "@fms/ui/standard-form"
import { calculateNextScheduleDate, getTodayIsoDate } from "@fms/utils"
import { useToast } from "@/hooks/use-toast"
import { isEqual } from "lodash"

interface PreventiveMasterFormProps {
  formMode: "create" | "edit" | "view"
  initialData: Partial<PreventiveMaster> | null
  equipmentList?: Equipment[]
  templateList?: InspectionMaster[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: PreventiveMaster) => void
}

export function PreventiveMasterForm({
  formMode,
  initialData,
  equipmentList = [],
  templateList = [],
  open,
  onOpenChange,
  onSave,
}: PreventiveMasterFormProps) {
  const { toast } = useToast()
  
  // 폼 내부 상태 추적 (종속성 관리를 위해)
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(initialData?.equipmentId || "")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialData?.templateId || "")
  const [formInitialData, setFormInitialData] = useState<Record<string, any>>({})

  const selectedEquipment = useMemo(() => {
    return equipmentList.find((eq) => eq.id === selectedEquipmentId)
  }, [selectedEquipmentId, equipmentList])

  const selectedTemplate = useMemo(() => {
    return templateList.find((tpl) => tpl.id === selectedTemplateId)
  }, [selectedTemplateId, templateList])

  const filteredTemplateList = useMemo(() => {
    if (!selectedEquipment) return templateList
    return templateList.filter((tpl) => 
        !tpl.equipmentTypeId || tpl.equipmentTypeId === selectedEquipment.typeId
    )
  }, [selectedEquipment, templateList])

  // 초기 데이터 생성 로직
  const generateFormValues = useCallback(
    (
      currentEquipmentId: string,
      currentTemplateId: string,
      currentInitialData: Partial<PreventiveMaster> | null,
    ): Record<string, any> => {
      const eq = equipmentList.find((e) => e.id === currentEquipmentId)
      const tpl = templateList.find((t) => t.id === currentTemplateId)

      if (formMode !== "create" && currentInitialData) {
        return {
          ...currentInitialData,
          nextScheduleDate: currentInitialData.nextScheduleDate
            ? new Date(currentInitialData.nextScheduleDate).toISOString().split("T")[0]
            : getTodayIsoDate(),
        } as Record<string, any>
      }

      let suggestedNextDate = getTodayIsoDate()
      let taskDesc = ""
      let estDuration = 60
      const estCost = 0

      if (tpl) {
        taskDesc = `${eq?.name || "선택된 설비"} - ${tpl.name}`
        estDuration = tpl.estimatedTime || 60

        const baseDateForCalc = eq?.installDate || getTodayIsoDate()
        // Simple mapping for demo: all template periods map to TIME_BASED for now
        if (tpl.periodType && tpl.periodValue > 0) {
          suggestedNextDate = calculateNextScheduleDate(baseDateForCalc, tpl.periodType as any, tpl.periodValue)
        }
      }

      return {
        equipmentId: currentEquipmentId,
        templateId: currentTemplateId,
        taskDescription: taskDesc,
        estimatedDuration: estDuration,
        estimatedCost: estCost,
        isActive: true,
        nextScheduleDate: suggestedNextDate,
      }
    },
    [equipmentList, templateList, formMode],
  )

  // initialData 변경 시 동기화
  useEffect(() => {
    if (!open) return;

    const newInitialValues = generateFormValues(
      initialData?.equipmentId || "",
      initialData?.templateId || "",
      initialData,
    )
    
    if (!isEqual(formInitialData, newInitialValues)) {
      setFormInitialData(newInitialValues)
    }
    
    if (initialData?.equipmentId) setSelectedEquipmentId(initialData.equipmentId)
    if (initialData?.templateId) setSelectedTemplateId(initialData.templateId)
  }, [initialData, open, generateFormValues])

  const formFields: StandardFormField[] = [
    {
      name: "equipmentId",
      label: "설비 *",
      type: "select",
      required: true,
      options: equipmentList.map((eq) => ({ label: eq.name, value: eq.id })),
      disabled: formMode !== "create",
      customRender: (field, value, onChange) => (
        <div className="space-y-1">
             <select 
                className="w-full p-2 border rounded-md"
                value={value || ""} 
                onChange={(e) => {
                    const val = e.target.value;
                    setSelectedEquipmentId(val);
                    onChange(val);
                }}
                disabled={field.disabled}
             >
                <option value="">선택하세요</option>
                {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
             </select>
        </div>
      )
    },
    {
      name: "templateId",
      label: "적용 템플릿 *",
      type: "select",
      required: true,
      options: filteredTemplateList.map((tpl) => ({ label: tpl.name, value: tpl.id })),
      description: selectedEquipment ? "선택한 설비 유형에 맞는 점검 템플릿 목록입니다." : "설비를 먼저 선택하세요.",
      customRender: (field, value, onChange) => (
        <div className="space-y-1">
             <select 
                className="w-full p-2 border rounded-md"
                value={value || ""} 
                onChange={(e) => {
                    const val = e.target.value;
                    setSelectedTemplateId(val);
                    onChange(val);
                }}
             >
                <option value="">선택하세요</option>
                {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
             </select>
        </div>
      )
    },
    {
      name: "taskDescription",
      label: "작업 설명 *",
      type: "textarea",
      required: true,
      placeholder: "예: 압축기 #1 - 일일 누유 점검",
      gridColumn: "md:col-span-2",
      description: "템플릿 선택 시 자동으로 생성되며, 직접 수정 가능합니다.",
    },
    {
      name: "selectedTemplatePeriod",
      label: "템플릿 주기",
      type: "text",
      disabled: true,
      gridColumn: "md:col-span-1",
      customRender: () => (
          <div className="p-2 bg-muted rounded-md text-sm border">
               {selectedTemplate
                ? `${periodTypeLabels[selectedTemplate.periodType]} (값: ${selectedTemplate.periodValue})`
                : "템플릿을 선택하세요."}
          </div>
      )
    },
    {
      name: "nextScheduleDate",
      label: "다음 점검 예정일 *",
      type: "date",
      required: true,
      gridColumn: "md:col-span-1",
      description: "템플릿 선택 시 자동 제안됩니다.",
    },
    {
      name: "estimatedDuration",
      label: "예상 소요시간 (분)",
      type: "number",
      gridColumn: "md:col-span-1",
      validation: { min: 0 }
    },
    {
      name: "estimatedCost",
      label: "예상 비용 (원)",
      type: "number",
      gridColumn: "md:col-span-1",
      validation: { min: 0 }
    },
    {
      name: "isActive",
      label: "이 설비에 템플릿 적용 활성화",
      type: "switch",
      defaultValue: true,
      gridColumn: "md:col-span-2",
    },
  ]

  const formGroups: StandardFormGroup[] = [{ name: "main", title: "예방 정비 계획 정보" }]

  const handleSubmit = (data: Record<string, any>) => {
    const currentEquipment = equipmentList.find((eq) => eq.id === data.equipmentId)
    const currentTemplate = templateList.find((tpl) => tpl.id === data.templateId)

    const saveData: PreventiveMaster = {
      id: (initialData?.id as string) || `pm-master-${Date.now()}`,
      code: (initialData?.code as string) || `PM-${Date.now().toString().slice(-4)}`,
      name: data.taskDescription?.substring(0, 50) || currentTemplate?.name || "N/A",
      equipmentId: data.equipmentId,
      equipmentName: currentEquipment?.name || "N/A",
      templateId: data.templateId,
      taskDescription: data.taskDescription,
      periodType: (currentTemplate?.periodType as any) || initialData?.periodType || PreventivePeriodType.TIME_BASED,
      intervalDays: currentTemplate?.periodValue || initialData?.intervalDays,
      usageThreshold: initialData?.usageThreshold,
      usageUnit: initialData?.usageUnit,
      conditionParameter: initialData?.conditionParameter,
      estimatedDuration: Number(data.estimatedDuration) || 0,
      estimatedCost: Number(data.estimatedCost) || 0,
      isActive: data.isActive === undefined ? true : data.isActive,
      nextScheduleDate: data.nextScheduleDate ? new Date(data.nextScheduleDate).toISOString() : getTodayIsoDate(),
      lastExecutedDate: initialData?.lastExecutedDate,
      effectiveDate: initialData?.effectiveDate || getTodayIsoDate(),
      priority: PreventivePriority.MEDIUM,
      type: "PREVENTIVE",
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: initialData?.createdBy || "system",
      updatedBy: "system",
      title: data.taskDescription?.substring(0, 50) || currentTemplate?.name || "N/A",
    }
    onSave(saveData)
  }

  return (
    <StandardForm
      fields={formFields}
      groups={formGroups}
      initialData={formInitialData}
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
      mode={formMode}
      title={formMode === "create" ? "새 예방 정비 계획 연결" : formMode === "edit" ? "예방 정비 계획 수정" : "예방 정비 계획 상세"}
      description="설비에 점검 템플릿을 연결하고 다음 점검 일정을 설정합니다."
      submitText={formMode === "create" ? "연결 생성" : "수정 완료"}
      showInDialog={true}
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="800px"
    />
  )
}
