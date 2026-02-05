/**
 * @file packages/types/src/index.ts
 * @description FMS 공유 타입 정의 패키지 - 모든 도메인 타입을 re-export
 *
 * 중복 타입 처리:
 * - EquipmentType: equipment-master.ts 사용 (inspection-master.ts의 것은 InspectionEquipmentType으로)
 * - MaterialStock: material-stock.ts 사용 (더 상세함)
 * - Warehouse: material-stock.ts 사용 (더 상세함)
 * - MaterialTransaction: material-transaction.ts 사용 (더 상세함)
 * - User: user.ts 사용 (inspection-master.ts의 것은 InspectionUser로)
 */

import type { ReactNode } from "react";

// Navigation types
export interface MainNavItem {
  title: string;
  href: string;
  disabled?: boolean;
  icon?: ReactNode;
  items?: MainNavItem[];
  description?: string;
  requiredPermissions?: string[];
  external?: boolean;
}

// Code types
export * from "./code";

// Equipment types (equipment.ts)
export * from "./equipment";

// Equipment Master types (equipment-master.ts) - EquipmentType, EquipmentStatus 등
export * from "./equipment-master";

// Equipment sub-types
export * from "./equipment-bom";
export * from "./equipment-document";
export * from "./equipment-health";
export * from "./equipment-specification";

// Failure types
export * from "./failure";

// Inspection types - 중복 제거를 위해 명시적 re-export
export {
  EquipmentTypeCategory,
  InspectionTypeCategory,
  PeriodType,
  periodTypeLabels,
} from "./inspection-master";

export type {
  InspectionType,
  Department,
  InspectionMasterItem,
  InspectionMaster,
} from "./inspection-master";

// inspection-master.ts의 EquipmentType과 User를 별칭으로 export
export type {
  EquipmentType as InspectionEquipmentType,
  User as InspectionUser,
} from "./inspection-master";

export * from "./inspection-result";
export * from "./inspection-schedule";
export * from "./inspection-standard";

// KPI types
export * from "./kpi";

// Language types
export * from "./language";

// Location Monitoring types
export * from "./location-monitoring";

// Maintenance types
export * from "./maintenance";

// Material types - 기본 Material만 export
export { type Material } from "./material";

// Material 상세 types (중복 타입은 여기서 export)
export * from "./material-issuance";
export * from "./material-master";
export * from "./material-stock"; // MaterialStock, Warehouse, StockAdjustment
export * from "./material-transaction"; // MaterialTransaction, TransactionDetail

// Metering types
export * from "./metering";

// MTBF types
export * from "./mtbf";

// Organization types
export * from "./organization";

// Permission types
export * from "./permission";

// Preventive types
export * from "./preventive";

// Sensor types
export * from "./sensor";

// TPM types
export * from "./tpm";

// User types (main User type)
export * from "./user";
