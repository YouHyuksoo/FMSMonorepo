"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Badge } from "@fms/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@fms/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog"
import { Label } from "@fms/ui/label"
import { Icon } from "@fms/ui/icon"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  detectConflicts,
  getConflictSeverityColor,
  getConflictIcon,
  type ConflictResult,
} from "@/lib/permission-conflict-detector"

// 간단한 타입 정의
interface Role {
  id: string
  name: string
  displayName: string
  description: string
  level: number
  permissions: string[]
  isActive: boolean
}

interface User {
  id: string
  name: string
  email: string
  department: string
}

interface UserRole {
  userId: string
  roleId: string
  isActive: boolean
}

// 샘플 데이터
const mockRoles: Role[] = [
  {
    id: "role-1",
    name: "SYSTEM_ADMIN",
    displayName: "시스템 관리자",
    description: "모든 시스템 기능에 접근 가능",
    level: 1,
    permissions: ["SYSTEM_ALL", "EQUIPMENT_ALL", "MAINTENANCE_ALL"],
    isActive: true,
  },
  {
    id: "role-2",
    name: "EQUIPMENT_ADMIN",
    displayName: "설비 관리자",
    description: "설비 관련 모든 기능에 접근 가능",
    level: 2,
    permissions: ["EQUIPMENT_ALL", "MAINTENANCE_READ"],
    isActive: true,
  },
  {
    id: "role-3",
    name: "MAINTENANCE_ADMIN",
    displayName: "보전 관리자",
    description: "보전 작업 관련 모든 기능에 접근 가능",
    level: 2,
    permissions: ["MAINTENANCE_ALL", "EQUIPMENT_READ"],
    isActive: true,
  },
  {
    id: "role-4",
    name: "INSPECTOR",
    displayName: "점검자",
    description: "설비 점검 및 결과 등록 가능",
    level: 3,
    permissions: ["INSPECTION_ALL", "EQUIPMENT_READ"],
    isActive: true,
  },
  {
    id: "role-5",
    name: "OPERATOR",
    displayName: "작업자",
    description: "일상 작업 및 기본 정보 접근 가능",
    level: 4,
    permissions: ["EQUIPMENT_READ", "MAINTENANCE_READ", "INSPECTION_READ"],
    isActive: true,
  },
]

const mockUsers: User[] = [
  {
    id: "user-1",
    name: "김관리",
    email: "admin@example.com",
    department: "시스템관리부",
  },
  {
    id: "user-2",
    name: "이설비",
    email: "equipment@example.com",
    department: "설비관리부",
  },
  {
    id: "user-3",
    name: "박보전",
    email: "maintenance@example.com",
    department: "보전관리부",
  },
  {
    id: "user-4",
    name: "최점검",
    email: "inspector@example.com",
    department: "품질관리부",
  },
]

const mockUserRoles: UserRole[] = [
  {
    userId: "user-1",
    roleId: "role-1",
    isActive: true,
  },
  {
    userId: "user-2",
    roleId: "role-2",
    isActive: true,
  },
  {
    userId: "user-3",
    roleId: "role-3",
    isActive: true,
  },
  {
    userId: "user-4",
    roleId: "role-4",
    isActive: true,
  },
]

const mockPermissions = [
  { id: "perm-1", name: "SYSTEM_ALL", resource: "SYSTEM", action: "ALL", description: "모든 시스템 기능" },
  { id: "perm-2", name: "EQUIPMENT_ALL", resource: "EQUIPMENT", action: "ALL", description: "모든 설비 기능" },
  { id: "perm-3", name: "MAINTENANCE_ALL", resource: "MAINTENANCE", action: "ALL", description: "모든 보전 기능" },
  { id: "perm-4", name: "INSPECTION_ALL", resource: "INSPECTION", action: "ALL", description: "모든 점검 기능" },
  { id: "perm-5", name: "EQUIPMENT_READ", resource: "EQUIPMENT", action: "READ", description: "설비 조회" },
  { id: "perm-6", name: "MAINTENANCE_READ", resource: "MAINTENANCE", action: "read", description: "보전 조회" },
  { id: "perm-7", name: "INSPECTION_READ", resource: "INSPECTION", action: "read", description: "점검 조회" },
]

