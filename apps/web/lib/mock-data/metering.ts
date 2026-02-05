import type { MeterReading, CalibrationRecord, CalibrationBudget } from "@fms/types"

// 더 풍부한 목업 데이터 생성 함수
function generateMockMeterReadings(): MeterReading[] {
  const readings: MeterReading[] = []
  const equipments = [
    { id: "EQ001", name: "냉각기 #1", type: "electricity" },
    { id: "EQ002", name: "보일러 #1", type: "gas" },
    { id: "EQ003", name: "압축기 #1", type: "electricity" },
    { id: "EQ004", name: "세척기 #1", type: "water" },
    { id: "EQ005", name: "건조기 #1", type: "steam" },
    { id: "EQ006", name: "냉각기 #2", type: "electricity" },
    { id: "EQ007", name: "보일러 #2", type: "gas" },
    { id: "EQ008", name: "압축기 #2", type: "compressed_air" },
  ]

  // 기준 사용량 및 비용 (계측기 유형별)
  const baseConsumption = {
    electricity: 1000, // kWh
    gas: 500, // m³
    water: 300, // 톤
    steam: 200, // 톤
    compressed_air: 400, // m³
  }

  const unitCost = {
    electricity: 100, // 원/kWh
    gas: 500, // 원/m³
    water: 200, // 원/톤
    steam: 300, // 원/톤
    compressed_air: 150, // 원/m³
  }

  // 계절 변동 패턴 (월별 계수)
  const seasonalFactor = {
    electricity: [1.2, 1.1, 1.0, 0.9, 0.8, 0.9, 1.1, 1.3, 1.1, 0.9, 1.0, 1.2], // 여름, 겨울 피크
    gas: [1.5, 1.4, 1.2, 1.0, 0.7, 0.5, 0.4, 0.5, 0.7, 1.0, 1.2, 1.4], // 겨울 피크
    water: [0.8, 0.8, 0.9, 1.0, 1.1, 1.3, 1.5, 1.4, 1.1, 0.9, 0.8, 0.8], // 여름 피크
    steam: [1.4, 1.3, 1.1, 0.9, 0.7, 0.6, 0.5, 0.6, 0.8, 1.0, 1.2, 1.3], // 겨울 피크
    compressed_air: [1.0, 1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.2, 1.1, 1.0, 1.0, 1.0], // 여름 약간 증가
  }

  // 주간 변동 패턴 (요일별 계수, 0=일요일)
  const weekdayFactor = {
    electricity: [0.6, 1.0, 1.1, 1.1, 1.1, 1.0, 0.7], // 주중 높음
    gas: [0.7, 1.0, 1.1, 1.1, 1.1, 1.0, 0.7], // 주중 높음
    water: [0.5, 1.0, 1.1, 1.1, 1.1, 1.0, 0.6], // 주중 높음
    steam: [0.6, 1.0, 1.1, 1.1, 1.1, 1.0, 0.7], // 주중 높음
    compressed_air: [0.4, 1.0, 1.1, 1.2, 1.1, 1.0, 0.5], // 주중 높음
  }

  // 설비별 사용 패턴 (기준 사용량에 대한 계수)
  const equipmentFactor = {
    EQ001: 1.2, // 냉각기 #1 (전력 많이 사용)
    EQ002: 1.5, // 보일러 #1 (가스 많이 사용)
    EQ003: 0.8, // 압축기 #1
    EQ004: 1.3, // 세척기 #1 (물 많이 사용)
    EQ005: 1.1, // 건조기 #1
    EQ006: 0.9, // 냉각기 #2
    EQ007: 1.2, // 보일러 #2
    EQ008: 1.4, // 압축기 #2 (압축공기 많이 사용)
  }

  // 지난 12개월 데이터 생성
  const today = new Date()
  const startDate = new Date(today)
  startDate.setMonth(today.getMonth() - 12) // 12개월 전부터 시작

  // 각 설비별로 매일 검침 데이터 생성
  let readingId = 1
  for (const equipment of equipments) {
    const currentDate = new Date(startDate)
    let previousReading = baseConsumption[equipment.type as keyof typeof baseConsumption] * 0.9 // 초기값

    while (currentDate <= today) {
      const month = currentDate.getMonth()
      const dayOfWeek = currentDate.getDay()

      // 계절, 요일, 설비 특성을 반영한 사용량 계산
      const seasonEffect = seasonalFactor[equipment.type as keyof typeof seasonalFactor][month]
      const weekdayEffect = weekdayFactor[equipment.type as keyof typeof weekdayFactor][dayOfWeek]
      const equipEffect = equipmentFactor[equipment.id]

      // 약간의 랜덤 변동 추가 (0.9 ~ 1.1)
      const randomFactor = 0.9 + Math.random() * 0.2

      // 기준 사용량에 모든 요소 반영
      const baseValue = baseConsumption[equipment.type as keyof typeof baseConsumption]
      const consumption = Math.round(baseValue * seasonEffect * weekdayEffect * equipEffect * randomFactor)

      // 비용 계산
      const unitPrice = unitCost[equipment.type as keyof typeof unitCost]
      const cost = consumption * unitPrice

      // 검침자 랜덤 선택
      const readers = ["김검침", "이검침", "박검침", "최검침", "정검침"]
      const readBy = readers[Math.floor(Math.random() * readers.length)]

      // 상태 결정 (대부분 confirmed, 일부 pending)
      const statusOptions = ["confirmed", "confirmed", "confirmed", "confirmed", "pending"]
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]

      // 검침 데이터 생성
      readings.push({
        id: `MR${String(readingId).padStart(4, "0")}`,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        meterType: equipment.type,
        readingDate: currentDate.toISOString().split("T")[0],
        previousReading: previousReading,
        currentReading: previousReading + consumption,
        consumption: consumption,
        unit: getUnitByMeterType(equipment.type),
        cost: cost,
        readBy: readBy,
        notes: status === "confirmed" ? "정상 검침" : "",
        status: status,
        createdAt: `${currentDate.toISOString().split("T")[0]}T09:00:00Z`,
        updatedAt: `${currentDate.toISOString().split("T")[0]}T09:30:00Z`,
      })

      // 다음 검침의 이전 값은 현재 검침의 현재 값
      previousReading = previousReading + consumption

      // 다음 날짜로 이동
      currentDate.setDate(currentDate.getDate() + 1)
      readingId++
    }
  }

  return readings
}

