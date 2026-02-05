"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Textarea } from "@fms/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import {
  type PreventiveOrder,
  PreventiveOrderStatus,
  PreventivePriority,
  preventiveOrderStatusLabels,
  preventivePriorityLabels,
  type PreventiveMaster, // Added for preventiveMasters prop
} from "@fms/types"
import { getTodayIsoDate } from "@fms/utils" // For setting today's date
import type { User } from "@fms/types" // For users prop

interface PreventiveOrderFormProps {
  order: PreventiveOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<PreventiveOrder>) => void
  preventiveMasters?: PreventiveMaster[] // Optional: pass full list for selection
  users?: User[] // Optional: pass full list for selection
}

const initialFormData: Partial<PreventiveOrder> = {
  masterId: "",
  masterTitle: "",
  equipmentId: "",
  equipmentName: "",
  scheduledDate: "",
  assignedTo: "",
  assignedToName: "",
  status: PreventiveOrderStatus.SCHEDULED,
  priority: PreventivePriority.MEDIUM,
  estimatedCost: 0,
  workDescription: "",
  actualEndDate: undefined, // Ensure actualEndDate is part of initial state
}

export function PreventiveOrderForm({
  order,
  open,
  onOpenChange,
  onSave,
  preventiveMasters = [],
  users = [],
}: PreventiveOrderFormProps) {
  const [formData, setFormData] = useState<Partial<PreventiveOrder>>(initialFormData)

  useEffect(() => {
    if (open) {
      if (order) {
        setFormData({
          ...order,
          // Ensure date fields are in YYYY-MM-DD or YYYY-MM-DDTHH:mm format for input type=date/datetime-local
          scheduledDate: order.scheduledDate ? new Date(order.scheduledDate).toISOString().slice(0, 16) : "",
          actualEndDate: order.actualEndDate ? new Date(order.actualEndDate).toISOString().split("T")[0] : undefined,
        })
      } else {
        setFormData(initialFormData)
      }
    }
  }, [order, open])

  // Effect to handle actualEndDate based on status
  useEffect(() => {
    if (formData.status === PreventiveOrderStatus.COMPLETED) {
      if (!formData.actualEndDate) {
        setFormData((prev) => ({ ...prev, actualEndDate: getTodayIsoDate() }))
      }
    } else {
      // If status is not COMPLETED, clear actualEndDate and disable it
      setFormData((prev) => ({ ...prev, actualEndDate: undefined }))
    }
  }, [formData.status])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dataToSave: Partial<PreventiveOrder> = {
      ...formData,
      // Ensure dates are in ISO string format if they exist
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
      actualEndDate: formData.actualEndDate ? new Date(formData.actualEndDate).toISOString() : undefined,
    }
    onSave(dataToSave)
    onOpenChange(false)
  }

  const handleMasterChange = (masterId: string) => {
    const master = preventiveMasters.find((m) => m.id === masterId)
    setFormData({
      ...formData,
      masterId,
      masterTitle: master?.title || "",
      equipmentId: master?.equipmentId || "",
      equipmentName: master?.equipmentName || "",
      estimatedCost: master?.estimatedCost || 0,
      workDescription: master?.description || "", // Assuming PreventiveMaster has description
    })
  }

  const handleAssigneeChange = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    setFormData({
      ...formData,
      assignedTo: userId,
      assignedToName: user?.name || "",
    })
  }

  const handleDateInputChange = (field: keyof PreventiveOrder, value: string) => {
    // For datetime-local, value is already in YYYY-MM-DDTHH:mm
    // For date, value is YYYY-MM-DD
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{order ? "정비오더 수정" : "정비오더 등록"}</DialogTitle>
          <DialogDescription>
            {order ? "정비오더 정보를 수정합니다." : "새로운 정비오더를 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="masterId">예방정비마스터 *</Label>
              <Select value={formData.masterId || ""} onValueChange={handleMasterChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="마스터를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {preventiveMasters.map((master) => (
                    <SelectItem key={master.id} value={master.id}>
                      {master.title} ({master.equipmentName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">예정일 *</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate || ""}
                onChange={(e) => handleDateInputChange("scheduledDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">담당자 *</Label>
              <Select value={formData.assignedTo || ""} onValueChange={handleAssigneeChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="담당자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">우선순위</Label>
              <Select
                value={formData.priority || PreventivePriority.MEDIUM}
                onValueChange={(value) => setFormData({ ...formData, priority: value as PreventivePriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(preventivePriorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">상태</Label>
              <Select
                value={formData.status || PreventiveOrderStatus.SCHEDULED}
                onValueChange={(value) => setFormData({ ...formData, status: value as PreventiveOrderStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(preventiveOrderStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualEndDate">실제완료일</Label>
              <Input
                id="actualEndDate"
                type="date" // Changed to 'date' for YYYY-MM-DD
                value={formData.actualEndDate || ""}
                onChange={(e) => handleDateInputChange("actualEndDate", e.target.value)}
                disabled={formData.status !== PreventiveOrderStatus.COMPLETED}
                required={formData.status === PreventiveOrderStatus.COMPLETED}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedCost">예상비용 (원)</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={formData.estimatedCost || 0}
                onChange={(e) => setFormData({ ...formData, estimatedCost: Number.parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <div className="col-span-full space-y-2">
              {" "}
              {/* Changed to col-span-full for better layout */}
              <Label htmlFor="workDescription">작업 설명</Label>
              <Textarea
                id="workDescription"
                value={formData.workDescription || ""}
                onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                placeholder="작업 내용을 입력하세요"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">{order ? "수정" : "등록"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
