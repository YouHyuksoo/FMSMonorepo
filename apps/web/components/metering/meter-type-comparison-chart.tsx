"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import type { MeterReading } from "@fms/types"
import { meterTypeLabels } from "@fms/types"

interface MeterTypeComparisonChartProps {
  data: MeterReading[]
}

export function MeterTypeComparisonChart({ data }: MeterTypeComparisonChartProps) {
  // 계측기 유형별 통계 계산
  const chartData = Object.entries(meterTypeLabels)
    .map(([type, label]) => {
      const typeData = data.filter((reading) => reading.meterType === type)
      const totalConsumption = typeData.reduce((sum, reading) => sum + reading.consumption, 0)
      const totalCost = typeData.reduce((sum, reading) => sum + reading.cost, 0)
      const readingCount = typeData.length
      const avgConsumption = readingCount > 0 ? totalConsumption / readingCount : 0

      return {
        type: label,
        totalConsumption,
        totalCost,
        readingCount,
        avgConsumption,
      }
    })
    .filter((item) => item.readingCount > 0) // 데이터가 있는 유형만 표시

  return (
    <Card>
      <CardHeader>
        <CardTitle>계측기 유형별 비교</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="consumption" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="consumption">총 사용량</TabsTrigger>
            <TabsTrigger value="cost">총 비용</TabsTrigger>
            <TabsTrigger value="average">평균 사용량</TabsTrigger>
          </TabsList>

          <TabsContent value="consumption" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} 단위`, "총 사용량"]} />
                <Bar dataKey="totalConsumption" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="cost" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => [`₩${Number(value).toLocaleString()}`, "총 비용"]} />
                <Bar dataKey="totalCost" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="average" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} 단위`, "평균 사용량"]} />
                <Bar dataKey="avgConsumption" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
