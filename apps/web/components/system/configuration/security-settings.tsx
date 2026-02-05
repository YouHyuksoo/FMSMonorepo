"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@fms/ui/card";
import { Label } from "@fms/ui/label";
import { Switch } from "@fms/ui/switch";
import { Input } from "@fms/ui/input";
import { Button } from "@fms/ui/button";

export function SecuritySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>보안 설정</CardTitle>
        <CardDescription>
          시스템 접근 및 데이터 보안 관련 설정을 관리합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="two-factor-auth">2단계 인증(2FA)</Label>
            <span className="text-xs text-muted-foreground">
              로그인 시 추가적인 보안 계층을 위해 2단계 인증을 활성화합니다.
            </span>
          </div>
          <Switch id="two-factor-auth" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="session-timeout">세션 타임아웃 (분)</Label>
          <Input
            id="session-timeout"
            type="number"
            defaultValue={30}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            지정된 시간 동안 활동이 없으면 자동으로 로그아웃됩니다.
          </p>
        </div>
        <div className="space-y-2">
          <Label>비밀번호 정책</Label>
          <div className="p-4 border rounded-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">최소 길이</span>
              <Input type="number" defaultValue={8} className="w-20" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">대/소문자, 숫자, 특수문자 포함</span>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button>저장</Button>
        </div>
      </CardContent>
    </Card>
  );
}
