"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

// TODO: 실제 API에서 고장 패턴 데이터를 가져와야 함
const failurePatterns: {
  equipmentType: string
  failureType: string
  frequency: number
  seasonality: string
  timeOfDay: string
  commonCauses: string[]
  preventiveMeasures: string[]
  averageDowntime: number
}[] = []

export function FailurePatternAnalysis() {
  // 고장 유형별 빈도 데이터 가공
  const failureTypeData = failurePatterns.map((pattern) => ({
    name:
      pattern.failureType === "mechanical"
        ? "기계적 고장"
        : pattern.failureType === "electrical"
          ? "전기적 고장"
          : pattern.failureType,
    value: pattern.frequency,
  }))

  // 계절별 고장 빈도 데이터 가공
  const seasonalityData = [
    {
      name: "봄",
      value: failurePatterns
        .filter((p) => p.seasonality === "spring")
        .reduce((acc, curr) => acc + curr.frequency, 0),
    },
    {
      name: "여름",
      value: failurePatterns
        .filter((p) => p.seasonality === "summer")
        .reduce((acc, curr) => acc + curr.frequency, 0),
    },
    {
      name: "가을",
      value: failurePatterns.filter((p) => p.seasonality === "fall").reduce((acc, curr) => acc + curr.frequency, 0),
    },
    {
      name: "겨울",
      value: failurePatterns
        .filter((p) => p.seasonality === "winter")
        .reduce((acc, curr) => acc + curr.frequency, 0),
    },
    {
      name: "계절성 없음",
      value: failurePatterns.filter((p) => p.seasonality === "none").reduce((acc, curr) => acc + curr.frequency, 0),
    },
  ]

  // 시간대별 고장 빈도 데이터 가공
  const timeOfDayData = [
    {
      name: "오전",
      value: failurePatterns
        .filter((p) => p.timeOfDay === "morning")
        .reduce((acc, curr) => acc + curr.frequency, 0),
    },
    {
      name: "오후",
      value: failurePatterns
        .filter((p) => p.timeOfDay === "afternoon")
        .reduce((acc, curr) => acc + curr.frequency, 0),
    },
    {
      name: "저녁",
      value: failurePatterns
        .filter((p) => p.timeOfDay === "evening")
        .reduce((acc, curr) => acc + curr.frequency, 0),
    },
    {
      name: "야간",
      value: failurePatterns.filter((p) => p.timeOfDay === "night").reduce((acc, curr) => acc + curr.frequency, 0),
    },
    {
      name: "시간대 무관",
      value: failurePatterns.filter((p) => p.timeOfDay === "any").reduce((acc, curr) => acc + curr.frequency, 0),
    },
  ]

  // 설비 유형별 고장 빈도 데이터 가공
  const equipmentTypeData = failurePatterns.map((pattern) => ({
    name: pattern.equipmentType,
    value: pattern.frequency,
  }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>고장 유형별 분포</CardTitle>
            <CardDescription>고장 유형에 따른 빈도 분석</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={failureTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {failureTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>계절별 고장 빈도</CardTitle>
            <CardDescription>계절에 따른 고장 패턴 분석</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={seasonalityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="고장 빈도" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시간대별 고장 빈도</CardTitle>
            <CardDescription>시간대에 따른 고장 패턴 분석</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeOfDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="고장 빈도" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>설비 유형별 고장 빈도</CardTitle>
            <CardDescription>설비 유형에 따른 고장 패턴 분석</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={equipmentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {equipmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>주요 고장 원인 및 예방 조치</CardTitle>
          <CardDescription>고장 패턴 분석을 통한 예방 조치 권장사항</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {failurePatterns.map((pattern, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium text-lg mb-2">
                  {pattern.equipmentType} -{" "}
                  {pattern.failureType === "mechanical"
                    ? "기계적 고장"
                    : pattern.failureType === "electrical"
                      ? "전기적 고장"
                      : pattern.failureType}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm text-muted-foreground mb-1">주요 고장 원인:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {pattern.commonCauses.map((cause, causeIndex) => (
                        <li key={causeIndex}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm text-muted-foreground mb-1">권장 예방 조치:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {pattern.preventiveMeasures.map((measure, measureIndex) => (
                        <li key={measureIndex}>{measure}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">평균 정지시간:</span>{" "}
                    <span>{pattern.averageDowntime.toFixed(1)} 시간</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">발생 빈도:</span>{" "}
                    <span>{pattern.frequency} 건</span>
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
