"use client"

import type React from "react"

import type { DraggableEquipment } from "@fms/types"
import { Card, CardContent } from "@fms/ui/card"
import { Icon } from "@fms/ui/icon"

interface EquipmentPaletteItemProps {
  equipment: DraggableEquipment
}

const getStatusStyles = (status: DraggableEquipment["status"]) => {
  switch (status) {
    case "running":
      return { icon: <Icon name="check_circle" size="sm" className="text-green-500" />, color: "border-green-500" }
    case "stopped":
      return { icon: <Icon name="power_settings_new" size="sm" className="text-gray-500" />, color: "border-gray-500" }
    case "maintenance":
      return { icon: <Icon name="build" size="sm" className="text-blue-500" />, color: "border-blue-500" }
    case "failure":
      return { icon: <Icon name="warning" size="sm" className="text-red-500" />, color: "border-red-500" }
    default:
      return { icon: <Icon name="settings" size="sm" className="text-gray-400" />, color: "border-gray-400" }
  }
}

export function EquipmentPaletteItem({ equipment }: EquipmentPaletteItemProps) {
  const statusInfo = getStatusStyles(equipment.status)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/json", JSON.stringify(equipment))
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className={`mb-2 cursor-grab active:cursor-grabbing border-l-4 ${statusInfo.color} hover:shadow-md transition-shadow`}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{equipment.name}</span>
          {statusInfo.icon}
        </div>
        <p className="text-xs text-muted-foreground">{equipment.type}</p>
      </CardContent>
    </Card>
  )
}
