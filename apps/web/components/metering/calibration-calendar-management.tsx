/**
 * @file apps/web/components/metering/calibration-calendar-management.tsx
 * @description 계측기 교정 일정 캘린더 관리 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 계측기 교정 일정을 캘린더 형태로 관리하는 최상위 컴포넌트
 * 2. **사용 방법**: /metering/calendar 페이지에서 사용
 * 3. **기능**: 데이터 로딩 및 상태 관리를 담당하고 CalibrationCalendar에 전달
 */

"use client"

import { useState, useEffect } from "react"
import { CalibrationCalendar } from "./calibration-calendar"
import { mockCalibrationRecords } from "@/lib/mock-data/metering"
import type { CalibrationRecord } from "@fms/types"

export function CalibrationCalendarManagement() {
  const [calibrations, setCalibrations] = useState<CalibrationRecord[]>([])

  // 계측기검교정 관리와 동일한 데이터 로드
  useEffect(() => {
    // 실제 환경에서는 API에서 데이터를 가져오겠지만,
    // 현재는 계측기검교정 관리와 동일한 목업 데이터 사용
    setCalibrations(mockCalibrationRecords)
  }, [])

  const handleCalibrationUpdate = (updatedCalibrations: CalibrationRecord[]) => {
    setCalibrations(updatedCalibrations)
  }

  return (
    <CalibrationCalendar
      calibrations={calibrations}
      onCalibrationUpdate={handleCalibrationUpdate}
    />
  )
}
