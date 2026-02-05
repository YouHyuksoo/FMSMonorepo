"use client"

import type { DraggableEquipment } from "@fms/types"
import { EquipmentPaletteItem } from "./equipment-palette-item"
import { ScrollArea } from "@fms/ui/scroll-area"
import { Input } from "@fms/ui/input"
import { useState } from "react"

interface EquipmentPaletteProps {
  availableEquipment: DraggableEquipment[]
}

export function EquipmentPalette({ availableEquipment }: EquipmentPaletteProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEquipment = availableEquipment.filter(
    (eq) =>
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="w-full h-full flex flex-col border-r bg-card p-4">
      <h3 className="text-lg font-semibold mb-3">설비 목록</h3>
      <Input
        placeholder="설비명 또는 유형 검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3"
      />
      <ScrollArea className="flex-grow">
        {filteredEquipment.length > 0 ? (
          filteredEquipment.map((eq) => <EquipmentPaletteItem key={eq.id} equipment={eq} />)
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">사용 가능한 설비가 없습니다.</p>
        )}
      </ScrollArea>
    </div>
  )
}
