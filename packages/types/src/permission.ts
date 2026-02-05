export type PermissionAction = "CREATE" | "READ" | "UPDATE" | "DELETE" | "EXECUTE" | "APPROVE"

export type PermissionResource =
  | "EQUIPMENT"
  | "MAINTENANCE"
  | "INSPECTION"
  | "MATERIALS"
  | "TPM"
  | "FAILURE"
  | "PREVENTIVE"
  | "METERING"
  | "PREDICTION"
  | "KPI"
  | "LOCATION"
  | "INTEGRATION"
  | "MOBILE"
  | "SYSTEM"
  | "USERS"
  | "ORGANIZATION"
  | "CODES"
  | "LANGUAGE"

export interface Permission {
  id: string
  name: string
  resource: PermissionResource
  action: PermissionAction
  description: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  displayName: string
  description: string
  level: number // 1: 시스템관리자, 2: 부서관리자, 3: 팀장, 4: 작업자, 5: 조회자
  permissions: string[] // Permission IDs
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserRole {
  userId: string
  roleId: string
  assignedBy: string
  assignedAt: string
  expiresAt?: string
  isActive: boolean
}

export interface PermissionCheck {
  resource: PermissionResource
  action: PermissionAction
  context?: Record<string, any>
}
