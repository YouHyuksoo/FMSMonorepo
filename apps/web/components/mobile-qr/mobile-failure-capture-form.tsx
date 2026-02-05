"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Textarea } from "@fms/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { type Failure, FailureType, FailurePriority, FailureStatus } from "@fms/types"
import type { Equipment } from "@fms/types"
import { Icon } from "@fms/ui/icon"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"

interface MobileFailureCaptureFormProps {
  equipment: Equipment | null
  onSubmit: (failureData: Failure) => void
  onCancel: () => void
}

export function MobileFailureCaptureForm({ equipment, onSubmit, onCancel }: MobileFailureCaptureFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Failure>>({
    title: "",
    description: "",
    type: FailureType.MECHANICAL,
    priority: FailurePriority.MEDIUM,
    symptom: "",
    attachments: [],
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (equipment) {
      setFormData((prev) => ({
        ...prev,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
      }))
    }
  }, [equipment])

  const handleChange = (field: keyof Omit<Failure, "attachments">, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTakePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file)
        setImagePreviews((prevPreviews) => [...prevPreviews, previewUrl])
        // In a real app, you might want to store the File object itself
        // until submission to upload it, then store the server URL.
        // For mock, we'll store the blob URL in attachments.
        setFormData((prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), previewUrl],
        }))
      } else {
        toast({
          title: "잘못된 파일 형식",
          description: "이미지 파일만 첨부할 수 있습니다.",
          variant: "destructive",
        })
      }
    }
    // Reset file input to allow capturing the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const previewToRemove = imagePreviews[indexToRemove]
    URL.revokeObjectURL(previewToRemove) // Revoke blob URL

    setImagePreviews((prevPreviews) => prevPreviews.filter((_, index) => index !== indexToRemove))
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, index) => index !== indexToRemove),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipment) {
      toast({ title: "오류", description: "설비 정보가 없습니다.", variant: "destructive" })
      return
    }
    if (!formData.title) {
      toast({ title: "오류", description: "고장 제목을 입력해주세요.", variant: "destructive" })
      return
    }

    const newFailure: Failure = {
      id: `failure-mobile-${Date.now()}`,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      title: formData.title!,
      description: formData.description || "",
      type: formData.type || FailureType.MECHANICAL,
      priority: formData.priority || FailurePriority.MEDIUM,
      status: FailureStatus.REPORTED,
      reportedAt: new Date().toISOString(),
      reporterName: "모바일 사용자", // Or get from auth context
      reporterContact: "",
      symptom: formData.symptom || "",
      possibleCauses: "",
      recommendedActions: "",
      preventionMethods: "",
      attachments: formData.attachments || [],
      estimatedCost: 0,
      actualCost: 0,
      downtimeHours: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSubmit(newFailure)
  }

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(URL.revokeObjectURL)
    }
  }, [imagePreviews])

  if (!equipment) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">설비 정보 없음</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Icon name="warning" className="mx-auto text-yellow-500" style={{ fontSize: 48 }} />
          <p className="mt-4">QR 코드를 다시 스캔해주세요.</p>
          <Button onClick={onCancel} className="mt-6 w-full">
            다시 스캔하기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>고장 등록 (QR)</CardTitle>
        <p className="text-sm text-muted-foreground">
          설비: {equipment.name} ({equipment.code})
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              고장 제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              placeholder="예: 컨베이어 벨트 소음 발생"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">고장 유형</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange("type", value as FailureType)}>
              <SelectTrigger>
                <SelectValue placeholder="유형 선택" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FailureType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">우선순위</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange("priority", value as FailurePriority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="우선순위 선택" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FailurePriority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptom">주요 증상</Label>
            <Textarea
              id="symptom"
              value={formData.symptom}
              onChange={(e) => handleChange("symptom", e.target.value)}
              placeholder="예: 작동 중 '덜컹'거리는 소리가 남"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">상세 설명 (선택)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="고장에 대한 자세한 내용을 입력하세요."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>사진 첨부</Label>
            <Input
              type="file"
              accept="image/*"
              capture="environment" // Prioritize back camera
              onChange={handlePhotoCapture}
              ref={fileInputRef}
              className="hidden"
            />
            <Button type="button" variant="outline" onClick={handleTakePhotoClick} className="w-full">
              <Icon name="photo_camera" size="sm" className="mr-2" /> 사진 촬영/선택
            </Button>
            {imagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`첨부파일 ${index + 1}`}
                      className="object-cover w-full h-24 rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-75 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Icon name="close" size="sm" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              취소 / 다시 스캔
            </Button>
            <Button type="submit" className="w-full sm:w-auto flex-grow">
              고장 등록
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
