"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card"
import { Progress } from "@fms/ui/progress"
import type { MtbfRecommendation } from "@fms/types"
import { Button } from "@fms/ui/button"
import { Icon } from "@fms/ui/icon"

export function MtbfRecommendations() {
  // MTBF 권장사항 데이터 (실제 API 연동 시 대체 필요)
  const mtbfRecommendations: MtbfRecommendation[] = []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">MTBF 개선 권장사항</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Icon name="print" size="sm" className="mr-2" />
            인쇄
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="download" size="sm" className="mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      {mtbfRecommendations.map((recommendation) => (
        <Card key={recommendation.equipmentId} className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{recommendation.equipmentName}</CardTitle>
                <CardDescription>MTBF 개선 권장사항</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">현재 MTBF: {recommendation.currentMtbf} 시간</div>
                <div className="text-sm font-medium">목표 MTBF: {recommendation.targetMtbf} 시간</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">개선 가능성</span>
                <span className="text-sm font-medium">{recommendation.improvementPotential}%</span>
              </div>
              <Progress value={recommendation.improvementPotential} className="h-2" />
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium mb-2">권장 개선 조치</h4>
                <div className="space-y-4">
                  {recommendation.recommendations.map((action, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">
                          {action.category === "preventive"
                            ? "예방 정비"
                            : action.category === "predictive"
                              ? "예지 정비"
                              : action.category === "design"
                                ? "설계 개선"
                                : "운영 개선"}
                        </h5>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            action.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : action.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {action.priority === "high"
                            ? "높은 우선순위"
                            : action.priority === "medium"
                              ? "중간 우선순위"
                              : "낮은 우선순위"}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{action.action}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">예상 개선율:</span>{" "}
                          {action.expectedImprovement}%
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">구현 비용:</span>{" "}
                          {action.implementationCost.toLocaleString()}원
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">구현 기간:</span> {action.timeframe}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-base font-medium">예상 투자 수익률 (ROI)</h4>
                  <span className="text-lg font-bold text-green-600">{recommendation.estimatedRoi}%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  제안된 개선 조치를 모두 구현할 경우 예상되는 투자 수익률입니다. 이는 설비 가동률 향상, 정지 시간 감소,
                  유지보수 비용 절감 등을 고려하여 계산되었습니다.
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-base font-medium mb-2">구현 로드맵</h4>
                <div className="relative">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-4 relative">
                    <div className="ml-6 relative">
                      <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-blue-500"></div>
                      <h5 className="font-medium">1단계: 단기 조치 (1-3개월)</h5>
                      <p className="text-sm text-muted-foreground mt-1">예방 정비 주기 최적화 및 운영 개선 조치 구현</p>
                    </div>
                    <div className="ml-6 relative">
                      <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-blue-500"></div>
                      <h5 className="font-medium">2단계: 중기 조치 (3-6개월)</h5>
                      <p className="text-sm text-muted-foreground mt-1">예지 정비 시스템 구축 및 센서 설치</p>
                    </div>
                    <div className="ml-6 relative">
                      <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-blue-500"></div>
                      <h5 className="font-medium">3단계: 장기 조치 (6-12개월)</h5>
                      <p className="text-sm text-muted-foreground mt-1">설계 개선 및 주요 부품 업그레이드</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
