"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import type { MeterReading } from "@fms/types"

interface EquipmentUsageChartProps {
  data: MeterReading[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function EquipmentUsageChart({ data }: EquipmentUsageChartProps) {
  // 설비별로 데이터를 그룹화
  const chartData = Object.entries(
    data.reduce(
      (acc, reading) => {
        const equipment = reading.equipmentName
        if (!acc[equipment]) {
          acc[equipment] = {
            name: equipment,
            value: 0,
            cost: 0,
          }
        }
        acc[equipment].value += reading.consumption
        acc[equipment].cost += reading.cost
        return acc
      },
      {} as Record<string, { name: string; value: number; cost: number }>,
    ),
  )
    .map(([_, value]) => value)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // 상위 10개 설비만 표시

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // 5% 미만은 라벨 표시 안함

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>설비별 사용량 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [`${value} 단위`, "사용량"]}
              labelFormatter={(label) => `설비: ${label}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
