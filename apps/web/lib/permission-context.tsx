"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { mockPermissions, mockRoles, mockUserRoles } from "./mock-data/permissions"
import type { Permission, Role, PermissionCheck } from "@fms/types"

interface PermissionContextType {
  userPermissions: Permission[]
  userRoles: Role[]
  hasPermission: (check: PermissionCheck) => boolean
  hasRole: (roleName: string) => boolean
  isLoading: boolean
  refreshPermissions: () => void
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [userPermissions, setUserPermissions] = useState<Permission[]>([])
  const [userRoles, setUserRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadUserPermissions = async () => {
    if (!user) {
      setUserPermissions([])
      setUserRoles([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      // 사용자의 역할 조회
      const userRoleAssignments = mockUserRoles.filter((ur) => ur.userId === user.id && ur.isActive)

      // 역할 정보 조회
      const roles = mockRoles.filter((role) => userRoleAssignments.some((ur) => ur.roleId === role.id) && role.isActive)

      // 역할에 할당된 권한 ID 수집
      const permissionIds = new Set<string>()
      roles.forEach((role) => {
        role.permissions.forEach((permId) => permissionIds.add(permId))
      })

      // 권한 정보 조회
      const permissions = mockPermissions.filter((perm) => permissionIds.has(perm.id))

      setUserRoles(roles)
      setUserPermissions(permissions)
    } catch (error) {
      console.error("Failed to load user permissions:", error)
      setUserPermissions([])
      setUserRoles([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserPermissions()
  }, [user])

  const hasPermission = (check: PermissionCheck): boolean => {
    if (!user || userPermissions.length === 0) return false

    // 시스템 관리자는 모든 권한 보유
    if (userRoles.some((role) => role.name === "SYSTEM_ADMIN")) {
      return true
    }

    // 특정 권한 확인
    return userPermissions.some((perm) => perm.resource === check.resource && perm.action === check.action)
  }

  const hasRole = (roleName: string): boolean => {
    return userRoles.some((role) => role.name === roleName)
  }

  const refreshPermissions = () => {
    loadUserPermissions()
  }

  return (
    <PermissionContext.Provider
      value={{
        userPermissions,
        userRoles,
        hasPermission,
        hasRole,
        isLoading,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  )
}

export const usePermission = () => {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error("usePermission must be used within a PermissionProvider")
  }
  return context
}