// 계측기 유형별 단위 반환
function getUnitByMeterType(meterType: string): string {
  switch (meterType) {
    case "electricity":
      return "kWh"
    case "gas":
      return "m³"
    case "water":
      return "톤"
    case "steam":
      return "톤"
    case "compressed_air":
      return "m³"
    default:
      return "단위"
  }
}

// 목업 데이터 생성
export const mockMeterReadings: MeterReading[] = generateMockMeterReadings()

// 교정 기록 목업 데이터 (비용 정보 포함)
export const mockCalibrationRecords: CalibrationRecord[] = [
  {
    id: "CAL001",
    equipmentId: "EQ001",
    equipmentName: "압력계 PT-001",
    instrumentType: "압력계",
    serialNumber: "PT001-2023",
    calibrationDate: "2023-01-10",
    nextCalibrationDate: "2024-01-10",
    calibrationStandard: "KS B 5305",
    calibratedBy: "한국계측기술원",
    certificateNumber: "CERT-2023-001",
    result: "pass",
    accuracy: 0.25,
    notes: "정상 교정 완료",
    status: "completed",
    calibrationCost: 150000,
    travelCost: 30000,
    materialCost: 20000,
    totalCost: 200000,
    budgetCategory: "정기교정",
    costCenter: "생산부",
    approvedBy: "김부장",
    invoiceNumber: "INV-2023-001",
    paymentStatus: "paid",
    paymentDate: "2023-01-20",
    createdAt: "2023-01-10T09:00:00Z",
    updatedAt: "2023-01-10T17:00:00Z",
  },
  {
    id: "CAL002",
    equipmentId: "EQ002",
    equipmentName: "온도계 TT-002",
    instrumentType: "온도계",
    serialNumber: "TT002-2023",
    calibrationDate: "2023-01-20",
    nextCalibrationDate: "2024-01-20",
    calibrationStandard: "KS C 1604",
    calibratedBy: "대한계측협회",
    certificateNumber: "CERT-2023-002",
    result: "pass",
    accuracy: 0.1,
    status: "completed",
    calibrationCost: 120000,
    travelCost: 25000,
    materialCost: 15000,
    totalCost: 160000,
    budgetCategory: "정기교정",
    costCenter: "품질부",
    approvedBy: "이과장",
    invoiceNumber: "INV-2023-002",
    paymentStatus: "paid",
    paymentDate: "2023-01-30",
    createdAt: "2023-01-05T10:00:00Z",
    updatedAt: "2023-01-05T10:00:00Z",
  },
  {
    id: "CAL003",
    equipmentId: "EQ003",
    equipmentName: "유량계 FT-003",
    instrumentType: "유량계",
    serialNumber: "FT003-2022",
    calibrationDate: "2022-12-15",
    nextCalibrationDate: "2023-12-15",
    calibrationStandard: "KS B 0801",
    calibratedBy: "계측기교정센터",
    certificateNumber: "CERT-2022-045",
    result: "conditional",
    accuracy: 0.5,
    notes: "허용 오차 범위 내 조건부 합격",
    status: "overdue",
    calibrationCost: 180000,
    travelCost: 40000,
    materialCost: 30000,
    totalCost: 250000,
    budgetCategory: "긴급교정",
    costCenter: "생산부",
    approvedBy: "박차장",
    invoiceNumber: "INV-2022-045",
    paymentStatus: "paid",
    paymentDate: "2022-12-25",
    createdAt: "2022-12-15T11:00:00Z",
    updatedAt: "2022-12-15T16:00:00Z",
  },
  {
    id: "CAL004",
    equipmentId: "EQ004",
    equipmentName: "압력계 PT-004",
    instrumentType: "압력계",
    serialNumber: "PT004-2023",
    calibrationDate: "2023-03-05",
    nextCalibrationDate: "2024-03-05",
    calibrationStandard: "KS B 5305",
    calibratedBy: "한국계측기술원",
    certificateNumber: "CERT-2023-015",
    result: "pass",
    accuracy: 0.2,
    notes: "정상 교정 완료",
    status: "completed",
    calibrationCost: 150000,
    travelCost: 30000,
    materialCost: 20000,
    totalCost: 200000,
    budgetCategory: "정기교정",
    costCenter: "생산부",
    approvedBy: "김부장",
    invoiceNumber: "INV-2023-015",
    paymentStatus: "paid",
    paymentDate: "2023-03-15",
    createdAt: "2023-03-05T09:00:00Z",
    updatedAt: "2023-03-05T17:00:00Z",
  },
  {
    id: "CAL005",
    equipmentId: "EQ005",
    equipmentName: "온도계 TT-005",
    instrumentType: "온도계",
    serialNumber: "TT005-2023",
    calibrationDate: "2023-04-12",
    nextCalibrationDate: "2024-04-12",
    calibrationStandard: "KS C 1604",
    calibratedBy: "대한계측협회",
    certificateNumber: "CERT-2023-022",
    result: "pass",
    accuracy: 0.15,
    status: "completed",
    calibrationCost: 120000,
    travelCost: 25000,
    materialCost: 15000,
    totalCost: 160000,
    budgetCategory: "정기교정",
    costCenter: "품질부",
    approvedBy: "이과장",
    invoiceNumber: "INV-2023-022",
    paymentStatus: "paid",
    paymentDate: "2023-04-22",
    createdAt: "2023-04-12T10:00:00Z",
    updatedAt: "2023-04-12T15:30:00Z",
  },
  {
    id: "CAL006",
    equipmentId: "EQ006",
    equipmentName: "유량계 FT-006",
    instrumentType: "유량계",
    serialNumber: "FT006-2023",
    calibrationDate: "2023-05-20",
    nextCalibrationDate: "2024-05-20",
    calibrationStandard: "KS B 0801",
    calibratedBy: "계측기교정센터",
    certificateNumber: "CERT-2023-035",
    result: "fail",
    accuracy: 1.2,
    notes: "허용 오차 초과, 재교정 필요",
    status: "completed",
    calibrationCost: 180000,
    travelCost: 40000,
    materialCost: 50000,
    totalCost: 270000,
    budgetCategory: "재교정",
    costCenter: "생산부",
    approvedBy: "박차장",
    invoiceNumber: "INV-2023-035",
    paymentStatus: "paid",
    paymentDate: "2023-05-30",
    createdAt: "2023-05-20T11:00:00Z",
    updatedAt: "2023-05-20T16:00:00Z",
  },
  {
    id: "CAL007",
    equipmentId: "EQ007",
    equipmentName: "압력계 PT-007",
    instrumentType: "압력계",
    serialNumber: "PT007-2023",
    calibrationDate: "2023-06-15",
    nextCalibrationDate: "2024-06-15",
    calibrationStandard: "KS B 5305",
    calibratedBy: "한국계측기술원",
    certificateNumber: "CERT-2023-042",
    result: "pass",
    accuracy: 0.3,
    notes: "정상 교정 완료",
    status: "completed",
    calibrationCost: 150000,
    travelCost: 30000,
    materialCost: 20000,
    totalCost: 200000,
    budgetCategory: "정기교정",
    costCenter: "생산부",
    approvedBy: "김부장",
    invoiceNumber: "INV-2023-042",
    paymentStatus: "pending",
    createdAt: "2023-06-15T09:00:00Z",
    updatedAt: "2023-06-15T17:00:00Z",
  },
  {
    id: "CAL008",
    equipmentId: "EQ008",
    equipmentName: "온도계 TT-008",
    instrumentType: "온도계",
    serialNumber: "TT008-2023",
    calibrationDate: "2023-07-10",
    nextCalibrationDate: "2024-07-10",
    calibrationStandard: "KS C 1604",
    calibratedBy: "대한계측협회",
    certificateNumber: "CERT-2023-055",
    result: "pass",
    accuracy: 0.1,
    status: "completed",
    calibrationCost: 120000,
    travelCost: 25000,
    materialCost: 15000,
    totalCost: 160000,
    budgetCategory: "정기교정",
    costCenter: "품질부",
    approvedBy: "이과장",
    invoiceNumber: "INV-2023-055",
    paymentStatus: "overdue",
    createdAt: "2023-07-10T10:00:00Z",
    updatedAt: "2023-07-10T15:30:00Z",
  },
]

