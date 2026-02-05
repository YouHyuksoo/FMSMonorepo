"use client"

import { useState, useMemo, useEffect } from "react"
import { Icon } from "@fms/ui/icon"
import { Button } from "@fms/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Badge } from "@fms/ui/badge"
import { Skeleton } from "@fms/ui/skeleton"
import type { PreventiveScheduleRecord } from "@fms/types"
import { cn } from "@fms/utils"

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay() // 0 (Sun) - 6 (Sat)

const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

export function PreventiveMaintenanceCalendar() {
  const [schedules, setSchedules] = useState<PreventiveScheduleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSchedules([])
      setLoading(false)
    }, 500)
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() // 0-11

  const numDays = daysInMonth(year, month)
  const firstDay = firstDayOfMonth(year, month)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, PreventiveScheduleRecord[]>()
    schedules.forEach((schedule) => {
      const dateKey = schedule.scheduledDate // Assumes YYYY-MM-DD
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)?.push(schedule)
    })
    return map
  }, [schedules])

  const getStatusColor = (status: PreventiveScheduleRecord["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500"
      case "in-progress":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      case "overdue":
        return "bg-red-500"
      case "cancelled":
        return "bg-gray-500"
      default:
        return "bg-gray-300"
    }
  }

  const calendarGrid = []
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.push(<div key={`empty-start-${i}`} className="border p-2 h-28"></div>)
  }

  for (let day = 1; day <= numDays; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const daySchedules = schedulesByDate.get(dateStr) || []
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

    calendarGrid.push(
      <div key={day} className={cn("border p-2 h-32 overflow-y-auto scrollbar-thin", isToday ? "bg-blue-50" : "")}>
        <div className={cn("font-semibold", isToday ? "text-blue-600" : "")}>{day}</div>
        {daySchedules.map((schedule) => (
          <div key={schedule.id} className="mt-1 text-xs p-1 rounded-sm bg-opacity-20" title={schedule.taskDescription}>
            <Badge
              variant={
                schedule.status === "completed"
                  ? "default"
                  : schedule.status === "overdue"
                    ? "destructive"
                    : schedule.status === "in-progress"
                      ? "outline"
                      : // Needs a specific color or style
                        schedule.status === "scheduled"
                        ? "secondary"
                        : "default" // for 'cancelled' or others
              }
              className={cn(
                "w-full text-left justify-start truncate",
                schedule.status === "in-progress" && "border-yellow-500 text-yellow-700",
              )}
            >
              {schedule.equipmentName}
            </Badge>
          </div>
        ))}
      </div>,
    )
  }

  const remainingCells = (7 - (calendarGrid.length % 7)) % 7
  for (let i = 0; i < remainingCells; i++) {
    calendarGrid.push(<div key={`empty-end-${i}`} className="border p-2 h-28"></div>)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-2/3 mt-2" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Icon name="calendar_month" size="sm" className="mr-2" />
          {`${year}년 ${month + 1}월`}
        </CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <Icon name="chevron_left" size="sm" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <Icon name="chevron_right" size="sm" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-border">
          {dayNames.map((name) => (
            <div key={name} className="text-center font-medium p-2 bg-muted">
              {name}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px border-l border-r border-b">{calendarGrid}</div>
        <p className="mt-4 text-sm text-muted-foreground">
          이 캘린더는 간단한 월별 보기 기능을 제공합니다. 상세 기능 및 일정 수정은 각 항목에서 진행해주세요.
        </p>
      </CardContent>
    </Card>
    </div>
  )
}
