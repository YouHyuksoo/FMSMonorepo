"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Textarea } from "@fms/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import type { CalibrationRecord } from "@fms/types"
import { format } from "date-fns"

interface CalibrationCostFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<CalibrationRecord>) => void
  initialData?: CalibrationRecord | null
}

export function CalibrationCostForm({ isOpen, onClose, onSubmit, initialData }: CalibrationCostFormProps) {
  const [formData, setFormData] = useState({
    equipmentName: "",
    instrumentType: "",
    calibratedBy: "",
    calibrationDate: "",
    calibrationCost: "",
    travelCost: "",
    materialCost: "",
    budgetCategory: "",
    costCenter: "",
    approvedBy: "",
    invoiceNumber: "",
    paymentStatus: "pending",
    paymentDate: "",
    notes: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        equipmentName: initialData.equipmentName || "",
        instrumentType: initialData.instrumentType || "",
        calibratedBy: initialData.calibratedBy || "",
        calibrationDate: initialData.calibrationDate ? format(new Date(initialData.calibrationDate), "yyyy-MM-dd") : "",
        calibrationCost: initialData.calibrationCost?.toString() || "",
        travelCost: initialData.travelCost?.toString() || "",
        materialCost: initialData.materialCost?.toString() || "",
        budgetCategory: initialData.budgetCategory || "",
        costCenter: initialData.costCenter || "",
        approvedBy: initialData.approvedBy || "",
        invoiceNumber: initialData.invoiceNumber || "",
        paymentStatus: initialData.paymentStatus || "pending",
        paymentDate: initialData.paymentDate ? format(new Date(initialData.paymentDate), "yyyy-MM-dd") : "",
        notes: initialData.notes || "",
      })
    } else {
      setFormData({
        equipmentName: "",
        instrumentType: "",
        calibratedBy: "",
        calibrationDate: "",
        calibrationCost: "",
        travelCost: "",
        materialCost: "",
        budgetCategory: "",
        costCenter: "",
        approvedBy: "",
        invoiceNumber: "",
        paymentStatus: "pending",
        paymentDate: "",
        notes: "",
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const calibrationCost = Number.parseFloat(formData.calibrationCost) || 0
    const travelCost = Number.parseFloat(formData.travelCost) || 0
    const materialCost = Number.parseFloat(formData.materialCost) || 0
    const totalCost = calibrationCost + travelCost + materialCost

    const submitData: Partial<CalibrationRecord> = {
      ...formData,
      calibrationCost,
      travelCost,
      materialCost,
      totalCost,
      paymentDate: formData.paymentDate || undefined,
    }

    onSubmit(submitData)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateTotal = () => {
    const calibrationCost = Number.parseFloat(formData.calibrationCost) || 0
    const travelCost = Number.parseFloat(formData.travelCost) || 0
    const materialCost = Number.parseFloat(formData.materialCost) || 0
    return calibrationCost + travelCost + materialCost
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "비용 정보 수정" : "새 비용 등록"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipmentName">설비명 *</Label>
              <Input
                id="equipmentName"
                value={formData.equipmentName}
                onChange={(e) => handleInputChange("equipmentName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instrumentType">계측기 유형 *</Label>
              <Select
                value={formData.instrumentType}
                onValueChange={(value) => handleInputChange("instrumentType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="계측기 유형 선택" />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="calibratedBy">교정 기관 *</Label>
              <Input
                id="calibratedBy"
                value={formData.calibratedBy}
                onChange={(e) => handleInputChange("calibratedBy", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calibrationDate">교정일 *</Label>
              <Input
                id="calibrationDate"
                type="date"
                value={formData.calibrationDate}
                onChange={(e) => handleInputChange("calibrationDate", e.target.value)}
                required
              />
            </div>
          </div>

          {/* 비용 정보 */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">비용 정보</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calibrationCost">교정비 (원)</Label>
                <Input
                  id="calibrationCost"
                  type="number"
                  value={formData.calibrationCost}
                  onChange={(e) => handleInputChange("calibrationCost", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelCost">출장비 (원)</Label>
                <Input
                  id="travelCost"
                  type="number"
                  value={formData.travelCost}
                  onChange={(e) => handleInputChange("travelCost", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="materialCost">재료비 (원)</Label>
                <Input
                  id="materialCost"
                  type="number"
                  value={formData.materialCost}
                  onChange={(e) => handleInputChange("materialCost", e.target.value)}
                />
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">총 비용</div>
              <div className="text-xl font-bold">₩{calculateTotal().toLocaleString()}</div>
            </div>
          </div>

          {/* 예산 및 승인 정보 */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">예산 및 승인 정보</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetCategory">예산 분류</Label>
                <Select
                  value={formData.budgetCategory}
                  onValueChange={(value) => handleInputChange("budgetCategory", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="예산 분류 선택" />
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
                <Label htmlFor="costCenter">코스트센터</Label>
                <Select value={formData.costCenter} onValueChange={(value) => handleInputChange("costCenter", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="코스트센터 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="생산부">생산부</SelectItem>
                    <SelectItem value="품질부">품질부</SelectItem>
                    <SelectItem value="기술부">기술부</SelectItem>
                    <SelectItem value="설비부">설비부</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approvedBy">승인자</Label>
                <Input
                  id="approvedBy"
                  value={formData.approvedBy}
                  onChange={(e) => handleInputChange("approvedBy", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">송장 번호</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">결제 정보</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">결제 상태</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => handleInputChange("paymentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">결제대기</SelectItem>
                    <SelectItem value="paid">결제완료</SelectItem>
                    <SelectItem value="overdue">연체</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.paymentStatus === "paid" && (
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">결제일</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">비고</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
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
