/**
 * @file apps/web/components/user/tabs/role-tab.tsx
 * @description 역할 탭 - 역할 목록 및 관리
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card";
import { Button } from "@fms/ui/button";
import { Input } from "@fms/ui/input";
import { Label } from "@fms/ui/label";
import { Textarea } from "@fms/ui/textarea";
import { Badge } from "@fms/ui/badge";
import { Checkbox } from "@fms/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/hooks/use-toast";

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

const initialRoles: Role[] = [
  {
    id: "role-1",
    name: "SYSTEM_ADMIN",
    displayName: "시스템 관리자",
    description: "모든 시스템 기능에 접근 가능",
    level: 1,
    permissions: ["SYSTEM_ALL", "EQUIPMENT_ALL", "MAINTENANCE_ALL"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "role-2",
    name: "EQUIPMENT_ADMIN",
    displayName: "설비 관리자",
    description: "설비 관련 모든 기능에 접근 가능",
    level: 2,
    permissions: ["EQUIPMENT_ALL", "MAINTENANCE_READ"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "role-3",
    name: "MAINTENANCE_ADMIN",
    displayName: "보전 관리자",
    description: "보전 작업 관련 모든 기능에 접근 가능",
    level: 2,
    permissions: ["MAINTENANCE_ALL", "EQUIPMENT_READ"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "role-4",
    name: "OPERATOR",
    displayName: "작업자",
    description: "일상 작업 및 기본 정보 접근 가능",
    level: 4,
    permissions: ["EQUIPMENT_READ", "MAINTENANCE_READ", "INSPECTION_READ"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const availablePermissions = [
  { id: "SYSTEM_ALL", name: "시스템 전체", group: "시스템" },
  { id: "EQUIPMENT_ALL", name: "설비 전체", group: "설비" },
  { id: "EQUIPMENT_READ", name: "설비 조회", group: "설비" },
  { id: "MAINTENANCE_ALL", name: "보전 전체", group: "보전" },
  { id: "MAINTENANCE_READ", name: "보전 조회", group: "보전" },
  { id: "INSPECTION_ALL", name: "점검 전체", group: "점검" },
  { id: "INSPECTION_READ", name: "점검 조회", group: "점검" },
];

export function RoleTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    level: 5,
    permissions: [] as string[],
    isActive: true,
  });

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "all" || role.level.toString() === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1: return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 2: return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case 3: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 4: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return "시스템관리자";
      case 2: return "부서관리자";
      case 3: return "팀장";
      case 4: return "작업자";
      case 5: return "조회자";
      default: return "기타";
    }
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setFormData({
      name: "",
      displayName: "",
      description: "",
      level: 5,
      permissions: [],
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      level: role.level,
      permissions: [...role.permissions],
      isActive: role.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleCopyRole = (role: Role) => {
    setSelectedRole(null);
    setFormData({
      name: `${role.name}_COPY`,
      displayName: `${role.displayName} (복사본)`,
      description: role.description,
      level: role.level,
      permissions: [...role.permissions],
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRole = () => {
    if (roleToDelete) {
      setRoles(roles.filter((role) => role.id !== roleToDelete.id));
      toast({ title: "성공", description: `${roleToDelete.displayName} 역할이 삭제되었습니다.` });
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleSaveRole = () => {
    if (!formData.name || !formData.displayName) {
      toast({ title: "오류", description: "역할명과 표시명은 필수 입력 항목입니다.", variant: "destructive" });
      return;
    }

    const roleData: Role = {
      id: selectedRole?.id || `role-${Date.now()}`,
      name: formData.name,
      displayName: formData.displayName,
      description: formData.description,
      level: formData.level,
      permissions: formData.permissions,
      isActive: formData.isActive,
      createdAt: selectedRole?.createdAt || new Date().toISOString(),
    };

    if (selectedRole) {
      setRoles(roles.map((role) => (role.id === selectedRole.id ? roleData : role)));
      toast({ title: "성공", description: `${roleData.displayName} 역할이 수정되었습니다.` });
    } else {
      setRoles([...roles, roleData]);
      toast({ title: "성공", description: `${roleData.displayName} 역할이 생성되었습니다.` });
    }

    setIsDialogOpen(false);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>역할 관리</CardTitle>
              <CardDescription>시스템 역할을 생성하고 권한을 할당합니다.</CardDescription>
            </div>
            <Button onClick={handleCreateRole}>
              <Icon name="add" size="sm" className="mr-2" />
              새 역할 생성
            </Button>
          </div>
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
                    <Button variant="outline" size="sm" onClick={() => handleCopyRole(role)}>
                      <Icon name="content_copy" size="sm" className="mr-1" />
                      복사
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                      <Icon name="edit" size="sm" className="mr-1" />
                      편집
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRole(role)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Icon name="delete" size="sm" className="mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {filteredRoles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                역할이 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 역할 생성/편집 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRole ? "역할 편집" : "새 역할 생성"}</DialogTitle>
            <DialogDescription>역할 정보를 입력하고 권한을 선택하세요.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">권한 레벨</Label>
                <Select
                  value={formData.level.toString()}
                  onValueChange={(value) => setFormData({ ...formData, level: parseInt(value) })}
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
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                  />
                  <Label htmlFor="isActive">활성 상태</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>권한 선택 ({formData.permissions.length}개 선택됨)</Label>
              <Card className="p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <Label htmlFor={permission.id} className="text-sm cursor-pointer">
                        [{permission.group}] {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
            <Button onClick={handleSaveRole}>{selectedRole ? "수정" : "생성"}</Button>
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
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>취소</Button>
            <Button variant="destructive" onClick={confirmDeleteRole}>삭제</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
