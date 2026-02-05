"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog"
import { Button } from "@fms/ui/button"
import { Badge } from "@fms/ui/badge"
import { Checkbox } from "@fms/ui/checkbox"
import { Label } from "@fms/ui/label"
import { Separator } from "@fms/ui/separator"
import { ScrollArea } from "@fms/ui/scroll-area"
import { Avatar, AvatarFallback } from "@fms/ui/avatar"
import { Calendar } from "@fms/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@fms/ui/popover"
import { Icon } from "@fms/ui/icon"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@fms/utils"
import type { User as UserType } from "@fms/types"
import type { UserRole, Role } from "@fms/types"
import { useToast } from "@/hooks/use-toast"

// 빈 배열로 초기화
const mockRoles: Role[] = []
const mockUserRoles: UserRole[] = []

interface UserRoleAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserType | null
  onAssignmentChange: (userRoles: UserRole[]) => void
}

export function UserRoleAssignmentDialog({
  open,
  onOpenChange,
  user,
  onAssignmentChange,
}: UserRoleAssignmentDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [expiryDate, setExpiryDate] = useState<Date>()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user && open) {
      // 현재 사용자의 활성 역할 로드
      const currentRoles = mockUserRoles.filter((ur) => ur.userId === user.id && ur.isActive).map((ur) => ur.roleId)
      setSelectedRoles(currentRoles)
      setExpiryDate(undefined)
    }
  }, [user, open])

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles((prev) => [...prev, roleId])
    } else {
      setSelectedRoles((prev) => prev.filter((id) => id !== roleId))
    }
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      // 시뮬레이션: API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 기존 역할 비활성화
      const updatedUserRoles = mockUserRoles.map((ur) => (ur.userId === user.id ? { ...ur, isActive: false } : ur))

      // 새 역할 추가
      const newUserRoles: UserRole[] = selectedRoles.map((roleId) => ({
        userId: user.id,
        roleId,
        assignedBy: "current-user", // 실제로는 현재 로그인한 사용자 ID
        assignedAt: new Date().toISOString(),
        expiresAt: expiryDate?.toISOString(),
        isActive: true,
      }))

      const finalUserRoles = [...updatedUserRoles, ...newUserRoles]
      onAssignmentChange(finalUserRoles)

      toast({
        title: "성공",
        description: `${user.name}님의 역할이 업데이트되었습니다.`,
      })

      onOpenChange(false)
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

  const getCurrentRoles = () => {
    if (!user) return []
    const currentRoleIds = mockUserRoles.filter((ur) => ur.userId === user.id && ur.isActive).map((ur) => ur.roleId)
    return mockRoles.filter((role) => currentRoleIds.includes(role.id))
  }

  const getSelectedRolePermissions = () => {
    const roles = mockRoles.filter((role) => selectedRoles.includes(role.id))
    const allPermissions = new Set<string>()
    roles.forEach((role) => {
      role.permissions.forEach((perm) => allPermissions.add(perm))
    })
    return allPermissions.size
  }

  const hasConflictingRoles = () => {
    const roles = mockRoles.filter((role) => selectedRoles.includes(role.id))
    const levels = roles.map((role) => role.level)
    return new Set(levels).size > 1 && levels.some((level) => level <= 2) // 관리자 레벨 충돌 검사
  }

  if (!user) return null

  const currentRoles = getCurrentRoles()
  const totalPermissions = getSelectedRolePermissions()
  const hasConflicts = hasConflictingRoles()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="shield" size="sm" />
            사용자 역할 할당
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-3 mt-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">
                  {user.department} · {user.position}
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 현재 역할 */}
          <div>
            <Label className="text-sm font-medium">현재 할당된 역할</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {currentRoles.length > 0 ? (
                currentRoles.map((role) => (
                  <Badge key={role.id} variant="outline">
                    {role.displayName}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">할당된 역할이 없습니다</span>
              )}
            </div>
          </div>

          <Separator />

          {/* 역할 선택 */}
          <div>
            <Label className="text-sm font-medium">새 역할 할당</Label>
            <ScrollArea className="h-64 mt-2 border rounded-md p-4">
              <div className="space-y-4">
                {mockRoles.map((role) => (
                  <div key={role.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={role.id}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={role.id} className="font-medium cursor-pointer">
                          {role.displayName}
                        </Label>
                        <Badge variant={role.level === 1 ? "default" : "secondary"} className="text-xs">
                          Level {role.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                      <p className="text-xs text-muted-foreground">{role.permissions.length}개 권한</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* 만료일 설정 */}
          <div>
            <Label className="text-sm font-medium">만료일 (선택사항)</Label>
            <div className="mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !expiryDate && "text-muted-foreground")}
                  >
                    <Icon name="calendar_today" size="sm" className="mr-2" />
                    {expiryDate ? format(expiryDate, "PPP", { locale: ko }) : "만료일 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* 요약 정보 */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>선택된 역할:</span>
              <span className="font-medium">{selectedRoles.length}개</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>총 권한:</span>
              <span className="font-medium">{totalPermissions}개</span>
            </div>
            {expiryDate && (
              <div className="flex items-center gap-2 text-sm">
                <Icon name="schedule" size="sm" />
                <span>만료일: {format(expiryDate, "PPP", { locale: ko })}</span>
              </div>
            )}
            {hasConflicts && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <Icon name="warning" size="sm" />
                <span>관리자 레벨 역할이 중복 선택되었습니다</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={loading || selectedRoles.length === 0}>
            {loading ? "저장 중..." : "역할 할당"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
