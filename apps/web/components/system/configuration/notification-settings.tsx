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
import { Button } from "@fms/ui/button";

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>시스템 알림 수신 방법을 설정합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="email-notifications">이메일 알림</Label>
            <span className="text-xs text-muted-foreground">
              주요 이벤트 발생 시 이메일로 알림을 받습니다.
            </span>
          </div>
          <Switch id="email-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="sms-notifications">SMS 알림</Label>
            <span className="text-xs text-muted-foreground">
              긴급 상황 발생 시 SMS로 알림을 받습니다.
            </span>
          </div>
          <Switch id="sms-notifications" />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="push-notifications">푸시 알림</Label>
            <span className="text-xs text-muted-foreground">
              모바일 앱을 통해 실시간 푸시 알림을 받습니다.
            </span>
          </div>
          <Switch id="push-notifications" defaultChecked />
        </div>
        <div className="flex justify-end pt-2">
          <Button>저장</Button>
        </div>
      </CardContent>
    </Card>
  );
}
