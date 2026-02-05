"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@fms/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card"
import { Badge } from "@fms/ui/badge"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Textarea } from "@fms/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fms/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@fms/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Icon } from "@fms/ui/icon"
import type { EquipmentPhoto } from "@fms/types"

interface EquipmentPhotoManagerProps {
  equipmentId: string
  equipmentName: string
  photos: EquipmentPhoto[]
  onPhotosChange: (photos: EquipmentPhoto[]) => void
  readonly?: boolean
}

export function EquipmentPhotoManager({
  equipmentId,
  equipmentName,
  photos = [],
  onPhotosChange,
  readonly = false,
}: EquipmentPhotoManagerProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<EquipmentPhoto | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    type: "main" as EquipmentPhoto["type"],
    description: "",
  })
  const { toast } = useToast()

  const photoTypeLabels = {
    main: "메인 사진",
    detail: "상세 사진",
    manual: "매뉴얼",
    certificate: "인증서",
  }

  const photoTypeColors = {
    main: "bg-blue-100 text-blue-800",
    detail: "bg-green-100 text-green-800",
    manual: "bg-orange-100 text-orange-800",
    certificate: "bg-purple-100 text-purple-800",
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      // 실제 구현에서는 파일을 서버에 업로드
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newPhotos: EquipmentPhoto[] = Array.from(files).map((file, index) => ({
        id: `photo_${Date.now()}_${index}`,
        equipmentId,
        filename: `${equipmentId}_${Date.now()}_${index}.${file.name.split(".").pop()}`,
        originalName: file.name,
        url: URL.createObjectURL(file), // 실제로는 서버 URL
        type: uploadForm.type,
        description: uploadForm.description,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "current-user",
      }))

      onPhotosChange([...photos, ...newPhotos])

      toast({
        title: "업로드 완료",
        description: `${files.length}개의 사진이 업로드되었습니다.`,
      })

      setUploadDialogOpen(false)
      setUploadForm({ type: "main", description: "" })
    } catch (error) {
      toast({
        title: "업로드 실패",
        description: "사진 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      onPhotosChange(photos.filter((photo) => photo.id !== selectedPhoto.id))

      toast({
        title: "삭제 완료",
        description: "사진이 삭제되었습니다.",
      })
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "사진 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedPhoto(null)
    }
  }

  const handleViewPhoto = (photo: EquipmentPhoto) => {
    setSelectedPhoto(photo)
    setViewDialogOpen(true)
  }

  const handleDeleteClick = (photo: EquipmentPhoto) => {
    setSelectedPhoto(photo)
    setDeleteDialogOpen(true)
  }

  const handleDownload = (photo: EquipmentPhoto) => {
    // 실제 구현에서는 파일 다운로드
    const link = document.createElement("a")
    link.href = photo.url
    link.download = photo.originalName
    link.click()

    toast({
      title: "다운로드 시작",
      description: `${photo.originalName} 다운로드를 시작합니다.`,
    })
  }

  const getMainPhoto = () => {
    return photos.find((photo) => photo.type === "main")
  }

  const groupedPhotos = photos.reduce(
    (acc, photo) => {
      if (!acc[photo.type]) acc[photo.type] = []
      acc[photo.type].push(photo)
      return acc
    },
    {} as Record<EquipmentPhoto["type"], EquipmentPhoto[]>,
  )

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">설비 사진 관리</h3>
          <p className="text-sm text-muted-foreground">
            {equipmentName} - 총 {photos.length}개의 사진
          </p>
        </div>
        {!readonly && (
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Icon name="upload" size="sm" className="mr-2" />
            사진 업로드
          </Button>
        )}
      </div>

      {/* 메인 사진 */}
      {getMainPhoto() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="photo_camera" size="sm" />
              메인 사진
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative">
                <img
                  src={getMainPhoto()!.url || "/placeholder.svg"}
                  alt="메인 사진"
                  className="w-48 h-36 object-cover rounded-lg border"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => handleViewPhoto(getMainPhoto()!)}>
                    <Icon name="visibility" size="xs" />
                  </Button>
                  {!readonly && (
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(getMainPhoto()!)}>
                      <Icon name="delete" size="xs" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{getMainPhoto()!.originalName}</h4>
                <p className="text-sm text-muted-foreground mt-1">{getMainPhoto()!.description || "설명 없음"}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  업로드: {new Date(getMainPhoto()!.uploadedAt).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 사진 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedPhotos).map(([type, typePhotos]) => (
          <Card key={type}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="image" size="sm" />
                  {photoTypeLabels[type as EquipmentPhoto["type"]]}
                </div>
                <Badge variant="secondary" className={photoTypeColors[type as EquipmentPhoto["type"]]}>
                  {typePhotos.length}개
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {typePhotos.map((photo) => (
                <div key={photo.id} className="flex items-center gap-3 p-2 border rounded-lg">
                  <img
                    src={photo.url || "/placeholder.svg"}
                    alt={photo.originalName}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{photo.originalName}</p>
                    <p className="text-xs text-muted-foreground truncate">{photo.description || "설명 없음"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleViewPhoto(photo)}>
                      <Icon name="visibility" size="xs" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDownload(photo)}>
                      <Icon name="download" size="xs" />
                    </Button>
                    {!readonly && (
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(photo)}>
                        <Icon name="delete" size="xs" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {photos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icon name="photo_camera" size="md" className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">사진이 없습니다</h3>
            <p className="text-muted-foreground text-center mb-4">설비의 사진을 업로드하여 관리하세요.</p>
            {!readonly && (
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Icon name="upload" size="sm" className="mr-2" />첫 번째 사진 업로드
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 업로드 다이얼로그 */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사진 업로드</DialogTitle>
            <DialogDescription>설비 사진을 업로드합니다. 여러 파일을 동시에 선택할 수 있습니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="photo-type">사진 유형</Label>
              <Select
                value={uploadForm.type}
                onValueChange={(value) => setUploadForm({ ...uploadForm, type: value as EquipmentPhoto["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(photoTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">설명 (선택사항)</Label>
              <Textarea
                id="description"
                placeholder="사진에 대한 설명을 입력하세요"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="file-upload">파일 선택</Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF 파일을 지원합니다. 최대 10MB</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 사진 보기 다이얼로그 */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.originalName}</DialogTitle>
            <DialogDescription>
              {photoTypeLabels[selectedPhoto?.type || "main"]} • 업로드:{" "}
              {selectedPhoto && new Date(selectedPhoto.uploadedAt).toLocaleString("ko-KR")}
            </DialogDescription>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <img
                src={selectedPhoto.url || "/placeholder.svg"}
                alt={selectedPhoto.originalName}
                className="w-full max-h-96 object-contain rounded-lg border"
              />
              {selectedPhoto.description && (
                <div>
                  <Label>설명</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPhoto.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              닫기
            </Button>
            {selectedPhoto && (
              <Button onClick={() => handleDownload(selectedPhoto)}>
                <Icon name="download" size="sm" className="mr-2" />
                다운로드
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>사진 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedPhoto?.originalName}" 사진을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePhoto} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
