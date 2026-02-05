"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Badge } from "@fms/ui/badge"
import { Progress } from "@fms/ui/progress"
import { Icon } from "@fms/ui/icon"
import type { KpiMetric, EquipmentHealth } from "@fms/types"

export function KpiDashboard() {
  // KPI 데이터 (실제 API 연동 시 대체 필요)
  const kpiMetrics: KpiMetric[] = []
  const equipmentHealth: EquipmentHealth[] = []

  const totalEquipment = kpiMetrics.length || 1 // 0으로 나누기 방지
  const avgMtbf = kpiMetrics.reduce((sum, item) => sum + item.mtbf, 0) / totalEquipment
  const avgMttr = kpiMetrics.reduce((sum, item) => sum + item.mttr, 0) / totalEquipment
  const avgAvailability = kpiMetrics.reduce((sum, item) => sum + item.availability, 0) / totalEquipment
  const avgOee = kpiMetrics.reduce((sum, item) => sum + item.oee, 0) / totalEquipment

  const healthyEquipment = equipmentHealth.filter((eq) => eq.riskLevel === "low").length
  const warningEquipment = equipmentHealth.filter((eq) => eq.riskLevel === "medium").length
  const criticalEquipment = equipmentHealth.filter(
    (eq) => eq.riskLevel === "high" || eq.riskLevel === "critical",
  ).length

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <Icon name="trending_up" size="sm" className="text-green-500" />
      case "declining":
        return <Icon name="trending_down" size="sm" className="text-red-500" />
      default:
        return <Icon name="remove" size="sm" className="text-gray-500" />
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-orange-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">KPI 대시보드</h1>
        <Badge variant="outline">실시간 업데이트</Badge>
      </div>

      {/* 핵심 KPI 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 MTBF</CardTitle>
            <Icon name="trending_up" size="sm" className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMtbf.toFixed(1)}시간</div>
            <p className="text-xs text-muted-foreground">전월 대비 +5.2%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 MTTR</CardTitle>
            <Icon name="trending_down" size="sm" className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMttr.toFixed(1)}시간</div>
            <p className="text-xs text-muted-foreground">전월 대비 -8.3%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 가동률</CardTitle>
            <Icon name="check_circle" size="sm" className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAvailability.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">목표: 95.0%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 OEE</CardTitle>
            <Icon name="warning" size="sm" className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOee.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">목표: 85.0%</p>
          </CardContent>
        </Card>
      </div>

      {/* 설비 건강상태 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>설비 건강상태 요약</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">정상 ({healthyEquipment}대)</span>
              <div className="flex items-center space-x-2">
                <Progress value={(healthyEquipment / totalEquipment) * 100} className="w-20" />
                <span className="text-sm text-muted-foreground">
                  {((healthyEquipment / totalEquipment) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">주의 ({warningEquipment}대)</span>
              <div className="flex items-center space-x-2">
                <Progress value={(warningEquipment / totalEquipment) * 100} className="w-20" />
                <span className="text-sm text-muted-foreground">
                  {((warningEquipment / totalEquipment) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">위험 ({criticalEquipment}대)</span>
              <div className="flex items-center space-x-2">
                <Progress value={(criticalEquipment / totalEquipment) * 100} className="w-20" />
                <span className="text-sm text-muted-foreground">
                  {((criticalEquipment / totalEquipment) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>설비별 KPI 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpiMetrics.map((kpi) => (
                <div key={kpi.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(kpi.riskLevel)}`} />
                    <div>
                      <p className="font-medium">{kpi.equipmentName}</p>
                      <p className="text-sm text-muted-foreground">
                        건강점수: {kpi.healthScore}점 ({kpi.healthGrade}등급)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(kpi.trend)}
                    <Badge variant={kpi.riskLevel === "low" ? "default" : "destructive"}>
                      {kpi.riskLevel === "low" ? "정상" : kpi.riskLevel === "medium" ? "주의" : "위험"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
