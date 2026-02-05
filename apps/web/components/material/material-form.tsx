"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@fms/ui/button"
import { Input } from "@fms/ui/input"
import { Label } from "@fms/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { Textarea } from "@fms/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fms/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs"
import { Icon } from "@fms/ui/icon"
import { useToast } from "@/hooks/use-toast"

interface MaterialFormData {
  code: string
  name: string
  specification: string
  unit: string
  category: string
  manufacturer: string
  model: string
  price: number
  currency: string
  safetyStock: number
  minStock: number
  maxStock: number
  warehouse: string
  location: string
  status: string
  description: string
  images: File[]
}

interface MaterialFormProps {
  onSubmit: (data: MaterialFormData) => void
  onCancel: () => void
  initialData?: Partial<MaterialFormData>
}

export default function MaterialForm({ onSubmit, onCancel, initialData }: MaterialFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<MaterialFormData>({
    code: initialData?.code || "",
    name: initialData?.name || "",
    specification: initialData?.specification || "",
    unit: initialData?.unit || "EA",
    category: initialData?.category || "소모품",
    manufacturer: initialData?.manufacturer || "",
    model: initialData?.model || "",
    price: initialData?.price || 0,
    currency: initialData?.currency || "KRW",
    safetyStock: initialData?.safetyStock || 0,
    minStock: initialData?.minStock || 0,
    maxStock: initialData?.maxStock || 0,
    warehouse: initialData?.warehouse || "",
    location: initialData?.location || "",
    status: initialData?.status || "active",
    description: initialData?.description || "",
    images: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 자재코드 자동생성
  const generateMaterialCode = () => {
    const categoryPrefix =
      {
        소모품: "CON",
        교체품: "REP",
        예비품: "SPA",
        표준품: "STD",
      }[formData.category] || "MAT"

    const timestamp = Date.now().toString().slice(-6)
    const newCode = `${categoryPrefix}-${timestamp}`

    setFormData((prev) => ({ ...prev, code: newCode }))
    toast({
      title: "자재코드 생성",
      description: `자재코드가 자동 생성되었습니다: ${newCode}`,
    })
  }

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof MaterialFormData, value: string | number | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // 에러 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
      toast({
        title: "이미지 업로드",
        description: `${files.length}개의 이미지가 추가되었습니다.`,
      })
    }
  }

  // 이미지 제거 핸들러
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "자재코드는 필수입니다."
    }
    if (!formData.name.trim()) {
      newErrors.name = "자재명은 필수입니다."
    }
    if (!formData.specification.trim()) {
      newErrors.specification = "규격/사양은 필수입니다."
    }
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = "제조사는 필수입니다."
    }
    if (formData.price < 0) {
      newErrors.price = "단가는 0 이상이어야 합니다."
    }
    if (formData.safetyStock < 0) {
      newErrors.safetyStock = "안전재고는 0 이상이어야 합니다."
    }
    if (formData.minStock < 0) {
      newErrors.minStock = "최소재고는 0 이상이어야 합니다."
    }
    if (formData.maxStock < formData.minStock) {
      newErrors.maxStock = "최대재고는 최소재고보다 커야 합니다."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
      toast({
        title: "자재 등록",
        description: "자재가 성공적으로 등록되었습니다.",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">기본정보</TabsTrigger>
          <TabsTrigger value="stock">재고정보</TabsTrigger>
          <TabsTrigger value="images">이미지</TabsTrigger>
          <TabsTrigger value="additional">추가정보</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>자재의 기본 정보를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">자재코드 *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange("code", e.target.value)}
                      placeholder="자재코드 입력"
                      className={errors.code ? "border-red-500" : ""}
                    />
                    <Button type="button" variant="outline" onClick={generateMaterialCode}>
                      자동생성
                    </Button>
                  </div>
                  {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">자재명 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="자재명 입력"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specification">규격/사양 *</Label>
                  <Input
                    id="specification"
                    value={formData.specification}
                    onChange={(e) => handleInputChange("specification", e.target.value)}
                    placeholder="규격/사양 입력"
                    className={errors.specification ? "border-red-500" : ""}
                  />
                  {errors.specification && <p className="text-sm text-red-500">{errors.specification}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">단위</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="단위 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EA">EA (개)</SelectItem>
                      <SelectItem value="SET">SET (세트)</SelectItem>
                      <SelectItem value="M">M (미터)</SelectItem>
                      <SelectItem value="L">L (리터)</SelectItem>
                      <SelectItem value="KG">KG (킬로그램)</SelectItem>
                      <SelectItem value="BOX">BOX (박스)</SelectItem>
                      <SelectItem value="ROLL">ROLL (롤)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">자재분류</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="분류 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="소모품">소모품</SelectItem>
                      <SelectItem value="교체품">교체품</SelectItem>
                      <SelectItem value="예비품">예비품</SelectItem>
                      <SelectItem value="표준품">표준품</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">상태</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="inactive">비활성</SelectItem>
                      <SelectItem value="discontinued">단종</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">제조사 *</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                    placeholder="제조사 입력"
                    className={errors.manufacturer ? "border-red-500" : ""}
                  />
                  {errors.manufacturer && <p className="text-sm text-red-500">{errors.manufacturer}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">모델명</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="모델명 입력"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">단가</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", Number(e.target.value))}
                    placeholder="단가 입력"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">통화</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="통화 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KRW">KRW (원)</SelectItem>
                      <SelectItem value="USD">USD (달러)</SelectItem>
                      <SelectItem value="EUR">EUR (유로)</SelectItem>
                      <SelectItem value="JPY">JPY (엔)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>재고 정보</CardTitle>
              <CardDescription>재고 관리를 위한 정보를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="safetyStock">안전재고</Label>
                  <Input
                    id="safetyStock"
                    type="number"
                    value={formData.safetyStock}
                    onChange={(e) => handleInputChange("safetyStock", Number(e.target.value))}
                    placeholder="안전재고 입력"
                    className={errors.safetyStock ? "border-red-500" : ""}
                  />
                  {errors.safetyStock && <p className="text-sm text-red-500">{errors.safetyStock}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStock">최소재고</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => handleInputChange("minStock", Number(e.target.value))}
                    placeholder="최소재고 입력"
                    className={errors.minStock ? "border-red-500" : ""}
                  />
                  {errors.minStock && <p className="text-sm text-red-500">{errors.minStock}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStock">최대재고</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    value={formData.maxStock}
                    onChange={(e) => handleInputChange("maxStock", Number(e.target.value))}
                    placeholder="최대재고 입력"
                    className={errors.maxStock ? "border-red-500" : ""}
                  />
                  {errors.maxStock && <p className="text-sm text-red-500">{errors.maxStock}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse">창고</Label>
                  <Select value={formData.warehouse} onValueChange={(value) => handleInputChange("warehouse", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="창고 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A창고">A창고 (메인창고)</SelectItem>
                      <SelectItem value="B창고">B창고 (부품창고)</SelectItem>
                      <SelectItem value="C창고">C창고 (소모품창고)</SelectItem>
                      <SelectItem value="D창고">D창고 (예비품창고)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">위치</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="예: A-01-01 (구역-선반-칸)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>자재 이미지</CardTitle>
              <CardDescription>자재의 이미지를 업로드하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Icon name="upload" className="mx-auto text-gray-400" style={{ fontSize: 48 }} />
                <div className="mt-4">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      이미지를 드래그하거나 클릭하여 업로드
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-500">{image.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <Icon name="close" size="sm" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>추가 정보</CardTitle>
              <CardDescription>기타 추가 정보를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">비고</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="추가 설명이나 특이사항을 입력하세요"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">등록</Button>
      </div>
    </form>
  )
}
