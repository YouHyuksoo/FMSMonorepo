"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Badge } from "@fms/ui/badge"
import { Progress } from "@fms/ui/progress"
import { mockEquipmentHealth } from "@/lib/mock-data/kpi"
import { Icon } from "@fms/ui/icon"

export function EquipmentHealthGrid() {
  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getHealthBgColor = (score: number) => {
    if (score >= 90) return "bg-green-100"
    if (score >= 80) return "bg-blue-100"
    if (score >= 70) return "bg-yellow-100"
    if (score >= 60) return "bg-orange-100"
    return "bg-red-100"
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <Icon name="check_circle" size="sm" className="text-green-500" />
      case "medium":
        return <Icon name="schedule" size="sm" className="text-yellow-500" />
      case "high":
      case "critical":
        return <Icon name="warning" size="sm" className="text-red-500" />
      default:
        return <Icon name="check_circle" size="sm" className="text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">설비 건강점수</h2>
        <Badge variant="outline">실시간 모니터링</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEquipmentHealth.map((equipment) => (
          <Card key={equipment.equipmentId} className={getHealthBgColor(equipment.healthScore)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{equipment.equipmentName}</CardTitle>
                {getRiskIcon(equipment.riskLevel)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Icon name="location_on" size="sm" className="mr-1" />
                {equipment.location}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getHealthColor(equipment.healthScore)}`}>
                  {equipment.healthScore}
                </div>
                <div className="text-sm text-muted-foreground">건강점수</div>
                <Badge variant="outline" className="mt-1">
                  {equipment.healthGrade}등급
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>건강도</span>
                  <span>{equipment.healthScore}%</span>
                </div>
                <Progress value={equipment.healthScore} className="h-2" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">최근 정비:</span>
                  <span>{equipment.lastMaintenance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">다음 정비:</span>
                  <span>{equipment.nextMaintenance}</span>
                </div>
              </div>

              {equipment.issues.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-red-600">발견된 이슈:</div>
                  <div className="space-y-1">
                    {equipment.issues.map((issue, index) => (
                      <div key={index} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                        • {issue}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <Badge
                  variant={equipment.riskLevel === "low" ? "default" : "destructive"}
                  className="w-full justify-center"
                >
                  {equipment.riskLevel === "low"
                    ? "정상"
                    : equipment.riskLevel === "medium"
                      ? "주의 필요"
                      : equipment.riskLevel === "high"
                        ? "위험"
                        : "긴급"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
