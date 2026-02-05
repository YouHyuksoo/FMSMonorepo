"use client"

import { FloorPlanEditor } from "@/components/location/floor-plan-editor"

export default function LocationLayoutPage() {
  // TODO: 실제 API에서 도면 및 설비 배치 데이터를 가져와야 함
  return (
    <FloorPlanEditor
      floorPlan={null}
      initialPlacedEquipment={[]}
      availablePaletteEquipment={[]}
    />
  )
}
