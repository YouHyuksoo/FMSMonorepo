/**
 * @file apps/web/components/sensor/sensor-register-form.tsx
 * @description 센서 등록 폼 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 새로운 센서를 등록하기 위한 폼 컴포넌트
 * 2. **사용 방법**: SensorRegisterForm 컴포넌트를 페이지에 배치
 * 3. **기능**: 센서 기본 정보, 연결 설정, 임계값 설정 입력
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { Textarea } from "@fms/ui/textarea"

export function SensorRegisterForm() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">센서 등록</h2>
          <p className="text-muted-foreground">새로운 센서를 등록하세요.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>센서 정보</CardTitle>
            <CardDescription>센서의 기본 정보를 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sensorId">센서 ID</Label>
                <Input id="sensorId" placeholder="센서 ID를 입력하세요" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sensorName">센서 이름</Label>
                <Input id="sensorName" placeholder="센서 이름을 입력하세요" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sensorType">센서 유형</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="센서 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temperature">온도</SelectItem>
                    <SelectItem value="humidity">습도</SelectItem>
                    <SelectItem value="pressure">압력</SelectItem>
                    <SelectItem value="vibration">진동</SelectItem>
                    <SelectItem value="current">전류</SelectItem>
                    <SelectItem value="voltage">전압</SelectItem>
                    <SelectItem value="power">전력</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sensorGroup">센서 그룹</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="그룹을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group1">1공장</SelectItem>
                    <SelectItem value="group2">2공장</SelectItem>
                    <SelectItem value="group3">3공장</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">설치 위치</Label>
              <Input id="location" placeholder="설치 위치를 입력하세요" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea id="description" placeholder="센서에 대한 설명을 입력하세요" className="min-h-[100px]" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>연결 설정</CardTitle>
              <CardDescription>센서의 연결 정보를 설정하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="connectionType">연결 유형</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="연결 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wifi">Wi-Fi</SelectItem>
                    <SelectItem value="ethernet">유선</SelectItem>
                    <SelectItem value="lora">LoRa</SelectItem>
                    <SelectItem value="modbus">Modbus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipAddress">IP 주소</Label>
                <Input id="ipAddress" placeholder="192.168.0.1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">포트</Label>
                <Input id="port" placeholder="502" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pollingInterval">폴링 간격 (초)</Label>
                <Input id="pollingInterval" type="number" min="1" defaultValue="10" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>임계값 설정</CardTitle>
              <CardDescription>경고 및 알림을 위한 임계값을 설정하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minValue">최소값</Label>
                  <Input id="minValue" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxValue">최대값</Label>
                  <Input id="maxValue" type="number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">단위</Label>
                <Input id="unit" placeholder="°C, %, kPa 등" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline">취소</Button>
            <Button>저장</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
