/**
 * @file components/sensor/sensor-analysis-management.tsx
 * @description 센서 데이터 분석 관리 컴포넌트 - 표준 DataTable 형식
 */
"use client"

import { useState, useMemo, useEffect } from "react"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Icon } from "@/components/ui/Icon"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { subDays, format } from "date-fns"

// 센서 로그 데이터 타입
interface SensorLog {
  id: string
  ts: Date
  sensorId: string
  sensorName: string
  value: number
  status: "normal" | "warning" | "error"
  remark?: string
}

// 보고서 이력 타입
interface ReportHistory {
  id: string
  title: string
  created: string
  author: string
}

// 임시 목업: 지난 7일간 시간별 값 생성
const generateMockSeries = (sensorId: string, sensorName: string): SensorLog[] => {
  const data: SensorLog[] = []
  const now = new Date()
  for (let i = 0; i < 24 * 7; i++) {
    const ts = subDays(now, 7 - Math.floor(i / 24))
    ts.setHours(i % 24, 0, 0, 0)
    const value = Math.random() * 100
    const status = value > 90 ? "error" : value > 80 ? "warning" : "normal"
    data.push({
      id: `LOG-${sensorId}-${i}`,
      ts: new Date(ts),
      sensorId,
      sensorName,
      value,
      status,
      remark: status === "error" ? "임계값 초과" : undefined,
    })
  }
  return data
}

// 센서 목록
const sensors = [
  { id: "SNS-001", group: "온도(1공장)", desc: "1공장 A라인 온도" },
  { id: "SNS-002", group: "진동(1공장)", desc: "1공장 B라인 진동" },
  { id: "SNS-003", group: "전력(1공장)", desc: "전기실 전력" },
  { id: "SNS-004", group: "온습도(본관)", desc: "본관 2층 온습도" },
  { id: "SNS-005", group: "온도(창고)", desc: "2공장 창고 온도" },
]

// 보고서 이력 목업
const mockReportHistory: ReportHistory[] = [
  { id: "RPT-001", title: "2024년 5월 센서 리포트", created: "2024-06-01", author: "홍길동" },
  { id: "RPT-002", title: "2024년 4월 센서 리포트", created: "2024-05-01", author: "홍길동" },
]

