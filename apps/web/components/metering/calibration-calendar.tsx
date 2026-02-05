/**
 * @file apps/web/components/metering/calibration-calendar.tsx
 * @description 계측기 교정 일정 캘린더 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 계측기 교정 일정을 캘린더 형태로 시각화
 * 2. **사용 방법**: /metering/calendar 경로에서 접근
 * 3. **기능**:
 *    - 월간 캘린더 뷰
 *    - 교정 일정 상태별 필터링
 *    - 교정 일정 등록/수정
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { CalibrationScheduleDialog } from "./calibration-schedule-dialog"
import { CalibrationForm } from "./calibration-form"
import type { CalibrationRecord } from "@fms/types"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  isSameMonth,
  isValid,
  parseISO,
} from "date-fns"
import { ko } from "date-fns/locale"
import { Icon } from "@fms/ui/icon"

interface CalibrationCalendarProps {
  calibrations: CalibrationRecord[]
  onCalibrationUpdate?: (calibrations: CalibrationRecord[]) => void
}

type FilterType = "all" | "scheduled" | "completed" | "overdue" | "canceled"

export function CalibrationCalendar({ calibrations = [], onCalibrationUpdate }: CalibrationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCalibration, setSelectedCalibration] = useState<CalibrationRecord | null>(null)
  const [editingCalibration, setEditingCalibration] = useState<CalibrationRecord | null>(null)

  // 안전한 날짜 파싱 함수
  const safeParseDate = (dateString: string | Date): Date => {
    if (!dateString) return new Date()

    if (dateString instanceof Date) {
      return isValid(dateString) ? dateString : new Date()
    }

    try {
      const parsed = parseISO(dateString)
      return isValid(parsed) ? parsed : new Date()
    } catch {
      return new Date()
    }
  }

  // 필터링된 교정 데이터
  const filteredCalibrations = calibrations.filter((calibration) => {
    if (!calibration) return false

    const matchesSearch =
      (calibration.equipmentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (calibration.instrumentType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (calibration.calibratedBy || "").toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (filterType === "all") return true
    return calibration.status === filterType
  })

  // 날짜별 교정 일정 그룹화
  const getCalibrationsByDate = (date: Date) => {
    if (!isValid(date)) return []

    return filteredCalibrations.filter((calibration) => {
      if (!calibration) return false

      try {
        const calibrationDate = safeParseDate(calibration.calibrationDate)
        const nextCalibrationDate = safeParseDate(calibration.nextCalibrationDate)
        return isSameDay(calibrationDate, date) || isSameDay(nextCalibrationDate, date)
      } catch {
        return false
      }
    })
  }

  // 교정 결과별 아이콘
  const getResultIcon = (result: string) => {
    switch (result) {
      case "pass":
        return <Icon name="check_circle" size="sm" className="text-green-600 !text-[12px]" />
      case "fail":
        return <Icon name="cancel" size="sm" className="text-red-600 !text-[12px]" />
      case "conditional":
        return <Icon name="warning" size="sm" className="text-yellow-600 !text-[12px]" />
      default:
        return <Icon name="schedule" size="sm" className="text-gray-600 !text-[12px]" />
    }
  }

  // 교정 상태 확인 (만료 여부 포함)
  const getCalibrationStatus = (calibration: CalibrationRecord) => {
    if (!calibration) return "unknown"

    try {
      const today = new Date()
      const nextCalibrationDate = safeParseDate(calibration.nextCalibrationDate)

      if (calibration.status === "completed") return "completed"
      if (calibration.status === "canceled") return "canceled"
      if (nextCalibrationDate < today) return "overdue"
      return "scheduled"
    } catch {
      return "unknown"
    }
  }

  // 교정 데이터 업데이트
  const handleCalibrationSubmit = (data: Partial<CalibrationRecord>) => {
    try {
      let updatedCalibrations: CalibrationRecord[]

      if (editingCalibration) {
        // 수정
        updatedCalibrations = calibrations.map((cal) =>
          cal.id === editingCalibration.id ? { ...cal, ...data, updatedAt: new Date().toISOString() } : cal,
        )
      } else {
        // 새 등록
        const newCalibration: CalibrationRecord = {
          ...(data as CalibrationRecord),
          id: `CAL${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        updatedCalibrations = [...calibrations, newCalibration]
      }

      onCalibrationUpdate?.(updatedCalibrations)
      setEditingCalibration(null)
      setFormOpen(false)
    } catch (error) {
      console.error("Error updating calibration:", error)
    }
  }

  // 월간 뷰 렌더링
  const renderMonthView = () => {
    try {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

      return (
        <div className="grid grid-cols-7 gap-1">
          {/* 요일 헤더 */}
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="p-2 text-center font-semibold text-sm bg-muted">
              {day}
            </div>
          ))}

          {/* 날짜 셀 */}
          {days.map((day) => {
            const calibrationsOnDay = getCalibrationsByDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-[120px] p-1 border border-border
                  ${isCurrentMonth ? "bg-background" : "bg-muted/30"}
                  ${isCurrentDay ? "bg-blue-50 dark:bg-blue-950 border-blue-300" : ""}
                `}
              >
                <div className={`text-sm font-medium mb-1 ${isCurrentMonth ? "" : "text-muted-foreground"}`}>
                  {format(day, "d")}
                </div>

                <div className="space-y-1">
                  {calibrationsOnDay.slice(0, 3).map((calibration) => {
                    if (!calibration) return null

                    try {
                      const isCalibrationDate = isSameDay(safeParseDate(calibration.calibrationDate), day)
                      const isNextCalibrationDate = isSameDay(safeParseDate(calibration.nextCalibrationDate), day)
                      const status = getCalibrationStatus(calibration)

                      return (
                        <div
                          key={calibration.id}
                          className={`
                            text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity
                            ${isCalibrationDate && status === "completed" ? "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-200" : ""}
                            ${isNextCalibrationDate && status === "scheduled" ? "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-200" : ""}
                            ${isNextCalibrationDate && status === "overdue" ? "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-200" : ""}
                            ${status === "canceled" ? "bg-gray-100 text-gray-600 border border-gray-300 dark:bg-gray-800 dark:text-gray-400" : ""}
                          `}
                          onClick={() => {
                            setSelectedCalibration(calibration)
                            setDialogOpen(true)
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {getResultIcon(calibration.result || "")}
                            <span className="truncate">{calibration.equipmentName || "Unknown"}</span>
                          </div>
                          <div className="text-xs opacity-75">
                            {isCalibrationDate ? "완료" : status === "overdue" ? "만료" : "예정"}
                          </div>
                        </div>
                      )
                    } catch {
                      return null
                    }
                  })}

                  {calibrationsOnDay.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{calibrationsOnDay.length - 3}개 더
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )
    } catch (error) {
      console.error("Error rendering month view:", error)
      return <div className="text-center text-red-500">캘린더 렌더링 중 오류가 발생했습니다.</div>
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* 컨트롤 패널 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <Icon name="chevron_left" size="sm" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[200px] text-center">
                {format(currentDate, "yyyy년 M월", { locale: ko })}
              </h2>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <Icon name="chevron_right" size="sm" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                오늘
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* 필터 */}
              <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                <SelectTrigger className="w-[120px]">
                  <Icon name="filter_list" size="sm" className="mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="scheduled">예정</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="overdue">만료</SelectItem>
                  <SelectItem value="canceled">취소</SelectItem>
                </SelectContent>
              </Select>

              {/* 검색 */}
              <div className="relative">
                <Icon name="search" size="sm" className="absolute left-2 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="설비명 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>

              {/* 새 일정 추가 */}
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Icon name="add" size="sm" className="mr-2" />새 일정
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>{renderMonthView()}</CardContent>
      </Card>

      {/* 범례 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">범례</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>교정 완료</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span>교정 예정</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>교정 만료</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="check_circle" size="sm" className="text-green-600 !text-[12px]" />
              <span>합격</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="cancel" size="sm" className="text-red-600 !text-[12px]" />
              <span>불합격</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="warning" size="sm" className="text-yellow-600 !text-[12px]" />
              <span>조건부합격</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상세 정보 다이얼로그 */}
      <CalibrationScheduleDialog open={dialogOpen} onOpenChange={setDialogOpen} calibration={selectedCalibration} />

      {/* 교정 등록/수정 폼 */}
      <CalibrationForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingCalibration(null)
        }}
        onSubmit={handleCalibrationSubmit}
        initialData={editingCalibration}
      />
    </div>
  )
}
