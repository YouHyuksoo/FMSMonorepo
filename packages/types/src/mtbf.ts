// MTBF 분석 관련 타입 정의
export interface MtbfAnalysis {
  equipmentId: string
  equipmentName: string
  equipmentType: string
  location: string
  mtbf: number // 평균 고장 간격 (시간)
  mttr: number // 평균 수리 시간 (시간)
  reliability: number // 신뢰도 (%)
  availability: number // 가동률 (%)
  failureRate: number // 고장률 (failures/hour)
  repairRate: number // 수리율 (repairs/hour)
  totalFailures: number // 총 고장 횟수
  totalOperatingTime: number // 총 가동 시간
  totalRepairTime: number // 총 수리 시간
  lastFailureDate: string
  nextPredictedFailure: string
  confidenceLevel: number // 예측 신뢰도 (%)
  trend: "improving" | "stable" | "declining"
  riskLevel: "low" | "medium" | "high" | "critical"
}

// 고장 이력 데이터
export interface FailureHistory {
  id: string
  equipmentId: string
  equipmentName: string
  failureDate: string
  repairStartDate: string
  repairEndDate: string
  failureType: string
  failureCause: string
  repairAction: string
  downtime: number // 정지 시간 (시간)
  repairCost: number
  severity: "minor" | "major" | "critical"
  preventable: boolean
  rootCause: string
  corrective_action: string
}

// MTBF 트렌드 데이터
export interface MtbfTrend {
  date: string
  equipmentId: string
  mtbf: number
  mttr: number
  failureCount: number
  operatingHours: number
  availability: number
  reliability: number
}

// 고장 패턴 분석
export interface FailurePattern {
  equipmentType: string
  failureType: string
  frequency: number
  averageDowntime: number
  seasonality: "spring" | "summer" | "fall" | "winter" | "none"
  timeOfDay: "morning" | "afternoon" | "evening" | "night" | "any"
  commonCauses: string[]
  preventiveMeasures: string[]
}

// 신뢰성 분석
export interface ReliabilityAnalysis {
  equipmentId: string
  equipmentName: string
  weibullShape: number // 와이불 분포 형상 모수
  weibullScale: number // 와이불 분포 척도 모수
  characteristicLife: number // 특성 수명
  reliabilityAt1000h: number // 1000시간 신뢰도
  reliabilityAt5000h: number // 5000시간 신뢰도
  reliabilityAt10000h: number // 10000시간 신뢰도
  meanLifetime: number // 평균 수명
  medianLifetime: number // 중간 수명
  hazardRate: number // 위험률
  bathTubPhase: "early" | "useful" | "wearout" // 욕조 곡선 단계
}

// MTBF 개선 권장사항
export interface MtbfRecommendation {
  equipmentId: string
  equipmentName: string
  currentMtbf: number
  targetMtbf: number
  improvementPotential: number // 개선 가능성 (%)
  recommendations: {
    category: "preventive" | "predictive" | "design" | "operational"
    action: string
    expectedImprovement: number // 예상 개선율 (%)
    implementationCost: number
    priority: "high" | "medium" | "low"
    timeframe: string
  }[]
  estimatedRoi: number // 예상 ROI (%)
}

export const failureTypeLabels: Record<string, string> = {
  mechanical: "기계적 고장",
  electrical: "전기적 고장",
  hydraulic: "유압 고장",
  pneumatic: "공압 고장",
  thermal: "열적 고장",
  software: "소프트웨어 오류",
  human: "인적 오류",
  environmental: "환경적 요인",
}

export const severityLabels: Record<string, string> = {
  minor: "경미",
  major: "중대",
  critical: "치명적",
}

export const bathTubPhaseLabels: Record<string, string> = {
  early: "초기 고장기",
  useful: "우발 고장기",
  wearout: "마모 고장기",
}
