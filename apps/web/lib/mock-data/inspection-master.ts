import {
  type InspectionMaster,
  PeriodType,
  type EquipmentType,
  type InspectionType,
  type Department,
  type User,
} from "@fms/types"

// Define and export mock data for related entities
export const mockEquipmentTypes: EquipmentType[] = [
  { id: "et001", name: "컨베이어" },
  { id: "et002", name: "프레스" },
  { id: "et003", name: "CNC 머신" },
  { id: "et004", name: "로봇팔" },
  { id: "et005", name: "공기압축기" },
  { id: "et006", name: "용접 로봇" },
  { id: "et007", name: "도장 설비" },
]

export const mockInspectionTypes: InspectionType[] = [
  { id: "it001", name: "일일점검" },
  { id: "it002", name: "주간점검" },
  { id: "it003", name: "월간점검" },
  { id: "it004", name: "정밀점검" },
  { id: "it005", name: "안전점검" },
  { id: "it006", name: "법정검사" },
]

export const mockDepartments: Department[] = [
  { id: "dept001", name: "생산1팀" },
  { id: "dept002", name: "생산2팀" },
  { id: "dept003", name: "설비보전팀" },
  { id: "dept004", name: "품질관리팀" },
  { id: "dept005", name: "공무팀" },
]

export const mockUsers: User[] = [
  { id: "user001", name: "김철수" },
  { id: "user002", name: "이영희" },
  { id: "user003", name: "박보전" },
  { id: "user004", name: "최품질" },
  { id: "admin", name: "관리자" },
  { id: "system", name: "시스템" },
]

