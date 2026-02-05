"use client"

import { useState } from "react"
import { Button } from "@fms/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@fms/ui/dropdown-menu"
import { Badge } from "@fms/ui/badge"
import { Icon } from "@fms/ui/icon"
import { mockRoles } from "@/lib/mock-data/permissions"
import type { User } from "@fms/types"
import type { Role } from "@fms/types"
import { useToast } from "@/hooks/use-toast"

interface QuickRoleAssignmentProps {
  user: User
  onRoleAssigned: (userId: string, roleId: string) => void
}

export function QuickRoleAssignment({ user, onRoleAssigned }: QuickRoleAssignmentProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleQuickAssign = async (role: Role) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      onRoleAssigned(user.id, role.id)
      toast({
        title: "성공",
        description: `${user.name}님에게 ${role.displayName} 역할이 할당되었습니다.`,
      })
    } catch (error) {
      toast({
        title: "오류",
        description: "역할 할당에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "SYSTEM_ADMIN":
        return <Icon name="settings" size="sm" />
      case "EQUIPMENT_ADMIN":
        return <Icon name="build" size="sm" />
      case "MAINTENANCE_ADMIN":
        return <Icon name="shield" size="sm" />
      case "INSPECTOR":
        return <Icon name="group" size="sm" />
      case "OPERATOR":
        return <Icon name="person_add" size="sm" />
      case "VIEWER":
        return <Icon name="visibility" size="sm" />
      default:
        return <Icon name="shield" size="sm" />
    }
  }

  const getRoleColor = (level: number) => {
    switch (level) {
      case 1:
        return "text-red-600"
      case 2:
        return "text-blue-600"
      case 3:
        return "text-green-600"
      case 4:
        return "text-yellow-600"
      case 5:
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <Icon name="person_add" size="sm" className="mr-1" />
          빠른 할당
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>역할 선택</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mockRoles.map((role) => (
          <DropdownMenuItem key={role.id} onClick={() => handleQuickAssign(role)} className="flex items-center gap-2">
            <div className={getRoleColor(role.level)}>{getRoleIcon(role.name)}</div>
            <div className="flex-1">
              <div className="font-medium">{role.displayName}</div>
              <div className="text-xs text-muted-foreground">{role.permissions.length}개 권한</div>
            </div>
            <Badge variant="outline" className="text-xs">
              L{role.level}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
