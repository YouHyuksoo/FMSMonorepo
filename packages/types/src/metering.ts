export type MeterType = "electricity" | "gas" | "water" | "steam" | "compressed_air" | "other"

export const meterTypeLabels: Record<string, string> = {
  electricity: "전력",
  gas: "가스",
  water: "용수",
  steam: "스팀",
  compressed_air: "압축공기",
  other: "기타",
}

export interface MeterReading {
  id: string
  equipmentId: string
  equipmentName: string
  meterType: string
  readingDate: string
  previousReading: number
  currentReading: number
  consumption: number
  unit: string
  cost: number
  readBy: string
  notes?: string
  status: "pending" | "confirmed" | "rejected"
  createdAt: string
  updatedAt: string
}

export const meterReadingStatusLabels: Record<string, string> = {
  pending: "대기",
  confirmed: "확인",
  rejected: "반려",
}

export interface CalibrationRecord {
  id: string
  equipmentId: string
  equipmentName: string
  instrumentType: string
  serialNumber: string
  calibrationDate: string
  nextCalibrationDate: string
  calibrationStandard?: string
  calibratedBy: string
  calibrationAgency?: string
  certificateNumber?: string
  result: "pass" | "conditional" | "fail"
  accuracy?: number
  notes?: string
  status: "scheduled" | "completed" | "overdue" | "canceled"
  // 비용 관련 필드 추가
  calibrationCost?: number
  travelCost?: number
  materialCost?: number
  totalCost?: number
  budgetCategory?: string
  costCenter?: string
  approvedBy?: string
  invoiceNumber?: string
  paymentStatus?: "pending" | "paid" | "overdue"
  paymentDate?: string
  createdAt: string
  updatedAt: string
}

export const calibrationResultLabels: Record<string, string> = {
  pass: "합격",
  conditional: "조건부합격",
  fail: "불합격",
}

export const calibrationStatusLabels: Record<string, string> = {
  scheduled: "예정",
  completed: "완료",
  overdue: "만료",
  canceled: "취소",
}

export const paymentStatusLabels: Record<string, string> = {
  pending: "결제대기",
  paid: "결제완료",
  overdue: "연체",
}

// 교정 예산 관리
export interface CalibrationBudget {
  id: string
  year: number
  quarter?: number
  month?: number
  budgetType: "annual" | "quarterly" | "monthly"
  category: string
  instrumentType?: string
  costCenter?: string
  plannedAmount: number
  allocatedAmount: number
  usedAmount: number
  remainingAmount: number
  description?: string
  approvedBy: string
  approvedDate: string
  status: "draft" | "approved" | "active" | "closed"
  createdAt: string
  updatedAt: string
}

export const budgetStatusLabels: Record<string, string> = {
  draft: "초안",
  approved: "승인",
  active: "활성",
  closed: "마감",
}

export const budgetTypeLabels: Record<string, string> = {
  annual: "연간",
  quarterly: "분기",
  monthly: "월간",
}

// 비용 분석 데이터
export interface CalibrationCostAnalysis {
  period: string
  totalBudget: number
  totalSpent: number
  budgetUtilization: number
  costByCategory: { category: string; amount: number; percentage: number }[]
  costByAgency: { agency: string; amount: number; count: number }[]
  costByInstrumentType: { type: string; amount: number; count: number }[]
  monthlyTrend: { month: string; budget: number; spent: number; utilization: number }[]
  topExpenses: CalibrationRecord[]
  upcomingExpenses: CalibrationRecord[]
}

// 비용 예측
export interface CalibrationCostForecast {
  period: string
  predictedCost: number
  confidence: number
  factors: string[]
  recommendations: string[]
}
