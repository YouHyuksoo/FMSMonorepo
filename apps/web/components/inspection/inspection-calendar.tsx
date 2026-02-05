"use client"

import { useState, useMemo } from "react"
import { Button } from "@fms/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Icon } from "@fms/ui/icon"
import type { InspectionSchedule } from "@fms/types"
import { Badge } from "@fms/ui/badge"
import { cn } from "@fms/utils"

interface InspectionCalendarProps {
  schedules: InspectionSchedule[]
  initialDate?: Date
}

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay() // 0 (Sun) - 6 (Sat)

const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

export function InspectionCalendar({ schedules, initialDate = new Date() }: InspectionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() // 0-indexed

  const numDays = daysInMonth(year, month)
  const firstDay = firstDayOfMonth(year, month)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, InspectionSchedule[]>()
    schedules.forEach((schedule) => {
      const dateKey = schedule.scheduledDate // Assumes YYYY-MM-DD format
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)?.push(schedule)
    })
    return map
  }, [schedules])

  const getStatusColor = (status: InspectionSchedule["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500"
      case "in-progress":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      case "missed":
        return "bg-red-500"
      case "rescheduled":
        return "bg-purple-500"
      case "canceled":
        return "bg-gray-500"
      default:
        return "bg-gray-400"
    }
  }

  const renderDays = () => {
    const days = []
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="border p-2 h-32"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= numDays; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
      const dailySchedules = schedulesByDate.get(dateStr) || []
      const isToday =
        new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === day

      days.push(
        <div key={day} className={cn("border p-2 h-32 overflow-y-auto", isToday ? "bg-primary/10" : "")}>
          <div className={cn("font-semibold mb-1", isToday ? "text-primary" : "")}>{day}</div>
          {dailySchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="mb-1 p-1 rounded text-xs cursor-pointer hover:opacity-80"
              title={`${schedule.equipment?.name} - ${schedule.standard?.name} (${schedule.status})`}
            >
              <Badge
                variant="secondary"
                className={cn("w-full text-left justify-start truncate", getStatusColor(schedule.status), "text-white")}
              >
                {schedule.equipment?.name || "N/A"}
              </Badge>
            </div>
          ))}
        </div>,
      )
    }
    return days
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {year}년 {month + 1}월
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
        <div className="grid grid-cols-7 gap-px">
          {dayNames.map((name) => (
            <div key={name} className="text-center font-medium p-2 border-b">
              {name}
            </div>
          ))}
          {renderDays()}
        </div>
      </CardContent>
    </Card>
  )
}
