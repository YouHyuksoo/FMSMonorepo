import type { Equipment } from "./equipment"
import type { EquipmentType } from "./equipment-master"
import type { InspectionMaster, InspectionMasterItem } from "./inspection-master"
import type { User } from "./user"

export interface InspectionStandardItem {
  id: string
  standardId: string // InspectionStandard ID
  masterItemId: string // InspectionMasterItem ID (원본 템플릿 항목 ID)
  masterItem?: InspectionMasterItem // 원본 템플릿 항목 정보 (optional)

  sequence: number
  name: string // 점검항목명 (템플릿에서 가져오거나 수정 가능)
  description?: string
  checkMethod?: string
  expectedValue?: string // 기준값 (템플릿에서 가져오거나 수정/구체화 가능)
  dataType?: "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT"
  unit?: string
  tolerance?: string
  options?: string[]
  isRequired?: boolean
  referenceDocument?: string
  safetyNotes?: string
  imageUrl?: string

  // 기준서별 특화 정보
  specificInstructions?: string // 이 기준서에만 해당하는 특별 지시사항
  passFailCriteria?: string // 합격/불합격 기준 (더 명확하게)
  measurementPoints?: number // 측정 포인트 수 (필요시)

  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface InspectionStandard {
  id: string
  code: string // 기준서 코드 (예: STD-COMP-DAILY-001)
  name: string // 기준서명 (예: 압축기 A 모델 일일 점검 기준서)
  version: string
  description?: string

  masterId: string // InspectionMaster ID (어떤 템플릿을 기반으로 했는지)
  master?: InspectionMaster // InspectionMaster 정보 (optional)

  // 적용 대상: 설비 유형 또는 특정 설비
  targetType: "EQUIPMENT_TYPE" | "EQUIPMENT"
  equipmentTypeId?: string // 적용 대상 설비 유형 ID
  equipmentType?: EquipmentType // 적용 대상 설비 유형 정보 (optional)
  equipmentId?: string // 적용 대상 특정 설비 ID
  equipment?: Equipment // 적용 대상 특정 설비 정보 (optional)
  // equipmentIds?: string[]; // 여러 설비에 동시 적용 시

  items: InspectionStandardItem[] // 이 기준서에 포함된 점검 항목들

  isActive: boolean
  effectiveDate: string // 적용 시작일
  expiryDate?: string // 적용 만료일
  revisionHistory?: Array<{ version: string; date: string; changes: string; revisedBy: string }>

  createdAt: string
  updatedAt: string
  createdBy: User | string
  updatedBy: User | string
}
