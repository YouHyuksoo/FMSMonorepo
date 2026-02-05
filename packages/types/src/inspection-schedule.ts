export interface InspectionScheduleStandard {
  id: string
  name: string
  version: string
  type: string
}

export interface InspectionScheduleEquipment {
  id: string
  code: string
  name: string
  location: string
  department: string
}

export interface InspectionScheduleUser {
  id: string
  name: string
  department: string
  position: string
}

export interface InspectionSchedule {
  id: string
  standardId: string
  standard?: InspectionScheduleStandard
  equipmentId: string
  equipment?: InspectionScheduleEquipment
  scheduledDate: string
  scheduledTime: string
  estimatedDuration: number
  assignedToId: string
  assignedTo?: InspectionScheduleUser
  status: "scheduled" | "in-progress" | "completed" | "missed" | "rescheduled" | "canceled"
  priority: "low" | "medium" | "high" | "critical"
  completedDate?: string
  completedTime?: string
  completedById?: string
  completedBy?: InspectionScheduleUser
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  recurrencePattern?: string
  recurrenceEndDate?: string
}
