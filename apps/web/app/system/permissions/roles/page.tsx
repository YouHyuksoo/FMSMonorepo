"use client"

import { useState } from "react"
import { Button } from "@fms/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Textarea } from "@fms/ui/textarea"
import { Badge } from "@fms/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { Checkbox } from "@fms/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Icon } from "@fms/ui/icon"
import type { Role, Permission, PermissionResource } from "@fms/types"
import { mockRoles, mockPermissions } from "@/lib/mock-data/permissions"

interface RoleFormData {
  name: string
  displayName: string
  description: string
  level: number
  permissions: string[]
  isActive: boolean
}

const permissionGroups: Record<PermissionResource, { label: string; icon: string; color: string }> = {
  EQUIPMENT: { label: "설비관리", icon: "settings", color: "bg-blue-100 text-blue-800" },
  MAINTENANCE: { label: "보전작업", icon: "settings", color: "bg-green-100 text-green-800" },
  INSPECTION: { label: "점검관리", icon: "shield", color: "bg-yellow-100 text-yellow-800" },
  MATERIALS: { label: "자재관리", icon: "settings", color: "bg-purple-100 text-purple-800" },
  TPM: { label: "TPM활동", icon: "group", color: "bg-orange-100 text-orange-800" },
  FAILURE: { label: "고장관리", icon: "settings", color: "bg-red-100 text-red-800" },
  PREVENTIVE: { label: "예방정비", icon: "settings", color: "bg-indigo-100 text-indigo-800" },
  METERING: { label: "검침/검교정", icon: "settings", color: "bg-pink-100 text-pink-800" },
  PREDICTION: { label: "예지보전", icon: "settings", color: "bg-cyan-100 text-cyan-800" },
  KPI: { label: "KPI분석", icon: "settings", color: "bg-teal-100 text-teal-800" },
  LOCATION: { label: "위치모니터링", icon: "settings", color: "bg-lime-100 text-lime-800" },
  INTEGRATION: { label: "외부연동", icon: "settings", color: "bg-amber-100 text-amber-800" },
  MOBILE: { label: "모바일", icon: "settings", color: "bg-emerald-100 text-emerald-800" },
  SYSTEM: { label: "시스템관리", icon: "settings", color: "bg-gray-100 text-gray-800" },
  USERS: { label: "사용자관리", icon: "group", color: "bg-slate-100 text-slate-800" },
  ORGANIZATION: { label: "조직관리", icon: "group", color: "bg-stone-100 text-stone-800" },
  CODES: { label: "코드관리", icon: "settings", color: "bg-zinc-100 text-zinc-800" },
  LANGUAGE: { label: "다국어관리", icon: "settings", color: "bg-neutral-100 text-neutral-800" },
}

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const { toast } = useToast()

  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    displayName: "",
    description: "",
    level: 5,
    permissions: [],
    isActive: true,
  })

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = filterLevel === "all" || role.level.toString() === filterLevel
    return matchesSearch && matchesLevel
  })

  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = []
      }
      acc[permission.resource].push(permission)
      return acc
    },
    {} as Record<PermissionResource, Permission[]>,
  )

  const handleCreateRole = () => {
    setSelectedRole(null)
    setFormData({
      name: "",
      displayName: "",
      description: "",
      level: 5,
      permissions: [],
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      level: role.level,
      permissions: role.permissions,
      isActive: role.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleCopyRole = (role: Role) => {
    setSelectedRole(null)
    setFormData({
      name: `${role.name}_COPY`,
      displayName: `${role.displayName} (복사본)`,
      description: role.description,
      level: role.level,
      permissions: role.permissions,
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteRole = () => {
    if (roleToDelete) {
      setRoles(roles.filter((role) => role.id !== roleToDelete.id))
      toast({
        title: "역할 삭제 완료",
        description: `${roleToDelete.displayName} 역할이 삭제되었습니다.`,
      })
      setIsDeleteDialogOpen(false)
      setRoleToDelete(null)
    }
  }

  const handleSaveRole = () => {
    if (!formData.name || !formData.displayName) {
      toast({
        title: "입력 오류",
        description: "역할명과 표시명은 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    const roleData: Role = {
      id: selectedRole?.id || Date.now().toString(),
      name: formData.name,
      displayName: formData.displayName,
      description: formData.description,
      level: formData.level,
      permissions: formData.permissions,
      isActive: formData.isActive,
      createdAt: selectedRole?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (selectedRole) {
      setRoles(roles.map((role) => (role.id === selectedRole.id ? roleData : role)))
      toast({
        title: "역할 수정 완료",
        description: `${roleData.displayName} 역할이 수정되었습니다.`,
      })
    } else {
      setRoles([...roles, roleData])
      toast({
        title: "역할 생성 완료",
        description: `${roleData.displayName} 역할이 생성되었습니다.`,
      })
    }

    setIsDialogOpen(false)
  }

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const handleGroupToggle = (resource: PermissionResource, checked: boolean) => {
    const groupPermissions = groupedPermissions[resource]?.map((p) => p.id) || []

    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...new Set([...prev.permissions, ...groupPermissions])]
        : prev.permissions.filter((id) => !groupPermissions.includes(id)),
    }))
  }

  const isGroupChecked = (resource: PermissionResource) => {
    const groupPermissions = groupedPermissions[resource]?.map((p) => p.id) || []
    return groupPermissions.length > 0 && groupPermissions.every((id) => formData.permissions.includes(id))
  }

  const isGroupIndeterminate = (resource: PermissionResource) => {
    const groupPermissions = groupedPermissions[resource]?.map((p) => p.id) || []
    const checkedCount = groupPermissions.filter((id) => formData.permissions.includes(id)).length
    return checkedCount > 0 && checkedCount < groupPermissions.length
  }

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-red-100 text-red-800"
      case 2:
        return "bg-orange-100 text-orange-800"
      case 3:
        return "bg-yellow-100 text-yellow-800"
      case 4:
        return "bg-blue-100 text-blue-800"
      case 5:
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLevelText = (level: number) => {
    switch (level) {
      case 1:
        return "시스템관리자"
      case 2:
        return "부서관리자"
      case 3:
        return "팀장"
      case 4:
        return "작업자"
      case 5:
        return "조회자"
      default:
        return "기타"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">역할 관리</h1>
          <p className="text-muted-foreground">시스템 역할을 생성하고 권한을 할당합니다.</p>
        </div>
        <Button onClick={handleCreateRole} className="flex items-center gap-2">
          <Icon name="add" size="sm" />새 역할 생성
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>역할 목록</CardTitle>
          <CardDescription>등록된 역할을 조회하고 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="역할명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="레벨 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 레벨</SelectItem>
                <SelectItem value="1">레벨 1 (시스템관리자)</SelectItem>
                <SelectItem value="2">레벨 2 (부서관리자)</SelectItem>
                <SelectItem value="3">레벨 3 (팀장)</SelectItem>
                <SelectItem value="4">레벨 4 (작업자)</SelectItem>
                <SelectItem value="5">레벨 5 (조회자)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{role.displayName}</h3>
                      <Badge className={getLevelBadgeColor(role.level)}>
                        레벨 {role.level} - {getLevelText(role.level)}
                      </Badge>
                      <Badge variant={role.isActive ? "default" : "secondary"}>
                        {role.isActive ? "활성" : "비활성"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>권한 수: {role.permissions.length}개</span>
                      <span>생성일: {new Date(role.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyRole(role)}
                      className="flex items-center gap-1"
                    >
                      <Icon name="content_copy" size="sm" />
                      복사
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                      className="flex items-center gap-1"
                    >
                      <Icon name="edit" size="sm" />
                      편집
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRole(role)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Icon name="delete" size="sm" />
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 역할 생성/편집 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRole ? "역할 편집" : "새 역할 생성"}</DialogTitle>
            <DialogDescription>역할 정보를 입력하고 권한을 선택하세요.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="permissions">권한 설정</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">역할명 (영문)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ROLE_NAME"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">표시명</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="역할 표시명"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="역할에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">권한 레벨</Label>
                  <Select
                    value={formData.level.toString()}
                    onValueChange={(value) => setFormData({ ...formData, level: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">레벨 1 - 시스템관리자</SelectItem>
                      <SelectItem value="2">레벨 2 - 부서관리자</SelectItem>
                      <SelectItem value="3">레벨 3 - 팀장</SelectItem>
                      <SelectItem value="4">레벨 4 - 작업자</SelectItem>
                      <SelectItem value="5">레벨 5 - 조회자</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                    />
                    <Label htmlFor="isActive">활성 상태</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="mb-4">
                <h4 className="font-medium mb-2">선택된 권한: {formData.permissions.length}개</h4>
                <div className="text-sm text-muted-foreground">
                  모듈별로 권한을 선택하거나 개별 권한을 선택할 수 있습니다.
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resource, perms]) => {
                  const groupInfo = permissionGroups[resource as PermissionResource]

                  return (
                    <Card key={resource} className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Checkbox
                          checked={isGroupChecked(resource as PermissionResource)}
                          onCheckedChange={(checked) => handleGroupToggle(resource as PermissionResource, !!checked)}
                          className={
                            isGroupIndeterminate(resource as PermissionResource)
                              ? "data-[state=checked]:bg-orange-500"
                              : ""
                          }
                        />
                        <Icon name={groupInfo.icon} size="sm" />
                        <Badge className={groupInfo.color}>{groupInfo.label}</Badge>
                        <span className="text-sm text-muted-foreground">
                          ({perms.filter((p) => formData.permissions.includes(p.id)).length}/{perms.length})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 ml-8">
                        {perms.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <Label htmlFor={permission.id} className="text-sm">
                              {permission.description}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <Icon name="close" size="sm" className="mr-2" />
              취소
            </Button>
            <Button onClick={handleSaveRole}>
              <Icon name="save" size="sm" className="mr-2" />
              {selectedRole ? "수정" : "생성"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>역할 삭제 확인</DialogTitle>
            <DialogDescription>
              {roleToDelete?.displayName} 역할을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRole}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