// 교정 예산 목업 데이터
export const mockCalibrationBudgets: CalibrationBudget[] = [
  {
    id: "BUD001",
    year: 2024,
    budgetType: "annual",
    category: "정기교정",
    plannedAmount: 5000000,
    allocatedAmount: 5000000,
    usedAmount: 1200000,
    remainingAmount: 3800000,
    description: "2024년 정기 계측기 교정 예산",
    approvedBy: "김이사",
    approvedDate: "2023-12-15",
    status: "active",
    createdAt: "2023-12-01T09:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "BUD002",
    year: 2024,
    budgetType: "annual",
    category: "긴급교정",
    plannedAmount: 2000000,
    allocatedAmount: 2000000,
    usedAmount: 250000,
    remainingAmount: 1750000,
    description: "2024년 긴급 교정 예산",
    approvedBy: "김이사",
    approvedDate: "2023-12-15",
    status: "active",
    createdAt: "2023-12-01T09:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "BUD003",
    year: 2024,
    quarter: 1,
    budgetType: "quarterly",
    category: "재교정",
    plannedAmount: 800000,
    allocatedAmount: 800000,
    usedAmount: 270000,
    remainingAmount: 530000,
    description: "2024년 1분기 재교정 예산",
    approvedBy: "박부장",
    approvedDate: "2023-12-20",
    status: "active",
    createdAt: "2023-12-15T09:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "BUD004",
    year: 2024,
    month: 1,
    budgetType: "monthly",
    category: "정기교정",
    costCenter: "생산부",
    plannedAmount: 400000,
    allocatedAmount: 400000,
    usedAmount: 400000,
    remainingAmount: 0,
    description: "2024년 1월 생산부 정기교정 예산",
    approvedBy: "김부장",
    approvedDate: "2023-12-25",
    status: "closed",
    createdAt: "2023-12-20T09:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z",
  },
  {
    id: "BUD005",
    year: 2024,
    month: 2,
    budgetType: "monthly",
    category: "정기교정",
    costCenter: "품질부",
    plannedAmount: 300000,
    allocatedAmount: 300000,
    usedAmount: 160000,
    remainingAmount: 140000,
    description: "2024년 2월 품질부 정기교정 예산",
    approvedBy: "이과장",
    approvedDate: "2024-01-25",
    status: "active",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-02-15T10:00:00Z",
  },
]
