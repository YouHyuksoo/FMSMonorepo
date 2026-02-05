/**
 * @file apps/web/components/user/tabs/user-tab.tsx
 * @description 사용자 탭 - 사용자 목록 및 관리
 */

"use client";

import { useState, useEffect } from "react";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table";
import { UserForm } from "../user-form";
import { ImportExportDialog } from "@/components/common/import-export-dialog";
import { Badge } from "@fms/ui/badge";
import { Button } from "@fms/ui/button";
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
import { useCrudState } from "@/hooks/use-crud-state";
import type { User, UserFormData } from "@fms/types";
import type { ExportColumn } from "@/lib/utils/export-utils";
import type { ImportColumn } from "@/lib/utils/import-utils";
import { useTranslation } from "@/lib/language-context";

export function UserTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { toast } = useToast();
  const { t } = useTranslation("common");
  const crud = useCrudState<User>();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUsers([]);
    } catch (error) {
      toast({
        title: "오류",
        description: "사용자 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, isActive: !u.isActive, updatedAt: new Date().toISOString(), updatedBy: "current-user" }
            : u
        )
      );
      toast({
        title: "성공",
        description: `사용자가 ${user.isActive ? "비활성화" : "활성화"}되었습니다.`,
      });
    } catch (error) {
      toast({ title: "오류", description: "사용자 상태 변경에 실패했습니다.", variant: "destructive" });
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast({ title: "성공", description: `${user.name}님의 비밀번호가 초기화되었습니다.` });
    } catch (error) {
      toast({ title: "오류", description: "비밀번호 초기화에 실패했습니다.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!crud.itemToDelete) return;
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers((prev) => prev.filter((user) => user.id !== crud.itemToDelete?.id));
      toast({ title: "성공", description: "사용자가 삭제되었습니다." });
    } catch (error) {
      toast({ title: "오류", description: "사용자 삭제에 실패했습니다.", variant: "destructive" });
    } finally {
      crud.setDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      if (crud.formMode === "create") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const newUser: User = {
          id: Date.now().toString(),
          ...data,
          company: "",
          department: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "current-user",
          updatedBy: "current-user",
        };
        setUsers((prev) => [...prev, newUser]);
        toast({ title: "성공", description: "사용자가 추가되었습니다." });
      } else if (crud.formMode === "edit") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setUsers((prev) =>
          prev.map((user) =>
            user.id === crud.selectedItem?.id
              ? { ...user, ...data, updatedAt: new Date().toISOString(), updatedBy: "current-user" }
              : user
          )
        );
        toast({ title: "성공", description: "사용자 정보가 수정되었습니다." });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: `사용자 ${crud.formMode === "create" ? "추가" : "수정"}에 실패했습니다.`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleImportComplete = async (importedData: User[]) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const processedUsers = importedData.map((userData, index) => ({
        ...userData,
        id: (Date.now() + index).toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "current-user",
        updatedBy: "current-user",
      }));
      setUsers((prev) => [...prev, ...processedUsers]);
      toast({ title: "성공", description: `${importedData.length}명의 사용자가 가져오기 되었습니다.` });
    } catch (error) {
      toast({ title: "오류", description: "사용자 데이터 가져오기에 실패했습니다.", variant: "destructive" });
      throw error;
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "admin": return t("user.level.admin");
      case "manager": return t("user.level.manager");
      case "user": return t("user.level.user");
      case "viewer": return t("user.level.viewer");
      default: return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "admin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "manager": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "user": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "viewer": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      title: "사용자",
      width: "minmax(180px, 1fr)",
      searchable: true,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {record.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-text-secondary">{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      title: "이메일",
      width: "minmax(180px, 1fr)",
      searchable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Icon name="mail" size="sm" className="text-text-secondary" />
          <span>{record.email}</span>
        </div>
      ),
    },
    {
      key: "level",
      title: "레벨",
      width: "110px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "관리자", value: "admin" },
        { label: "매니저", value: "manager" },
        { label: "사용자", value: "user" },
        { label: "뷰어", value: "viewer" },
      ],
      render: (_, record) => (
        <div className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getLevelColor(record.level)}`}>
          {getLevelLabel(record.level)}
        </div>
      ),
    },
    {
      key: "department",
      title: "부서",
      width: "150px",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.department}</div>
          <div className="text-xs text-text-secondary">{record.position}</div>
        </div>
      ),
    },
    {
      key: "isActive",
      title: "상태",
      width: "90px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "활성", value: "true" },
        { label: "비활성", value: "false" },
      ],
      render: (_, record) => (
        <Badge variant={record.isActive ? "default" : "secondary"}>
          {record.isActive ? "활성" : "비활성"}
        </Badge>
      ),
    },
  ];

  const rowActions: DataTableAction<User>[] = [
    { key: "view", label: t("common.view"), iconName: "visibility", onClick: (record) => crud.handleView(record) },
    { key: "edit", label: t("common.edit"), iconName: "edit", onClick: (record) => crud.handleEdit(record) },
    { key: "toggle", label: "활성/비활성", iconName: "person_off", onClick: (record) => handleToggleActive(record) },
    { key: "resetPassword", label: "비밀번호 초기화", iconName: "key", onClick: (record) => handleResetPassword(record) },
    { key: "delete", label: t("common.delete"), iconName: "delete", variant: "destructive", onClick: (record) => crud.handleDelete(record), hidden: (record) => record.level === "admin" },
  ];

  const exportColumns: ExportColumn[] = [
    { key: "username", title: "사용자ID", width: 15 },
    { key: "name", title: "이름", width: 15 },
    { key: "email", title: "이메일", width: 25 },
    { key: "level", title: "레벨", width: 10, format: (value) => getLevelLabel(value) },
    { key: "department", title: "부서", width: 20 },
    { key: "isActive", title: "활성상태", width: 10, format: (value) => (value ? "Y" : "N") },
  ];

  const importColumns: ImportColumn[] = [
    { key: "username", title: "사용자ID", required: true, type: "string" },
    { key: "name", title: "이름", required: true, type: "string" },
    { key: "email", title: "이메일", required: true, type: "email" },
    { key: "level", title: "레벨", required: true, type: "string" },
    { key: "department", title: "부서", required: true, type: "string" },
    { key: "isActive", title: "활성상태", type: "boolean" },
  ];

  const sampleData: Partial<User>[] = [
    { username: "sample_user", name: "샘플사용자", email: "sample@company.com", level: "user" as const, department: "생산1팀", isActive: true },
  ];

  const HeaderRight = () => (
    <div className="flex items-center gap-2">
      <Button onClick={() => crud.setImportExportOpen(true)} variant="outline">
        <Icon name="upload_file" size="sm" className="mr-2" />
        가져오기/내보내기
      </Button>
      <Button onClick={crud.handleAdd}>
        <Icon name="add" size="sm" className="mr-2" />
        사용자 추가
      </Button>
    </div>
  );

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        actions={rowActions}
        loading={loading}
        headerRight={<HeaderRight />}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="이름, 사용자ID, 이메일로 검색..."
        pagination={{
          page: currentPage,
          pageSize,
          total: users.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <UserForm
        open={crud.formOpen}
        onOpenChange={crud.setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={crud.selectedItem ?? undefined}
        mode={crud.formMode}
      />

      <ImportExportDialog
        open={crud.importExportOpen}
        onOpenChange={crud.setImportExportOpen}
        title="사용자"
        exportColumns={exportColumns}
        importColumns={importColumns}
        exportData={selectedRows.length > 0 ? selectedRows : users}
        onImportComplete={handleImportComplete}
        exportOptions={{ filename: "users" }}
        sampleData={sampleData}
      />

      <Dialog open={crud.deleteDialogOpen} onOpenChange={crud.setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 삭제</DialogTitle>
            <DialogDescription>
              "{crud.itemToDelete?.name}" 사용자를 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => crud.setDeleteDialogOpen(false)}>취소</Button>
            <Button variant="destructive" onClick={confirmDelete}>삭제</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
