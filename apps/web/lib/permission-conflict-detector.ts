import type { Role } from "@fms/types"

export interface ConflictRule {
  id: string
  name: string
  description: string
  severity: "warning" | "error" | "critical"
  check: (roles: Role[]) => boolean
  suggestion?: string
}

export interface ConflictResult {
  hasConflicts: boolean
  conflicts: {
    rule: ConflictRule
    conflictingRoles: Role[]
  }[]
}

// 권한 충돌 규칙 정의
export const conflictRules: ConflictRule[] = [
  {
    id: "multiple-admin-levels",
    name: "다중 관리자 레벨 충돌",
    description: "서로 다른 레벨의 관리자 역할을 동시에 가질 수 없습니다",
    severity: "error",
    check: (roles: Role[]) => {
      const adminRoles = roles.filter((role) => role.level <= 2)
      const levels = new Set(adminRoles.map((role) => role.level))
      return levels.size > 1
    },
    suggestion: "하나의 관리자 레벨만 선택하세요",
  },
  {
    id: "admin-operator-conflict",
    name: "관리자-작업자 역할 충돌",
    description: "관리자 역할과 일반 작업자 역할을 동시에 가질 수 없습니다",
    severity: "warning",
    check: (roles: Role[]) => {
      const hasAdmin = roles.some((role) => role.level <= 2)
      const hasOperator = roles.some((role) => role.level >= 4)
      return hasAdmin && hasOperator
    },
    suggestion: "관리자 역할 또는 작업자 역할 중 하나만 선택하세요",
  },
  {
    id: "system-admin-with-others",
    name: "시스템 관리자 단독 역할",
    description: "시스템 관리자는 다른 역할과 함께 할당할 수 없습니다",
    severity: "critical",
    check: (roles: Role[]) => {
      const hasSystemAdmin = roles.some((role) => role.level === 1)
      return hasSystemAdmin && roles.length > 1
    },
    suggestion: "시스템 관리자 역할만 할당하세요",
  },
  {
    id: "conflicting-permissions",
    name: "상충 권한 감지",
    description: "읽기 전용 권한과 수정 권한이 충돌합니다",
    severity: "warning",
    check: (roles: Role[]) => {
      const allPermissions = roles.flatMap((role) => role.permissions)
      const hasReadOnly = allPermissions.some((perm) => perm.includes("READ"))
      const hasWriteAll = allPermissions.some((perm) => perm.includes("ALL"))
      return hasReadOnly && hasWriteAll && roles.length > 1
    },
    suggestion: "권한 범위를 명확히 구분하세요",
  },
  {
    id: "inspector-admin-conflict",
    name: "점검자-관리자 분리 원칙",
    description: "점검자는 관리자 역할과 분리되어야 합니다 (감사 독립성)",
    severity: "warning",
    check: (roles: Role[]) => {
      const hasInspector = roles.some((role) => role.name === "INSPECTOR")
      const hasAdmin = roles.some((role) => role.level <= 2)
      return hasInspector && hasAdmin
    },
    suggestion: "감사 독립성을 위해 점검자와 관리자 역할을 분리하세요",
  },
]

export function detectConflicts(selectedRoles: string[], allRoles: Role[]): ConflictResult {
  const roles = allRoles.filter((role) => selectedRoles.includes(role.id))
  const conflicts: ConflictResult["conflicts"] = []

  for (const rule of conflictRules) {
    if (rule.check(roles)) {
      conflicts.push({
        rule,
        conflictingRoles: roles,
      })
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  }
}

export function getConflictSeverityColor(severity: ConflictRule["severity"]): string {
  switch (severity) {
    case "critical":
      return "text-red-600 bg-red-50 border-red-200"
    case "error":
      return "text-red-500 bg-red-50 border-red-200"
    case "warning":
      return "text-amber-600 bg-amber-50 border-amber-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

export function getConflictIcon(severity: ConflictRule["severity"]): string {
  switch (severity) {
    case "critical":
      return "🚨"
    case "error":
      return "❌"
    case "warning":
      return "⚠️"
    default:
      return "ℹ️"
  }
}
