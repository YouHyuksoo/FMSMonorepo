import type { DraggableEquipment, PlacedEquipment, FloorPlan } from "@fms/types"
import { mockEquipment } from "./equipment" // 기존 설비 목업 데이터 활용

export const availableEquipmentForPalette: DraggableEquipment[] = mockEquipment
  .slice(0, 5) // 예시로 5개 설비만 팔레트에 표시
  .map((eq) => ({
    id: eq.id,
    name: eq.name,
    type: eq.type,
    status: eq.status,
  }))

export const initialPlacedEquipment: PlacedEquipment[] = [
  {
    instanceId: "placed-eq-1",
    id: mockEquipment[0].id,
    name: mockEquipment[0].name,
    type: mockEquipment[0].type,
    status: mockEquipment[0].status,
    x: 100,
    y: 150,
  },
  {
    instanceId: "placed-eq-2",
    id: mockEquipment[1].id,
    name: mockEquipment[1].name,
    type: mockEquipment[1].type,
    status: "failure", // 상태를 다르게 설정하여 시각적 확인
    x: 300,
    y: 250,
  },
]

export const sampleFloorPlan: FloorPlan = {
  id: "fp-1",
  name: "1층 생산 라인 A",
  imageUrl: "/placeholder-floor-plan.svg?width=1200&height=800&text=1%E층+%EC%83%9D%EC%82%B0+%EB%9D%BC%EC%9D%B8+A", // placeholder 이미지 사용
  width: 1200,
  height: 800,
}
