import {
  type PreventiveMaster,
  type PreventiveOrder,
  PreventiveOrderStatus,
  PreventivePriority,
} from "@fms/types"

// 오늘 날짜 기준으로 날짜 생성 함수
const getFutureDateISO = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}
const getPastDateISO = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export const mockPreventiveMasters: PreventiveMaster[] = [
  {
    id: "pm-link-001", // 설비-템플릿 연결 ID
    equipmentId: "EQ-001", // CNC 밀링머신 #1
    equipmentName: "CNC 밀링머신 #1",
    templateId: "IM003", // CNC 월간 정밀점검 템플릿
    taskDescription: "CNC 밀링머신 #1 - 월간 정밀점검 (템플릿 기반)", // 템플릿 이름 기반으로 생성 또는 커스텀
    estimatedDuration: 120, // 템플릿에서 가져오거나 override
    estimatedCost: 70000,
    isActive: true, // 이 설비에 이 템플릿 적용 활성화
    lastExecutedDate: getPastDateISO(25), // "2024-05-10T09:00:00Z",
    nextScheduleDate: getFutureDateISO(5), // "2024-06-10T09:00:00Z",
    // intervalTypeOverride: PeriodType.CUSTOM_WEEKS, // 필요시 override
    // intervalValueOverride: 5,
    createdBy: "admin",
    createdAt: "2024-01-15T09:00:00Z",
    updatedBy: "admin",
    updatedAt: "2024-05-10T09:00:00Z",
  },
  {
    id: "pm-link-002",
    equipmentId: "EQ-002", // 프레스 #1
    equipmentName: "프레스 #1",
    templateId: "IM002", // 프레스 주간점검 템플릿
    taskDescription: "프레스 #1 - 주간 안전점검 (템플릿 기반)",
    estimatedDuration: 45,
    estimatedCost: 30000,
    isActive: true,
    lastExecutedDate: getPastDateISO(3), // "2024-06-02T10:30:00Z",
    nextScheduleDate: getFutureDateISO(4), // "2024-06-09T10:30:00Z",
    createdBy: "admin",
    createdAt: "2024-01-10T10:30:00Z",
    updatedBy: "admin",
    updatedAt: "2024-06-02T10:30:00Z",
  },
  {
    id: "pm-link-003",
    equipmentId: "EQ-003", // 컨베이어 벨트 #1
    equipmentName: "컨베이어 벨트 #1",
    templateId: "IM001", // 컨베이어 일일점검 템플릿
    taskDescription: "컨베이어 벨트 #1 - 일일 점검 (템플릿 기반)",
    estimatedDuration: 30,
    estimatedCost: 10000,
    isActive: true,
    lastExecutedDate: getPastDateISO(1), // "2024-06-04T08:00:00Z",
    nextScheduleDate: getFutureDateISO(0), // "2024-06-05T08:00:00Z", // 오늘
    createdBy: "admin",
    createdAt: "2024-01-05T08:00:00Z",
    updatedBy: "admin",
    updatedAt: "2024-06-04T08:00:00Z",
  },
  {
    id: "pm-link-004", // 로봇팔 - 주간 점검 (템플릿 IM002 - 프레스 주간점검을 예시로 사용, 실제로는 로봇팔 주간 템플릿 ID여야 함)
    equipmentId: "EQ-004", // 로봇 #1
    equipmentName: "로봇 #1",
    templateId: "IM002", // 예시로 프레스 주간점검 템플릿 ID 사용
    taskDescription: "로봇 #1 - 주간 기본 점검 (템플릿 기반)",
    estimatedDuration: 60,
    estimatedCost: 40000,
    isActive: true,
    nextScheduleDate: getFutureDateISO(7), // "2024-06-12T09:00:00Z",
    createdBy: "system",
    createdAt: "2024-02-01T09:00:00Z",
    updatedBy: "system",
    updatedAt: "2024-02-01T09:00:00Z",
  },
  {
    id: "pm-link-005", // 로봇팔 - 분기 점검 (템플릿 IM004 - 로봇팔 분기점검 템플릿)
    equipmentId: "EQ-004", // 로봇 #1
    equipmentName: "로봇 #1",
    templateId: "IM004", // 로봇팔 분기점검 템플릿 (현재 비활성 템플릿)
    taskDescription: "로봇 #1 - 분기 정밀 점검 (템플릿 기반)",
    estimatedDuration: 180,
    estimatedCost: 150000,
    isActive: false, // 이 설비에는 이 분기점검 템플릿 적용이 비활성화됨
    nextScheduleDate: getFutureDateISO(80), // "2024-08-23T09:00:00Z",
    createdBy: "system",
    createdAt: "2024-02-01T09:00:00Z",
    updatedBy: "system",
    updatedAt: "2024-02-01T09:00:00Z",
  },
  {
    id: "pm-link-006",
    equipmentId: "EQ-005", // 에어컴프레서 #1
    equipmentName: "에어컴프레서 #1",
    templateId: "IM005", // 공기압축기 연간점검 템플릿
    taskDescription: "에어컴프레서 #1 - 연간 오버홀 (템플릿 기반)",
    estimatedDuration: 240,
    estimatedCost: 200000,
    isActive: true,
    lastExecutedDate: getPastDateISO(300), // "2023-08-01T09:00:00Z",
    nextScheduleDate: getFutureDateISO(65), // "2024-08-08T09:00:00Z",
    createdBy: "admin",
    createdAt: "2023-07-01T09:00:00Z",
    updatedBy: "admin",
    updatedAt: "2023-08-01T09:00:00Z",
  },
]

