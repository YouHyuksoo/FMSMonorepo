"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import type { MeterReading } from "@fms/types"

interface CostAnalysisChartProps {
  data: MeterReading[]
}

export function CostAnalysisChart({ data }: CostAnalysisChartProps) {
  // 월별로 데이터를 그룹화
  const chartData = data
    .reduce(
      (acc, reading) => {
        const date = new Date(reading.readingDate)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const monthLabel = `${date.getFullYear()}년 ${date.getMonth() + 1}월`

        const existing = acc.find((item) => item.month === monthKey)

        if (existing) {
          existing.totalCost += reading.cost
          existing.avgCost = existing.totalCost / existing.count
          existing.count += 1
        } else {
          acc.push({
            month: monthKey,
            monthLabel,
            totalCost: reading.cost,
            avgCost: reading.cost,
            count: 1,
            sortDate: date.getTime(),
          })
        }
        return acc
      },
      [] as Array<{
        month: string
        monthLabel: string
        totalCost: number
        avgCost: number
        count: number
        sortDate: number
      }>,
    )
    .sort((a, b) => a.sortDate - b.sortDate)
    .slice(-12) // 최근 12개월 데이터만 표시

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 비용 분석</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                `₩${Number(value).toLocaleString()}`,
                name === "totalCost" ? "총 비용" : "평균 비용",
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="totalCost"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
              name="총 비용"
            />
            <Area
              type="monotone"
              dataKey="avgCost"
              stackId="2"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.6}
              name="평균 비용"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
