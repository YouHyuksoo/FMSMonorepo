export interface TPMTeam {
  id: string;
  code: string;
  name: string;
  description: string;
  department: string;
  leader: string;
  leaderName: string;
  members: TPMTeamMember[];
  equipmentArea: string;
  targetEquipments: string[];
  establishedDate: string;
  status: "active" | "inactive";
  meetingDay: string;
  meetingTime: string;
  meetingLocation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface TPMTeamMember {
  id: string;
  userId: string;
  userName: string;
  department: string;
  position: string;
  role: "leader" | "facilitator" | "secretary" | "member";
  joinDate: string;
  isActive: boolean;
}

export interface TPMActivity {
  id: string;
  activityNo: string;
  title: string;
  description: string;
  teamId: string;
  teamName: string;
  activityType:
    | "tpm.activity.autonomous"
    | "tpm.activity.planned"
    | "tpm.activity.quality"
    | "tpm.activity.focused"
    | "tpm.activity.early"
    | "tpm.activity.training"
    | "tpm.activity.safety"
    | "tpm.activity.office";
  pillar: TPMPillar;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  priority: "high" | "normal" | "low";
  equipmentIds: string[];
  equipmentNames: string[];
  location: string;
  startDate: string;
  endDate: string;
  completionDate?: string;
  completionRate: number;
  goals: TPMGoal[];
  activities: TPMSubActivity[];
  beforeImages?: TPMImage[];
  afterImages?: TPMImage[];
  attachments?: TPMAttachment[];
  results?: TPMResult;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface TPMGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  achievementRate: number;
}

export interface TPMSubActivity {
  id: string;
  step: number;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  completionNotes?: string;
}

export interface TPMImage {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  description: string;
  takenAt: string;
  takenBy: string;
  takenByName: string;
}

export interface TPMAttachment {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  type: "document" | "image" | "video" | "other";
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
}

export interface TPMResult {
  id: string;
  summary: string;
  improvements: string;
  beforeMetrics: TPMMetrics;
  afterMetrics: TPMMetrics;
  costSavings: number;
  timeReduction: number;
  qualityImprovement: number;
  safetyImprovement: string;
  lessonsLearned: string;
  nextSteps: string;
}

export interface TPMMetrics {
  oee?: number;
  mtbf?: number;
  mttr?: number;
  availability?: number;
  performance?: number;
  quality?: number;
  defectRate?: number;
  setupTime?: number;
  cycleTime?: number;
  energyUsage?: number;
  customMetrics?: { [key: string]: number };
}

export interface TPMTeamFormData {
  code: string;
  name: string;
  description: string;
  department: string;
  leader: string;
  equipmentArea: string;
  targetEquipments: string[];
  establishedDate: string;
  meetingDay: string;
  meetingTime: string;
  meetingLocation: string;
  members: TPMTeamMember[];
}

export interface TPMActivityFormData {
  title: string;
  description: string;
  teamId: string;
  activityType:
    | "tpm.activity.autonomous"
    | "tpm.activity.planned"
    | "tpm.activity.quality"
    | "tpm.activity.focused"
    | "tpm.activity.early"
    | "tpm.activity.training"
    | "tpm.activity.safety"
    | "tpm.activity.office";
  pillar: TPMPillar;
  priority: "high" | "normal" | "low";
  equipmentIds: string[];
  location: string;
  startDate: string;
  endDate: string;
  goals: TPMGoal[];
  activities: TPMSubActivity[];
}

export interface TPMFilter {
  teamId?: string;
  activityType?: string;
  pillar?: string;
  status?: string;
  priority?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  equipmentId?: string;
  searchTerm?: string;
}

export type TPMPillar =
  | "tpm.pillar.autonomous"
  | "tpm.pillar.planned"
  | "tpm.pillar.quality"
  | "tpm.pillar.improvement"
  | "tpm.pillar.initial"
  | "tpm.pillar.training"
  | "tpm.pillar.safety"
  | "tpm.pillar.office";

export const tpmPillarLabels: Record<TPMPillar, string> = {
  "tpm.pillar.autonomous": "자주보전",
  "tpm.pillar.planned": "계획보전",
  "tpm.pillar.quality": "품질보전",
  "tpm.pillar.improvement": "개별개선",
  "tpm.pillar.initial": "초기관리",
  "tpm.pillar.training": "교육훈련",
  "tpm.pillar.safety": "안전환경",
  "tpm.pillar.office": "사무TPM",
};
