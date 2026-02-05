// No changes, just for reference
export enum EquipmentTypeCategory {
  ROTATING = "ROTATING", // 회전기기
  STATIC = "STATIC", // 고정기기
  ELECTRICAL = "ELECTRICAL", // 전기설비
  INSTRUMENTATION = "INSTRUMENTATION", // 계측설비
  UTILITY = "UTILITY", // 유틸리티
  SAFETY = "SAFETY", // 안전설비
  OTHER = "OTHER", // 기타
}

export interface EquipmentType {
  id: string;
  name: string;
  code: string;
  category: EquipmentTypeCategory;
  description?: string;
}

export enum InspectionTypeCategory {
  PREVENTIVE = "PREVENTIVE", // 예방점검
  PREDICTIVE = "PREDICTIVE", // 예지점검
  CORRECTIVE = "CORRECTIVE", // 고장점검 (사후보전의 일부로 볼 수도 있음)
  LEGAL = "LEGAL", // 법정점검
  SAFETY_INSPECTION = "SAFETY_INSPECTION", // 안전점검
  ROUTINE = "ROUTINE", // 일상점검
  OTHER = "OTHER", // 기타
}

export interface InspectionType {
  id: string;
  name: string;
  code: string;
  category: InspectionTypeCategory;
  description?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  departmentId?: string;
  departmentName?: string; // For convenience
}

// PeriodType을 enum으로 변경
export enum PeriodType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  SEMI_ANNUALLY = "SEMI_ANNUALLY",
  ANNUALLY = "ANNUALLY",
  ON_DEMAND = "ON_DEMAND",
  CUSTOM_DAYS = "CUSTOM_DAYS",
  CUSTOM_WEEKS = "CUSTOM_WEEKS",
  CUSTOM_MONTHS = "CUSTOM_MONTHS",
  CUSTOM_YEARS = "CUSTOM_YEARS",
}

export const periodTypeLabels: Record<PeriodType, string> = {
  [PeriodType.DAILY]: "inspection.period.daily",
  [PeriodType.WEEKLY]: "inspection.period.weekly",
  [PeriodType.MONTHLY]: "inspection.period.monthly",
  [PeriodType.QUARTERLY]: "inspection.period.quarterly",
  [PeriodType.SEMI_ANNUALLY]: "inspection.period.semi_annually",
  [PeriodType.ANNUALLY]: "inspection.period.annually",
  [PeriodType.CUSTOM_DAYS]: "inspection.period.custom_days",
  [PeriodType.CUSTOM_WEEKS]: "inspection.period.custom_weeks",
  [PeriodType.CUSTOM_MONTHS]: "inspection.period.custom_months",
  [PeriodType.CUSTOM_YEARS]: "inspection.period.custom_years",
  [PeriodType.ON_DEMAND]: "inspection.period.on_demand",
};

export interface InspectionMasterItem {
  id: string;
  sequence: number;
  name: string; // 점검항목명 (예: "오일 레벨 확인")
  description?: string; // 상세 설명
  checkMethod?: string; // 점검 방법 (예: "육안 확인", "게이지 확인")
  expectedValue?: string; // 기준값 (예: "정상 범위", "5-10mm", "Y")
  dataType?: "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT"; // 결과 데이터 타입
  unit?: string; // 단위 (dataType이 NUMBER일 경우)
  tolerance?: string; // 허용오차 (dataType이 NUMBER일 경우)
  options?: string[]; // 선택 옵션 (dataType이 SELECT일 경우)
  isRequired?: boolean; // 필수 항목 여부
  referenceDocument?: string; // 참고 문서
  safetyNotes?: string; // 안전 참고사항
  imageUrl?: string; // 참고 이미지 URL
}

export interface InspectionMaster {
  id: string;
  code: string; // 템플릿 코드 (예: TPL-COMP-001)
  name: string; // 템플릿명 (예: 압축기 일일 점검)
  version: string; // 버전 (예: "1.0", "1.1")
  description?: string; // 설명
  equipmentTypeId?: string; // 대상 설비 유형 ID
  equipmentType?: EquipmentType; // 대상 설비 유형
  inspectionTypeId?: string; // 점검 유형 ID
  inspectionType?: InspectionType; // 점검 유형
  periodType: PeriodType; // 점검 주기 유형
  periodValue: number; // 점검 주기 값 (예: periodType이 DAILY이고 periodValue가 1이면 매일)
  estimatedTime?: number; // 예상 소요 시간 (분)
  departmentId?: string; // 담당 부서 ID
  department?: Department; // 담당 부서
  responsibleUserId?: string; // 담당자 ID
  responsibleUser?: User; // 담당자
  items: InspectionMasterItem[]; // 점검 항목 목록
  isActive: boolean; // 활성 여부
  effectiveDate: string; // 적용 시작일 (YYYY-MM-DD)
  expiryDate?: string; // 적용 만료일 (YYYY-MM-DD)
  revisionHistory?: Array<{
    version: string;
    date: string;
    changes: string;
    revisedBy: string;
  }>; // 개정 이력
  tags?: string[]; // 태그
  relatedDocuments?: Array<{ name: string; url: string }>; // 관련 문서
  createdAt: string;
  updatedAt: string;
  createdBy: User | string; // string for ID, User for object
  updatedBy: User | string;
}
