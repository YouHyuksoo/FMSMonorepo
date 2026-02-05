"use client"
import { StandardForm, type FormField, type FormGroup } from "@fms/ui/standard-form"
import type { MaintenanceRequest, MaintenanceFormData } from "@fms/types"
import { mockEquipment } from "@/lib/mock-data/equipment"
import { useTranslation } from "@/lib/language-context"

interface MaintenanceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: MaintenanceFormData) => Promise<void>
  initialData?: MaintenanceRequest
  mode: "create" | "edit" | "view"
}

export function MaintenanceForm({ open, onOpenChange, onSubmit, initialData, mode }: MaintenanceFormProps) {
  const { t } = useTranslation("maintenance")
  const { t: tCommon } = useTranslation("common")

  // 설비 옵션
  const equipmentOptions = mockEquipment
    .filter((eq) => eq.isActive)
    .map((eq) => ({
      label: `${eq.code} - ${eq.name}`,
      value: eq.id,
      description: `${eq.location} / ${eq.department}`,
    }))

  // 요청 유형 옵션
  const requestTypeOptions = [
    { label: "고장수리", value: "breakdown" },
    { label: "예방정비", value: "preventive" },
    { label: "개선작업", value: "improvement" },
    { label: "비상수리", value: "emergency" },
  ]

  const priorityOptions = [
    { label: "긴급", value: "critical" },
    { label: "높음", value: "high" },
    { label: "보통", value: "normal" },
    { label: "낮음", value: "low" },
  ]

  const formFields: FormField[] = [
    {
      name: "title",
      label: "작업 제목",
      type: "text",
      required: true,
      placeholder: "작업 제목을 입력하세요",
      group: "basic",
      gridColumn: "md:col-span-2",
    },
    {
      name: "equipmentId",
      label: "대상 설비",
      type: "select",
      required: true,
      options: equipmentOptions,
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "requestType",
      label: "요청 유형",
      type: "select",
      required: true,
      options: requestTypeOptions,
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "priority",
      label: "우선순위",
      type: "select",
      required: true,
      options: priorityOptions,
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "estimatedDuration",
      label: "예상 소요시간 (시간)",
      type: "number",
      min: 0.5,
      step: 0.5,
      placeholder: "4",
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "estimatedCost",
      label: "예상 비용 (원)",
      type: "number",
      min: 0,
      placeholder: "500000",
      group: "basic",
      gridColumn: "md:col-span-1",
    },
    {
      name: "description",
      label: "작업 내용",
      type: "textarea",
      required: true,
      placeholder: "상세한 작업 내용과 문제점을 기술하세요",
      group: "details",
      gridColumn: "md:col-span-2",
      rows: 4,
    },
  ]

  const formGroups: FormGroup[] = [
    {
      name: "basic",
      title: "기본 정보",
      description: "보전작업 요청의 기본 정보를 입력하세요",
    },
    {
      name: "details",
      title: "상세 정보",
      description: "작업에 대한 상세한 정보를 입력하세요",
    },
  ]

  const getInitialData = () => {
    if (!initialData) return {}

    return {
      title: initialData.title,
      equipmentId: initialData.equipmentId,
      requestType: initialData.requestType,
      priority: initialData.priority,
      estimatedDuration: initialData.estimatedDuration,
      estimatedCost: initialData.estimatedCost,
      description: initialData.description,
    }
  }

  return (
    <StandardForm
      fields={formFields}
      groups={formGroups}
      initialData={getInitialData()}
      onSubmit={onSubmit}
      onCancel={() => onOpenChange(false)}
      mode={mode}
      title={mode === "create" ? "보전작업 요청" : mode === "edit" ? "작업 요청 수정" : "작업 요청 상세"}
      description={
        mode === "create"
          ? "새로운 보전작업을 요청합니다."
          : mode === "edit"
            ? "작업 요청 정보를 수정합니다."
            : "작업 요청 정보를 확인합니다."
      }
      submitText={mode === "create" ? "요청 등록" : mode === "edit" ? "수정 완료" : tCommon("confirm")}
      open={open}
      onOpenChange={onOpenChange}
      showInDialog={true}
      layout="tabs"
      maxWidth="800px"
    />
  )
}
