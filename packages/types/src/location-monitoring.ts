import type { EquipmentStatus } from "./equipment-master"

export interface DraggableEquipment {
  id: string // 설비의 고유 ID (e.g., mockEquipment의 id)
  name: string
  type: string // 설비 유형 (e.g., '압축기', '펌프')
  status: EquipmentStatus
}

export interface PlacedEquipment extends DraggableEquipment {
  instanceId: string // 맵 위에 배치된 설비 인스턴스의 고유 ID
  x: number // 평면도 내 x 좌표 (px)
  y: number // 평면도 내 y 좌표 (px)
}

export interface FloorPlan {
  id: string
  name: string
  imageUrl: string // 평면도 이미지 URL
  width: number // 평면도 이미지 원본 너비
  height: number // 평면도 이미지 원본 높이
}