export const mockPreventiveOrders: PreventiveOrder[] = [
  {
    id: "po-001",
    preventiveMasterId: "pm-link-001", // CNC 월간 정밀점검 연결
    equipmentId: "EQ-001",
    equipmentName: "CNC 밀링머신 #1",
    templateId: "IM003", // 작업지시에도 템플릿 ID 명시
    scheduledDate: getPastDateISO(0), // 오늘 작업 완료된 것으로 가정 "2024-06-05T09:00:00Z",
    actualStartDate: getPastDateISO(0), // "2024-06-05T09:15:00Z",
    actualEndDate: getPastDateISO(0), // "2024-06-05T11:30:00Z",
    assignedTo: "user-002",
    assignedToName: "김정비",
    status: PreventiveOrderStatus.COMPLETED,
    priority: PreventivePriority.MEDIUM,
    estimatedCost: 70000, // PreventiveMaster에서 가져옴
    actualCost: 65000,
    workDescription: "CNC 밀링머신 #1 - 월간 정밀점검 작업", // PreventiveMaster의 taskDescription 기반
    completionNotes: "모든 점검 항목 정상. 스핀들 오일 교체 완료.",
    attachments: [],
    createdBy: "system", // 스케줄러 또는 관리자에 의해 생성
    createdAt: getPastDateISO(7), // "2024-05-29T00:00:00Z",
    updatedBy: "user-002",
    updatedAt: getPastDateISO(0), // "2024-06-05T11:30:00Z",
  },
  {
    id: "po-002",
    preventiveMasterId: "pm-link-002", // 프레스 주간 안전점검 연결
    equipmentId: "EQ-002",
    equipmentName: "프레스 #1",
    templateId: "IM002",
    scheduledDate: getFutureDateISO(4), // "2024-06-09T10:30:00Z",
    assignedTo: "user-003",
    assignedToName: "박기술",
    status: PreventiveOrderStatus.SCHEDULED,
    priority: PreventivePriority.HIGH,
    estimatedCost: 30000,
    workDescription: "프레스 #1 - 주간 안전점검 작업",
    attachments: [],
    createdBy: "system",
    createdAt: getFutureDateISO(0), // "2024-06-05T00:00:00Z", // 오늘 생성된 작업지시
    updatedBy: "system",
    updatedAt: getFutureDateISO(0), // "2024-06-05T00:00:00Z",
  },
  {
    id: "po-003",
    preventiveMasterId: "pm-link-003", // 컨베이어 일일 점검 연결
    equipmentId: "EQ-003",
    equipmentName: "컨베이어 벨트 #1",
    templateId: "IM001",
    scheduledDate: getFutureDateISO(0), // "2024-06-05T08:00:00Z", // 오늘 예정
    actualStartDate: getFutureDateISO(0), // "2024-06-05T08:00:00Z",
    assignedTo: "user-004",
    assignedToName: "이운전",
    status: PreventiveOrderStatus.IN_PROGRESS, // 현재 진행중
    priority: PreventivePriority.LOW,
    estimatedCost: 10000,
    workDescription: "컨베이어 벨트 #1 - 일일 점검 작업",
    attachments: [],
    createdBy: "system",
    createdAt: getPastDateISO(1), // "2024-06-04T00:00:00Z",
    updatedBy: "user-004",
    updatedAt: getFutureDateISO(0), // "2024-06-05T08:00:00Z",
  },
  {
    id: "po-004",
    preventiveMasterId: "pm-link-001", // CNC 월간 정밀점검 연결
    equipmentId: "EQ-001",
    equipmentName: "CNC 밀링머신 #1",
    templateId: "IM003", // 작업지시에도 템플릿 ID 명시
    scheduledDate: getPastDateISO(7), // 오늘 작업 완료된 것으로 가정 "2024-06-05T09:00:00Z",
    assignedTo: "user-002",
    assignedToName: "김정비",
    status: PreventiveOrderStatus.OVERDUE,
    priority: PreventivePriority.MEDIUM,
    estimatedCost: 70000, // PreventiveMaster에서 가져옴
    workDescription: "CNC 밀링머신 #1 - 월간 정밀점검 작업", // PreventiveMaster의 taskDescription 기반
    attachments: [],
    createdBy: "system", // 스케줄러 또는 관리자에 의해 생성
    createdAt: getPastDateISO(14), // "2024-05-29T00:00:00Z",
    updatedBy: "user-002",
    updatedAt: getPastDateISO(7), // "2024-06-05T11:30:00Z",
  },
  {
    id: "po-005",
    preventiveMasterId: "pm-link-004", // 프레스 주간 안전점검 연결
    equipmentId: "EQ-004",
    equipmentName: "로봇 #1",
    templateId: "IM002",
    scheduledDate: getFutureDateISO(2), // "2024-06-09T10:30:00Z",
    assignedTo: "user-005",
    assignedToName: "최전문",
    status: PreventiveOrderStatus.SCHEDULED,
    priority: PreventivePriority.CRITICAL,
    estimatedCost: 40000,
    workDescription: "로봇 #1 - 주간 기본 점검 작업",
    attachments: [],
    createdBy: "system",
    createdAt: getFutureDateISO(0), // "2024-06-05T00:00:00Z", // 오늘 생성된 작업지시
    updatedBy: "system",
    updatedAt: getFutureDateISO(0), // "2024-06-05T00:00:00Z",
  },
  {
    id: "po-006",
    preventiveMasterId: "pm-link-006", // 컨베이어 일일 점검 연결
    equipmentId: "EQ-005",
    equipmentName: "에어컴프레서 #1",
    templateId: "IM005",
    scheduledDate: getFutureDateISO(180), // "2024-06-05T08:00:00Z", // 오늘 예정
    assignedTo: "user-003",
    assignedToName: "박기술",
    status: PreventiveOrderStatus.SCHEDULED, // 현재 진행중
    priority: PreventivePriority.HIGH,
    estimatedCost: 200000,
    workDescription: "에어컴프레서 #1 - 연간 오버홀 작업",
    attachments: [],
    createdBy: "system",
    createdAt: getPastDateISO(1), // "2024-06-04T00:00:00Z",
    updatedBy: "user-004",
    updatedAt: getFutureDateISO(0), // "2024-06-05T08:00:00Z",
  },
  {
    id: "po-007",
    preventiveMasterId: "pm-link-002", // 프레스 주간 안전점검 연결
    equipmentId: "EQ-002",
    equipmentName: "프레스 #1",
    templateId: "IM002",
    scheduledDate: getPastDateISO(21), // "2024-06-09T10:30:00Z",
    actualStartDate: getPastDateISO(21), // "2024-06-09T10:30:00Z",
    actualEndDate: getPastDateISO(21), // "2024-06-09T10:30:00Z",
    assignedTo: "user-003",
    assignedToName: "박기술",
    status: PreventiveOrderStatus.COMPLETED,
    priority: PreventivePriority.HIGH,
    estimatedCost: 30000,
    actualCost: 35000,
    workDescription: "프레스 #1 - 주간 안전점검 작업",
    completionNotes: "압력 게이지 1개 교체함.",
    attachments: [],
    createdBy: "system",
    createdAt: getFutureDateISO(0), // "2024-06-05T00:00:00Z", // 오늘 생성된 작업지시
    updatedBy: "system",
    updatedAt: getFutureDateISO(0), // "2024-06-05T00:00:00Z",
  },
  {
    id: "po-008",
    preventiveMasterId: "pm-link-003", // 컨베이어 일일 점검 연결
    equipmentId: "EQ-003",
    equipmentName: "컨베이어 벨트 #1",
    templateId: "IM001",
    scheduledDate: getPastDateISO(1), // "2024-06-05T08:00:00Z", // 오늘 예정
    actualStartDate: getPastDateISO(1), // "2024-06-05T08:00:00Z",
    actualEndDate: getPastDateISO(1), // "2024-06-05T08:00:00Z",
    assignedTo: "user-004",
    assignedToName: "이운전",
    status: PreventiveOrderStatus.COMPLETED, // 현재 진행중
    priority: PreventivePriority.LOW,
    estimatedCost: 10000,
    actualCost: 12000,
    workDescription: "컨베이어 벨트 #1 - 일일 점검 작업",
    completionNotes: "롤러 청소 완료.",
    attachments: [],
    createdBy: "system",
    createdAt: getPastDateISO(2), // "2024-06-04T00:00:00Z",
    updatedBy: "user-004",
    updatedAt: getFutureDateISO(0), // "2024-06-05T08:00:00Z",
  },
]

// PreventiveFrequency enum 및 labels는 PeriodType으로 점진적 대체 예정
