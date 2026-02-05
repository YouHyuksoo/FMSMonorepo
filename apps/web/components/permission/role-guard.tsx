"use client"

import type React from "react"
import { usePermission } from "@/lib/permission-context"
import { Alert, AlertDescription } from "@fms/ui/alert"
import { Icon } from "@fms/ui/icon"

interface RoleGuardProps {
  children: React.ReactNode
  roles: string[]
  fallback?: React.ReactNode
  showError?: boolean
  requireAll?: boolean // true: 모든 역할 필요, false: 하나라도 있으면 됨
}

export function RoleGuard({ children, roles, fallback, showError = true, requireAll = false }: RoleGuardProps) {
  const { hasRole, isLoading } = usePermission()

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-8 rounded" />
  }

  const hasAccess = requireAll ? roles.every((role) => hasRole(role)) : roles.some((role) => hasRole(role))

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showError) {
      return (
        <Alert variant="destructive">
          <Icon name="shield" size="sm" />
          <AlertDescription>이 기능에 접근할 권한이 없습니다.</AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return <>{children}</>
}
