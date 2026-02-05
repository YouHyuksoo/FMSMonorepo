"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import { Badge } from "@fms/ui/badge"
import { Button } from "@fms/ui/button"
import { Card, CardContent } from "@fms/ui/card"
import type { CalibrationRecord } from "@fms/types"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Icon } from "@fms/ui/icon"

interface CalibrationScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  calibration: CalibrationRecord | null
}

export function CalibrationScheduleDialog({ open, onOpenChange, calibration }: CalibrationScheduleDialogProps) {
  if (!calibration) return null

  const getResultIcon = (result: string) => {
    switch (result) {
      case "pass":
        return <Icon name="check_circle" size="sm" className="text-green-600" />
      case "fail":
        return <Icon name="cancel" size="sm" className="text-red-600" />
      case "conditional":
        return <Icon name="warning" size="sm" className="text-yellow-600" />
      default:
        return <Icon name="schedule" size="sm" className="text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">완료</Badge>
      case "scheduled":
        return <Badge className="bg-blue-500">예정</Badge>
      case "overdue":
        return <Badge variant="destructive">만료</Badge>
      case "canceled":
        return <Badge variant="secondary">취소</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getResultBadge = (result: string) => {
    switch (result) {
      case "pass":
        return <Badge className="bg-green-500">합격</Badge>
      case "fail":
        return <Badge variant="destructive">불합격</Badge>
      case "conditional":
        return <Badge className="bg-yellow-500">조건부합격</Badge>
      default:
        return <Badge variant="outline">{result}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {getResultIcon(calibration.result)}
              {calibration.equipmentName} 교정 정보
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Icon name="edit" size="sm" className="mr-2" />
                수정
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="delete" size="sm" className="mr-2" />
                삭제
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="calendar_month" size="sm" />
                기본 정보
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">설비명</label>
                    <p className="text-sm font-medium">{calibration.equipmentName}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">계측기 유형</label>
                    <p className="text-sm">{calibration.instrumentType}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">시리얼 번호</label>
                    <p className="text-sm font-mono">{calibration.serialNumber}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">상태</label>
                    <div className="mt-1">{getStatusBadge(calibration.status)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">교정 결과</label>
                    <div className="mt-1">{getResultBadge(calibration.result)}</div>
                  </div>

                  {calibration.accuracy && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">정확도</label>
                      <p className="text-sm">{calibration.accuracy}%</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">교정 기관</label>
                    <p className="text-sm">{calibration.calibratedBy}</p>
                  </div>

                  {calibration.certificateNumber && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">인증서 번호</label>
                      <p className="text-sm font-mono">{calibration.certificateNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 일정 정보 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="schedule" size="sm" />
                일정 정보
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">교정 완료일</label>
                  <p className="text-sm font-medium">
                    {format(new Date(calibration.calibrationDate), "yyyy년 M월 d일 (E)", { locale: ko })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(calibration.calibrationDate), "yyyy-MM-dd")}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">다음 교정 예정일</label>
                  <p className="text-sm font-medium">
                    {format(new Date(calibration.nextCalibrationDate), "yyyy년 M월 d일 (E)", { locale: ko })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(calibration.nextCalibrationDate), "yyyy-MM-dd")}
                  </p>
                </div>
              </div>

              {/* 남은 일수 계산 */}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">다음 교정까지</span>
                  <span className="text-sm font-bold">
                    {Math.ceil(
                      (new Date(calibration.nextCalibrationDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}
                    일 남음
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 추가 정보 */}
          {calibration.notes && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">비고</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{calibration.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* 이력 정보 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">이력 정보</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">등록일</label>
                  <p className="text-sm">{format(new Date(calibration.createdAt), "yyyy-MM-dd HH:mm")}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">최종 수정일</label>
                  <p className="text-sm">{format(new Date(calibration.updatedAt), "yyyy-MM-dd HH:mm")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button>
            <Icon name="edit" size="sm" className="mr-2" />
            수정하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
