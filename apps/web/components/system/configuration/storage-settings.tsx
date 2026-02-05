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

export function StorageSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>파일 저장소 설정</CardTitle>
        <CardDescription>
          업로드된 파일의 저장 위치를 설정합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="size-2 rounded-full bg-primary" />
            <Label className="font-medium text-base">
              로컬 서버 저장소
            </Label>
          </div>
          <div className="pl-5 space-y-2">
            <Label htmlFor="local-path" className="text-sm text-muted-foreground">저장 경로</Label>
            <Input id="local-path" defaultValue="/var/fms/uploads" readOnly className="bg-muted" />
          </div>
        </div>
        <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground text-center">
          파일 저장소는 서버 로컬 디렉토리를 사용하도록 설정되어 있습니다.
        </div>
      </CardContent>
    </Card>
  );
}
