"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Badge } from "@fms/ui/badge"
import { Progress } from "@fms/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { Icon } from "@fms/ui/icon"
import type { EquipmentHealthDetail } from "@fms/types"

export function EquipmentHealthDashboard() {
  // 설비 건강 상세 데이터 (실제 API 연동 시 대체 필요)
  const equipmentHealthDetails: EquipmentHealthDetail[] = []

  const totalEquipment = equipmentHealthDetails.length || 1 // 0으로 나누기 방지
  const healthyEquipment = equipmentHealthDetails.filter((eq) => eq.healthScore >= 80).length
  const warningEquipment = equipmentHealthDetails.filter((eq) => eq.healthScore >= 60 && eq.healthScore < 80).length
  const criticalEquipment = equipmentHealthDetails.filter((eq) => eq.healthScore < 60).length
  const averageHealth = Math.round(
    equipmentHealthDetails.reduce((sum, eq) => sum + eq.healthScore, 0) / totalEquipment,
  )

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getHealthBadgeVariant = (grade: string) => {
    switch (grade) {
      case "A":
        return "default"
      case "B":
        return "secondary"
      case "C":
        return "outline"
      case "D":
        return "destructive"
      case "F":
        return "destructive"
      default:
        return "outline"
    }
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
        return <Icon name="monitoring" size="sm" className="text-gray-500" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <Icon name="trending_up" size="sm" className="text-green-500" />
      case "declining":
        return <Icon name="trending_down" size="sm" className="text-red-500" />
      default:
        return <Icon name="monitoring" size="sm" className="text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 설비</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipment}</div>
            <p className="text-xs text-muted-foreground">대</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">평균 건강지수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(averageHealth)}`}>{averageHealth}</div>
            <p className="text-xs text-muted-foreground">점</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">정상</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyEquipment}</div>
            <p className="text-xs text-muted-foreground">80점 이상</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">주의</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningEquipment}</div>
            <p className="text-xs text-muted-foreground">60-79점</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">위험</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalEquipment}</div>
            <p className="text-xs text-muted-foreground">60점 미만</p>
          </CardContent>
        </Card>
      </div>

      {/* 설비별 상세 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>설비별 건강지수 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">카드 뷰</TabsTrigger>
              <TabsTrigger value="table">테이블 뷰</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipmentHealthDetails.map((equipment) => (
                  <Card key={equipment.equipmentId} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{equipment.equipmentName}</CardTitle>
                        <div className="flex items-center space-x-1">
                          {getRiskIcon(equipment.riskLevel)}
                          {getTrendIcon(equipment.trend)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {equipment.equipmentType} • {equipment.location}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getHealthColor(equipment.healthScore)}`}>
                          {equipment.healthScore}
                        </div>
                        <div className="text-sm text-muted-foreground">건강점수</div>
                        <Badge variant={getHealthBadgeVariant(equipment.healthGrade)} className="mt-1">
                          {equipment.healthGrade}등급
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>신뢰도</span>
                          <span>{equipment.factors.reliability}%</span>
                        </div>
                        <Progress value={equipment.factors.reliability} className="h-1" />

                        <div className="flex justify-between text-sm">
                          <span>가동률</span>
                          <span>{equipment.factors.availability}%</span>
                        </div>
                        <Progress value={equipment.factors.availability} className="h-1" />

                        <div className="flex justify-between text-sm">
                          <span>보전성</span>
                          <span>{equipment.factors.maintainability}%</span>
                        </div>
                        <Progress value={equipment.factors.maintainability} className="h-1" />

                        <div className="flex justify-between text-sm">
                          <span>성능</span>
                          <span>{equipment.factors.performance}%</span>
                        </div>
                        <Progress value={equipment.factors.performance} className="h-1" />
                      </div>

                      {equipment.issues.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-red-600">발견된 이슈:</div>
                          <div className="space-y-1">
                            {equipment.issues.slice(0, 2).map((issue, index) => (
                              <div key={index} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                                • {issue}
                              </div>
                            ))}
                            {equipment.issues.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                외 {equipment.issues.length - 2}건 더...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                        <div>다음 점검: {equipment.nextInspection}</div>
                        <div>다음 정비: {equipment.nextMaintenance}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="table">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">설비명</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">위치</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">건강점수</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">등급</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">위험도</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">추세</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">다음 정비</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipmentHealthDetails.map((equipment) => (
                      <tr key={equipment.equipmentId} className="border-b">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{equipment.equipmentName}</div>
                            <div className="text-sm text-muted-foreground">{equipment.equipmentType}</div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{equipment.location}</td>
                        <td className="p-4">
                          <div className={`text-lg font-bold ${getHealthColor(equipment.healthScore)}`}>
                            {equipment.healthScore}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={getHealthBadgeVariant(equipment.healthGrade)}>
                            {equipment.healthGrade}등급
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            {getRiskIcon(equipment.riskLevel)}
                            <span className="text-sm capitalize">{equipment.riskLevel}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(equipment.trend)}
                            <span className="text-sm">{equipment.trend}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{equipment.nextMaintenance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
