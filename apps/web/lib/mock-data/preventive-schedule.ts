import type { PreventiveScheduleRecord } from "@fms/types"

// 오늘 날짜 기준으로 날짜 생성 함수
const getFutureDate = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split("T")[0]
}
const getPastDate = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split("T")[0]
}

export const mockPreventiveScheduleRecords: PreventiveScheduleRecord[] = [
  {
    id: "pm-link-001", // PreventiveMaster ID
    equipmentId: "EQ-001",
    equipmentName: "CNC 머신 Alpha",
    taskDescription: "월간 윤활 및 점검 (템플릿: IM003)",
    scheduledDate: getFutureDate(5),
    status: "planned", // 작업지시 생성 전 상태
    assignedTo: "정비팀 A", // PreventiveMaster 레벨에서 담당팀/담당자 지정 가능
    priority: "high",
    templateId: "IM003",
    isRecurring: true,
  },
  {
    id: "pm-link-002",
    equipmentId: "EQ-002",
    equipmentName: "프레스기 Beta",
    taskDescription: "주간 안전 점검 (템플릿: IM002)",
    scheduledDate: getFutureDate(4),
    status: "planned",
    assignedTo: "정비팀 B",
    priority: "medium",
    templateId: "IM002",
    isRecurring: true,
  },
  {
    id: "po-003", // PreventiveOrder ID (이미 작업지시 생성됨)
    equipmentId: "EQ-003",
    equipmentName: "컨베이어 시스템 Delta",
    taskDescription: "일일 점검 (템플릿: IM001)",
    scheduledDate: getFutureDate(0), // 오늘
    status: "in-progress", // 작업지시 상태
    assignedTo: "이운전",
    priority: "medium",
    templateId: "IM001",
    isRecurring: true, // 이 작업지시의 근간이 되는 PM은 반복적임
  },
  {
    id: "pm-link-004", // 로봇 주간 점검
    equipmentId: "EQ-004",
    equipmentName: "로봇 Gamma",
    taskDescription: "주간 기본 점검 (템플릿: IM002)",
    scheduledDate: getFutureDate(7),
    status: "planned",
    assignedTo: "로봇정비팀",
    priority: "high",
    templateId: "IM002", // 실제로는 로봇팔 주간 템플릿 ID
    isRecurring: true,
  },
  {
    id: "po-001-completed", // 완료된 작업 예시 (ID는 po-001과 다르게)
    equipmentId: "EQ-001",
    equipmentName: "CNC 머신 Alpha",
    taskDescription: "월간 윤활 및 점검 (템플릿: IM003) - 이전 작업",
    scheduledDate: getPastDate(25), // 과거 완료된 날짜
    status: "completed",
    assignedTo: "김정비",
    notes: "모든 항목 정상 확인됨. 스핀들 오일 교체.",
    priority: "high",
    templateId: "IM003",
    isRecurring: true,
  },
  {
    id: "pm-link-006-overdue", // 지연된 PM 예시
    equipmentId: "EQ-005",
    equipmentName: "에어컴프레서 #1",
    taskDescription: "연간 오버홀 (템플릿: IM005) - 지연",
    scheduledDate: getPastDate(10), // 10일 지남
    status: "overdue", // PM 마스터 레벨에서 다음 예정일이 지났지만 작업지시 안된 경우
    assignedTo: "전문정비팀",
    priority: "critical",
    templateId: "IM005",
    isRecurring: true,
  },
]
