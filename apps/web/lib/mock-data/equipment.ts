export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  typeCode: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  location: string;
  locationId: string;
  department: string;
  departmentId: string;
  status: "running" | "stopped" | "maintenance" | "failure";
  priority: "critical" | "high" | "normal" | "low";
  installDate: string;
  warrantyEndDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  specifications: { [key: string]: string };
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  typeId: string;
  customProperties: { [key: string]: string };
}

export const mockEquipment: Equipment[] = [
  {
    id: "1",
    code: "COMP-A1-001",
    name: "공기압축기 #1",
    type: "압축기",
    typeCode: "COMPRESSOR",
    model: "CP-100A",
    manufacturer: "한국압축기",
    serialNumber: "CP2023001",
    location: "A동 1층",
    locationId: "LOC-A1",
    department: "생산1팀",
    departmentId: "1",
    status: "running",
    priority: "critical",
    installDate: "2023-01-15",
    warrantyEndDate: "2025-01-14",
    lastMaintenanceDate: "2023-12-10",
    nextMaintenanceDate: "2024-03-10",
    specifications: {
      정격출력: "75kW",
      작동압력: "8bar",
      공기토출량: "12.5m³/min",
      소음레벨: "72dB",
      냉각방식: "공냉식",
    },
    description: "메인 공기압축기",
    isActive: true,
    createdAt: "2023-01-15T08:30:00Z",
    updatedAt: "2023-12-10T14:15:00Z",
    createdBy: "admin",
    updatedBy: "technician1",
    typeId: "TYPE-COMP",
    customProperties: {
      설치위치상세: "컴프레서실 A구역",
      담당자: "김기술",
      점검주기: "3개월",
    },
  },
  {
    id: "2",
    code: "FAN-B2-002",
    name: "배기팬 #2",
    type: "팬",
    typeCode: "FAN",
    model: "EF-200B",
    manufacturer: "대성환풍기",
    serialNumber: "EF2023002",
    location: "B동 2층",
    locationId: "LOC-B2",
    department: "생산2팀",
    departmentId: "2",
    status: "stopped",
    priority: "low",
    installDate: "2023-02-20",
    warrantyEndDate: "2025-02-19",
    lastMaintenanceDate: "2024-01-05",
    nextMaintenanceDate: "2024-04-05",
    specifications: {
      풍량: "200m³/min",
      정압: "300Pa",
      전압: "220V",
      소비전력: "1.5kW",
      회전수: "1750RPM",
    },
    description: "생산라인 배기용 팬",
    isActive: true,
    createdAt: "2023-02-20T09:45:00Z",
    updatedAt: "2024-01-05T11:20:00Z",
    createdBy: "admin",
    updatedBy: "technician2",
    typeId: "TYPE-FAN",
    customProperties: {
      필터교체주기: "6개월",
      베어링타입: "볼베어링",
      진동측정위치: "모터측",
    },
  },
  {
    id: "3",
    code: "PUMP-C3-003",
    name: "냉각수 펌프 #3",
    type: "펌프",
    typeCode: "PUMP",
    model: "WP-300C",
    manufacturer: "삼일펌프",
    serialNumber: "WP2023003",
    location: "C동 3층",
    locationId: "LOC-C3",
    department: "설비보전팀",
    departmentId: "3",
    status: "running",
    priority: "high",
    installDate: "2023-03-25",
    warrantyEndDate: "2025-03-24",
    lastMaintenanceDate: "2024-02-10",
    nextMaintenanceDate: "2024-05-10",
    specifications: {
      유량: "30m³/h",
      양정: "50m",
      흡입구경: "80mm",
      토출구경: "50mm",
      펌프효율: "75%",
    },
    description: "냉각수 순환 펌프",
    isActive: true,
    createdAt: "2023-03-25T10:50:00Z",
    updatedAt: "2024-02-10T15:30:00Z",
    createdBy: "admin",
    updatedBy: "technician3",
    typeId: "TYPE-PUMP",
    customProperties: {
      임펠러재질: "스테인리스",
      씰타입: "메카니컬씰",
      윤활방식: "오일윤활",
    },
  },
];

// 기존 mockEquipment를 mockEquipments로도 export
export const mockEquipments = mockEquipment;
