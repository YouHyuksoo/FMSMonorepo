"use client"

import { FloorPlanEditor } from "@/components/location/floor-plan-editor"
import {
  sampleFloorPlan,
  initialPlacedEquipment,
  availableEquipmentForPalette,
} from "@/lib/mock-data/location-monitoring"

export default function LocationLayoutPage() {
  return (
    <FloorPlanEditor
      floorPlan={sampleFloorPlan}
      initialPlacedEquipment={initialPlacedEquipment}
      availablePaletteEquipment={availableEquipmentForPalette}
    />
  )
}
