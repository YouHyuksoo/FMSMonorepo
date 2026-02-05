export interface EquipmentListItem {
  id: string
  name: string
  code?: string
  location?: string
}

export interface MaintenanceMaterial {
  id: string
  materialId: string
  materialCode: string
  materialName: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  isRequired?: boolean
  warehouseId?: string
  warehouseName?: string
  usedBy?: string
  usedByName?: string
  usedAt?: string
  plannedQuantity?: number // For comparing planned vs actual
  actualQuantity?: number // For comparing planned vs actual
}

export interface MaintenanceProcedure {
  id: string
  step: number
  title: string
  description: string
  estimatedDuration: number // in minutes
  safetyNotes?: string
  // For work results
  result?: "pending" | "completed" | "skipped" | "failed"
  notes?: string
  duration?: number // actual duration in minutes
  completedBy?: string
  completedByName?: string
  completedAt?: string
  procedureId?: string // Link to the original procedure in plan for work results
}

export interface MaintenanceRequest {
  id: string
  requestNo: string
  title: string
  description: string
  equipmentId: string
  equipmentCode: string
  equipmentName: string
  requestType?: "breakdown" | "preventive" | "improvement" | "emergency" | "general" // Added general
  workType?: "repair" | "replace" | "inspect" | "calibrate" | "upgrade" | "general" // Added to align with PlanForm
  priority: "critical" | "high" | "normal" | "low"
  status: "requested" | "approved" | "rejected" | "planned" | "in_progress" | "completed" | "cancelled"
  requestedBy: string
  requestedByName?: string // Name of the requester
  requesterName?: string // Name of the requester (used in PlanForm)
  requestDate: string // ISO Date string
  approvedBy?: string
  approvedByName?: string
  approvalDate?: string // ISO Date string
  estimatedDuration?: number // in hours
  estimatedCost?: number
  location?: string
  department?: string
  // Standard audit fields
  isActive?: boolean
  createdAt: string // ISO Date string
  updatedAt: string // ISO Date string
  createdBy: string
  updatedBy?: string
}

export interface MaintenancePlan {
  id: string
  requestId?: string // Link to the original request if any
  planNo: string
  title: string
  description: string
  equipmentId: string
  equipmentCode?: string
  equipmentName: string
  workType: "repair" | "replace" | "inspect" | "calibrate" | "upgrade" | "general" // Added general
  priority: "critical" | "high" | "normal" | "low"
  status: "planned" | "assigned" | "in_progress" | "completed" | "cancelled" | "on_hold" // Added on_hold
  plannedBy?: string
  plannedByName?: string
  planDate?: string // ISO Date string
  scheduledStartDate: string // ISO Date string
  scheduledEndDate?: string // ISO Date string
  estimatedDuration: number // in hours
  estimatedCost: number
  assignedTo?: string
  assignedToName?: string
  assignedTeam?: string
  assignedTeamName?: string
  assignDate?: string // ISO Date string
  requesterName?: string // From original request, if applicable
  requestDate?: string // From original request, if applicable
  materials?: MaintenanceMaterial[]
  procedures?: MaintenanceProcedure[]
  safetyNotes?: string
  specialInstructions?: string
  location?: string
  department?: string
  // Standard audit fields
  isActive?: boolean
  createdAt: string // ISO Date string
  updatedAt: string // ISO Date string
  createdBy?: string
  updatedBy?: string
}

export interface MaintenanceWork {
  id: string
  requestId?: string
  planId: string // Link to the maintenance plan
  workNo: string
  title: string
  description: string
  equipmentId: string
  equipmentCode?: string
  equipmentName: string
  workType: "repair" | "replace" | "inspect" | "calibrate" | "upgrade" | "general"
  priority: "critical" | "high" | "normal" | "low"
  status: "pending" | "in_progress" | "completed" | "on_hold" | "cancelled"
  assignedTo: string
  assignedToName?: string
  assignedTeam?: string
  assignedTeamName?: string
  assignDate: string // ISO Date string
  startDate?: string // ISO Date string
  endDate?: string // ISO Date string
  actualDuration?: number // in hours
  actualCost?: number
  workResults?: MaintenanceProcedure[] // Reusing MaintenanceProcedure for work results
  materialsUsed?: MaintenanceMaterial[] // Reusing MaintenanceMaterial for materials used
  completionNotes?: string
  failureReportId?: string // Link to failure report if applicable
  nextMaintenanceDate?: string // ISO Date string, if applicable
  workNotes?: string
  location?: string
  department?: string
  // Standard audit fields
  isActive?: boolean
  createdAt: string // ISO Date string
  updatedAt: string // ISO Date string
  createdBy?: string
  updatedBy?: string
}
