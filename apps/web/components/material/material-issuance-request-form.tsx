"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { Textarea } from "@fms/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card"
import { useToast } from "@/hooks/use-toast"
import { mockMaterials } from "@/components/material/material-management" // Using existing mock materials
import type { MaterialIssuanceRequest } from "@fms/types"

interface MaterialIssuanceRequestFormProps {
  onSubmit: (data: Omit<MaterialIssuanceRequest, "id" | "requestedAt" | "status">) => void
  onCancel: () => void
  initialData?: Partial<MaterialIssuanceRequest>
}

export default function MaterialIssuanceRequestForm({
  onSubmit,
  onCancel,
  initialData,
}: MaterialIssuanceRequestFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Omit<MaterialIssuanceRequest, "id" | "requestedAt" | "status">>({
    materialId: initialData?.materialId || "",
    materialCode: initialData?.materialCode || "",
    materialName: initialData?.materialName || "",
    quantity: initialData?.quantity || 1,
    unit: initialData?.unit || "EA",
    requestedBy: initialData?.requestedBy || "현재 사용자", // Placeholder for current user
    purpose: initialData?.purpose || "",
    notes: initialData?.notes || "",
    referenceNo: initialData?.referenceNo || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleMaterialSelect = (materialCode: string) => {
    const selectedMaterial = mockMaterials.find((m) => m.code === materialCode)
    if (selectedMaterial) {
      setFormData((prev) => ({
        ...prev,
        materialId: selectedMaterial.id,
        materialCode: selectedMaterial.code,
        materialName: selectedMaterial.name,
        unit: selectedMaterial.unit,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        materialId: "",
        materialCode: "",
        materialName: "",
        unit: "EA", // Default unit if material not found
      }))
    }
    if (errors.materialCode) {
      setErrors((prev) => ({ ...prev, materialCode: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.materialCode.trim()) {
      newErrors.materialCode = "자재는 필수입니다."
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = "수량은 0보다 커야 합니다."
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = "요청 목적은 필수입니다."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
      toast({
        title: "출고 요청 등록",
        description: "자재 출고 요청이 성공적으로 등록되었습니다.",
      })
    } else {
      toast({
        title: "유효성 검사 실패",
        description: "필수 입력 항목을 확인해주세요.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>자재 출고 요청</CardTitle>
          <CardDescription>필요한 자재를 요청합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="materialCode">자재 *</Label>
              <Select value={formData.materialCode} onValueChange={handleMaterialSelect}>
                <SelectTrigger className={errors.materialCode ? "border-red-500" : ""}>
                  <SelectValue placeholder="자재 선택" />
                </SelectTrigger>
                <SelectContent>
                  {mockMaterials.map((material) => (
                    <SelectItem key={material.id} value={material.code}>
                      {material.name} ({material.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.materialCode && <p className="text-sm text-red-500">{errors.materialCode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">수량 *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
                placeholder="수량 입력"
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">단위</Label>
              <Input id="unit" value={formData.unit} readOnly disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestedBy">요청자</Label>
              <Input id="requestedBy" value={formData.requestedBy} readOnly disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">요청 목적 *</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => handleInputChange("purpose", e.target.value)}
              placeholder="자재 요청 목적을 입력하세요 (예: 설비 수리, 정기 보전)"
              rows={3}
              className={errors.purpose ? "border-red-500" : ""}
            />
            {errors.purpose && <p className="text-sm text-red-500">{errors.purpose}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNo">참조 번호 (선택)</Label>
            <Input
              id="referenceNo"
              value={formData.referenceNo}
              onChange={(e) => handleInputChange("referenceNo", e.target.value)}
              placeholder="관련 작업 지시 번호, PM 오더 번호 등"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">비고 (선택)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="추가 설명이나 특이사항을 입력하세요"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">요청 등록</Button>
      </div>
    </form>
  )
}
