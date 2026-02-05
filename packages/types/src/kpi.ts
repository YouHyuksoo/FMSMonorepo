// KPI 메트릭 타입 정의
export interface KPIMetrics {
  id: string;
  equipmentId: string;
  equipmentName: string;
  mtbf?: number; // MTBF (평균 고장 간격)
  mttr?: number; // MTTR (평균 수리 시간)
  availability: number; // 가동률 (%)
  performance?: number; // 성능률 (%)
  quality?: number; // 품질률 (%)
  healthScore: number; // 건강점수 (0-100)
  oee: number; // Overall Equipment Effectiveness (%)
  healthGrade: "A" | "B" | "C" | "D" | "F";
  riskLevel: "low" | "medium" | "high" | "critical";
  trend: "improving" | "stable" | "declining";
  lastUpdated: string;
}

// 설비 건강점수 상세
export interface KPIHealthDetail {
  equipmentId: string;
  equipmentName: string;
  location: string;
  score: number; // 건강점수 (0-100)
  grade: "A" | "B" | "C" | "D" | "F"; // 건강등급
  riskLevel: "low" | "medium" | "high" | "critical";
  lastMaintenance: string;
  nextMaintenance: string;
  issues: string[];
  factors: {
    name: string; // 요인명
    score: number; // 점수
    weight: number; // 가중치
    impact: number; // 영향도
  }[];
  recommendations: string[]; // 개선 권장사항
}

// KPI 트렌드 분석
export interface KPITrend {
  metric: string; // 지표명
  values: number[]; // 값 배열
  dates: string[]; // 날짜 배열
  trend: "improving" | "stable" | "declining"; // 추세
  change: number; // 변화율
}

// KPI 벤치마크
export interface KPIBenchmark {
  metric: string; // 지표명
  value: number; // 현재값
  target: number; // 목표값
  industry: number; // 산업 평균
  best: number; // 최고값
  worst: number; // 최저값
}

// KPI 목표 설정
export interface KPIGoal {
  metric: string; // 지표명
  target: number; // 목표값
  current: number; // 현재값
  unit: string; // 단위
  period: string; // 기간
  status: "on_track" | "at_risk" | "off_track"; // 상태
  progress: number; // 진행률
}

// KPI 알림 설정
export interface KPIAlert {
  id: string;
  metric: string; // 지표명
  condition: "above" | "below" | "equals"; // 조건
  threshold: number; // 임계값
  severity: "low" | "medium" | "high" | "critical"; // 심각도
  message: string; // 알림 메시지
  isActive: boolean; // 활성화 여부
  recipients: string[]; // 수신자 목록
}

export const healthGradeLabels: Record<string, string> = {
  A: "kpi.health.grade.a",
  B: "kpi.health.grade.b",
  C: "kpi.health.grade.c",
  D: "kpi.health.grade.d",
  F: "kpi.health.grade.f",
};

export const riskLevelLabels: Record<string, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  critical: "위험",
};

export const kpiSeverityLabels: Record<string, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  critical: "위험",
};

export const kpiTrendLabels: Record<string, string> = {
  improving: "개선",
  stable: "안정",
  declining: "악화",
};

export const kpiMetricLabels: Record<string, string> = {
  mtbf: "MTBF (평균 고장 간격)",
  mttr: "MTTR (평균 수리 시간)",
  availability: "가동률",
  reliability: "신뢰도",
  maintainability: "보전성",
  oee: "종합설비효율",
  healthScore: "건강점수",
};

export const kpiUnitLabels: Record<string, string> = {
  mtbf: "시간",
  mttr: "시간",
  availability: "%",
  reliability: "%",
  maintainability: "%",
  oee: "%",
  healthScore: "점",
};
