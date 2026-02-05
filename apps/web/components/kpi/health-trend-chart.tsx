"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { mockHealthTrendData } from "@/lib/mock-data/equipment-health"

export function HealthTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>건강지수 추이 분석</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockHealthTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value}점`,
                  name === "overallHealth"
                    ? "전체 건강지수"
                    : name === "reliability"
                      ? "신뢰도"
                      : name === "availability"
                        ? "가동률"
                        : name === "maintainability"
                          ? "보전성"
                          : name === "performance"
                            ? "성능"
                            : name,
                ]}
              />
              <Legend
                formatter={(value: string) =>
                  value === "overallHealth"
                    ? "전체 건강지수"
                    : value === "reliability"
                      ? "신뢰도"
                      : value === "availability"
                        ? "가동률"
                        : value === "maintainability"
                          ? "보전성"
                          : value === "performance"
                            ? "성능"
                            : value
                }
              />
              <Area
                type="monotone"
                dataKey="overallHealth"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Line type="monotone" dataKey="reliability" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="availability" stroke="#ffc658" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="maintainability" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="performance" stroke="#8dd1e1" strokeWidth={2} dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
