export const dashboardSummary = {
  totalEquipment: {
    value: 1234,
    change: 2,
  },
  failedEquipment: {
    value: 23,
    change: -5,
  },
  inspectionRate: {
    value: 94.2,
    change: 1.2,
  },
  pendingWork: {
    value: 47,
    change: 12,
  },
};

export const recentFailures = [
  { id: 1, equipment: "압축기 #001", cause: "베어링 이상", time: "2시간 전" },
  { id: 2, equipment: "컨베이어 #005", cause: "모터 과열", time: "5시간 전" },
  { id: 3, equipment: "펌프 #003", cause: "누수 발생", time: "1일 전" },
];

export const todaysInspections = [
  { id: 1, title: "일일점검 - A라인", manager: "김기사", status: "completed" },
  {
    id: 2,
    title: "주간점검 - B라인",
    manager: "이기사",
    status: "in_progress",
  },
  { id: 3, title: "월간점검 - C라인", manager: "박기사", status: "pending" },
];

export const inspectionStatus: {
  [key: string]: { text: string; color: string };
} = {
  completed: { text: "완료", color: "text-green-600" },
  in_progress: { text: "진행중", color: "text-orange-600" },
  pending: { text: "대기", color: "text-muted-foreground" },
};
