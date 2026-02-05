"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import type { KpiMetrics, EquipmentHealth } from "@fms/types"

interface KpiChartsProps {
  isOpen: boolean
  onClose: () => void
  metrics: KpiMetrics[]
  equipmentHealth: EquipmentHealth[]
}

export function KpiCharts({ isOpen, onClose, metrics, equipmentHealth }: KpiChartsProps) {
  // 월별 트렌드 데이터
  const getMonthlyTrendData = () => {
    const monthlyData = metrics.reduce(
      (acc, metric) => {
        if (!acc[metric.period]) {
          acc[metric.period] = {
            period: metric.period,
            mtbf: 0,
            mttr: 0,
            availability: 0,
            oee: 0,
            count: 0,
          }
        }

        acc[metric.period].mtbf += metric.mtbf
        acc[metric.period].mttr += metric.mttr
        acc[metric.period].availability += metric.availability
        acc[metric.period].oee += metric.oee
        acc[metric.period].count += 1

        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(monthlyData)
      .map((data: any) => ({
        period: data.period,
        mtbf: Math.round(data.mtbf / data.count),
        mttr: Math.round((data.mttr / data.count) * 10) / 10,
        availability: Math.round((data.availability / data.count) * 10) / 10,
        oee: Math.round((data.oee / data.count) * 10) / 10,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }

  // 설비별 성능 비교 데이터
  const getEquipmentComparisonData = () => {
    const latestPeriod = "2024-01"
    return metrics
      .filter((m) => m.period === latestPeriod)
      .map((metric) => ({
        name: metric.equipmentName,
        mtbf: metric.mtbf,
        mttr: metric.mttr,
        availability: metric.availability,
        oee: metric.oee,
        healthScore: metric.healthScore,
      }))
  }

  // MTBF vs MTTR 산점도 데이터
  const getScatterData = () => {
    const latestPeriod = "2024-01"
    return metrics
      .filter((m) => m.period === latestPeriod)
      .map((metric) => ({
        x: metric.mtbf,
        y: metric.mttr,
        name: metric.equipmentName,
        healthScore: metric.healthScore,
      }))
  }

  // 설비 건강점수 레이더 차트 데이터
  const getRadarData = () => {
    return equipmentHealth.map((equipment) => ({
      equipment: equipment.equipmentName,
      신뢰도: equipment.factors.reliability,
      가동률: equipment.factors.availability,
      보전성: equipment.factors.maintainability,
      성능: equipment.factors.performance,
    }))
  }

  const monthlyTrendData = getMonthlyTrendData()
  const equipmentComparisonData = getEquipmentComparisonData()
  const scatterData = getScatterData()
  const radarData = getRadarData()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KPI 상세 분석 차트</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">트렌드 분석</TabsTrigger>
            <TabsTrigger value="comparison">설비 비교</TabsTrigger>
            <TabsTrigger value="correlation">상관관계</TabsTrigger>
            <TabsTrigger value="health">건강점수</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>MTBF & MTTR 트렌드</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="mtbf" stroke="#8884d8" name="MTBF (시간)" />
                      <Line yAxisId="right" type="monotone" dataKey="mttr" stroke="#82ca9d" name="MTTR (시간)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>가동률 & OEE 트렌드</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="availability"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                        name="가동률 (%)"
                      />
                      <Area
                        type="monotone"
                        dataKey="oee"
                        stackId="2"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.6}
                        name="OEE (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>설비별 MTBF 비교</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={equipmentComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="mtbf" fill="#8884d8" name="MTBF (시간)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>설비별 가동률 비교</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={equipmentComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="availability" fill="#82ca9d" name="가동률 (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>MTBF vs MTTR 상관관계</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={scatterData}>
                    <CartesianGrid />
                    <XAxis dataKey="x" name="MTBF" unit="시간" />
                    <YAxis dataKey="y" name="MTTR" unit="시간" />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value, name) => [value, name === "x" ? "MTBF" : "MTTR"]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return `${payload[0].payload.name}`
                        }
                        return ""
                      }}
                    />
                    <Scatter dataKey="y" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>설비 건강점수 레이더 차트</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <RadarChart data={radarData[0] ? [radarData[0]] : []}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="equipment" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="신뢰도" dataKey="신뢰도" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="가동률" dataKey="가동률" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Radar name="보전성" dataKey="보전성" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                    <Radar name="성능" dataKey="성능" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
