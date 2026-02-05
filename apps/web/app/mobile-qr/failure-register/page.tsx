"use client"

import { useState, useEffect } from "react"
import { Button } from "@fms/ui/button"
import { QrScannerModal } from "@/components/mobile-qr/qr-scanner-modal"
import { MobileFailureCaptureForm } from "@/components/mobile-qr/mobile-failure-capture-form"
import type { Equipment } from "@fms/types"
import { useToast } from "@/hooks/use-toast"
import { Icon } from "@fms/ui/icon"
import type { Failure } from "@fms/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card"

export default function MobileQrFailureRegisterPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scannedEquipment, setScannedEquipment] = useState<Equipment | null>(null)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const { toast } = useToast()

  // Automatically open scanner on page load if no equipment is scanned yet
  useEffect(() => {
    if (!scannedEquipment && !registrationComplete) {
      setIsScannerOpen(true)
    }
  }, [scannedEquipment, registrationComplete])

  const handleScanSuccess = (decodedText: string) => {
    // Assuming QR code contains equipment ID
    const equipmentId = decodedText.trim()
    // TODO: 실제 API에서 설비 정보를 조회해야 함
    // const foundEquipment = await fetchEquipmentById(equipmentId)

    toast({
      title: "스캔 오류",
      description: "등록된 설비 정보를 찾을 수 없습니다. (API 연동 필요)",
      variant: "destructive",
    })
    // Keep scanner open or allow user to retry
    setScannedEquipment(null) // Clear any previous scan
    setIsScannerOpen(true) // Re-open scanner
  }

  const handleFailureSubmit = (failureData: Failure) => {
    // TODO: 실제 API를 통해 고장 정보를 저장해야 함
    console.log("New failure registered:", failureData)
    toast({
      title: "고장 등록 완료",
      description: `${failureData.title} (${failureData.equipmentName}) 고장이 성공적으로 등록되었습니다.`,
      className: "bg-green-100 dark:bg-green-800 border-green-500",
    })
    setRegistrationComplete(true)
    setScannedEquipment(null) // Reset for next scan
  }

  const handleCancelOrRescan = () => {
    setScannedEquipment(null)
    setRegistrationComplete(false)
    setIsScannerOpen(true)
  }

  if (registrationComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Icon name="check_circle" size="sm" className="mx-auto h-16 w-16 text-green-500" />
            <CardTitle className="mt-4 text-2xl">등록 완료!</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>고장 정보가 성공적으로 시스템에 등록되었습니다.</CardDescription>
            <Button onClick={handleCancelOrRescan} className="mt-8 w-full">
              <Icon name="qr_code_2" size="sm" className="mr-2" /> 다른 설비 고장 등록하기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8 min-h-screen flex flex-col items-center">
      {!scannedEquipment ? (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">모바일 QR 고장등록</CardTitle>
            <CardDescription>설비의 QR 코드를 스캔하여 고장을 등록하세요.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <Icon name="qr_code_2" size="sm" className="text-primary h-16 w-16" />
            <Button onClick={() => setIsScannerOpen(true)} className="w-full py-3 text-lg">
              <Icon name="qr_code_2" size="sm" className="mr-2" /> QR 코드 스캔 시작
            </Button>
            <p className="text-xs text-muted-foreground text-center">카메라 접근 권한이 필요합니다.</p>
          </CardContent>
        </Card>
      ) : (
        <MobileFailureCaptureForm
          equipment={scannedEquipment}
          onSubmit={handleFailureSubmit}
          onCancel={handleCancelOrRescan}
        />
      )}

      <QrScannerModal
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onScanSuccess={handleScanSuccess}
        onScanError={(errorMessage) => {
          // console.warn("QR Scan Error (Modal):", errorMessage)
          // Optionally show a toast for persistent errors, but avoid for "not found"
        }}
      />
    </div>
  )
}
