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
        <CardTitle>데이터베이스 연결 설정</CardTitle>
        <CardDescription>
          PostgreSQL 데이터베이스 연결 정보를 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="db-host">호스트</Label>
              <Input id="db-host" name="host" defaultValue="localhost" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="db-port">포트</Label>
              <Input
                id="db-port"
                name="port"
                type="number"
                defaultValue="5432"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="db-name">데이터베이스</Label>
            <Input id="db-name" name="database" defaultValue="fms" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="db-user">사용자</Label>
              <Input id="db-user" name="user" defaultValue="postgres" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="db-password">비밀번호</Label>
              <Input id="db-password" name="password" type="password" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline">
              연결 테스트
            </Button>
            <Button type="submit">저장</Button>
          </div>
          {state?.message && (
            <p className="text-sm text-muted-foreground pt-2">
              {state.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
