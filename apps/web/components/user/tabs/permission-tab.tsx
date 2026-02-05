/**
 * @file apps/web/components/user/tabs/permission-tab.tsx
 * @description 권한 탭 - 권한 목록 및 관리
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card";
import { Button } from "@fms/ui/button";
import { Input } from "@fms/ui/input";
import { Badge } from "@fms/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@fms/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog";
import { Label } from "@fms/ui/label";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/hooks/use-toast";

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

const initialPermissions: Permission[] = [
  { id: "perm-1", name: "SYSTEM_ALL", resource: "SYSTEM", action: "ALL", description: "모든 시스템 기능" },
  { id: "perm-2", name: "EQUIPMENT_ALL", resource: "EQUIPMENT", action: "ALL", description: "모든 설비 기능" },
  { id: "perm-3", name: "MAINTENANCE_ALL", resource: "MAINTENANCE", action: "ALL", description: "모든 보전 기능" },
  { id: "perm-4", name: "INSPECTION_ALL", resource: "INSPECTION", action: "ALL", description: "모든 점검 기능" },
  { id: "perm-5", name: "EQUIPMENT_READ", resource: "EQUIPMENT", action: "READ", description: "설비 조회" },
  { id: "perm-6", name: "MAINTENANCE_READ", resource: "MAINTENANCE", action: "READ", description: "보전 조회" },
  { id: "perm-7", name: "INSPECTION_READ", resource: "INSPECTION", action: "READ", description: "점검 조회" },
];

export function PermissionTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [newPermission, setNewPermission] = useState({
    name: "",
    resource: "",
    action: "",
    description: "",
  });

  const filteredPermissions = permissions.filter(
    (perm) =>
      perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePermission = () => {
    if (!newPermission.name || !newPermission.resource || !newPermission.action) {
      toast({ title: "오류", description: "필수 항목을 입력해주세요.", variant: "destructive" });
      return;
    }

    const permission: Permission = {
      id: `perm-${Date.now()}`,
      ...newPermission,
    };

    setPermissions([...permissions, permission]);
    toast({ title: "성공", description: `${newPermission.name} 권한이 생성되었습니다.` });
    setIsCreateModalOpen(false);
    setNewPermission({ name: "", resource: "", action: "", description: "" });
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setNewPermission({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePermission = () => {
    if (!editingPermission) return;

    setPermissions(
      permissions.map((p) =>
        p.id === editingPermission.id ? { ...p, ...newPermission } : p
      )
    );

    toast({ title: "성공", description: `${newPermission.name} 권한이 수정되었습니다.` });
    setIsEditModalOpen(false);
    setEditingPermission(null);
    setNewPermission({ name: "", resource: "", action: "", description: "" });
  };

  const handleDeletePermission = (permission: Permission) => {
    setPermissions(permissions.filter((p) => p.id !== permission.id));
    toast({ title: "성공", description: `${permission.name} 권한이 삭제되었습니다.` });
  };

  const PermissionForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">권한명</Label>
        <Input
          id="name"
          value={newPermission.name}
          onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
          className="col-span-3"
          placeholder="PERMISSION_NAME"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="resource" className="text-right">리소스</Label>
        <Input
          id="resource"
          value={newPermission.resource}
          onChange={(e) => setNewPermission({ ...newPermission, resource: e.target.value })}
          className="col-span-3"
          placeholder="EQUIPMENT, MAINTENANCE, etc."
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="action" className="text-right">액션</Label>
        <Input
          id="action"
          value={newPermission.action}
          onChange={(e) => setNewPermission({ ...newPermission, action: e.target.value })}
          className="col-span-3"
          placeholder="READ, WRITE, ALL, etc."
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">설명</Label>
        <Input
          id="description"
          value={newPermission.description}
          onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
          className="col-span-3"
          placeholder="권한에 대한 설명"
        />
      </div>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>권한 관리</CardTitle>
              <CardDescription>시스템 권한을 관리합니다.</CardDescription>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Icon name="add" size="sm" className="mr-2" />
              새 권한
            </Button>
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
                <TableHead className="w-24">작업</TableHead>
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
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditPermission(permission)}>
                        <Icon name="edit" size="sm" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePermission(permission)}>
                        <Icon name="delete" size="sm" className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPermissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    권한이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 권한 생성 다이얼로그 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>새 권한 생성</DialogTitle>
            <DialogDescription>새로운 시스템 권한을 생성합니다.</DialogDescription>
          </DialogHeader>
          <PermissionForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>취소</Button>
            <Button onClick={handleCreatePermission}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 권한 편집 다이얼로그 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>권한 편집</DialogTitle>
            <DialogDescription>권한 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <PermissionForm isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>취소</Button>
            <Button onClick={handleUpdatePermission}>수정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
