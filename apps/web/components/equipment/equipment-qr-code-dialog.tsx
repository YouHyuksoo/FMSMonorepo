"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@fms/ui/dialog"
import { Button } from "@fms/ui/button"
import { Badge } from "@fms/ui/badge"
import { Separator } from "@fms/ui/separator"
import { Icon } from "@fms/ui/icon"
import type { Equipment } from "@fms/types"

interface EquipmentQRCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment: Equipment | null
}

export function EquipmentQRCodeDialog({ open, onOpenChange, equipment }: EquipmentQRCodeDialogProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  // QR 코드 생성 (실제로는 qrcode 라이브러리 사용)
  const generateQRCode = () => {
    if (!equipment) return

    const qrData = {
      id: equipment.id,
      code: equipment.code,
      name: equipment.name,
      location: equipment.location,
      url: `${window.location.origin}/equipment/${equipment.id}`,
    }

    // 임시 QR 코드 URL (실제로는 QR 라이브러리로 생성)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`
    setQrCodeUrl(qrUrl)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (!qrCodeUrl || !equipment) return

    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `QR_${equipment.code}.png`
    link.click()
  }

  // 다이얼로그가 열릴 때 QR 코드 생성
  useState(() => {
    if (open && equipment) {
      generateQRCode()
    }
  }, [open, equipment])

  if (!equipment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="qr_code_2" size="sm" />
            설비 QR 코드
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 설비 정보 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">설비 코드:</span>
              <Badge variant="outline">{equipment.code}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">설비명:</span>
              <span className="text-sm">{equipment.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">위치:</span>
              <span className="text-sm">{equipment.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">상태:</span>
              <Badge variant="secondary">{equipment.status}</Badge>
            </div>
          </div>

          <Separator />

          {/* QR 코드 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="border rounded-lg p-4 bg-white">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt={`QR Code for ${equipment.code}`}
                  className="w-48 h-48"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                  <span className="text-gray-500">QR 코드 생성 중...</span>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">QR 코드를 스캔하면 설비 상세 정보를 확인할 수 있습니다.</p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload} className="flex-1">
              <Icon name="download" size="sm" className="mr-2" />
              다운로드
            </Button>
            <Button variant="outline" onClick={handlePrint} className="flex-1">
              <Icon name="print" size="sm" className="mr-2" />
              인쇄
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
