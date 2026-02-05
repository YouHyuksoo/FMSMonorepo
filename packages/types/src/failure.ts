export enum FailureType {
  MECHANICAL = "기계적",
  ELECTRICAL = "전기적",
  HYDRAULIC = "유압",
  PNEUMATIC = "공압",
  CONTROL = "제어",
  OTHER = "기타",
}

export enum FailurePriority {
  EMERGENCY = "긴급",
  HIGH = "높음",
  MEDIUM = "보통",
  LOW = "낮음",
}

export enum FailureStatus {
  REPORTED = "접수됨",
  DIAGNOSED = "진단중",
  IN_REPAIR = "수리중",
  COMPLETED = "완료됨",
}

export interface Failure {
  id: string
  equipmentId: string
  equipmentName: string
  title: string
  description: string
  type: FailureType
  priority: FailurePriority
  status: FailureStatus
  reportedAt: string
  reporterName: string
  reporterContact: string
  symptom: string
  possibleCauses: string
  recommendedActions: string
  preventionMethods: string
  attachments: string[] // This will store image URLs
  estimatedCost: number
  actualCost: number
  downtimeHours: number
  completedAt?: string
  copilotDescription?: string
  createdAt: string
  updatedAt: string
}
