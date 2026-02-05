"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card"
import { mockReliabilityAnalysis } from "@/lib/mock-data/mtbf"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

export function ReliabilityAnalysis() {
  const [selectedEquipment, setSelectedEquipment] = useState<string>(mockReliabilityAnalysis[0].equipmentId)

  // 선택된 설비의 신뢰성 분석 데이터
  const selectedAnalysis = mockReliabilityAnalysis.find((analysis) => analysis.equipmentId === selectedEquipment)

  // 신뢰도 곡선 데이터 생성 (와이불 분포 기반)
  const generateReliabilityCurve = (shape: number, scale: number) => {
    const data = []
    for (let t = 0; t <= 1000; t += 100) {
      // 와이불 분포 신뢰도 함수: R(t) = exp(-(t/scale)^shape)
      const reliability = Math.exp(-Math.pow(t / scale, shape)) * 100
      data.push({
        time: t,
        reliability: reliability.toFixed(2),
      })
    }
    return data
  }

  // 위험률 곡선 데이터 생성
  const generateHazardCurve = (shape: number, scale: number) => {
    const data = []
    for (let t = 0; t <= 1000; t += 100) {
      // 와이불 분포 위험률 함수: h(t) = (shape/scale) * (t/scale)^(shape-1)
      const hazardRate = (shape / scale) * Math.pow(t / scale, shape - 1)
      data.push({
        time: t,
        hazardRate: hazardRate.toFixed(4),
      })
    }
    return data
  }

  // 레이더 차트 데이터
  const radarData = [
    {
      subject: "신뢰도",
      A: selectedAnalysis?.reliabilityAt1000h || 0,
      fullMark: 100,
    },
    {
      subject: "특성수명",
      A: (selectedAnalysis?.characteristicLife || 0) / 10, // 스케일 조정
      fullMark: 100,
    },
    {
      subject: "평균수명",
      A: (selectedAnalysis?.meanLifetime || 0) / 10, // 스케일 조정
      fullMark: 100,
    },
    {
      subject: "위험률",
      A: 100 - (selectedAnalysis?.hazardRate || 0) * 10000, // 역수 및 스케일 조정
      fullMark: 100,
    },
    {
      subject: "형상모수",
      A: (selectedAnalysis?.weibullShape || 0) * 20, // 스케일 조정
      fullMark: 100,
    },
  ]

  const reliabilityCurveData = selectedAnalysis
    ? generateReliabilityCurve(selectedAnalysis.weibullShape, selectedAnalysis.weibullScale)
    : []

  const hazardCurveData = selectedAnalysis
    ? generateHazardCurve(selectedAnalysis.weibullShape, selectedAnalysis.weibullScale)
    : []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">설비 신뢰성 분석</h3>
        <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="설비 선택" />
          </SelectTrigger>
          <SelectContent>
            {mockReliabilityAnalysis.map((analysis) => (
              <SelectItem key={analysis.equipmentId} value={analysis.equipmentId}>
                {analysis.equipmentName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAnalysis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>신뢰성 지표</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">와이불 형상모수:</dt>
                    <dd>{selectedAnalysis.weibullShape.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">와이불 척도모수:</dt>
                    <dd>{selectedAnalysis.weibullScale.toFixed(2)} 시간</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">특성 수명:</dt>
                    <dd>{selectedAnalysis.characteristicLife.toFixed(2)} 시간</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">평균 수명:</dt>
                    <dd>{selectedAnalysis.meanLifetime.toFixed(2)} 시간</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">중간 수명:</dt>
                    <dd>{selectedAnalysis.medianLifetime.toFixed(2)} 시간</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">위험률:</dt>
                    <dd>{selectedAnalysis.hazardRate.toFixed(5)} 고장/시간</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">욕조곡선 단계:</dt>
                    <dd>
                      {selectedAnalysis.bathTubPhase === "early"
                        ? "초기 고장기"
                        : selectedAnalysis.bathTubPhase === "useful"
                          ? "우발 고장기"
                          : "마모 고장기"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>신뢰도 예측</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">1,000시간 신뢰도:</dt>
                    <dd>{selectedAnalysis.reliabilityAt1000h.toFixed(1)}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">5,000시간 신뢰도:</dt>
                    <dd>{selectedAnalysis.reliabilityAt5000h.toFixed(1)}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">10,000시간 신뢰도:</dt>
                    <dd>{selectedAnalysis.reliabilityAt10000h.toFixed(1)}%</dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">신뢰성 레이더 차트</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart outerRadius={70} data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name={selectedAnalysis.equipmentName}
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>신뢰성 해석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">형상모수 해석</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedAnalysis.weibullShape < 1
                        ? "형상모수가 1보다 작으므로 초기 고장기에 해당합니다. 이는 제조 결함이나 설치 오류로 인한 고장이 주로 발생함을 의미합니다."
                        : selectedAnalysis.weibullShape >= 1 && selectedAnalysis.weibullShape <= 3
                          ? "형상모수가 1~3 사이로 우발 고장기에 해당합니다. 이는 무작위적인 고장이 주로 발생함을 의미합니다."
                          : "형상모수가 3보다 크므로 마모 고장기에 해당합니다. 이는 설비의 노후화로 인한 고장이 주로 발생함을 의미합니다."}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">권장 정비 전략</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedAnalysis.bathTubPhase === "early"
                        ? "초기 고장기에는 품질 관리 강화와 설치 검사 강화가 필요합니다."
                        : selectedAnalysis.bathTubPhase === "useful"
                          ? "우발 고장기에는 상태 기반 정비와 예지 정비가 효과적입니다."
                          : "마모 고장기에는 예방 정비와 주기적인 부품 교체가 필요합니다."}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">신뢰성 개선 방안</h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      <li>정기적인 상태 모니터링 강화</li>
                      <li>핵심 부품의 예방적 교체 주기 최적화</li>
                      <li>운전 조건 최적화를 통한 스트레스 감소</li>
                      <li>신뢰성 중심 정비(RCM) 도입 검토</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>신뢰도 곡선</CardTitle>
                <CardDescription>시간에 따른 신뢰도 변화</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reliabilityCurveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "시간 (시간)", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "신뢰도 (%)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reliability" name="신뢰도" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>위험률 곡선</CardTitle>
                <CardDescription>시간에 따른 위험률 변화</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hazardCurveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "시간 (시간)", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "위험률 (고장/시간)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="hazardRate" name="위험률" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
