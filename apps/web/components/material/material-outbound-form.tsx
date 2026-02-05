"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@fms/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@fms/ui/form"
import { Input } from "@fms/ui/input"
import { Textarea } from "@fms/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fms/ui/select"
import { mockMaterials } from "@/lib/mock-data/material" // Corrected import path
import { mockMaterialStocks } from "@/lib/mock-data/material-stock" // Corrected import name

const formSchema = z.object({
  materialCode: z.string().min(1, { message: "자재를 선택해주세요." }),
  quantity: z.coerce.number().min(1, { message: "수량은 1 이상이어야 합니다." }),
  warehouseName: z.string().min(1, { message: "창고를 선택해주세요." }),
  requestedBy: z.string().min(1, { message: "요청자를 입력해주세요." }),
  purpose: z.string().min(1, { message: "목적을 입력해주세요." }),
  referenceNo: z.string().optional(),
})

interface MaterialOutboundFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void
  onCancel: () => void
}

export default function MaterialOutboundForm({ onSubmit, onCancel }: MaterialOutboundFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materialCode: "",
      quantity: 1,
      warehouseName: "",
      requestedBy: "",
      purpose: "",
      referenceNo: "",
    },
  })

  const selectedMaterialCode = form.watch("materialCode")
  const selectedMaterial = mockMaterials.find((m) => m.materialCode === selectedMaterialCode)
  const availableStock = mockMaterialStocks.find((s) => s.materialCode === selectedMaterialCode)?.currentStock || 0

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (selectedMaterial && values.quantity > availableStock) {
      form.setError("quantity", { message: `재고가 부족합니다. 현재 재고: ${availableStock} ${selectedMaterial.unit}` })
      return
    }
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4">
        <FormField
          control={form.control}
          name="materialCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>자재명/코드</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="자재를 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockMaterials.map((material) => (
                    <SelectItem key={material.materialCode} value={material.materialCode}>
                      {material.materialName} ({material.materialCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedMaterial && (
          <div className="text-sm text-muted-foreground">
            단위: {selectedMaterial.unit}, 현재 재고: {availableStock} {selectedMaterial.unit}
          </div>
        )}
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>수량</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="warehouseName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>창고</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="창고를 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Assuming a fixed list of warehouses or from mock data */}
                  <SelectItem value="주창고">주창고</SelectItem>
                  <SelectItem value="보조창고">보조창고</SelectItem>
                  <SelectItem value="안전용품창고">안전용품창고</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requestedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>요청자</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>목적</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="referenceNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>참조번호 (선택 사항)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit">출고 등록</Button>
        </div>
      </form>
    </Form>
  )
}
