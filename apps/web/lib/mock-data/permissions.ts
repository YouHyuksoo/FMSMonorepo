import type { Permission, Role, UserRole } from "@fms/types"

export const mockPermissions: Permission[] = [
  // 설비 관리 권한
  {
    id: "1",
    name: "EQUIPMENT_CREATE",
    resource: "EQUIPMENT",
    action: "CREATE",
    description: "설비 등록",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "EQUIPMENT_READ",
    resource: "EQUIPMENT",
    action: "READ",
    description: "설비 조회",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "3",
    name: "EQUIPMENT_UPDATE",
    resource: "EQUIPMENT",
    action: "UPDATE",
    description: "설비 수정",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "4",
    name: "EQUIPMENT_DELETE",
    resource: "EQUIPMENT",
    action: "DELETE",
    description: "설비 삭제",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },

  // 보전 작업 권한
  {
    id: "5",
    name: "MAINTENANCE_CREATE",
    resource: "MAINTENANCE",
    action: "CREATE",
    description: "보전작업 등록",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "6",
    name: "MAINTENANCE_READ",
    resource: "MAINTENANCE",
    action: "READ",
    description: "보전작업 조회",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "7",
    name: "MAINTENANCE_UPDATE",
    resource: "MAINTENANCE",
    action: "UPDATE",
    description: "보전작업 수정",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "8",
    name: "MAINTENANCE_APPROVE",
    resource: "MAINTENANCE",
    action: "APPROVE",
    description: "보전작업 승인",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },

  // 점검 관리 권한
  {
    id: "9",
    name: "INSPECTION_CREATE",
    resource: "INSPECTION",
    action: "CREATE",
    description: "점검 등록",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "10",
    name: "INSPECTION_READ",
    resource: "INSPECTION",
    action: "READ",
    description: "점검 조회",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "11",
    name: "INSPECTION_UPDATE",
    resource: "INSPECTION",
    action: "UPDATE",
    description: "점검 수정",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "12",
    name: "INSPECTION_EXECUTE",
    resource: "INSPECTION",
    action: "EXECUTE",
    description: "점검 실행",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },

  // 시스템 관리 권한
  {
    id: "13",
    name: "SYSTEM_CREATE",
    resource: "SYSTEM",
    action: "CREATE",
    description: "시스템 설정",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "14",
    name: "SYSTEM_READ",
    resource: "SYSTEM",
    action: "READ",
    description: "시스템 조회",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "15",
    name: "SYSTEM_UPDATE",
    resource: "SYSTEM",
    action: "UPDATE",
    description: "시스템 수정",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },

  // 사용자 관리 권한
  {
    id: "16",
    name: "USERS_CREATE",
    resource: "USERS",
    action: "CREATE",
    description: "사용자 등록",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "17",
    name: "USERS_READ",
    resource: "USERS",
    action: "READ",
    description: "사용자 조회",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "18",
    name: "USERS_UPDATE",
    resource: "USERS",
    action: "UPDATE",
    description: "사용자 수정",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "19",
    name: "USERS_DELETE",
    resource: "USERS",
    action: "DELETE",
    description: "사용자 삭제",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
]

export const mockRoles: Role[] = [
  {
    id: "1",
    name: "SYSTEM_ADMIN",
    displayName: "시스템 관리자",
    description: "모든 시스템 기능에 대한 전체 권한",
    level: 1,
    permissions: mockPermissions.map((p) => p.id), // 모든 권한
    isActive: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "EQUIPMENT_ADMIN",
    displayName: "설비 관리자",
    description: "설비 관련 모든 기능 관리",
    level: 2,
    permissions: ["1", "2", "3", "4", "14", "17"], // 설비 관련 + 기본 조회
    isActive: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "3",
    name: "MAINTENANCE_ADMIN",
    displayName: "보전 관리자",
    description: "보전작업 관련 모든 기능 관리",
    level: 2,
    permissions: ["2", "5", "6", "7", "8", "14", "17"], // 보전 관련 + 설비 조회
    isActive: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "4",
    name: "INSPECTOR",
    displayName: "점검자",
    description: "점검 업무 수행",
    level: 3,
    permissions: ["2", "6", "9", "10", "11", "12"], // 점검 관련 + 기본 조회
    isActive: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "5",
    name: "OPERATOR",
    displayName: "작업자",
    description: "일반 작업 수행",
    level: 4,
    permissions: ["2", "6", "10", "12"], // 기본 조회 + 점검 실행
    isActive: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "6",
    name: "VIEWER",
    displayName: "조회자",
    description: "조회 권한만 보유",
    level: 5,
    permissions: ["2", "6", "10", "14", "17"], // 조회 권한만
    isActive: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
]

export const mockUserRoles: UserRole[] = [
  {
    userId: "1", // admin
    roleId: "1", // SYSTEM_ADMIN
    assignedBy: "system",
    assignedAt: "2024-01-01",
    isActive: true,
  },
  {
    userId: "2", // user1
    roleId: "5", // OPERATOR
    assignedBy: "1",
    assignedAt: "2024-01-01",
    isActive: true,
  },
  {
    userId: "3", // manager
    roleId: "3", // MAINTENANCE_ADMIN
    assignedBy: "1",
    assignedAt: "2024-01-01",
    isActive: true,
  },
]
