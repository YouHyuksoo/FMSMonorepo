import type { InspectionResult, InspectionResultItem } from "@fms/types"
import { mockInspectionSchedules } from "./inspection-schedule"
import { mockInspectionStandardItems } from "./inspection-standard"
import { v4 as uuidv4 } from "uuid"

export const mockInspectionResults: InspectionResult[] = []
export const mockInspectionResultItems: InspectionResultItem[] = []

// 완료된 스케줄에 대해 결과 생성
mockInspectionSchedules
  .filter((schedule) => schedule.status === "completed" || schedule.status === "in-progress")
  .forEach((schedule) => {
    // 결과 상태 결정
    const status = schedule.status === "completed" ? "completed" : "in-progress"

    // 시작 시간 (스케줄된 시간)
    const scheduledDateTime = new Date(`${schedule.scheduledDate}T${schedule.scheduledTime || "09:00"}:00`)
    const startedAt = scheduledDateTime.toISOString()

    // 완료 시간 (완료된 경우에만)
    let completedAt: string | undefined
    let duration: number | undefined
    if (status === "completed") {
      // 1~3시간 후 완료
      const completionTime = new Date(scheduledDateTime.getTime() + (Math.random() * 2 + 1) * 60 * 60 * 1000)
      completedAt = completionTime.toISOString()
      duration = Math.round((completionTime.getTime() - scheduledDateTime.getTime()) / (60 * 1000)) // 분 단위
    }

    // 표준 항목 찾기
    const standardItems = mockInspectionStandardItems.filter((item) => item.standardId === schedule.standardId)

    // 비정상 항목 수 계산 (10~20% 확률로 비정상)
    const abnormalItemCount = Math.floor(standardItems.length * (Math.random() * 0.1 + 0.1))

    // 결과 생성
    const result: InspectionResult = {
      id: uuidv4(),
      scheduleId: schedule.id,
      schedule: schedule,
      startedAt: startedAt,
      completedAt: completedAt,
      completedById: status === "completed" ? schedule.assignedToId : undefined,
      completedBy: status === "completed" ? schedule.assignedTo : undefined,
      status: status,
      notes: Math.random() > 0.7 ? "점검 중 특이사항 발견" : undefined,
      items: [],
      createdAt: startedAt,
      updatedAt: completedAt || startedAt,
      duration: duration,
      abnormalItemCount: abnormalItemCount,
      totalItemCount: standardItems.length,
    }

    mockInspectionResults.push(result)

    // 결과 항목 생성
    standardItems.forEach((standardItem, index) => {
      // 비정상 항목인지 결정 (앞에서부터 abnormalItemCount개)
      const isAbnormal = index < abnormalItemCount

      // 측정값이 있는 항목인 경우
      let value: string | number | undefined
      let measuredValue: number | undefined

      if (standardItem.masterItem?.measurementUnit) {
        // 측정값이 있는 경우
        const targetValue = standardItem.masterItem.targetValue || 0
        const tolerance = standardItem.masterItem.tolerance || 0

        if (isAbnormal) {
          // 비정상인 경우 범위를 벗어난 값
          const direction = Math.random() > 0.5 ? 1 : -1
          measuredValue = targetValue + direction * (tolerance + Math.random() * 10)
        } else {
          // 정상인 경우 범위 내 값
          measuredValue = targetValue + (Math.random() * 2 - 1) * tolerance * 0.8
        }

        value = measuredValue
      } else {
        // 측정값이 없는 경우 (예/아니오 또는 텍스트)
        if (isAbnormal) {
          value = "불량"
        } else {
          value = "양호"
        }
      }

      // 결과 항목 생성
      const resultItem: InspectionResultItem = {
        id: uuidv4(),
        resultId: result.id,
        standardItemId: standardItem.id,
        standardItem: standardItem,
        value: value,
        isPass: !isAbnormal,
        notes: isAbnormal ? "비정상 상태 발견, 추가 조치 필요" : undefined,
        imageUrl: isAbnormal
          ? `/placeholder.svg?height=200&width=300&query=abnormal ${standardItem.masterItem?.name}`
          : undefined,
        createdAt: startedAt,
        updatedAt: completedAt || startedAt,
        measuredValue: measuredValue,
        isAbnormal: isAbnormal,
      }

      mockInspectionResultItems.push(resultItem)
      result.items.push(resultItem)
    })
  })
