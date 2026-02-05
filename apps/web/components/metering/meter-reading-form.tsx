"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@fms/ui/dialog"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { Textarea } from "@fms/ui/textarea"
import { DatePicker } from "@fms/ui/date-picker"
import type { MeterReading } from "@fms/types"
import { meterTypeLabels, meterReadingStatusLabels } from "@fms/types"

interface MeterReadingFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<MeterReading>) => void
  initialData?: MeterReading | null
}

export function MeterReadingForm({ isOpen, onClose, onSubmit, initialData }: MeterReadingFormProps) {
  const [formData, setFormData] = useState<Partial<MeterReading>>({
    equipmentId: "",
    equipmentName: "",
    meterType: "electricity",
    readingDate: new Date().toISOString(),
    previousReading: 0,
    currentReading: 0,
    consumption: 0,
    unit: "kWh",
    cost: 0,
    readBy: "",
    notes: "",
    status: "pending",
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        equipmentId: "",
        equipmentName: "",
        meterType: "electricity",
        readingDate: new Date().toISOString(),
        previousReading: 0,
        currentReading: 0,
        consumption: 0,
        unit: "kWh",
        cost: 0,
        readBy: "",
        notes: "",
        status: "pending",
      })
    }
  }, [initialData, isOpen])

  const handleChange = (field: keyof MeterReading, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // 자동 계산: 현재 검침값 - 이전 검침값 = 사용량
      if (field === "currentReading" || field === "previousReading") {
        const current = field === "currentReading" ? value : updated.currentReading || 0
        const previous = field === "previousReading" ? value : updated.previousReading || 0
        updated.consumption = Math.max(0, Number(current) - Number(previous))
      }

      return updated
    })
  }

  const handleEquipmentChange = (equipmentId: string) => {
    // TODO: 실제 API에서 설비 정보를 가져와야 함
    setFormData((prev) => ({
      ...prev,
      equipmentId,
      equipmentName: "",
    }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      handleChange("readingDate", date.toISOString())
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "검침 수정" : "검침 등록"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipmentId">설비</Label>
                <Select value={formData.equipmentId || ""} onValueChange={handleEquipmentChange}>
                  <SelectTrigger id="equipmentId">
                    <SelectValue placeholder="설비 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: 실제 API에서 설비 목록을 가져와야 함 */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meterType">계측기 유형</Label>
                <Select
                  value={formData.meterType || "electricity"}
                  onValueChange={(value) => handleChange("meterType", value)}
                >
                  <SelectTrigger id="meterType">
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(meterTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="readingDate">검침일자</Label>
                <DatePicker
                  date={formData.readingDate ? new Date(formData.readingDate) : undefined}
                  onSelect={handleDateChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="readBy">검침자</Label>
                <Input
                  id="readBy"
                  value={formData.readBy || ""}
                  onChange={(e) => handleChange("readBy", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previousReading">이전 검침값</Label>
                <Input
                  id="previousReading"
                  type="number"
                  value={formData.previousReading || 0}
                  onChange={(e) => handleChange("previousReading", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentReading">현재 검침값</Label>
                <Input
                  id="currentReading"
                  type="number"
                  value={formData.currentReading || 0}
                  onChange={(e) => handleChange("currentReading", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consumption">사용량</Label>
                <div className="flex">
                  <Input
                    id="consumption"
                    type="number"
                    value={formData.consumption || 0}
                    onChange={(e) => handleChange("consumption", Number(e.target.value))}
                    className="rounded-r-none"
                  />
                  <Select value={formData.unit || "kWh"} onValueChange={(value) => handleChange("unit", value)}>
                    <SelectTrigger className="w-24 rounded-l-none">
                      <SelectValue placeholder="단위" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kWh">kWh</SelectItem>
                      <SelectItem value="m3">m³</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">비용</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₩</span>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost || 0}
                    onChange={(e) => handleChange("cost", Number(e.target.value))}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <Select value={formData.status || "pending"} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(meterReadingStatusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">비고</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">{initialData ? "수정" : "등록"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
