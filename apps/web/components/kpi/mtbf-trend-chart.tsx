"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { useState } from "react"
import type { MtbfTrend } from "@fms/types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
} from "recharts"

interface MtbfTrendChartProps {
  data: MtbfTrend[]
}

export function MtbfTrendChart({ data }: MtbfTrendChartProps) {
  const [chartType, setChartType] = useState<string>("line")
  const [metric, setMetric] = useState<string>("mtbf-mttr")

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              {metric === "mtbf-mttr" || metric === "mtbf" ? (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mtbf"
                  name="MTBF (시간)"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              ) : null}
              {metric === "mtbf-mttr" || metric === "mttr" ? (
                <Line yAxisId="right" type="monotone" dataKey="mttr" name="MTTR (시간)" stroke="#82ca9d" />
              ) : null}
              {metric === "availability" ? (
                <Line yAxisId="left" type="monotone" dataKey="availability" name="가동률 (%)" stroke="#ff7300" />
              ) : null}
              {metric === "reliability" ? (
                <Line yAxisId="left" type="monotone" dataKey="reliability" name="신뢰도 (%)" stroke="#0088fe" />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        )
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {metric === "mtbf-mttr" || metric === "mtbf" ? (
                <Bar dataKey="mtbf" name="MTBF (시간)" fill="#8884d8" />
              ) : null}
              {metric === "mtbf-mttr" || metric === "mttr" ? (
                <Bar dataKey="mttr" name="MTTR (시간)" fill="#82ca9d" />
              ) : null}
              {metric === "availability" ? <Bar dataKey="availability" name="가동률 (%)" fill="#ff7300" /> : null}
              {metric === "reliability" ? <Bar dataKey="reliability" name="신뢰도 (%)" fill="#0088fe" /> : null}
            </BarChart>
          </ResponsiveContainer>
        )
      case "composed":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="failureCount" name="고장 횟수" fill="#ff7300" />
              <Line yAxisId="right" type="monotone" dataKey="mtbf" name="MTBF (시간)" stroke="#8884d8" />
            </ComposedChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>MTBF/MTTR 추세 분석</CardTitle>
            <CardDescription>시간에 따른 MTBF/MTTR 변화 추이</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="차트 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">선 그래프</SelectItem>
                <SelectItem value="bar">막대 그래프</SelectItem>
                <SelectItem value="composed">복합 그래프</SelectItem>
              </SelectContent>
            </Select>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="지표 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtbf-mttr">MTBF & MTTR</SelectItem>
                <SelectItem value="mtbf">MTBF만</SelectItem>
                <SelectItem value="mttr">MTTR만</SelectItem>
                <SelectItem value="availability">가동률</SelectItem>
                <SelectItem value="reliability">신뢰도</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
}
