"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Button } from "@fms/ui/button"
import { Badge } from "@fms/ui/badge"
import { Input } from "@fms/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { Icon } from "@fms/ui/icon"

interface CostRecord {
  id: string
  equipmentName: string
  calibrationDate: string
  vendor: string
  calibrationCost: number
  travelCost: number
  materialCost: number
  totalCost: number
  paymentStatus: "pending" | "paid" | "overdue"
  invoiceNumber: string
  category: string
}

const mockCostData: CostRecord[] = [
  {
    id: "1",
    equipmentName: "압력계 A-001",
    calibrationDate: "2024-01-15",
    vendor: "정밀측정(주)",
    calibrationCost: 150000,
    travelCost: 50000,
    materialCost: 20000,
    totalCost: 220000,
    paymentStatus: "paid",
    invoiceNumber: "INV-2024-001",
    category: "정기교정",
  },
  {
    id: "2",
    equipmentName: "온도계 B-002",
    calibrationDate: "2024-01-18",
    vendor: "한국교정센터",
    calibrationCost: 120000,
    travelCost: 0,
    materialCost: 15000,
    totalCost: 135000,
    paymentStatus: "pending",
    invoiceNumber: "INV-2024-002",
    category: "정기교정",
  },
  {
    id: "3",
    equipmentName: "유량계 C-003",
    calibrationDate: "2024-01-20",
    vendor: "정밀측정(주)",
    calibrationCost: 300000,
    travelCost: 80000,
    materialCost: 45000,
    totalCost: 425000,
    paymentStatus: "overdue",
    invoiceNumber: "INV-2024-003",
    category: "긴급교정",
  },
  {
    id: "4",
    equipmentName: "저울 D-004",
    calibrationDate: "2024-01-22",
    vendor: "계측기교정원",
    calibrationCost: 80000,
    travelCost: 30000,
    materialCost: 10000,
    totalCost: 120000,
    paymentStatus: "paid",
    invoiceNumber: "INV-2024-004",
    category: "정기교정",
  },
]

export function CalibrationCostTracking() {
  const [costData] = useState<CostRecord[]>(mockCostData)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredData = costData.filter((item) => {
    const matchesSearch =
      item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.paymentStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalCost = costData.reduce((sum, item) => sum + item.totalCost, 0)
  const paidAmount = costData
    .filter((item) => item.paymentStatus === "paid")
    .reduce((sum, item) => sum + item.totalCost, 0)
  const pendingAmount = costData
    .filter((item) => item.paymentStatus === "pending")
    .reduce((sum, item) => sum + item.totalCost, 0)
  const overdueAmount = costData
    .filter((item) => item.paymentStatus === "overdue")
    .reduce((sum, item) => sum + item.totalCost, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">결제완료</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">결제대기</Badge>
      case "overdue":
        return <Badge className="bg-red-500">연체</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">교정 비용 분석</h1>
        <Button>
          <Icon name="download" size="sm" className="mr-2" />
          비용 리포트 다운로드
        </Button>
      </div>

      {/* 비용 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 교정 비용</CardTitle>
            <Icon name="attach_money" size="sm" className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">이번 달 누적</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">결제 완료</CardTitle>
            <Icon name="trending_up" size="sm" className="text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paidAmount)}</div>
            <p className="text-xs text-muted-foreground">{((paidAmount / totalCost) * 100).toFixed(1)}% 완료</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">결제 대기</CardTitle>
            <Icon name="trending_up" size="sm" className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">{((pendingAmount / totalCost) * 100).toFixed(1)}% 대기</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연체 금액</CardTitle>
            <Icon name="trending_up" size="sm" className="text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overdueAmount)}</div>
            <p className="text-xs text-muted-foreground">즉시 처리 필요</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>비용 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Icon name="search" size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="설비명 또는 업체명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Icon name="filter_list" size="sm" className="mr-2" />
                <SelectValue placeholder="결제 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="paid">결제완료</SelectItem>
                <SelectItem value="pending">결제대기</SelectItem>
                <SelectItem value="overdue">연체</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 비용 내역 테이블 */}
          <div className="space-y-4">
            {filteredData.map((record) => (
              <div key={record.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{record.equipmentName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {record.vendor} • {record.calibrationDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatCurrency(record.totalCost)}</div>
                    {getStatusBadge(record.paymentStatus)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">교정비:</span>
                    <span className="ml-2 font-medium">{formatCurrency(record.calibrationCost)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">출장비:</span>
                    <span className="ml-2 font-medium">{formatCurrency(record.travelCost)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">재료비:</span>
                    <span className="ml-2 font-medium">{formatCurrency(record.materialCost)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <Badge variant="outline">{record.category}</Badge>
                    <span className="ml-2 text-muted-foreground">송장번호: {record.invoiceNumber}</span>
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
