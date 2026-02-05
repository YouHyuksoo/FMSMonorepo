"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import type { MeterReading, MeterType } from "@fms/types"
import { meterTypeLabels } from "@fms/types"

interface UsageTrendChartProps {
  data: MeterReading[]
}

const colors = {
  electricity: "#8884d8",
  gas: "#82ca9d",
  water: "#ffc658",
  steam: "#ff7300",
  compressed_air: "#00ff00",
  other: "#ff0000",
}

export function UsageTrendChart({ data }: UsageTrendChartProps) {
  // 계측기 유형별로 데이터 그룹화
  const getMeterTypeData = (meterType: MeterType) => {
    return data
      .filter((reading) => reading.meterType === meterType)
      .reduce(
        (acc, reading) => {
          const date = new Date(reading.readingDate).toLocaleDateString()
          const existing = acc.find((item) => item.date === date)

          if (existing) {
            existing.consumption += reading.consumption
            existing.cost += reading.cost
            existing.count += 1
          } else {
            acc.push({
              date,
              consumption: reading.consumption,
              cost: reading.cost,
              count: 1,
              sortDate: new Date(reading.readingDate).getTime(),
            })
          }
          return acc
        },
        [] as Array<{ date: string; consumption: number; cost: number; count: number; sortDate: number }>,
      )
      .sort((a, b) => a.sortDate - b.sortDate)
      .slice(-30) // 최근 30일 데이터만 표시
  }

  // 사용 가능한 계측기 유형들
  const availableMeterTypes = Array.from(new Set(data.map((reading) => reading.meterType))) as MeterType[]

  // 모든 계측기 유형을 하나의 차트에 표시하는 데이터
  const getAllTypesData = () => {
    const dateMap = new Map<string, any>()

    data.forEach((reading) => {
      const date = new Date(reading.readingDate).toLocaleDateString()
      const sortDate = new Date(reading.readingDate).getTime()

      if (!dateMap.has(date)) {
        dateMap.set(date, { date, sortDate })
      }

      const dayData = dateMap.get(date)
      const typeKey = reading.meterType

      if (!dayData[typeKey]) {
        dayData[typeKey] = 0
      }
      dayData[typeKey] += reading.consumption
    })

    return Array.from(dateMap.values())
      .sort((a, b) => a.sortDate - b.sortDate)
      .slice(-30)
  }

  const allTypesData = getAllTypesData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>사용량 트렌드</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-auto">
            <TabsTrigger value="all">전체 비교</TabsTrigger>
            {availableMeterTypes.map((type) => (
              <TabsTrigger key={type} value={type}>
                {meterTypeLabels[type]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={allTypesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `${Number(value).toLocaleString()} ${getUnitByMeterType(name as MeterType)}`,
                    meterTypeLabels[name as MeterType] || name,
                  ]}
                />
                <Legend />
                {availableMeterTypes.map((type) => (
                  <Line
                    key={type}
                    type="monotone"
                    dataKey={type}
                    stroke={colors[type]}
                    strokeWidth={2}
                    name={meterTypeLabels[type]}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          {availableMeterTypes.map((type) => {
            const typeData = getMeterTypeData(type)
            const unit = getUnitByMeterType(type)

            return (
              <TabsContent key={type} value={type} className="mt-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{meterTypeLabels[type]} 사용량 트렌드</h3>
                  <p className="text-sm text-muted-foreground">단위: {unit}</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "consumption"
                          ? `${Number(value).toLocaleString()} ${unit}`
                          : `₩${Number(value).toLocaleString()}`,
                        name === "consumption" ? "사용량" : "비용",
                      ]}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="consumption"
                      stroke={colors[type]}
                      strokeWidth={2}
                      name="사용량"
                    />
                    <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#82ca9d" strokeWidth={2} name="비용" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}

// 계측기 유형별 단위 반환
function getUnitByMeterType(meterType: MeterType): string {
  switch (meterType) {
    case "electricity":
      return "kWh"
    case "gas":
      return "m³"
    case "water":
      return "톤"
    case "steam":
      return "톤"
    case "compressed_air":
      return "m³"
    default:
      return "단위"
  }
}
