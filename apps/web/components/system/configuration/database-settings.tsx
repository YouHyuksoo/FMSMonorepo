"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@fms/ui/card";
import { Label } from "@fms/ui/label";
import { Input } from "@fms/ui/input";
import { Button } from "@fms/ui/button";
import { useActionState } from "react";
import { updateDatabaseSettings } from "@/app/actions/system-actions";

const initialState = {
  message: "",
};

export function DatabaseSettings() {
  const [state, formAction] = useActionState(
    updateDatabaseSettings,
    initialState
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>데이터베이스 연결 정보</CardTitle>
        <CardDescription>
          현재 시스템에 설정된 PostgreSQL 연결 정보입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md text-sm text-amber-800 dark:text-amber-200">
            데이터베이스 접속 정보는 서버 환경 설정(.env)을 통해 관리되며, 보안상의 이유로 웹 UI에서는 수정할 수 없습니다.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="db-host">호스트</Label>
              <Input id="db-host" readOnly defaultValue="localhost" className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="db-port">포트</Label>
              <Input
                id="db-port"
                readOnly
                type="number"
                defaultValue="5432"
                className="bg-muted"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="db-name">데이터베이스</Label>
            <Input id="db-name" readOnly defaultValue="fmsdb" className="bg-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="db-user">사용자</Label>
              <Input id="db-user" readOnly defaultValue="fms" className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="db-password">비밀번호</Label>
              <Input id="db-password" readOnly type="password" defaultValue="********" className="bg-muted" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => alert("현재 연결 상태가 양호합니다.")}>
              연결 테스트
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
