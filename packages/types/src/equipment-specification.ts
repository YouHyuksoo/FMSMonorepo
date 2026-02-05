export interface EquipmentSpecification {
  id: string
  equipmentId: string
  equipmentCode: string
  equipmentName: string
  equipmentType: string
  version: string
  status: "draft" | "active" | "deprecated" | "archived"
  specifications: SpecificationGroup[]
  performanceIndicators: PerformanceIndicator[]
  operatingConditions: OperatingCondition[]
  safetyStandards: SafetyStandard[]
  certifications: Certification[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  approvedBy?: string
  approvedAt?: string
}

export interface SpecificationGroup {
  id: string
  name: string
  category: "technical" | "performance" | "physical" | "electrical" | "mechanical"
  items: SpecificationItem[]
  order: number
}

export interface SpecificationItem {
  id: string
  name: string
  value: string | number
  unit?: string
  tolerance?: string
  minValue?: number
  maxValue?: number
  dataType: "string" | "number" | "boolean" | "range"
  required: boolean
  description?: string
  order: number
}

export interface PerformanceIndicator {
  id: string
  name: string
  targetValue: number
  actualValue?: number
  unit: string
  tolerance: number
  category: "efficiency" | "accuracy" | "throughput" | "reliability" | "quality"
  measurementMethod: string
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually"
  lastMeasured?: string
  trend: "improving" | "stable" | "declining" | "unknown"
}

export interface OperatingCondition {
  id: string
  parameter: string
  minValue: number
  maxValue: number
  optimalValue?: number
  unit: string
  category: "temperature" | "humidity" | "pressure" | "vibration" | "noise" | "environment"
  critical: boolean
  description?: string
}

export interface SafetyStandard {
  id: string
  standard: string
  requirement: string
  compliance: "compliant" | "non-compliant" | "pending" | "not-applicable"
  verificationDate?: string
  nextVerificationDate?: string
  responsible: string
  notes?: string
}

export interface Certification {
  id: string
  name: string
  issuingBody: string
  certificateNumber: string
  issueDate: string
  expiryDate: string
  status: "valid" | "expired" | "pending" | "suspended"
  documentUrl?: string
}

export interface SpecificationTemplate {
  id: string
  name: string
  equipmentType: string
  description?: string
  specificationGroups: SpecificationGroup[]
  performanceIndicators: Omit<PerformanceIndicator, "actualValue" | "lastMeasured" | "trend">[]
  operatingConditions: OperatingCondition[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}
