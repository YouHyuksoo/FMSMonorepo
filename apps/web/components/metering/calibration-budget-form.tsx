"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Textarea } from "@fms/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import type { CalibrationBudget } from "@fms/types"

interface CalibrationBudgetFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<CalibrationBudget>) => void
  initialData?: CalibrationBudget | null
}

export function CalibrationBudgetForm({ isOpen, onClose, onSubmit, initialData }: CalibrationBudgetFormProps) {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    quarter: "",
    month: "",
    budgetType: "annual",
    category: "",
    instrumentType: "",
    costCenter: "",
    plannedAmount: "",
    allocatedAmount: "",
    description: "",
    approvedBy: "",
    status: "draft",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        year: initialData.year.toString(),
        quarter: initialData.quarter?.toString() || "",
        month: initialData.month?.toString() || "",
        budgetType: initialData.budgetType,
        category: initialData.category,
        instrumentType: initialData.instrumentType || "",
        costCenter: initialData.costCenter || "",
        plannedAmount: initialData.plannedAmount.toString(),
        allocatedAmount: initialData.allocatedAmount.toString(),
        description: initialData.description || "",
        approvedBy: initialData.approvedBy,
        status: initialData.status,
      })
    } else {
      setFormData({
        year: new Date().getFullYear().toString(),
        quarter: "",
        month: "",
        budgetType: "annual",
        category: "",
        instrumentType: "",
        costCenter: "",
        plannedAmount: "",
        allocatedAmount: "",
        description: "",
        approvedBy: "",
        status: "draft",
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: Partial<CalibrationBudget> = {
      year: Number.parseInt(formData.year),
      quarter: formData.quarter ? Number.parseInt(formData.quarter) : undefined,
      month: formData.month ? Number.parseInt(formData.month) : undefined,
      budgetType: formData.budgetType as "annual" | "quarterly" | "monthly",
      category: formData.category,
      instrumentType: formData.instrumentType || undefined,
      costCenter: formData.costCenter || undefined,
      plannedAmount: Number.parseFloat(formData.plannedAmount),
      allocatedAmount: Number.parseFloat(formData.allocatedAmount),
      description: formData.description || undefined,
      approvedBy: formData.approvedBy,
      approvedDate: formData.status === "approved" ? new Date().toISOString() : undefined,
      status: formData.status as "draft" | "approved" | "active" | "closed",
    }

    onSubmit(submitData)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // 예산 유형에 따라 분기/월 필드 초기화
    if (field === "budgetType") {
      if (value === "annual") {
        setFormData((prev) => ({ ...prev, quarter: "", month: "" }))
      } else if (value === "quarterly") {
        setFormData((prev) => ({ ...prev, month: "" }))
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "예산 정보 수정" : "새 예산 등록"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">연도 *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetType">예산 유형 *</Label>
              <Select value={formData.budgetType} onValueChange={(value) => handleInputChange("budgetType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">연간</SelectItem>
                  <SelectItem value="quarterly">분기</SelectItem>
                  <SelectItem value="monthly">월간</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.budgetType === "quarterly" && (
              <div className="space-y-2">
                <Label htmlFor="quarter">분기</Label>
                <Select value={formData.quarter} onValueChange={(value) => handleInputChange("quarter", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="분기 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1분기</SelectItem>
                    <SelectItem value="2">2분기</SelectItem>
                    <SelectItem value="3">3분기</SelectItem>
                    <SelectItem value="4">4분기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.budgetType === "monthly" && (
              <div className="space-y-2">
                <Label htmlFor="month">월</Label>
                <Select value={formData.month} onValueChange={(value) => handleInputChange("month", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="월 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}월
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">예산 분류 *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="분류 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="정기교정">정기교정</SelectItem>
                  <SelectItem value="긴급교정">긴급교정</SelectItem>
                  <SelectItem value="재교정">재교정</SelectItem>
                  <SelectItem value="신규교정">신규교정</SelectItem>
                  <SelectItem value="특별교정">특별교정</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instrumentType">계측기 유형</Label>
              <Select
                value={formData.instrumentType}
                onValueChange={(value) => handleInputChange("instrumentType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="계측기 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pressure">압력계</SelectItem>
                  <SelectItem value="temperature">온도계</SelectItem>
                  <SelectItem value="flow">유량계</SelectItem>
                  <SelectItem value="level">레벨계</SelectItem>
                  <SelectItem value="vibration">진동계</SelectItem>
                  <SelectItem value="electrical">전기계측기</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="costCenter">코스트센터</Label>
              <Select value={formData.costCenter} onValueChange={(value) => handleInputChange("costCenter", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="코스트센터 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="생산부">생산부</SelectItem>
                  <SelectItem value="품질부">품질부</SelectItem>
                  <SelectItem value="기술부">기술부</SelectItem>
                  <SelectItem value="설비부">설비부</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">상태 *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">초안</SelectItem>
                  <SelectItem value="approved">승인</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="closed">마감</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedAmount">계획 예산 (원) *</Label>
              <Input
                id="plannedAmount"
                type="number"
                value={formData.plannedAmount}
                onChange={(e) => handleInputChange("plannedAmount", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allocatedAmount">배정 예산 (원) *</Label>
              <Input
                id="allocatedAmount"
                type="number"
                value={formData.allocatedAmount}
                onChange={(e) => handleInputChange("allocatedAmount", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="approvedBy">승인자 *</Label>
            <Input
              id="approvedBy"
              value={formData.approvedBy}
              onChange={(e) => handleInputChange("approvedBy", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">{initialData ? "수정" : "등록"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
