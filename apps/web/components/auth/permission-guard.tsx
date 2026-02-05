"use client"

import type { ReactNode } from "react"

interface Permission {
  resource: string
  action: string
}

interface PermissionGuardProps {
  children: ReactNode
  permission: Permission
  fallback?: ReactNode
}

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
  // 실제 구현에서는 권한 컨텍스트에서 권한을 확인합니다
  // 여기서는 항상 true를 반환하여 모든 권한을 허용합니다
  const hasPermission = true

  if (!hasPermission) {
    return fallback
  }

  return <>{children}</>
}
