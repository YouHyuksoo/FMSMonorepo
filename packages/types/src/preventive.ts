import type { Equipment } from "./equipment";
import type { InspectionMaster } from "./inspection-master";
import type { User } from "./user";

export enum PreventivePeriodType {
  TIME_BASED = "preventive.period.time_based",
  USAGE_BASED = "preventive.period.usage_based",
  CONDITION_BASED = "preventive.period.condition_based",
}

export const preventivePeriodTypeLabels: Record<PreventivePeriodType, string> =
  {
    [PreventivePeriodType.TIME_BASED]: "시간 기준",
    [PreventivePeriodType.USAGE_BASED]: "사용량 기준",
    [PreventivePeriodType.CONDITION_BASED]: "상태 기반",
  };

export enum PreventiveOrderStatus {
  PLANNED = "preventive.status.planned",
  IN_PROGRESS = "preventive.status.in_progress",
  COMPLETED = "preventive.status.completed",
  CANCELLED = "preventive.status.cancelled",
  OVERDUE = "preventive.status.overdue",
}

export const preventiveOrderStatusLabels: Record<
  PreventiveOrderStatus,
  string
> = {
  [PreventiveOrderStatus.PLANNED]: "계획됨",
  [PreventiveOrderStatus.IN_PROGRESS]: "진행중",
  [PreventiveOrderStatus.COMPLETED]: "완료됨",
  [PreventiveOrderStatus.CANCELLED]: "취소됨",
  [PreventiveOrderStatus.OVERDUE]: "기한초과",
};

export enum PreventivePriority {
  CRITICAL = "preventive.priority.critical",
  HIGH = "preventive.priority.high",
  MEDIUM = "preventive.priority.medium",
  LOW = "preventive.priority.low",
}

export const preventivePriorityLabels: Record<PreventivePriority, string> = {
  [PreventivePriority.CRITICAL]: "긴급",
  [PreventivePriority.HIGH]: "높음",
  [PreventivePriority.MEDIUM]: "중간",
  [PreventivePriority.LOW]: "낮음",
};

export interface PreventiveMaster {
  id: string;
  code: string; // 예방정비 마스터 코드 (예: PM-COMP-001)
  name: string; // 예방정비 마스터명 (예: 압축기 3개월 점검)
  description?: string; // 설명
  taskDescription?: string; // 작업 설명 (description의 별칭, 호환성을 위해 추가)
  type: string; // 예방정비 유형

  equipmentId: string; // 대상 설비 ID
  equipment?: Equipment; // 대상 설비 정보 (optional, for display)
  equipmentName?: string; // 설비명 (편의를 위해 추가)

  templateId: string; // 점검 템플릿 ID (InspectionMaster ID)
  template?: InspectionMaster; // 점검 템플릿 정보 (optional, for display)
  title?: string; // 정비명 (PreventiveMasterManagement 에서 사용하던 것, name과 유사하나 유지)

  periodType: PreventivePeriodType; // 주기 유형 (시간, 사용량, 상태)

  // 시간 기준 주기
  intervalDays?: number; // 일 간격
  intervalMonths?: number; // 월 간격
  intervalYears?: number; // 년 간격
  fixedDateDay?: number; // 고정일 (월별)
  fixedDateMonth?: number; // 고정월 (년별)

  // 사용량 기준 주기
  usageParameter?: string; // 사용량 파라미터 (예: 가동시간, 생산량)
  usageThreshold?: number; // 사용량 임계값
  usageUnit?: string; // 사용량 단위

  // 상태 기반 조건 (간단한 예시, 실제로는 더 복잡할 수 있음)
  conditionParameter?: string; // 상태 파라미터 (예: 진동, 온도)
  conditionThreshold?: number; // 상태 임계값
  conditionUnit?: string; // 상태 단위

  estimatedDuration: number; // 예상 소요 시간 (분)
  estimatedCost?: number; // 예상 비용
  priority: PreventivePriority; // 우선순위
  assignedTo?: string; // 담당자 ID
  assignedToName?: string; // 담당자명 (편의를 위해 추가)
  department?: string; // 담당 부서
  isActive: boolean; // 활성화 여부

  nextScheduleDate?: string; // 다음 예정일
  lastExecutedDate?: string; // 최근 실행일
  effectiveDate?: string; // 적용일

  createdAt: string;
  updatedAt: string;
  createdBy: User | string;
  updatedBy: User | string;
}

export interface PreventiveOrder {
  id: string;
  orderNumber: string; // 작업 오더 번호
  masterId: string; // 예방정비 마스터 ID (PreventiveOrderManagement에서 사용)
  preventiveMasterId?: string; // 예방정비 마스터 ID (기존 정의와 일치시키기 위해 optional 또는 masterId로 통일 필요)
  preventiveMaster?: PreventiveMaster; // 예방정비 마스터 정보
  equipmentId: string; // 대상 설비 ID
  equipment?: Equipment; // 대상 설비 정보
  equipmentName?: string; // 설비명 (편의를 위해 추가)
  templateId: string; // 사용된 템플릿 ID
  template?: InspectionMaster; // 사용된 템플릿 정보
  masterTitle?: string; // 정비명 (템플릿명 등, PreventiveOrderManagement에서 사용)
  taskDescription?: string; // 작업 설명 (PreventiveMaster의 description에서 가져옴)

  status: PreventiveOrderStatus; // 상태 (Enum 사용)
  priority?: PreventivePriority; // 우선순위 추가
  scheduledDate: string; // 계획일
  completedDate?: string; // 완료일
  actualEndDate?: string; // 실제 완료일 (PreventiveOrderManagement에서 사용)
  assignedToUserId?: string; // 담당자 ID
  assignedToUser?: User; // 담당자 정보
  assignedTo?: string; // 담당자 ID (PreventiveOrderManagement에서 사용)
  assignedToName?: string; // 담당자명 (PreventiveOrderManagement에서 사용)
  workDescription?: string; // 작업 내용 (템플릿에서 가져오거나 추가)
  resultSummary?: string; // 결과 요약
  estimatedCost?: number; // 예상비용 (PreventiveOrderManagement에서 사용)
  actualTimeSpent?: number; // 실제 소요 시간 (분)
  notes?: string; // 비고
  attachments?: Array<{ fileName: string; url: string }>; // 첨부파일 (PreventiveOrderManagement에서 사용)

  createdAt: string;
  updatedAt: string;
  createdBy: User | string;
  updatedBy: User | string;
}
