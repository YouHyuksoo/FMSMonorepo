/**
 * @file apps/web/components/inspection/inspection-result-management.tsx
 * @description 점검 결과 관리 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 점검 결과 목록 조회, 생성, 수정, 상세보기 기능 제공
 * 2. **사용 방법**: 점검 결과 탭에서 결과 목록을 확인하고 CRUD 작업 수행
 * 3. **상태 관리**: useCrudState 훅을 사용하여 폼/다이얼로그 상태 관리
 * 4. **데이터 소스**: USE_MOCK_API 환경변수에 따라 Mock/API 전환
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@fms/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Badge } from "@fms/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import { Progress } from "@fms/ui/progress"
import type { InspectionResult, InspectionResultItem } from "@fms/types"
import { useToast } from "@/hooks/use-toast"
import { useCrudState } from "@/hooks/use-crud-state"
import { Icon } from "@fms/ui/icon"
import { DataTable } from "@/components/common/data-table"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { Textarea } from "@fms/ui/textarea"
import {
  useInspectionResults,
  useCreateInspectionResult,
} from "@/hooks/api/use-inspection"

// Mock/API 모드 전환
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

export function InspectionResultManagement() {
  // API 훅 (API 모드에서만 사용)
  const apiQuery = useInspectionResults(undefined, { enabled: !USE_MOCK_API })
  const createMutation = useCreateInspectionResult()

  // Mock 모드용 상태
  const [mockResultData, setMockResultData] = useState<InspectionResult[]>([])
  const [mockLoading, setMockLoading] = useState(USE_MOCK_API)

  // CRUD 상태 관리 훅
  const crud = useCrudState<InspectionResult>()

  // 상세보기용 선택된 결과 (테이블 행 클릭 시 하단에 표시)
  const [selectedResult, setSelectedResult] = useState<InspectionResult | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [previewItem, setPreviewItem] = useState<InspectionResultItem | null>(null)
  const { toast } = useToast()

  // 폼 데이터 상태 (생성/수정 공용)
  const [formData, setFormData] = useState({
    scheduleId: "",
    startedAt: "",
    completedAt: "",
    duration: "",
    status: "in-progress",
    notes: "",
    completedById: "",
  })

  // Mock 모드 데이터 로드
  useEffect(() => {
    if (USE_MOCK_API) {
      setMockLoading(true)
      setTimeout(() => {
        setMockResultData([])
        setMockLoading(false)
      }, 500)
    }
  }, [])

  // 폼이 열릴 때 데이터 초기화
  useEffect(() => {
    if (crud.formOpen) {
      if (crud.formMode === "edit" && crud.selectedItem) {
        // 수정 모드: 기존 데이터로 초기화
        setFormData({
          scheduleId: crud.selectedItem.scheduleId,
          startedAt: crud.selectedItem.startedAt,
          completedAt: crud.selectedItem.completedAt || "",
          duration: crud.selectedItem.duration?.toString() || "",
          status: crud.selectedItem.status,
          notes: crud.selectedItem.notes || "",
          completedById: crud.selectedItem.completedBy?.id || "",
        })
      } else {
        // 생성 모드: 빈 폼으로 초기화
        setFormData({
          scheduleId: "",
          startedAt: "",
          completedAt: "",
          duration: "",
          status: "in-progress",
          notes: "",
          completedById: "",
        })
      }
    }
  }, [crud.formOpen, crud.formMode, crud.selectedItem])

  // 통합 데이터 및 로딩 상태
  const results = useMemo(() => {
    if (USE_MOCK_API) return mockResultData
    const data = apiQuery.data as any
    return data?.items || data || []
  }, [mockResultData, apiQuery.data])

  const loading = USE_MOCK_API ? mockLoading : apiQuery.isLoading

  // 상태에 따른 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            진행중
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            완료됨
          </Badge>
        )
      case "incomplete":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            미완료
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // 결과 필터링
  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.schedule?.standard?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.schedule?.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.completedBy?.name.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && result.status === activeTab
  })

  // 결과 선택 핸들러 (테이블 행 클릭 시 하단에 상세 표시)
  const handleSelectResult = (result: InspectionResult) => {
    setSelectedResult(result)
  }

  // 결과 통계
  const resultStats = {
    total: results.length,
    completed: results.filter((r) => r.status === "completed").length,
    inProgress: results.filter((r) => r.status === "in-progress").length,
    incomplete: results.filter((r) => r.status === "incomplete").length,
    abnormalItems: results.reduce((sum, r) => sum + r.abnormalItemCount, 0),
    averageCompletion: Math.round((results.filter((r) => r.status === "completed").length / results.length) * 100),
  }

  // 결과 컬럼 정의
  const resultColumns = [
    { key: "startedAt", title: "점검일시", render: (value: string) => new Date(value).toLocaleString() },
    { key: "schedule.standard.name", title: "점검 기준서" },
    { key: "schedule.equipment.name", title: "설비명" },
    { key: "completedBy.name", title: "점검자" },
    { key: "status", title: "상태", render: (value: string) => getStatusBadge(value) },
    { key: "duration", title: "소요시간", render: (value: number) => (value ? `${value}분` : "-") },
    {
      key: "abnormalItemCount",
      title: "비정상 항목",
      render: (value: number, row: InspectionResult) => (
        <div className="flex items-center space-x-2">
          <span className={value > 0 ? "text-red-600 font-medium" : "text-green-600"}>
            {value}/{row.totalItemCount}
          </span>
          {value > 0 && <Icon name="warning" size="sm" className="text-red-500" />}
        </div>
      ),
    },
    {
      key: "actions",
      title: "작업",
      render: (_: any, row: InspectionResult) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleSelectResult(row)}>
            <Icon name="description" size="sm" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => crud.handleEdit(row)}>
            <Icon name="edit" size="sm" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDownloadResult(row)}>
            <Icon name="download" size="sm" />
          </Button>
        </div>
      ),
    },
  ]

  // 항목 컬럼 정의
  const itemColumns = [
    { key: "standardItem.sequence", title: "순서" },
    { key: "standardItem.masterItem.name", title: "항목명" },
    { key: "value", title: "측정값/결과" },
    { key: "standardItem.masterItem.measurementUnit", title: "단위" },
    {
      key: "isPass",
      title: "합격여부",
      render: (value: boolean) =>
        value ? <Icon name="check_circle" size="sm" className="text-green-500" /> : <Icon name="close" size="sm" className="text-red-500" />,
    },
    {
      key: "isAbnormal",
      title: "이상여부",
      render: (value: boolean) =>
        value ? <Icon name="warning" size="sm" className="text-red-500" /> : <Icon name="check_circle" size="sm" className="text-green-500" />,
    },
    {
      key: "imageUrl",
      title: "이미지",
      render: (value: string) =>
        value ? (
          <Button variant="ghost" size="sm" onClick={() => handlePreviewImage(value)}>
            <Icon name="visibility" size="sm" className="mr-1" /> 보기
          </Button>
        ) : (
          "없음"
        ),
    },
    { key: "notes", title: "비고" },
    {
      key: "actions",
      title: "작업",
      render: (_: any, row: InspectionResultItem) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setPreviewItem(row)}>
            <Icon name="visibility" size="sm" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEditItem(row)}>
            <Icon name="edit" size="sm" />
          </Button>
        </div>
      ),
    },
  ]

  // 이미지 미리보기 핸들러
  const handlePreviewImage = (imageUrl: string) => {
    toast({
      title: "이미지 미리보기",
      description: "이미지를 확대하여 볼 수 있습니다.",
    })
  }

  // 결과 다운로드 핸들러
  const handleDownloadResult = (result: InspectionResult) => {
    toast({
      title: "다운로드",
      description: "점검 결과를 PDF로 다운로드합니다.",
    })
  }

  // 항목 편집 핸들러
  const handleEditItem = (item: InspectionResultItem) => {
    toast({
      title: "편집 기능",
      description: `${item.standardItem?.masterItem?.name} 항목을 편집합니다.`,
    })
  }

  // 폼 제출 핸들러 (생성/수정 공용)
  const handleSubmitForm = () => {
    if (!formData.scheduleId || !formData.startedAt || !formData.completedById) {
      toast({
        title: "입력 오류",
        description: "필수 필드를 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (crud.formMode === "create") {
      // 새 결과 생성
      const resultToAdd: InspectionResult = {
        id: `result-${Date.now()}`,
        scheduleId: formData.scheduleId,
        schedule: null,
        startedAt: formData.startedAt,
        completedAt: formData.completedAt || undefined,
        duration: formData.duration ? Number.parseInt(formData.duration) : undefined,
        status: formData.status as "in-progress" | "completed" | "incomplete",
        totalItemCount: 5,
        abnormalItemCount: 0,
        items: [],
        notes: formData.notes || undefined,
        completedBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setMockResultData((prev) => [resultToAdd, ...prev])
      crud.setFormOpen(false)

      toast({
        title: "등록 완료",
        description: "새 점검 결과가 등록되었습니다.",
      })
    } else if (crud.formMode === "edit" && crud.selectedItem) {
      // 기존 결과 수정
      const updatedResult: InspectionResult = {
        ...crud.selectedItem,
        scheduleId: formData.scheduleId,
        schedule: null,
        startedAt: formData.startedAt,
        completedAt: formData.completedAt || undefined,
        duration: formData.duration ? Number.parseInt(formData.duration) : undefined,
        status: formData.status as "in-progress" | "completed" | "incomplete",
        notes: formData.notes || undefined,
        completedBy: null,
        updatedAt: new Date().toISOString(),
      }

      setMockResultData((prev) => prev.map((r) => (r.id === crud.selectedItem!.id ? updatedResult : r)))
      crud.setFormOpen(false)

      toast({
        title: "수정 완료",
        description: "점검 결과가 수정되었습니다.",
      })
    }
  }

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-white">점검 결과 관리</h1>
        <p className="text-sm text-text-secondary mt-1">점검 결과를 조회하고 관리합니다.</p>
      </div>

      <div className="flex justify-end items-center mb-4">
        <Button onClick={crud.handleAdd}>
          <Icon name="add" size="sm" className="mr-2" />새 점검 결과
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{resultStats.total}</div>
            <p className="text-xs text-muted-foreground">전체 결과</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{resultStats.completed}</div>
            <p className="text-xs text-muted-foreground">완료됨</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{resultStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">진행중</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{resultStats.incomplete}</div>
            <p className="text-xs text-muted-foreground">미완료</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{resultStats.abnormalItems}</div>
            <p className="text-xs text-muted-foreground">비정상 항목</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{resultStats.averageCompletion}%</div>
            <p className="text-xs text-muted-foreground">완료율</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="completed">완료됨</TabsTrigger>
            <TabsTrigger value="in-progress">진행중</TabsTrigger>
            <TabsTrigger value="incomplete">미완료</TabsTrigger>
          </TabsList>

          <div className="relative">
            <Icon name="search" size="sm" className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="검색..."
              className="w-64 pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="m-0">
          <DataTable columns={resultColumns} data={filteredResults} onRowClick={handleSelectResult} />
        </TabsContent>
      </Tabs>

      {selectedResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center justify-between">
                점검 결과 정보
                {getStatusBadge(selectedResult.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-sm font-medium">점검 기준서</Label>
                <p className="text-sm text-muted-foreground">{selectedResult.schedule?.standard?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">설비명</Label>
                <p className="text-sm text-muted-foreground">{selectedResult.schedule?.equipment?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">점검자</Label>
                <p className="text-sm text-muted-foreground">{selectedResult.completedBy?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">점검 시작</Label>
                <p className="text-sm text-muted-foreground">{new Date(selectedResult.startedAt).toLocaleString()}</p>
              </div>
              {selectedResult.completedAt && (
                <div>
                  <Label className="text-sm font-medium">점검 완료</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedResult.completedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedResult.duration && (
                <div>
                  <Label className="text-sm font-medium">소요 시간</Label>
                  <p className="text-sm text-muted-foreground">{selectedResult.duration}분</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">점검 진행률</Label>
                <div className="mt-2">
                  <Progress
                    value={
                      ((selectedResult.totalItemCount - selectedResult.abnormalItemCount) /
                        selectedResult.totalItemCount) *
                      100
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedResult.totalItemCount - selectedResult.abnormalItemCount}/{selectedResult.totalItemCount}{" "}
                    항목 정상
                  </p>
                </div>
              </div>
              {selectedResult.notes && (
                <div>
                  <Label className="text-sm font-medium">비고</Label>
                  <p className="text-sm text-muted-foreground">{selectedResult.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="p-4">
              <CardTitle>점검 항목 결과</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable columns={itemColumns} data={selectedResult.items} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 항목 미리보기 다이얼로그 */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.standardItem?.masterItem?.name}</DialogTitle>
            <DialogDescription>점검 항목 결과 상세 정보</DialogDescription>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">측정값/결과</Label>
                  <p className="text-sm text-muted-foreground">{previewItem.value}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">합격여부</Label>
                  <div className="flex items-center space-x-2">
                    {previewItem.isPass ? (
                      <Icon name="check_circle" size="sm" className="text-green-500" />
                    ) : (
                      <Icon name="close" size="sm" className="text-red-500" />
                    )}
                    <span className={previewItem.isPass ? "text-green-600" : "text-red-600"}>
                      {previewItem.isPass ? "합격" : "불합격"}
                    </span>
                  </div>
                </div>
              </div>
              {previewItem.notes && (
                <div>
                  <Label className="text-sm font-medium">비고</Label>
                  <p className="text-sm text-muted-foreground">{previewItem.notes}</p>
                </div>
              )}
              {previewItem.imageUrl && (
                <div>
                  <Label className="text-sm font-medium">첨부 이미지</Label>
                  <div className="mt-2">
                    <Image
                      src={previewItem.imageUrl || "/placeholder.svg"}
                      alt={previewItem.standardItem?.masterItem?.name || "점검 결과"}
                      width={400}
                      height={300}
                      className="rounded border"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 점검결과 등록/수정 통합 다이얼로그 */}
      <Dialog open={crud.formOpen} onOpenChange={crud.setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {crud.formMode === "create" ? "새 점검 결과 등록" : "점검 결과 수정"}
            </DialogTitle>
            <DialogDescription>
              {crud.formMode === "create" ? "점검 결과를 등록합니다." : "점검 결과를 수정합니다."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduleId">점검 스케줄 *</Label>
                <Select
                  value={formData.scheduleId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, scheduleId: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="스케줄 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 스케줄 옵션은 API에서 로드 */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="completedById">점검자 *</Label>
                <Select
                  value={formData.completedById}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, completedById: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="점검자 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 사용자 옵션은 API에서 로드 */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startedAt">점검 시작일시 *</Label>
                <Input
                  id="startedAt"
                  type="datetime-local"
                  value={formData.startedAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startedAt: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="completedAt">점검 완료일시</Label>
                <Input
                  id="completedAt"
                  type="datetime-local"
                  value={formData.completedAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, completedAt: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">소요시간 (분)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="예: 30"
                  value={formData.duration}
                  onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="status">상태</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-progress">진행중</SelectItem>
                    <SelectItem value="completed">완료됨</SelectItem>
                    <SelectItem value="incomplete">미완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">비고</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="점검 결과에 대한 추가 설명을 입력하세요"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => crud.setFormOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSubmitForm}>
                {crud.formMode === "create" ? "등록" : "수정"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