export const mockInspectionMasters: InspectionMaster[] = [
  {
    id: "IM001",
    code: "IM-001",
    name: "컨베이어 일일점검 템플릿",
    description: "컨베이어 벨트 및 모터 일일 점검 표준",
    version: "1.0",
    equipmentType: mockEquipmentTypes[0], // { id: "et001", name: "컨베이어" }
    inspectionType: mockInspectionTypes[0], // { id: "it001", name: "일일점검" }
    department: mockDepartments[2], // { id: "dept003", name: "설비보전팀" }
    responsibleUser: mockUsers[2], // { id: "user003", name: "박보전" }
    periodType: PeriodType.DAILY,
    periodValue: 1,
    estimatedTime: 30,
    isActive: true,
    effectiveDate: "2024-01-01",
    items: [
      {
        id: "II001",
        sequence: 1,
        name: "벨트 장력 확인",
        description: "컨베이어 벨트의 장력 상태를 육안으로 확인",
        checkMethod: "육안검사",
        isRequired: true,
        dataType: "BOOLEAN",
        expectedValue: "Y",
      },
      {
        id: "II002",
        sequence: 2,
        name: "모터 온도 측정",
        description: "구동 모터의 온도를 측정",
        checkMethod: "측정",
        standardValue: "60°C 이하",
        toleranceMax: 60,
        unit: "°C",
        isRequired: true,
        dataType: "NUMBER",
        expectedValue: "60",
        tolerance: "<=60",
      },
    ],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    createdBy: mockUsers.find((u) => u.id === "admin")!,
    updatedBy: mockUsers.find((u) => u.id === "admin")!,
  },
  {
    id: "IM002",
    code: "IM-002",
    name: "프레스 주간점검 템플릿",
    description: "유압 프레스 주간 안전점검 표준",
    version: "1.1",
    equipmentType: mockEquipmentTypes[1], // { id: "et002", name: "프레스" }
    inspectionType: mockInspectionTypes[1], // { id: "it002", name: "주간점검" }
    department: mockDepartments[2],
    responsibleUser: mockUsers[2],
    periodType: PeriodType.WEEKLY,
    periodValue: 1,
    estimatedTime: 45,
    isActive: true,
    effectiveDate: "2024-01-01",
    items: [
      {
        id: "II003",
        sequence: 1,
        name: "유압 압력 확인",
        description: "유압 시스템의 압력을 확인",
        checkMethod: "계측기 사용",
        standardValue: "150-200 bar",
        toleranceMin: 150,
        toleranceMax: 200,
        unit: "bar",
        isRequired: true,
        dataType: "NUMBER",
        expectedValue: "150-200",
      },
      {
        id: "II004",
        sequence: 2,
        name: "안전 가드 상태 확인",
        description: "안전 가드의 정상 작동 여부 확인",
        checkMethod: "작동테스트",
        isRequired: true,
        dataType: "BOOLEAN",
        expectedValue: "Y",
      },
    ],
    createdAt: "2024-01-02T10:00:00Z",
    updatedAt: "2024-01-20T16:45:00Z",
    createdBy: mockUsers.find((u) => u.id === "admin")!,
    updatedBy: mockUsers.find((u) => u.id === "admin")!,
  },
  {
    id: "IM003",
    code: "IM-003",
    name: "CNC 월간 정밀점검 템플릿",
    description: "CNC 머신 월간 정밀도 및 주요 부품 점검 표준",
    version: "2.0",
    equipmentType: mockEquipmentTypes[2], // { id: "et003", name: "CNC 머신" }
    inspectionType: mockInspectionTypes[2], // { id: "it003", name: "월간점검" }
    department: mockDepartments[2],
    responsibleUser: mockUsers[2],
    periodType: PeriodType.MONTHLY,
    periodValue: 1,
    estimatedTime: 120,
    isActive: true,
    effectiveDate: "2023-12-01",
    items: [
      {
        id: "II005",
        sequence: 1,
        name: "스핀들 정밀도 측정",
        description: "스핀들의 런아웃 정밀도 측정",
        checkMethod: "정밀계측",
        standardValue: "0.005mm 이하",
        toleranceMax: 0.005,
        unit: "mm",
        isRequired: true,
        dataType: "NUMBER",
        expectedValue: "<=0.005",
      },
      {
        id: "II006",
        sequence: 2,
        name: "윤활유 레벨 확인 및 보충",
        description: "주요 윤활부 윤활유 상태 점검 및 보충",
        checkMethod: "육안 및 보충",
        isRequired: true,
        dataType: "TEXT",
        expectedValue: "정상 레벨",
      },
    ],
    createdAt: "2024-01-03T11:00:00Z",
    updatedAt: "2024-01-25T15:00:00Z",
    createdBy: mockUsers.find((u) => u.id === "system")!,
    updatedBy: mockUsers.find((u) => u.id === "system")!,
  },
  {
    id: "IM004",
    code: "IM-004",
    name: "로봇팔 분기점검 템플릿",
    description: "로봇팔 관절 및 제어 시스템 분기 점검 표준",
    version: "1.0",
    equipmentType: mockEquipmentTypes[3], // { id: "et004", name: "로봇팔" }
    inspectionType: mockInspectionTypes[3], // { id: "it004", name: "정밀점검" }
    department: mockDepartments[4], // 공무팀
    responsibleUser: mockUsers[2],
    periodType: PeriodType.QUARTERLY,
    periodValue: 1,
    estimatedTime: 180,
    isActive: false, // 비활성 템플릿 예시
    effectiveDate: "2024-02-01",
    expiryDate: "2024-12-31",
    items: [
      {
        id: "II007",
        sequence: 1,
        name: "각 축 구동 테스트",
        description: "로봇팔 모든 축의 정상 구동 범위 테스트",
        checkMethod: "기능 테스트",
        isRequired: true,
        dataType: "TEXT",
        expectedValue: "정상 범위 내 작동",
      },
    ],
    createdAt: "2024-01-04T13:00:00Z",
    updatedAt: "2024-01-28T17:00:00Z",
    createdBy: mockUsers.find((u) => u.id === "admin")!,
    updatedBy: mockUsers.find((u) => u.id === "admin")!,
  },
  {
    id: "IM005",
    code: "IM-005",
    name: "공기압축기 연간점검 템플릿",
    description: "공기압축기 주요 부품 및 성능 연간 점검 표준",
    version: "1.2",
    equipmentType: mockEquipmentTypes[4], // { id: "et005", name: "공기압축기" }
    inspectionType: mockInspectionTypes[5], // 법정검사
    department: mockDepartments[4], // 공무팀
    responsibleUser: mockUsers[2],
    periodType: PeriodType.ANNUALLY,
    periodValue: 1,
    estimatedTime: 240,
    isActive: true,
    effectiveDate: "2024-03-01",
    items: [
      {
        id: "II008",
        sequence: 1,
        name: "에어 필터 교체",
        description: "메인 에어 필터 교체",
        checkMethod: "부품 교체",
        isRequired: true,
        dataType: "BOOLEAN",
        expectedValue: "Y",
      },
      {
        id: "II009",
        sequence: 2,
        name: "오일 레벨 및 상태 점검",
        description: "압축기 오일 레벨 및 오염도 점검",
        checkMethod: "육안 점검",
        isRequired: true,
        dataType: "SELECT",
        expectedValue: "정상,보충필요,교체필요", // Comma-separated for SELECT
      },
    ],
    createdAt: "2024-01-05T14:00:00Z",
    updatedAt: "2024-01-30T18:00:00Z",
    createdBy: mockUsers.find((u) => u.id === "system")!,
    updatedBy: mockUsers.find((u) => u.id === "system")!,
  },
]

// 점검 항목들을 별도로 export (기존 유지, 하지만 InspectionMaster에 포함되므로 중복될 수 있음)
// 이 부분은 TemplateMasterManagement에서 직접 사용하지 않는다면 제거하거나,
// InspectionMaster.items와 동기화되도록 주의해야 합니다.
// 현재 TemplateMasterManagement는 InspectionMaster.items를 직접 사용합니다.
export const mockInspectionItems = mockInspectionMasters.flatMap((master) =>
  master.items.map((item) => ({
    ...item,
    masterId: master.id,
    masterName: master.name,
  })),
)