export function SensorAnalysisManagement() {
  const [activeTab, setActiveTab] = useState<"logs" | "analysis" | "reports">("logs")
  const [selectedSensor, setSelectedSensor] = useState<string>(sensors[0].id)
  const [sensorLogs, setSensorLogs] = useState<SensorLog[]>([])
  const [analysisStart, setAnalysisStart] = useState<string>(format(subDays(new Date(), 7), "yyyy-MM-dd"))
  const [analysisEnd, setAnalysisEnd] = useState<string>(format(new Date(), "yyyy-MM-dd"))

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const selectedSensorObj = sensors.find((s) => s.id === selectedSensor)

  useEffect(() => {
    const sensorName = selectedSensorObj ? `${selectedSensorObj.group} - ${selectedSensorObj.desc}` : ""
    setSensorLogs(generateMockSeries(selectedSensor, sensorName))
  }, [selectedSensor, selectedSensorObj])

  // 기간 필터링된 데이터
  const filteredLogs = useMemo(() => {
    const start = new Date(analysisStart)
    const end = new Date(analysisEnd)
    return sensorLogs.filter((d) => d.ts >= start && d.ts <= end)
  }, [analysisStart, analysisEnd, sensorLogs])

  // 통계 계산
  const stats = useMemo(() => {
    const values = filteredLogs.map((d) => d.value)
    if (values.length === 0) return { avg: 0, max: 0, min: 0, std: 0 }
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length)
    return { avg, max, min, std }
  }, [filteredLogs])

  // 이상치 (임계값 90 초과)
  const outliers = useMemo(() => {
    return filteredLogs.filter((d) => d.value > 90)
  }, [filteredLogs])

  // 로그 데이터 컬럼 정의
  const logColumns: DataTableColumn<SensorLog>[] = [
    {
      key: "ts",
      title: "시간",
      width: "180px",
      sortable: true,
      render: (_, record) => format(record.ts, "yyyy-MM-dd HH:mm:ss"),
    },
    {
      key: "sensorId",
      title: "센서 ID",
      width: "120px",
      searchable: true,
      render: (_, record) => record.sensorId,
    },
    {
      key: "sensorName",
      title: "센서명",
      width: "minmax(180px, 1fr)",
      searchable: true,
      render: (_, record) => record.sensorName,
    },
    {
      key: "value",
      title: "측정값",
      width: "100px",
      align: "right",
      sortable: true,
      render: (_, record) => <span className="font-medium text-primary">{record.value.toFixed(2)}</span>,
    },
    {
      key: "status",
      title: "상태",
      width: "90px",
      align: "center",
      filterable: true,
      filterOptions: [
        { label: "정상", value: "normal" },
        { label: "경고", value: "warning" },
        { label: "오류", value: "error" },
      ],
      render: (_, record) => {
        const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
          normal: { label: "정상", variant: "default" },
          warning: { label: "경고", variant: "secondary" },
          error: { label: "오류", variant: "destructive" },
        }
        const config = statusConfig[record.status]
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
    {
      key: "remark",
      title: "비고",
      width: "150px",
      render: (_, record) => record.remark || "-",
    },
  ]

  // 이상치 컬럼 정의
  const outlierColumns: DataTableColumn<SensorLog>[] = [
    {
      key: "ts",
      title: "시간",
      width: "180px",
      render: (_, record) => format(record.ts, "yyyy-MM-dd HH:mm:ss"),
    },
    {
      key: "sensorId",
      title: "센서 ID",
      width: "120px",
      render: (_, record) => record.sensorId,
    },
    {
      key: "value",
      title: "측정값",
      width: "120px",
      align: "right",
      render: (_, record) => (
        <span className="text-destructive font-bold">{record.value.toFixed(2)}</span>
      ),
    },
    {
      key: "remark",
      title: "비고",
      width: "minmax(150px, 1fr)",
      render: (_, record) => record.remark || "임계값 초과",
    },
  ]

  // 보고서 이력 컬럼 정의
  const reportColumns: DataTableColumn<ReportHistory>[] = [
    {
      key: "title",
      title: "제목",
      width: "minmax(300px, 1fr)",
      searchable: true,
      render: (_, record) => <span className="font-medium">{record.title}</span>,
    },
    {
      key: "created",
      title: "생성일",
      width: "150px",
      sortable: true,
      render: (_, record) => record.created,
    },
    {
      key: "author",
      title: "작성자",
      width: "120px",
      render: (_, record) => record.author,
    },
  ]

  // 보고서 행 액션
  const reportActions: DataTableAction<ReportHistory>[] = [
    {
      key: "download",
      label: "다운로드",
      iconName: "download",
      onClick: () => alert("PDF 다운로드 기능은 추후 구현 예정입니다."),
    },
    {
      key: "view",
      label: "보기",
      iconName: "visibility",
      onClick: () => alert("보고서 보기 기능은 추후 구현 예정입니다."),
    },
  ]

  const handleDownloadPDF = () => {
    alert("PDF 다운로드 기능은 추후 구현 예정입니다.")
  }

  const handleDownloadExcel = () => {
    alert("엑셀 다운로드 기능은 추후 구현 예정입니다.")
  }

  // 헤더 좌측 탭 버튼
  const HeaderLeft = () => (
    <div className="flex gap-1 bg-surface dark:bg-surface-dark p-1 rounded-lg border border-border">
      {[
        { id: "logs", label: "로그 데이터" },
        { id: "analysis", label: "데이터 분석" },
        { id: "reports", label: "보고서" },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id as "logs" | "analysis" | "reports")
            setCurrentPage(1)
          }}
          className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === tab.id
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:text-text hover:bg-surface-dark/50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )

  // 헤더 우측 필터
  const HeaderRight = () => (
    <div className="flex items-center gap-4">
      <select
        value={selectedSensor}
        onChange={(e) => setSelectedSensor(e.target.value)}
        className="px-3 py-2 border rounded-lg bg-background dark:bg-background-dark text-text dark:text-white w-[250px] text-sm"
      >
        {sensors.map((sensor) => (
          <option key={sensor.id} value={sensor.id}>
            {sensor.group} - {sensor.desc}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={analysisStart}
          onChange={(e) => setAnalysisStart(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-background dark:bg-background-dark text-text dark:text-white w-[140px] text-sm"
        />
        <span className="text-text-secondary">~</span>
        <input
          type="date"
          value={analysisEnd}
          onChange={(e) => setAnalysisEnd(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-background dark:bg-background-dark text-text dark:text-white w-[140px] text-sm"
        />
      </div>
    </div>
  )

  // 보고서 탭 헤더 우측 버튼
  const ReportHeaderRight = () => (
    <div className="flex gap-2">
      <Button onClick={handleDownloadPDF} variant="outline">
        <Icon name="picture_as_pdf" size="sm" className="mr-2" />
        PDF 다운로드
      </Button>
      <Button variant="outline" onClick={handleDownloadExcel}>
        <Icon name="table_chart" size="sm" className="mr-2" />
        엑셀 다운로드
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">센서 데이터 분석</h1>
        <p className="text-sm text-text-secondary mt-1">센서 데이터를 분석하고 보고서를 생성합니다.</p>
      </div>

      <div className="space-y-6">
      {activeTab === "logs" && (
        <DataTable
          data={filteredLogs}
          columns={logColumns}
          loading={false}
          headerLeft={<HeaderLeft />}
          headerRight={<HeaderRight />}
          showSearch
          showFilter
          showColumnSettings
          searchPlaceholder="센서 ID, 센서명으로 검색..."
          pagination={{
            page: currentPage,
            pageSize,
            total: filteredLogs.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      )}

      {activeTab === "analysis" && (
        <div className="space-y-6">
          {/* 탭 및 필터 */}
          <div className="flex items-center justify-between">
            <HeaderLeft />
            <HeaderRight />
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "평균", value: stats.avg.toFixed(2), color: "text-primary", bg: "bg-primary/5" },
              { label: "최대", value: stats.max.toFixed(2), color: "text-red-500", bg: "bg-red-50" },
              { label: "최소", value: stats.min.toFixed(2), color: "text-green-500", bg: "bg-green-50" },
              { label: "표준편차", value: stats.std.toFixed(2), color: "text-slate-500", bg: "bg-slate-50" },
            ].map((stat) => (
              <Card key={stat.label} className={`${stat.bg} border-none`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-xs font-semibold ${stat.color}`}>{stat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 시계열 차트 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="show_chart" size="md" className="text-primary" />
                시계열 추이
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredLogs.map((d) => ({
                      ts: format(d.ts, "MM-dd HH:mm"),
                      value: d.value,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="ts" minTickGap={20} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Line type="monotone" dataKey="value" stroke="var(--brand-primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 이상치 테이블 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="warning" size="md" className="text-destructive" />
                이상치 감지 ({outliers.length}건)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={outliers}
                columns={outlierColumns}
                loading={false}
                pagination={{
                  page: currentPage,
                  pageSize: 10,
                  total: outliers.length,
                  onPageChange: setCurrentPage,
                  onPageSizeChange: setPageSize,
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "reports" && (
        <DataTable
          data={mockReportHistory}
          columns={reportColumns}
          actions={reportActions}
          loading={false}
          headerLeft={<HeaderLeft />}
          headerRight={<ReportHeaderRight />}
          showSearch
          showColumnSettings
          searchPlaceholder="보고서 제목으로 검색..."
          pagination={{
            page: currentPage,
            pageSize,
            total: mockReportHistory.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      )}
      </div>
    </div>
  )
}