export default function PermissionsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [userRoles, setUserRoles] = useState<UserRole[]>(mockUserRoles)
  const router = useRouter()

  const [isRoleAssignmentModalOpen, setIsRoleAssignmentModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  const [conflictResult, setConflictResult] = useState<ConflictResult>({ hasConflicts: false, conflicts: [] })
  const [showConflictWarning, setShowConflictWarning] = useState(false)
  const [forceAssignment, setForceAssignment] = useState(false)

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [newPermission, setNewPermission] = useState({
    name: "",
    resource: "",
    action: "",
    description: "",
  })

  const [isEditPermissionModalOpen, setIsEditPermissionModalOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<any>(null)

  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editRoleData, setEditRoleData] = useState({
    displayName: "",
    description: "",
    level: 1,
    permissions: [] as string[],
    isActive: true,
  })

  useEffect(() => {
    if (selectedRoles.length > 0) {
      const result = detectConflicts(selectedRoles, mockRoles)
      setConflictResult(result)
      setShowConflictWarning(result.hasConflicts)
    } else {
      setConflictResult({ hasConflicts: false, conflicts: [] })
      setShowConflictWarning(false)
    }
  }, [selectedRoles])

  const filteredPermissions = mockPermissions.filter(
    (perm) =>
      perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredRoles = mockRoles.filter(
    (role) =>
      role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getUserRoles = (userId: string) => {
    const userRoleIds = userRoles.filter((ur) => ur.userId === userId && ur.isActive).map((ur) => ur.roleId)
    return mockRoles.filter((role) => userRoleIds.includes(role.id))
  }

  const handleAssignRole = (user: User) => {
    setSelectedUser(user)
    const userRoleIds = userRoles.filter((ur) => ur.userId === user.id && ur.isActive).map((ur) => ur.roleId)
    setSelectedRoles(userRoleIds)
    setIsRoleAssignmentModalOpen(true)
  }

  const handleQuickAssign = (user: User, roleId: string) => {
    const updatedUserRoles = userRoles.map((ur) => (ur.userId === user.id ? { ...ur, isActive: false } : ur))

    const newUserRole = {
      userId: user.id,
      roleId: roleId,
      isActive: true,
    }

    setUserRoles([...updatedUserRoles, newUserRole])

    const role = mockRoles.find((r) => r.id === roleId)

    toast({
      title: "역할 할당 완료",
      description: `${user.name} 사용자에게 ${role?.displayName} 역할이 할당되었습니다.`,
    })
  }

  const handleSaveRoleAssignment = () => {
    if (!selectedUser) return

    if (conflictResult.hasConflicts && !forceAssignment) {
      const hasCriticalConflicts = conflictResult.conflicts.some((c) => c.rule.severity === "critical")
      if (hasCriticalConflicts) {
        toast({
          title: "역할 할당 불가",
          description: "심각한 권한 충돌이 감지되었습니다. 역할을 다시 선택해주세요.",
          variant: "destructive",
        })
        return
      }
    }

    const updatedUserRoles = userRoles.map((ur) => (ur.userId === selectedUser.id ? { ...ur, isActive: false } : ur))

    const newUserRoles = selectedRoles.map((roleId) => ({
      userId: selectedUser.id,
      roleId,
      isActive: true,
    }))

    setUserRoles([...updatedUserRoles, ...newUserRoles])

    const warningMessage = conflictResult.hasConflicts && forceAssignment ? " (권한 충돌 경고 무시됨)" : ""

    toast({
      title: "역할 할당 완료",
      description: `${selectedUser.name} 사용자의 역할이 업데이트되었습니다.${warningMessage}`,
    })

    setIsRoleAssignmentModalOpen(false)
    setForceAssignment(false)
  }

  const handleEditPermission = (permission: any) => {
    setEditingPermission(permission)
    setNewPermission({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
    })
    setIsEditPermissionModalOpen(true)
  }

  const handleUpdatePermission = () => {
    if (!editingPermission) return

    toast({
      title: "권한 수정 완료",
      description: `${newPermission.name} 권한이 수정되었습니다.`,
    })
    setIsEditPermissionModalOpen(false)
    setEditingPermission(null)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setEditRoleData({
      displayName: role.displayName,
      description: role.description,
      level: role.level,
      permissions: [...role.permissions],
      isActive: role.isActive,
    })
    setIsEditRoleModalOpen(true)
  }

  const handleUpdateRole = () => {
    if (!editingRole) return

    toast({
      title: "역할 수정 완료",
      description: `${editRoleData.displayName} 역할이 수정되었습니다.`,
    })
    setIsEditRoleModalOpen(false)
    setEditingRole(null)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="shield" size="sm" className="h-6 w-6" />
        <h1 className="text-2xl font-bold">권한 관리</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="permissions">권한</TabsTrigger>
          <TabsTrigger value="roles">역할</TabsTrigger>
          <TabsTrigger value="assignments">사용자 할당</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 권한</CardTitle>
                <Icon name="key" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPermissions.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 역할</CardTitle>
                <Icon name="shield" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockRoles.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
                <Icon name="group" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUsers.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">역할 할당</CardTitle>
                <Icon name="settings" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userRoles.filter((ur) => ur.isActive).length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>역할별 권한 분포</CardTitle>
              <CardDescription>각 역할에 할당된 권한 수를 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRoles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={role.level === 1 ? "default" : "secondary"}>Level {role.level}</Badge>
                      <div>
                        <h4 className="font-medium">{role.displayName}</h4>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{role.permissions.length}</div>
                      <div className="text-sm text-muted-foreground">권한</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>권한 관리</CardTitle>
                  <CardDescription>시스템 권한을 관리합니다</CardDescription>
                </div>
                <PermissionGuard permission={{ resource: "SYSTEM", action: "CREATE" }}>
                  <Button onClick={() => setIsPermissionModalOpen(true)}>
                    <Icon name="add" size="sm" className="mr-2" />새 권한
                  </Button>
                </PermissionGuard>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Input
                  placeholder="권한 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>권한명</TableHead>
                    <TableHead>리소스</TableHead>
                    <TableHead>액션</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-mono text-sm">{permission.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.resource}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{permission.action}</Badge>
                      </TableCell>
                      <TableCell>{permission.description}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <PermissionGuard permission={{ resource: "SYSTEM", action: "UPDATE" }}>
                            <Button variant="ghost" size="sm" onClick={() => handleEditPermission(permission)}>
                              <Icon name="edit" size="sm" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard permission={{ resource: "SYSTEM", action: "DELETE" }}>
                            <Button variant="ghost" size="sm">
                              <Icon name="delete" size="sm" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>역할 관리</CardTitle>
                  <CardDescription>시스템 역할을 관리합니다</CardDescription>
                </div>
                <PermissionGuard permission={{ resource: "SYSTEM", action: "CREATE" }}>
                  <Button onClick={() => router.push("/system/permissions/roles")}>
                    <Icon name="add" size="sm" className="mr-2" />새 역할
                  </Button>
                </PermissionGuard>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Input
                  placeholder="역할 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>역할명</TableHead>
                    <TableHead>레벨</TableHead>
                    <TableHead>권한 수</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.displayName}</TableCell>
                      <TableCell>
                        <Badge variant={role.level === 1 ? "default" : "secondary"}>Level {role.level}</Badge>
                      </TableCell>
                      <TableCell>{role.permissions.length}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <Badge variant={role.isActive ? "default" : "secondary"}>
                          {role.isActive ? "활성" : "비활성"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <PermissionGuard permission={{ resource: "SYSTEM", action: "UPDATE" }}>
                            <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                              <Icon name="edit" size="sm" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard permission={{ resource: "SYSTEM", action: "DELETE" }}>
                            <Button variant="ghost" size="sm">
                              <Icon name="delete" size="sm" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>사용자 역할 할당</CardTitle>
              <CardDescription>사용자에게 역할을 할당하고 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>부서</TableHead>
                    <TableHead>할당된 역할</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => {
                    const userRolesList = getUserRoles(user.id)

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {userRolesList.map((role) => (
                              <Badge key={role.id} variant="outline" className="text-xs">
                                {role.displayName}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <PermissionGuard permission={{ resource: "USERS", action: "UPDATE" }}>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleAssignRole(user)}>
                                <Icon name="edit" size="sm" className="mr-1" />
                                역할 할당
                              </Button>

                              <div className="relative group">
                                <Button variant="secondary" size="sm">
                                  빠른 할당
                                </Button>
                                <div className="absolute z-10 right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                                  {mockRoles.map((role) => (
                                    <button
                                      key={role.id}
                                      className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                                      onClick={() => handleQuickAssign(user, role.id)}
                                    >
                                      {role.displayName}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </PermissionGuard>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 새 권한 생성 다이얼로그 */}
      <Dialog open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>새 권한 생성</DialogTitle>
            <DialogDescription>
              새로운 시스템 권한을 생성합니다. 권한은 리소스와 액션의 조합으로 구성됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                권한명
              </Label>
              <Input
                id="name"
                value={newPermission.name}
                onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resource" className="text-right">
                리소스
              </Label>
              <Input
                id="resource"
                value={newPermission.resource}
                onChange={(e) => setNewPermission({ ...newPermission, resource: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="action" className="text-right">
                액션
              </Label>
              <Input
                id="action"
                value={newPermission.action}
                onChange={(e) => setNewPermission({ ...newPermission, action: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                설명
              </Label>
              <Input
                id="description"
                value={newPermission.description}
                onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionModalOpen(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "권한 생성 완료",
                  description: `${newPermission.name} 권한이 생성되었습니다.`,
                })
                setIsPermissionModalOpen(false)
              }}
            >
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 권한 편집 다이얼로그 */}
      <Dialog open={isEditPermissionModalOpen} onOpenChange={setIsEditPermissionModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>권한 편집</DialogTitle>
            <DialogDescription>
              기존 권한 정보를 수정합니다. 권한은 리소스와 액션의 조합으로 구성됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                권한명
              </Label>
              <Input
                id="edit-name"
                value={newPermission.name}
                onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-resource" className="text-right">
                리소스
              </Label>
              <Input
                id="edit-resource"
                value={newPermission.resource}
                onChange={(e) => setNewPermission({ ...newPermission, resource: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-action" className="text-right">
                액션
              </Label>
              <Input
                id="edit-action"
                value={newPermission.action}
                onChange={(e) => setNewPermission({ ...newPermission, action: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                설명
              </Label>
              <Input
                id="edit-description"
                value={newPermission.description}
                onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPermissionModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdatePermission}>수정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 사용자 역할 할당 다이얼로그 */}
      <Dialog open={isRoleAssignmentModalOpen} onOpenChange={setIsRoleAssignmentModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>사용자 역할 할당</DialogTitle>
            <DialogDescription>{selectedUser?.name} 사용자에게 할당할 역할을 선택하세요.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <Label className="text-sm font-medium">사용자 정보</Label>
              {selectedUser && (
                <div className="flex items-center gap-3 mt-2 p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{selectedUser.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                    <div className="text-xs text-muted-foreground">{selectedUser.department}</div>
                  </div>
                </div>
              )}
            </div>

            {/* 권한 충돌 경고 */}
            {showConflictWarning && (
              <div className="mb-4 space-y-2">
                <Label className="text-sm font-medium text-red-600">⚠️ 권한 충돌 감지</Label>
                {conflictResult.conflicts.map((conflict, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border ${getConflictSeverityColor(conflict.rule.severity)}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{getConflictIcon(conflict.rule.severity)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{conflict.rule.name}</div>
                        <div className="text-sm mt-1">{conflict.rule.description}</div>
                        {conflict.rule.suggestion && (
                          <div className="text-xs mt-2 font-medium">💡 제안: {conflict.rule.suggestion}</div>
                        )}
                        <div className="text-xs mt-2">
                          충돌 역할: {conflict.conflictingRoles.map((r) => r.displayName).join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 강제 할당 옵션 */}
                {!conflictResult.conflicts.some((c) => c.rule.severity === "critical") && (
                  <div className="flex items-center space-x-2 mt-3 p-2 bg-gray-50 rounded-md">
                    <input
                      type="checkbox"
                      id="force-assignment"
                      checked={forceAssignment}
                      onChange={(e) => setForceAssignment(e.target.checked)}
                    />
                    <label htmlFor="force-assignment" className="text-sm cursor-pointer">
                      경고를 무시하고 강제로 할당 (권장하지 않음)
                    </label>
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <Label className="text-sm font-medium">역할 선택</Label>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {mockRoles.map((role) => (
                  <div key={role.id} className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, role.id])
                        } else {
                          setSelectedRoles(selectedRoles.filter((id) => id !== role.id))
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor={`role-${role.id}`} className="font-medium cursor-pointer">
                        {role.displayName}
                      </label>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={role.level === 1 ? "default" : "secondary"} className="text-xs">
                          Level {role.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{role.permissions.length}개 권한</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 선택된 역할 요약 */}
            {selectedRoles.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Label className="text-sm font-medium text-blue-800">선택된 역할 요약</Label>
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-blue-700">총 {selectedRoles.length}개 역할 선택됨</div>
                  <div className="text-sm text-blue-700">
                    총 권한 수:{" "}
                    {mockRoles
                      .filter((r) => selectedRoles.includes(r.id))
                      .reduce((sum, role) => sum + role.permissions.length, 0)}
                    개
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedRoles.map((roleId) => {
                      const role = mockRoles.find((r) => r.id === roleId)
                      return role ? (
                        <Badge key={roleId} variant="outline" className="text-xs">
                          {role.displayName}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleAssignmentModalOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleSaveRoleAssignment}
              disabled={conflictResult.conflicts.some((c) => c.rule.severity === "critical") && !forceAssignment}
              variant={conflictResult.hasConflicts ? "destructive" : "default"}
            >
              {conflictResult.hasConflicts ? "경고 무시하고 저장" : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 역할 편집 다이얼로그 */}
      <Dialog open={isEditRoleModalOpen} onOpenChange={setIsEditRoleModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>역할 편집</DialogTitle>
            <DialogDescription>
              기존 역할 정보를 수정합니다. 역할명, 설명, 레벨 및 권한을 변경할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role-name" className="text-right">
                역할명
              </Label>
              <Input
                id="edit-role-name"
                value={editRoleData.displayName}
                onChange={(e) => setEditRoleData({ ...editRoleData, displayName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role-description" className="text-right">
                설명
              </Label>
              <Input
                id="edit-role-description"
                value={editRoleData.description}
                onChange={(e) => setEditRoleData({ ...editRoleData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role-level" className="text-right">
                레벨
              </Label>
              <select
                id="edit-role-level"
                value={editRoleData.level}
                onChange={(e) => setEditRoleData({ ...editRoleData, level: Number.parseInt(e.target.value) })}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value={1}>Level 1 - 최고 관리자</option>
                <option value={2}>Level 2 - 부서 관리자</option>
                <option value={3}>Level 3 - 팀장</option>
                <option value={4}>Level 4 - 작업자</option>
                <option value={5}>Level 5 - 조회자</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">권한 선택</Label>
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">시스템 권한</h4>
                    <div className="space-y-1">
                      {mockPermissions
                        .filter((p) => p.resource === "SYSTEM")
                        .map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit-perm-${permission.id}`}
                              checked={editRoleData.permissions.includes(permission.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditRoleData({
                                    ...editRoleData,
                                    permissions: [...editRoleData.permissions, permission.name],
                                  })
                                } else {
                                  setEditRoleData({
                                    ...editRoleData,
                                    permissions: editRoleData.permissions.filter((p) => p !== permission.name),
                                  })
                                }
                              }}
                            />
                            <label htmlFor={`edit-perm-${permission.id}`} className="text-sm cursor-pointer">
                              {permission.name} - {permission.description}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">설비 권한</h4>
                    <div className="space-y-1">
                      {mockPermissions
                        .filter((p) => p.resource === "EQUIPMENT")
                        .map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit-perm-${permission.id}`}
                              checked={editRoleData.permissions.includes(permission.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditRoleData({
                                    ...editRoleData,
                                    permissions: [...editRoleData.permissions, permission.name],
                                  })
                                } else {
                                  setEditRoleData({
                                    ...editRoleData,
                                    permissions: editRoleData.permissions.filter((p) => p !== permission.name),
                                  })
                                }
                              }}
                            />
                            <label htmlFor={`edit-perm-${permission.id}`} className="text-sm cursor-pointer">
                              {permission.name} - {permission.description}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">보전 권한</h4>
                    <div className="space-y-1">
                      {mockPermissions
                        .filter((p) => p.resource === "MAINTENANCE")
                        .map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit-perm-${permission.id}`}
                              checked={editRoleData.permissions.includes(permission.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditRoleData({
                                    ...editRoleData,
                                    permissions: [...editRoleData.permissions, permission.name],
                                  })
                                } else {
                                  setEditRoleData({
                                    ...editRoleData,
                                    permissions: editRoleData.permissions.filter((p) => p !== permission.name),
                                  })
                                }
                              }}
                            />
                            <label htmlFor={`edit-perm-${permission.id}`} className="text-sm cursor-pointer">
                              {permission.name} - {permission.description}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">점검 권한</h4>
                    <div className="space-y-1">
                      {mockPermissions
                        .filter((p) => p.resource === "INSPECTION")
                        .map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit-perm-${permission.id}`}
                              checked={editRoleData.permissions.includes(permission.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditRoleData({
                                    ...editRoleData,
                                    permissions: [...editRoleData.permissions, permission.name],
                                  })
                                } else {
                                  setEditRoleData({
                                    ...editRoleData,
                                    permissions: editRoleData.permissions.filter((p) => p !== permission.name),
                                  })
                                }
                              }}
                            />
                            <label htmlFor={`edit-perm-${permission.id}`} className="text-sm cursor-pointer">
                              {permission.name} - {permission.description}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-role-active"
                checked={editRoleData.isActive}
                onChange={(e) => setEditRoleData({ ...editRoleData, isActive: e.target.checked })}
              />
              <label htmlFor="edit-role-active" className="text-sm cursor-pointer">
                활성 상태
              </label>
            </div>

            {editRoleData.permissions.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Label className="text-sm font-medium text-blue-800">선택된 권한 요약</Label>
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-blue-700">총 {editRoleData.permissions.length}개 권한 선택됨</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editRoleData.permissions.map((permName) => (
                      <Badge key={permName} variant="outline" className="text-xs">
                        {permName}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateRole}>수정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
