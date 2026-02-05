"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Textarea } from "@fms/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { type Failure, FailureType, FailurePriority } from "@fms/types"
import type { Equipment } from "@fms/types"
import { Icon } from "@fms/ui/icon"

interface FailureFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  failure: Failure | null
  onSave: (data: Partial<Failure>) => void
  equipmentOptions: Equipment[]
}

export function FailureForm({ open, onOpenChange, failure, onSave, equipmentOptions }: FailureFormProps) {
  const [formData, setFormData] = useState<Partial<Failure>>(
    failure || {
      title: "",
      equipmentId: "",
      equipmentName: "",
      description: "",
      type: FailureType.MECHANICAL,
      priority: FailurePriority.MEDIUM,
      reporterName: "",
      reporterContact: "",
      symptom: "",
      possibleCauses: "",
      recommendedActions: "",
      preventionMethods: "",
      estimatedCost: 0,
      attachments: [], // Initialize attachments
    },
  )
  // Store image previews (blob URLs or existing URLs)
  const [imagePreviews, setImagePreviews] = useState<string[]>(failure?.attachments || [])

  useEffect(() => {
    if (open) {
      const initialData = failure || {
        title: "",
        equipmentId: "",
        equipmentName: "",
        description: "",
        type: FailureType.MECHANICAL,
        priority: FailurePriority.MEDIUM,
        reporterName: "",
        reporterContact: "",
        symptom: "",
        possibleCauses: "",
        recommendedActions: "",
        preventionMethods: "",
        estimatedCost: 0,
        attachments: [],
      }
      setFormData(initialData)
      setImagePreviews(initialData.attachments || [])
    }
  }, [failure, open])

  const handleChange = (field: keyof Failure, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "equipmentId") {
      const equipment = equipmentOptions.find((eq) => eq.id === value)
      if (equipment) {
        setFormData((prev) => ({ ...prev, equipmentName: equipment.name }))
      }
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newPreviews: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith("image/")) {
          const previewUrl = URL.createObjectURL(file)
          newPreviews.push(previewUrl)
        }
      }
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews])
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const previewToRemove = imagePreviews[indexToRemove]
    // Revoke blob URL if it is one, to free up memory
    if (previewToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(previewToRemove)
    }
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, uploaded files (represented by blob URLs in imagePreviews)
    // would be uploaded to a server here, and their persistent URLs would be stored.
    // For this mock, we're directly saving the blob URLs or existing URLs.
    onSave({ ...formData, attachments: imagePreviews })
  }

  // Clean up blob URLs when dialog closes or component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview)
        }
      })
    }
  }, [imagePreviews])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{failure ? "고장 정보 수정" : "새 고장 등록"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
          {/* ... other form fields ... */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">고장 제목</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipmentId">설비</Label>
              <Select value={formData.equipmentId || ""} onValueChange={(value) => handleChange("equipmentId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="설비 선택" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentOptions.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id}>
                      {equipment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">고장 유형</Label>
              <Select
                value={formData.type || FailureType.MECHANICAL}
                onValueChange={(value) => handleChange("type", value)}
              >
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
                value={formData.priority || FailurePriority.MEDIUM}
                onValueChange={(value) => handleChange("priority", value)}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">고장 설명</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">사진 첨부</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Icon name="cloud_upload" size="sm" className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <Input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                />
              </label>
            </div>
            {imagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
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
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Icon name="close" size="sm" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reporterName">신고자 이름</Label>
              <Input
                id="reporterName"
                value={formData.reporterName || ""}
                onChange={(e) => handleChange("reporterName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reporterContact">연락처</Label>
              <Input
                id="reporterContact"
                value={formData.reporterContact || ""}
                onChange={(e) => handleChange("reporterContact", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptom">증상</Label>
            <Textarea
              id="symptom"
              value={formData.symptom || ""}
              onChange={(e) => handleChange("symptom", e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="possibleCauses">가능한 원인</Label>
              <Textarea
                id="possibleCauses"
                value={formData.possibleCauses || ""}
                onChange={(e) => handleChange("possibleCauses", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendedActions">권장 조치</Label>
              <Textarea
                id="recommendedActions"
                value={formData.recommendedActions || ""}
                onChange={(e) => handleChange("recommendedActions", e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preventionMethods">예방 방법</Label>
              <Textarea
                id="preventionMethods"
                value={formData.preventionMethods || ""}
                onChange={(e) => handleChange("preventionMethods", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">예상 비용</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={formData.estimatedCost || 0}
                onChange={(e) => handleChange("estimatedCost", Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">저장</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
