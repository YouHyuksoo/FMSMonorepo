/**
 * @file apps/web/components/metering/meter-reading-charts.tsx
 * @description 검침 데이터 분석 차트 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 검침 데이터를 다양한 차트로 시각화하여 분석
 * 2. **사용 방법**: /metering/analytics 경로에서 접근
 * 3. **탭 구성**:
 *    - 사용량 트렌드: 시간에 따른 사용량 변화
 *    - 유형별 비교: 계측기 유형별 사용량 비교
 *    - 비용 분석: 비용 관련 분석
 *    - 설비별 분석: 설비별 사용량 분석
 */

"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@fms/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { UsageTrendChart } from "./usage-trend-chart"
import { MeterTypeComparisonChart } from "./meter-type-comparison-chart"
import { CostAnalysisChart } from "./cost-analysis-chart"
import { EquipmentUsageChart } from "./equipment-usage-chart"
import type { MeterReading } from "@fms/types"
import { meterTypeLabels } from "@fms/types"

export function MeterReadingCharts() {
  const [timeRange, setTimeRange] = useState<string>("30")
  const [meterType, setMeterType] = useState<string>("all")
  const [meterReadings] = useState<MeterReading[]>([])

  // 시간 범위에 따라 데이터 필터링
  const filteredData = useMemo(() => {
    const today = new Date()
    const startDate = new Date(today)

    switch (timeRange) {
      case "7":
        startDate.setDate(today.getDate() - 7)
        break
      case "30":
        startDate.setDate(today.getDate() - 30)
        break
      case "90":
        startDate.setDate(today.getDate() - 90)
        break
      case "180":
        startDate.setDate(today.getDate() - 180)
        break
      case "365":
        startDate.setDate(today.getDate() - 365)
        break
      default:
        startDate.setDate(today.getDate() - 30)
    }

    let data = meterReadings.filter((reading) => {
      const readingDate = new Date(reading.readingDate)
      return readingDate >= startDate && readingDate <= today
    })

    // 계측기 유형에 따라 데이터 필터링
    if (meterType !== "all") {
      data = data.filter((reading) => reading.meterType === meterType)
    }

    return data
  }, [timeRange, meterType, meterReadings])

  // 필터 컨트롤
  const filterControls = (
    <div className="flex items-center gap-4">
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="기간 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">최근 7일</SelectItem>
          <SelectItem value="30">최근 30일</SelectItem>
          <SelectItem value="90">최근 90일</SelectItem>
          <SelectItem value="180">최근 180일</SelectItem>
          <SelectItem value="365">최근 1년</SelectItem>
        </SelectContent>
      </Select>
      <Select value={meterType} onValueChange={setMeterType}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="계측기 유형" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {Object.entries(meterTypeLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  // 탭 리스트
  const tabsList = (
    <TabsList>
      <TabsTrigger value="trends">사용량 트렌드</TabsTrigger>
      <TabsTrigger value="comparison">유형별 비교</TabsTrigger>
      <TabsTrigger value="cost">비용 분석</TabsTrigger>
      <TabsTrigger value="equipment">설비별 분석</TabsTrigger>
    </TabsList>
  )

  return (
    <div className="p-6">
      <Tabs defaultValue="trends" className="space-y-4">
        {/* 헤더 영역: TabsList + 필터 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {tabsList}
          {filterControls}
        </div>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>사용량 트렌드</CardTitle>
              <CardDescription>시간에 따른 에너지 사용량 변화를 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <UsageTrendChart data={filteredData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>유형별 비교</CardTitle>
              <CardDescription>계측기 유형별 사용량을 비교합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <MeterTypeComparisonChart data={filteredData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>비용 분석</CardTitle>
              <CardDescription>에너지 사용에 따른 비용을 분석합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <CostAnalysisChart data={filteredData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>설비별 분석</CardTitle>
              <CardDescription>설비별 에너지 사용량을 분석합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <EquipmentUsageChart data={filteredData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
