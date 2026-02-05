/**
 * @file apps/web/components/user/user-management.tsx
 * @description 사용자 관리 컴포넌트 - 사용자, 권한, 역할 탭 통합
 */

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs";
import { Icon } from "@/components/ui/Icon";
import { useTranslation } from "@/lib/language-context";
import { UserTab } from "./tabs/user-tab";
import { PermissionTab } from "./tabs/permission-tab";
import { RoleTab } from "./tabs/role-tab";

export function UserManagement() {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">사용자 관리</h1>
        <p className="text-sm text-text-secondary mt-1">
          사용자, 권한, 역할을 통합 관리합니다.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Icon name="group" size="sm" />
            사용자
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Icon name="key" size="sm" />
            권한
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Icon name="shield" size="sm" />
            역할
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserTab />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionTab />
        </TabsContent>

        <TabsContent value="roles">
          <RoleTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
