"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@fms/ui/card";
import { Label } from "@fms/ui/label";
import { RadioGroup, RadioGroupItem } from "@fms/ui/radio-group";
import { Input } from "@fms/ui/input";
import { Button } from "@fms/ui/button";

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
        <RadioGroup defaultValue="local" className="space-y-4">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="local" id="local-storage" />
            <Label htmlFor="local-storage" className="font-normal">
              로컬 서버 저장소
            </Label>
          </div>
          <div className="pl-7 space-y-2">
            <Label htmlFor="local-path">저장 경로</Label>
            <Input id="local-path" defaultValue="/var/fms/uploads" />
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="s3" id="s3-storage" />
            <Label htmlFor="s3-storage" className="font-normal">
              Amazon S3
            </Label>
          </div>
          <div className="pl-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="s3-bucket">버킷 이름</Label>
              <Input id="s3-bucket" placeholder="my-fms-bucket" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s3-region">리전</Label>
              <Input id="s3-region" placeholder="ap-northeast-2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s3-access-key">액세스 키</Label>
              <Input id="s3-access-key" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s3-secret-key">시크릿 키</Label>
              <Input id="s3-secret-key" type="password" />
            </div>
          </div>
        </RadioGroup>
        <div className="flex justify-end pt-2">
          <Button>저장</Button>
        </div>
      </CardContent>
    </Card>
  );
}
