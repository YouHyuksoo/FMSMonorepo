"use client"
import { StandardForm, type FormField, type FormGroup } from "@fms/ui/standard-form"
import type { MaintenancePlan, MaintenanceRequest, MaintenancePlanFormData } from "@fms/types"
import { getTodayIsoDate } from "@fms/utils"

interface MaintenancePlanFormProps {
  onSubmit: (data: MaintenancePlanFormData) => Promise<void>
  initialData?: Partial<MaintenancePlan> | Partial<MaintenanceRequest>
  mode: "create" | "edit" | "view"
  onCancel: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mapRequestTypeToWorkType = (
  requestType?: MaintenanceRequest["requestType"],
): MaintenancePlanFormData["workType"] => {
  switch (requestType) {
    case "breakdown":
    case "emergency":
      return "repair"
    case "improvement":
      return "upgrade"
    case "preventive":
      return "inspect"
    default:
      return "repair" // Default work type
  }
}

export function MaintenancePlanForm({
  onSubmit,
  initialData,
  mode,
  onCancel,
  open,
  onOpenChange,
}: MaintenancePlanFormProps) {
  const equipmentOptions: Array<{ label: string; value: string; description?: string }> = []

  const workTypeOptions = [
    { label: "수리", value: "repair" },
    { label: "교체", value: "replace" },
    { label: "점검", value: "inspect" },
    { label: "교정", value: "calibrate" },
    { label: "개선", value: "upgrade" },
  ]

  const priorityOptions = [
    { label: "긴급", value: "critical" },
    { label: "높음", value: "high" },
    { label: "보통", value: "normal" },
    { label: "낮음", value: "low" },
  ]

  const userOptions: Array<{ label: string; value: string; description?: string }> = []

  const teamOptions: Array<{ label: string; value: string }> = []

  const formFields: FormField[] = [
    {
      name: "title",
      label: "작업 제목",
      type: "text",
      required: true,
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
      gridColumn: "md:col-span-2",
    },
    {
      name: "workType",
      label: "작업 유형",
      type: "select",
      required: true,
      options: workTypeOptions,
      group: "basic",
    },
    {
      name: "priority",
      label: "우선순위",
      type: "select",
      required: true,
      options: priorityOptions,
      group: "basic",
    },
    {
      name: "scheduledStartDate",
      label: "예정 시작일",
      type: "date",
      required: true,
      group: "schedule",
    },
    {
      name: "scheduledEndDate",
      label: "예정 완료일",
      type: "date",
      required: true,
      group: "schedule",
    },
    {
      name: "estimatedDuration",
      label: "예상 소요시간 (시간)",
      type: "number",
      min: 0.5,
      step: 0.5,
      group: "schedule",
    },
    {
      name: "estimatedCost",
      label: "예상 비용 (원)",
      type: "number",
      min: 0,
      group: "schedule",
    },
    {
      name: "assignedTo",
      label: "담당자",
      type: "select",
      options: userOptions,
      group: "assignment",
    },
    {
      name: "assignedTeam",
      label: "담당팀",
      type: "select",
      options: teamOptions,
      group: "assignment",
    },
    {
      name: "description",
      label: "작업 내용",
      type: "textarea",
      required: true,
      group: "details",
      gridColumn: "md:col-span-2",
      rows: 4,
    },
    {
      name: "safetyNotes",
      label: "안전 참고사항",
      type: "textarea",
      group: "details",
      gridColumn: "md:col-span-2",
      rows: 3,
    },
  ]

  const formGroups: FormGroup[] = [
    { name: "basic", title: "기본 정보" },
    { name: "schedule", title: "일정 및 비용" },
    { name: "assignment", title: "담당자 배정" },
    { name: "details", title: "상세 내용" },
  ]

  const getInitialData = () => {
    if (!initialData)
      return {
        scheduledStartDate: getTodayIsoDate(),
        scheduledEndDate: getTodayIsoDate(),
      }

    if ("requestNo" in initialData) {
      const request = initialData as MaintenanceRequest
      return {
        requestId: request.id,
        title: request.title,
        description: request.description,
        equipmentId: request.equipmentId,
        priority: request.priority,
        estimatedDuration: request.estimatedDuration,
        estimatedCost: request.estimatedCost,
        workType: mapRequestTypeToWorkType(request.requestType),
        scheduledStartDate: getTodayIsoDate(),
        scheduledEndDate: getTodayIsoDate(),
      }
    }

    return {
      ...initialData,
      scheduledStartDate: initialData.scheduledStartDate ? new Date(initialData.scheduledStartDate) : getTodayIsoDate(),
      scheduledEndDate: initialData.scheduledEndDate ? new Date(initialData.scheduledEndDate) : getTodayIsoDate(),
    }
  }

  return (
    <StandardForm
      fields={formFields}
      groups={formGroups}
      initialData={getInitialData()}
      onSubmit={onSubmit}
      onCancel={onCancel}
      mode={mode}
      title={mode === "create" ? "신규 작업계획 수립" : mode === "edit" ? "작업계획 수정" : "작업계획 상세"}
      description="작업 계획의 상세 정보를 입력하고 관리합니다."
      submitText={mode === "create" ? "계획 등록" : "수정 완료"}
      open={open}
      onOpenChange={onOpenChange}
      showInDialog={true}
      layout="tabs"
      maxWidth="800px"
    />
  )
}
