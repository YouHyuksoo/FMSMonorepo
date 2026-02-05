"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@fms/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { Button } from "@fms/ui/button"
import { DataTable, type Column } from "@/components/common/data-table"
import { MtbfTrendChart } from "./mtbf-trend-chart"
import { FailurePatternAnalysis } from "./failure-pattern-analysis"
import { ReliabilityAnalysis } from "./reliability-analysis"
import type {
  MtbfAnalysis,
  FailureHistory,
  MtbfTrend,
  FailurePattern,
  ReliabilityAnalysis as ReliabilityAnalysisType,
} from "@fms/types"
import { Icon } from "@fms/ui/icon"
import { Badge } from "@fms/ui/badge"

// Helper function to determine badge variant based on risk level
const getRiskLevelVariant = (
  riskLevel: "low" | "medium" | "high" | "critical",
): "default" | "secondary" | "destructive" | "outline" => {
  switch (riskLevel) {
    case "low":
      return "default"
    case "medium":
      return "secondary"
    case "high":
      return "outline"
    case "critical":
      return "destructive"
    default:
      return "default"
  }
}

// API 호출 시뮬레이션 함수
const simulateApiCall = <T,>(data: T, delay = 1000): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, delay)
  })
}

export function MtbfDashboard() {
  const [loading, setLoading] = useState(true)
  const [mtbfData, setMtbfData] = useState<MtbfAnalysis[]>([])
  const [failureHistory, setFailureHistory] = useState<FailureHistory[]>([])
  const [mtbfTrends, setMtbfTrends] = useState<MtbfTrend[]>([])
  const [failurePatterns, setFailurePatterns] = useState<FailurePattern[]>([])
  const [reliabilityAnalysisData, setReliabilityAnalysisData] = useState<ReliabilityAnalysisType[]>([])

  // 데이터 소스 (실제 API 연동 시 대체 필요)
  const initialMtbfAnalysis: MtbfAnalysis[] = []
  const initialFailureHistory: FailureHistory[] = []
  const initialMtbfTrends: MtbfTrend[] = []
  const initialFailurePatterns: FailurePattern[] = []
  const initialReliabilityAnalysis: ReliabilityAnalysisType[] = []

  const [selectedEquipment, setSelectedEquipment] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("6m")

  // Overall stats
  const [overallMtbf, setOverallMtbf] = useState(0)
  const [overallMttr, setOverallMttr] = useState(0)
  const [overallAvailability, setOverallAvailability] = useState(0)
  const [totalFailures, setTotalFailures] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // API 호출 시뮬레이션
        const overviewData = await simulateApiCall(
          initialMtbfAnalysis.filter(
            (item) => selectedEquipment === "all" || item.id === selectedEquipment,
            // 실제로는 dateRange도 필터링에 사용해야 합니다.
          ),
        )
        setMtbfData(overviewData)

        const historyData = await simulateApiCall(initialFailureHistory)
        setFailureHistory(historyData)

        const trendsData = await simulateApiCall(initialMtbfTrends)
        setMtbfTrends(trendsData)

        const patternsData = await simulateApiCall(initialFailurePatterns)
        setFailurePatterns(patternsData)

        const reliabilityData = await simulateApiCall(initialReliabilityAnalysis)
        setReliabilityAnalysisData(reliabilityData)

        // Calculate overall stats from (potentially filtered) overviewData
        if (overviewData.length > 0) {
          const totalMtbf = overviewData.reduce((sum, item) => sum + item.mtbf, 0)
          const totalMttr = overviewData.reduce((sum, item) => sum + item.mttr, 0)
          const totalAvail = overviewData.reduce((sum, item) => sum + item.availability, 0)
          const sumTotalFailures = overviewData.reduce((sum, item) => sum + item.totalFailures, 0)

          setOverallMtbf(totalMtbf / overviewData.length)
          setOverallMttr(totalMttr / overviewData.length)
          setOverallAvailability(totalAvail / overviewData.length)
          setTotalFailures(sumTotalFailures)
        } else {
          setOverallMtbf(0)
          setOverallMttr(0)
          setOverallAvailability(0)
          setTotalFailures(0)
        }
      } catch (error) {
        console.error("Simulated API call failed:", error)
        // 실제 에러 처리 로직 (예: 사용자에게 알림 표시)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedEquipment, dateRange]) // 필터 값이 변경될 때마다 실행

  const overviewColumns: Column<MtbfAnalysis>[] = [
    { key: "equipmentName", title: "설비명", sortable: true, searchable: true, defaultVisible: true },
    {
      key: "equipmentType",
      title: "설비유형",
      sortable: true,
      filterable: true,
      filterOptions: [...new Set(initialMtbfAnalysis.map((item) => item.equipmentType))].map((type) => ({
        label: type,
        value: type,
      })),
      defaultVisible: true,
    },
    { key: "location", title: "위치", sortable: true, defaultVisible: true },
    {
      key: "mtbf",
      title: "MTBF (시간)",
      sortable: true,
      render: (value) => `${Number(value).toFixed(1)} 시간`,
      defaultVisible: true,
    },
    {
      key: "mttr",
      title: "MTTR (시간)",
      sortable: true,
      render: (value) => `${Number(value).toFixed(1)} 시간`,
      defaultVisible: true,
    },
    {
      key: "availability",
      title: "가동률 (%)",
      sortable: true,
      render: (value) => `${Number(value).toFixed(1)}%`,
      defaultVisible: true,
    },
    {
      key: "reliability",
      title: "신뢰도 (%)",
      sortable: true,
      render: (value) => `${Number(value).toFixed(1)}%`,
      defaultVisible: false,
    },
    { key: "totalFailures", title: "총 고장 건수", sortable: true, defaultVisible: true },
    {
      key: "riskLevel",
      title: "위험 수준",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "낮음", value: "low" },
        { label: "중간", value: "medium" },
        { label: "높음", value: "high" },
        { label: "심각", value: "critical" },
      ],
      render: (value: "low" | "medium" | "high" | "critical") => (
        <Badge variant={getRiskLevelVariant(value)} className="capitalize">
          {value === "low" ? "낮음" : value === "medium" ? "중간" : value === "high" ? "높음" : "심각"}
        </Badge>
      ),
      defaultVisible: true,
    },
    {
      key: "trend",
      title: "추세",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "개선중", value: "improving" },
        { label: "안정적", value: "stable" },
        { label: "악화중", value: "declining" },
      ],
      render: (value: "improving" | "stable" | "declining") => {
        let trendText = ""
        let trendColorClass = ""
        if (value === "improving") {
          trendText = "개선중 ▲"
          trendColorClass = "text-green-600"
        } else if (value === "stable") {
          trendText = "안정적 ▬"
          trendColorClass = "text-yellow-600"
        } else if (value === "declining") {
          trendText = "악화중 ▼"
          trendColorClass = "text-red-600"
        }
        return <span className={trendColorClass}>{trendText}</span>
      },
      defaultVisible: true,
    },
    {
      key: "lastFailureDate",
      title: "최근 고장일",
      sortable: true,
      render: (value) => (value ? new Date(value as string).toLocaleDateString() : "-"),
      defaultVisible: false,
    },
  ]

  const failureHistoryColumns: Column<FailureHistory>[] = [
    { key: "equipmentName", title: "설비명", sortable: true, searchable: true, defaultVisible: true },
    {
      key: "failureDate",
      title: "고장일시",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleString(),
      defaultVisible: true,
    },
    { key: "failureType", title: "고장유형", sortable: true, filterable: true, defaultVisible: true },
    { key: "failureCause", title: "고장원인", sortable: true, defaultVisible: true },
    {
      key: "downtime",
      title: "정지시간 (시간)",
      sortable: true,
      render: (value) => `${Number(value).toFixed(1)} 시간`,
      defaultVisible: true,
    },
    {
      key: "repairCost",
      title: "수리비용",
      sortable: true,
      render: (value) => `${Number(value).toLocaleString()} 원`,
      defaultVisible: true,
    },
    {
      key: "severity",
      title: "심각도",
      sortable: true,
      filterable: true,
      defaultVisible: true,
      render: (value: "minor" | "major" | "critical") => (
        <Badge
          variant={value === "critical" ? "destructive" : value === "major" ? "secondary" : "default"}
          className="capitalize"
        >
          {value === "minor" ? "경미" : value === "major" ? "중대" : "심각"}
        </Badge>
      ),
    },
  ]

  const handlePrint = () => {
    window.print()
  }

  const handleExport = (dataToExport: any[], fileName: string) => {
    if (dataToExport.length === 0) {
      alert("내보낼 데이터가 없습니다.")
      return
    }
    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(dataToExport[0]).join(",") +
      "\n" +
      dataToExport.map((e) => Object.values(e).join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${fileName}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-semibold">MTBF/MTTR 분석</CardTitle>
              <CardDescription>설비 신뢰성 및 보전 효율성 분석 대시보드</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="전체 설비" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 설비</SelectItem>
                  {initialMtbfAnalysis.map(
                    (
                      eq, // Use full mock list for filter options
                    ) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.equipmentName}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">최근 1개월</SelectItem>
                  <SelectItem value="3m">최근 3개월</SelectItem>
                  <SelectItem value="6m">최근 6개월</SelectItem>
                  <SelectItem value="1y">최근 1년</SelectItem>
                  <SelectItem value="all">전체 기간</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" aria-label="필터">
                <Icon name="filter_list" size="sm" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="새로고침"
                onClick={() => {
                  // Trigger re-fetch by changing dependencies (or a dedicated refresh state)
                  // This will re-run useEffect due to dependency change if selectedEquipment/dateRange are involved
                  // For a more explicit refresh, you might add a counter state and increment it.
                  const currentEq = selectedEquipment
                  const currentRange = dateRange
                  setSelectedEquipment("temp") // Force change
                  setDateRange("temp")
                  setTimeout(() => {
                    setSelectedEquipment(currentEq)
                    setDateRange(currentRange)
                  }, 0)
                }}
              >
                <Icon name="refresh" size="sm" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평균 MTBF</CardTitle>
                <Icon name="info" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : `${overallMtbf.toFixed(1)} 시간`}</div>
                {!loading && <p className="text-xs text-muted-foreground">전월 대비 +5.2%</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평균 MTTR</CardTitle>
                <Icon name="info" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : `${overallMttr.toFixed(1)} 시간`}</div>
                {!loading && <p className="text-xs text-muted-foreground">전월 대비 -3.3%</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평균 가동률</CardTitle>
                <Icon name="info" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : `${overallAvailability.toFixed(1)}%`}</div>
                {!loading && <p className="text-xs text-muted-foreground">목표 95% 대비 -4.2%</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 고장 횟수</CardTitle>
                <Icon name="info" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : `${totalFailures} 건`}</div>
                {!loading && <p className="text-xs text-muted-foreground">전월 대비 -8.9%</p>}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-4">
              <TabsTrigger value="overview">개요</TabsTrigger>
              <TabsTrigger value="trend">추세 분석</TabsTrigger>
              <TabsTrigger value="history">고장 이력</TabsTrigger>
              <TabsTrigger value="pattern">고장 패턴</TabsTrigger>
              <TabsTrigger value="reliability">신뢰성 분석</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <CardTitle className="text-lg font-medium">설비별 MTBF/MTTR 현황</CardTitle>
                      <CardDescription className="text-sm">
                        주요 설비의 MTBF, MTTR 및 관련 지표를 확인합니다.
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Icon name="print" size="sm" className="mr-2" /> 인쇄
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExport(mtbfData, "mtbf_overview_data")}>
                        <Icon name="download" size="sm" className="mr-2" /> 내보내기
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={overviewColumns}
                    data={mtbfData}
                    loading={loading}
                    searchPlaceholder="설비명, 유형, 위치 검색..."
                    showSearch={true}
                    showFilter={true}
                    showColumnSettings={true}
                    pagination={{
                      page: 1,
                      pageSize: 10,
                      total: mtbfData.length,
                      onPageChange: (page) => console.log("Page change:", page),
                      onPageSizeChange: (size) => console.log("Page size change:", size),
                    }}
                    emptyMessage="표시할 데이터가 없습니다."
                    initialVisibleColumns={[
                      "equipmentName",
                      "equipmentType",
                      "mtbf",
                      "mttr",
                      "availability",
                      "totalFailures",
                      "riskLevel",
                      "trend",
                    ]}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="trend" className="mt-4">
              <MtbfTrendChart data={mtbfTrends} loading={loading} />
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <CardTitle className="text-lg font-medium">고장 이력 상세</CardTitle>
                      <CardDescription className="text-sm">설비별 고장 발생 및 조치 내역을 확인합니다.</CardDescription>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(failureHistory, "failure_history_data")}
                      >
                        <Icon name="download" size="sm" className="mr-2" /> 내보내기
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={failureHistoryColumns}
                    data={failureHistory}
                    loading={loading}
                    searchPlaceholder="설비명 또는 고장원인 검색..."
                    showSearch={true}
                    showFilter={true}
                    showColumnSettings={true}
                    pagination={{
                      page: 1,
                      pageSize: 10,
                      total: failureHistory.length,
                      onPageChange: (page) => console.log("Page change:", page),
                      onPageSizeChange: (size) => console.log("Page size change:", size),
                    }}
                    emptyMessage="고장 이력이 없습니다."
                    initialVisibleColumns={[
                      "equipmentName",
                      "failureDate",
                      "failureType",
                      "downtime",
                      "repairCost",
                      "severity",
                    ]}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="pattern" className="mt-4">
              <FailurePatternAnalysis data={failurePatterns} loading={loading} />
            </TabsContent>
            <TabsContent value="reliability" className="mt-4">
              <ReliabilityAnalysis data={reliabilityAnalysisData} loading={loading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
