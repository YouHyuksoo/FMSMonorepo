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

interface CalibrationFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<CalibrationRecord>) => void
  initialData?: CalibrationRecord | null
}

export function CalibrationForm({ isOpen, onClose, onSubmit, initialData }: CalibrationFormProps) {
  const [formData, setFormData] = useState({
    equipmentName: "",
    instrumentType: "",
    serialNumber: "",
    calibrationDate: "",
    nextCalibrationDate: "",
    calibratedBy: "",
    result: "pending",
    status: "scheduled",
    accuracy: "",
    certificateNumber: "",
    notes: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        equipmentName: initialData.equipmentName || "",
        instrumentType: initialData.instrumentType || "",
        serialNumber: initialData.serialNumber || "",
        calibrationDate: initialData.calibrationDate ? format(new Date(initialData.calibrationDate), "yyyy-MM-dd") : "",
        nextCalibrationDate: initialData.nextCalibrationDate
          ? format(new Date(initialData.nextCalibrationDate), "yyyy-MM-dd")
          : "",
        calibratedBy: initialData.calibratedBy || "",
        result: initialData.result || "pending",
        status: initialData.status || "scheduled",
        accuracy: initialData.accuracy?.toString() || "",
        certificateNumber: initialData.certificateNumber || "",
        notes: initialData.notes || "",
      })
    } else {
      setFormData({
        equipmentName: "",
        instrumentType: "",
        serialNumber: "",
        calibrationDate: "",
        nextCalibrationDate: "",
        calibratedBy: "",
        result: "pending",
        status: "scheduled",
        accuracy: "",
        certificateNumber: "",
        notes: "",
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: Partial<CalibrationRecord> = {
      ...formData,
      accuracy: formData.accuracy ? Number.parseFloat(formData.accuracy) : undefined,
    }

    onSubmit(submitData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "교정 정보 수정" : "새 교정 일정 등록"}</DialogTitle>
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
              <Label htmlFor="serialNumber">시리얼 번호</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange("serialNumber", e.target.value)}
              />
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

            <div className="space-y-2">
              <Label htmlFor="nextCalibrationDate">다음 교정 예정일 *</Label>
              <Input
                id="nextCalibrationDate"
                type="date"
                value={formData.nextCalibrationDate}
                onChange={(e) => handleInputChange("nextCalibrationDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="result">교정 결과</Label>
              <Select value={formData.result} onValueChange={(value) => handleInputChange("result", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">대기</SelectItem>
                  <SelectItem value="pass">합격</SelectItem>
                  <SelectItem value="fail">불합격</SelectItem>
                  <SelectItem value="conditional">조건부합격</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">상태</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">예정</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="canceled">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accuracy">정확도 (%)</Label>
              <Input
                id="accuracy"
                type="number"
                step="0.01"
                value={formData.accuracy}
                onChange={(e) => handleInputChange("accuracy", e.target.value)}
                placeholder="예: 99.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificateNumber">인증서 번호</Label>
              <Input
                id="certificateNumber"
                value={formData.certificateNumber}
                onChange={(e) => handleInputChange("certificateNumber", e.target.value)}
              />
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
