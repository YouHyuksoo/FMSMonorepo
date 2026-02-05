"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import type { PlacedEquipment, DraggableEquipment, FloorPlan } from "@fms/types"
import { EquipmentMapIcon } from "./equipment-map-icon"
import { EquipmentPalette } from "./equipment-palette"
import { Button } from "@fms/ui/button"
import { Icon } from "@fms/ui/icon"
import { useToast } from "@/hooks/use-toast"

interface FloorPlanEditorProps {
  floorPlan: FloorPlan
  initialPlacedEquipment: PlacedEquipment[]
  availablePaletteEquipment: DraggableEquipment[]
}

export function FloorPlanEditor({
  floorPlan,
  initialPlacedEquipment,
  availablePaletteEquipment,
}: FloorPlanEditorProps) {
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>(initialPlacedEquipment)
  const floorPlanRef = useRef<HTMLDivElement>(null)
  const draggedItemRef = useRef<DraggableEquipment | PlacedEquipment | null>(null)
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const { toast } = useToast()

  const handleDragStartPalette = (e: React.DragEvent<HTMLDivElement>, equipment: DraggableEquipment) => {
    draggedItemRef.current = equipment
    // 드래그 시작 시 마우스 포인터와 아이템 좌상단 간의 오프셋 계산 불필요 (새로 배치 시 중앙 정렬)
    e.dataTransfer.setData("application/json", JSON.stringify(equipment)) // Firefox 호환성
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragStartMapIcon = (e: React.DragEvent<HTMLDivElement>, equipment: PlacedEquipment) => {
    draggedItemRef.current = equipment
    const rect = e.currentTarget.getBoundingClientRect()
    // 아이콘 중심을 기준으로 오프셋 계산
    dragOffsetRef.current = {
      x: e.clientX - (rect.left + rect.width / 2),
      y: e.clientY - (rect.top + rect.height / 2),
    }
    e.dataTransfer.setData("application/json", JSON.stringify(equipment)) // Firefox 호환성
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault() // 필수: onDrop 이벤트를 발생시키기 위함
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!floorPlanRef.current || !draggedItemRef.current) return

    const floorPlanRect = floorPlanRef.current.getBoundingClientRect()
    const droppedItemData = draggedItemRef.current

    // 드롭된 위치 계산 (아이콘 중심 기준)
    let x = e.clientX - floorPlanRect.left
    let y = e.clientY - floorPlanRect.top

    if ("instanceId" in droppedItemData) {
      // 기존 아이템 이동
      x -= dragOffsetRef.current.x
      y -= dragOffsetRef.current.y
    }
    // 아이콘 크기의 절반을 빼서 중앙에 위치하도록 조정은 EquipmentMapIcon의 style에서 처리

    // 평면도 경계 체크
    x = Math.max(0, Math.min(x, floorPlanRect.width))
    y = Math.max(0, Math.min(y, floorPlanRect.height))

    if ("instanceId" in droppedItemData) {
      // 기존 설비 위치 업데이트
      setPlacedEquipment((prev) =>
        prev.map((eq) => (eq.instanceId === (droppedItemData as PlacedEquipment).instanceId ? { ...eq, x, y } : eq)),
      )
      toast({ title: "설비 이동", description: `"${droppedItemData.name}" 설비 위치가 변경되었습니다.` })
    } else {
      // 새 설비 추가
      const newPlacedItem: PlacedEquipment = {
        ...(droppedItemData as DraggableEquipment),
        instanceId: `placed-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        x,
        y,
      }
      setPlacedEquipment((prev) => [...prev, newPlacedItem])
      toast({ title: "설비 배치", description: `"${newPlacedItem.name}" 설비가 평면도에 배치되었습니다.` })
    }
    draggedItemRef.current = null
  }

  const handleSaveLayout = () => {
    // 실제로는 API를 통해 저장
    console.log("Saving layout:", placedEquipment)
    toast({
      title: "레이아웃 저장됨",
      description: `${placedEquipment.length}개의 설비 위치가 저장되었습니다. (콘솔 확인)`,
    })
  }

  const handleResetLayout = () => {
    setPlacedEquipment(initialPlacedEquipment)
    toast({
      title: "레이아웃 초기화",
      description: "설비 배치가 초기 상태로 복원되었습니다.",
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2rem)]">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">{floorPlan.name} - 설비 배치도</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetLayout}>
            <Icon name="refresh" size="sm" className="mr-2" /> 초기화
          </Button>
          <Button onClick={handleSaveLayout}>
            <Icon name="save" size="sm" className="mr-2" /> 레이아웃 저장
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 flex-shrink-0 h-full overflow-y-auto">
          <EquipmentPalette availableEquipment={availablePaletteEquipment} />
        </div>
        <div className="flex-1 p-4 overflow-auto bg-muted/30">
          <div
            ref={floorPlanRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative mx-auto border-2 border-dashed border-gray-300 rounded-md"
            style={{ width: `${floorPlan.width}px`, height: `${floorPlan.height}px` }}
          >
            <Image
              src={floorPlan.imageUrl || "/placeholder.svg"}
              alt={floorPlan.name}
              layout="fill"
              objectFit="contain" // 또는 "cover", "scale-down" 등 필요에 따라 조정
              priority
            />
            {placedEquipment.map((eq) => (
              <EquipmentMapIcon
                key={eq.instanceId}
                equipment={eq}
                onDragStart={(e, draggedEq) => handleDragStartMapIcon(e, draggedEq)}
                // onClick={(eq) => console.log("Clicked on map icon:", eq)} // 팝업 트리거
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
