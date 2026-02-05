"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Icon } from "@fms/ui/icon"
import type { EquipmentHealthDetail } from "@fms/types"

export function HealthRecommendations() {
  // 설비 건강 상세 데이터 (실제 API 연동 시 대체 필요)
  const equipmentHealthDetails: EquipmentHealthDetail[] = []

  // 모든 권장사항을 수집하고 우선순위별로 정렬
  const allRecommendations = equipmentHealthDetails
    .flatMap((equipment) =>
      equipment.recommendations.map((rec) => ({
        ...rec,
        equipmentName: equipment.equipmentName,
        equipmentId: equipment.equipmentId,
        currentHealth: equipment.healthScore,
      })),
    )
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "outline"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Icon name="warning" size="sm" />
      case "medium":
        return <Icon name="schedule" size="sm" />
      case "low":
        return <Icon name="trending_up" size="sm" />
      default:
        return <Icon name="trending_up" size="sm" />
    }
  }

  const totalCost = allRecommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0)
  const totalImprovement = allRecommendations.reduce((sum, rec) => sum + rec.expectedImprovement, 0)

  return (
    <div className="space-y-6">
      {/* 요약 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 권장사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">건</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">예상 개선효과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{totalImprovement}</div>
            <p className="text-xs text-muted-foreground">점</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">예상 투자비용</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalCost / 10000).toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">만원</p>
          </CardContent>
        </Card>
      </div>

      {/* 권장사항 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>개선 권장사항</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allRecommendations.map((recommendation, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        variant={getPriorityVariant(recommendation.priority)}
                        className="flex items-center space-x-1"
                      >
                        {getPriorityIcon(recommendation.priority)}
                        <span>
                          {recommendation.priority === "high"
                            ? "높음"
                            : recommendation.priority === "medium"
                              ? "보통"
                              : "낮음"}
                        </span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">{recommendation.equipmentName}</span>
                    </div>
                    <h4 className="font-medium mb-2">{recommendation.action}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Icon name="trending_up" size="sm" className="text-green-500" />
                        <span>예상 개선: +{recommendation.expectedImprovement}점</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="attach_money" size="sm" className="text-blue-500" />
                        <span>예상 비용: {(recommendation.estimatedCost / 10000).toFixed(0)}만원</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">현재 점수: {recommendation.currentHealth}점</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      상세보기
                    </Button>
                    <Button size="sm">승인요청</Button>
                  </div>
                </div>

                <div className="bg-muted/50 rounded p-3">
                  <div className="text-sm">
                    <span className="font-medium">ROI 분석: </span>
                    개선효과 {recommendation.expectedImprovement}점 대비 투자비용{" "}
                    {(recommendation.estimatedCost / 10000).toFixed(0)}만원
                    {recommendation.expectedImprovement > 0 && (
                      <span className="text-green-600 ml-2">
                        (점당 {(recommendation.estimatedCost / recommendation.expectedImprovement / 10000).toFixed(1)}
                        만원)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
