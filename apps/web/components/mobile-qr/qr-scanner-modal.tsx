"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode, type Html5QrcodeResult, type QrCodeError } from "html5-qrcode"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@fms/ui/dialog"
import { Button } from "@fms/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@fms/ui/alert"
import { Icon } from "@fms/ui/icon"

interface QrScannerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanSuccess: (decodedText: string, result: Html5QrcodeResult) => void
  onScanError?: (errorMessage: string, error: QrCodeError) => void
}

const QRCodeRegionId = "qr-code-reader-region"

export function QrScannerModal({ open, onOpenChange, onScanSuccess, onScanError }: QrScannerModalProps) {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)
  // isScanning state is primarily to ensure stop is called correctly if start was successful.
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    if (open) {
      // Defer scanner initialization to ensure DOM element is ready
      timeoutId = setTimeout(() => {
        const qrRegionElement = document.getElementById(QRCodeRegionId)
        if (qrRegionElement && !html5QrCodeRef.current) {
          // Check if element exists and instance not already created
          const newInstance = new Html5Qrcode(QRCodeRegionId)
          html5QrCodeRef.current = newInstance
          setError(null)

          newInstance
            .start(
              { facingMode: "environment" },
              { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
              (decodedText, result) => {
                setIsScanning(false) // Mark as not scanning before closing
                onScanSuccess(decodedText, result)
                onOpenChange(false) // This will trigger cleanup
              },
              (errorMessage, errorObject) => {
                if (onScanError) {
                  onScanError(errorMessage, errorObject)
                }
                // console.debug("QR Scan Error:", errorMessage, errorObject);
              },
            )
            .then(() => {
              setIsScanning(true) // Mark as scanning only after start() promise resolves
            })
            .catch((err) => {
              console.error("Failed to start QR scanner:", err)
              setError(`카메라를 시작할 수 없습니다: ${err.message || "알 수 없는 오류"}. 카메라 권한을 확인해주세요.`)
              html5QrCodeRef.current = null // Clear ref if start failed
              setIsScanning(false)
            })
        } else if (!qrRegionElement) {
          console.warn(`${QRCodeRegionId} not found in DOM. Scanner not started.`)
          setError(`QR 코드 리더 영역을 찾을 수 없습니다. 모달을 닫고 다시 시도해주세요.`)
        }
      }, 150) // Small delay (e.g., 100-200ms) to allow DOM to render.
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (html5QrCodeRef.current) {
        // Only attempt to stop if it was successfully started and isScanning
        if (isScanning) {
          html5QrCodeRef.current
            .stop()
            .then(() => {
              // console.log("QR Scanner stopped successfully.");
            })
            .catch((err) => {
              console.warn("Error stopping QR scanner:", err)
            })
            .finally(() => {
              setIsScanning(false)
            })
        }
        html5QrCodeRef.current = null // Clear the instance ref
      }
    }
  }, [open, onOpenChange, onScanSuccess, onScanError])

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        // If modal is being closed manually, ensure isScanning is reset
        if (!newOpenState) setIsScanning(false)
        onOpenChange(newOpenState)
      }}
    >
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>QR 코드 스캔</DialogTitle>
        </DialogHeader>
        {/* This div must be present in the DOM when Html5Qrcode is initialized */}
        <div id={QRCodeRegionId} style={{ width: "100%", minHeight: "300px" }} />
        {error && (
          <Alert variant="destructive" className="mt-4">
            <Icon name="error" size="sm" />
            <AlertTitle>스캔 오류</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsScanning(false) // Ensure reset on manual cancel
              onOpenChange(false)
            }}
          >
            취소
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
