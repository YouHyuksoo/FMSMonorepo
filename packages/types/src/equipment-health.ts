export interface EquipmentHealthDetail {
  equipmentId: string
  equipmentName: string
  equipmentType: string
  location: string
  healthScore: number
  healthGrade: "A" | "B" | "C" | "D" | "F"
  riskLevel: "low" | "medium" | "high" | "critical"
  trend: "improving" | "stable" | "declining"

  // 건강지수 구성 요소
  factors: {
    reliability: number // 신뢰도 (0-100)
    availability: number // 가동률 (0-100)
    maintainability: number // 보전성 (0-100)
    performance: number // 성능 (0-100)
  }

  // 상세 지표
  metrics: {
    mtbf: number // 평균 고장 간격 (시간)
    mttr: number // 평균 수리 시간 (시간)
    uptime: number // 가동 시간 (%)
    efficiency: number // 효율성 (%)
    vibration: number // 진동 수준
    temperature: number // 온도
    pressure: number // 압력
  }

  // 이력 정보
  history: {
    date: string
    healthScore: number
    event?: string
  }[]

  // 이슈 및 권장사항
  issues: string[]
  recommendations: {
    priority: "high" | "medium" | "low"
    action: string
    expectedImprovement: number
    estimatedCost: number
  }[]

  lastInspection: string
  nextInspection: string
  lastMaintenance: string
  nextMaintenance: string
}

export interface HealthTrendData {
  date: string
  overallHealth: number
  reliability: number
  availability: number
  maintainability: number
  performance: number
}
