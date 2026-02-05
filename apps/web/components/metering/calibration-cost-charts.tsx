"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Badge } from "@fms/ui/badge"
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
  AreaChart,
  Area,
} from "recharts"
import type { CalibrationRecord, CalibrationBudget } from "@fms/types"

interface CalibrationCostChartsProps {
  isOpen: boolean
  onClose: () => void
  records: CalibrationRecord[]
  budgets: CalibrationBudget[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function CalibrationCostCharts({ isOpen, onClose, records, budgets }: CalibrationCostChartsProps) {
  // 월별 비용 추이 데이터
  const getMonthlyTrendData = () => {
    const monthlyData = records
      .filter((r) => r.totalCost && r.calibrationDate)
      .reduce(
        (acc, record) => {
          const date = new Date(record.calibrationDate)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
          const monthLabel = `${date.getFullYear()}년 ${date.getMonth() + 1}월`

          if (!acc[monthKey]) {
            acc[monthKey] = {
              month: monthLabel,
              totalCost: 0,
              count: 0,
              avgCost: 0,
            }
          }

          acc[monthKey].totalCost += record.totalCost || 0
          acc[monthKey].count += 1
          acc[monthKey].avgCost = acc[monthKey].totalCost / acc[monthKey].count

          return acc
        },
        {} as Record<string, any>,
      )

    return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month))
  }

  // 예산 분류별 비용 데이터
  const getCategoryData = () => {
    const categoryData = records
      .filter((r) => r.totalCost && r.budgetCategory)
      .reduce(
        (acc, record) => {
          const category = record.budgetCategory || "기타"
          if (!acc[category]) {
            acc[category] = { name: category, value: 0, count: 0 }
          }
          acc[category].value += record.totalCost || 0
          acc[category].count += 1
          return acc
        },
        {} as Record<string, any>,
      )

    return Object.values(categoryData)
  }

  // 교정 기관별 비용 데이터
  const getAgencyData = () => {
    const agencyData = records
      .filter((r) => r.totalCost && r.calibratedBy)
      .reduce(
        (acc, record) => {
          const agency = record.calibratedBy
          if (!acc[agency]) {
            acc[agency] = { name: agency, totalCost: 0, count: 0, avgCost: 0 }
          }
          acc[agency].totalCost += record.totalCost || 0
          acc[agency].count += 1
          acc[agency].avgCost = acc[agency].totalCost / acc[agency].count
          return acc
        },
        {} as Record<string, any>,
      )

    return Object.values(agencyData).sort((a: any, b: any) => b.totalCost - a.totalCost)
  }

  // 예산 대비 실적 데이터
  const getBudgetVsActualData = () => {
    const currentYear = new Date().getFullYear()
    const yearlyBudgets = budgets.filter((b) => b.year === currentYear && b.status === "active")

    return yearlyBudgets.map((budget) => {
      const actualCost = records
        .filter((r) => r.budgetCategory === budget.category && r.totalCost)
        .reduce((sum, r) => sum + (r.totalCost || 0), 0)

      return {
        category: budget.category,
        budget: budget.allocatedAmount,
        actual: actualCost,
        utilization: budget.allocatedAmount > 0 ? (actualCost / budget.allocatedAmount) * 100 : 0,
      }
    })
  }

  const monthlyTrendData = getMonthlyTrendData()
  const categoryData = getCategoryData()
  const agencyData = getAgencyData()
  const budgetVsActualData = getBudgetVsActualData()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>교정 비용 분석 차트</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 월별 비용 추이 */}
          <Card>
            <CardHeader>
              <CardTitle>월별 비용 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "totalCost"
                        ? `₩${Number(value).toLocaleString()}`
                        : `₩${Number(value).toLocaleString()}`,
                      name === "totalCost" ? "총 비용" : "평균 비용",
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="totalCost"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    name="총 비용"
                  />
                  <Area
                    type="monotone"
                    dataKey="avgCost"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                    name="평균 비용"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 예산 분류별 비용 분포 */}
            <Card>
              <CardHeader>
                <CardTitle>예산 분류별 비용 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₩${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 교정 기관별 비용 비교 */}
            <Card>
              <CardHeader>
                <CardTitle>교정 기관별 비용 비교</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agencyData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "totalCost"
                          ? `₩${Number(value).toLocaleString()}`
                          : `₩${Number(value).toLocaleString()}`,
                        name === "totalCost" ? "총 비용" : "평균 비용",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="totalCost" fill="#8884d8" name="총 비용" />
                    <Bar dataKey="avgCost" fill="#82ca9d" name="평균 비용" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 예산 대비 실적 */}
          <Card>
            <CardHeader>
              <CardTitle>예산 대비 실적</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetVsActualData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      `₩${Number(value).toLocaleString()}`,
                      name === "budget" ? "예산" : "실적",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="budget" fill="#8884d8" name="예산" />
                  <Bar dataKey="actual" fill="#82ca9d" name="실적" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 예산 사용률 요약 */}
          <Card>
            <CardHeader>
              <CardTitle>예산 사용률 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetVsActualData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.category}</div>
                      <div className="text-sm text-muted-foreground">
                        예산: ₩{item.budget.toLocaleString()} / 실적: ₩{item.actual.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          item.utilization > 100 ? "destructive" : item.utilization > 80 ? "secondary" : "default"
                        }
                      >
                        {item.utilization.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
