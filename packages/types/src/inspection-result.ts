export interface InspectionResult {
  id: string
  scheduleId: string
  masterId: string
  masterName: string
  equipmentId: string
  equipmentName: string
  inspectorId: string
  inspectorName: string
  inspectionDate: string
  startTime: string
  endTime: string
  overallStatus: "pass" | "fail" | "warning"
  totalItems: number
  passedItems: number
  failedItems: number
  warningItems: number
  notes?: string
  recommendations?: string
  nextInspectionDate?: string
  createdAt: string
  items: InspectionResultItem[]
  attachments: string[]
  standardId: string // Links to InspectionStandard
  standardVersion: string // Version of the standard used
}

export interface InspectionResultItem {
  id: string
  itemId: string
  itemName: string
  checkMethod: string
  measuredValue?: string
  standardValue?: string
  unit?: string
  status: "pass" | "fail" | "warning" | "na"
  notes?: string
  images?: string[]
}
