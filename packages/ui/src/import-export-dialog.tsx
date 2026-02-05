"use client"

/**
 * @file packages/ui/src/import-export-dialog.tsx
 * @description 범용 데이터 Import/Export 다이얼로그 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 데이터를 Excel/CSV로 내보내거나 파일에서 가져오는 UI
 * 2. **사용 방법**: export/import 핸들러를 props로 전달하여 사용
 * 3. **앱 특화 로직**: ExportUtils, ImportUtils는 앱에서 주입
 */

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Progress } from "./progress"
import { Alert, AlertDescription } from "./alert"
import { Badge } from "./badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { ScrollArea } from "./scroll-area"
import { Icon } from "./icon"

/**
 * Export 컬럼 정의
 */
export interface ExportColumn {
  key: string
  title: string
  width?: number
  format?: (value: any) => string
}

/**
 * Export 옵션
 */
export interface ExportOptions {
  filename?: string
  sheetName?: string
  includeHeaders?: boolean
  dateFormat?: string
}

/**
 * Import 컬럼 정의
 */
export interface ImportColumn {
  key: string
  title: string
  required?: boolean
  type?: "string" | "number" | "date" | "boolean" | "email"
  validate?: (value: any, row: any) => string | null
  transform?: (value: any) => any
}

/**
 * Import 오류 정보
 */
export interface ImportError {
  row: number
  field?: string
  message: string
  value?: any
}

/**
 * Import 결과
 */
export interface ImportResult<T> {
  success: boolean
  data: T[]
  errors: ImportError[]
  summary: {
    total: number
    success: number
    failed: number
  }
}

/**
 * Import/Export 핸들러 (앱에서 주입)
 */
export interface ImportExportHandlers<T> {
  /** Excel 내보내기 */
  onExportExcel: (data: T[], columns: ExportColumn[], options: ExportOptions) => void
  /** CSV 내보내기 */
  onExportCSV: (data: T[], columns: ExportColumn[], options: ExportOptions) => void
  /** 템플릿 다운로드 */
  onDownloadTemplate: (columns: ExportColumn[], sampleData: Partial<T>[], options: ExportOptions) => void
  /** 파일에서 데이터 가져오기 */
  onImportFromFile: (file: File, columns: ImportColumn[]) => Promise<ImportResult<T>>
}

/**
 * 다이얼로그 Props
 */
export interface ImportExportDialogProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  exportColumns: ExportColumn[]
  importColumns: ImportColumn[]
  exportData?: T[]
  onImportComplete: (data: T[]) => Promise<void>
  exportOptions?: ExportOptions
  sampleData?: Partial<T>[]
  /** Import/Export 핸들러 (앱에서 주입) */
  handlers: ImportExportHandlers<T>
  /** 텍스트 라벨 (i18n 지원) */
  labels?: Partial<ImportExportLabels>
}

/**
 * 다국어 라벨 (기본값: 한국어)
 */
export interface ImportExportLabels {
  exportTab: string
  importTab: string
  excelFile: string
  excelDescription: string
  excelDownload: string
  csvFile: string
  csvDescription: string
  csvDownload: string
  template: string
  templateDescription: string
  templateDownload: string
  exportAlert: string
  selectFile: string
  fileHint: string
  selectedFile: string
  preview: string
  processing: string
  analyzing: string
  totalRows: string
  success: string
  failed: string
  fixErrors: string
  dataPreview: string
  rows: string
  moreRows: string
  reselect: string
  confirmImport: string
  dataManagement: string
  dataManagementDescription: string
  moreErrors: string
}

const defaultLabels: ImportExportLabels = {
  exportTab: "내보내기",
  importTab: "가져오기",
  excelFile: "Excel 파일",
  excelDescription: "스타일링과 서식이 포함된 Excel 파일로 내보내기",
  excelDownload: "Excel 다운로드",
  csvFile: "CSV 파일",
  csvDescription: "가벼운 CSV 형식으로 내보내기 (다른 시스템 연동용)",
  csvDownload: "CSV 다운로드",
  template: "템플릿",
  templateDescription: "데이터 입력용 템플릿 파일 다운로드",
  templateDownload: "템플릿 다운로드",
  exportAlert: "개의 데이터가 내보내기 됩니다. 필터가 적용된 경우 필터된 데이터만 내보내집니다.",
  selectFile: "파일 선택",
  fileHint: "Excel (.xlsx, .xls) 또는 CSV 파일을 선택하세요.",
  selectedFile: "선택된 파일:",
  preview: "미리보기",
  processing: "처리 중...",
  analyzing: "파일을 분석하고 있습니다...",
  totalRows: "총 행 수",
  success: "성공",
  failed: "실패",
  fixErrors: "다음 오류를 수정해주세요:",
  dataPreview: "데이터 미리보기",
  rows: "개 행",
  moreRows: "외",
  reselect: "다시 선택",
  confirmImport: "가져오기 확정",
  dataManagement: "데이터 관리",
  dataManagementDescription: "데이터를 내보내거나 가져올 수 있습니다.",
  moreErrors: "개 오류",
}

export function ImportExportDialog<T extends Record<string, any>>({
  open,
  onOpenChange,
  title,
  exportColumns,
  importColumns,
  exportData = [],
  onImportComplete,
  exportOptions = {},
  sampleData = [],
  handlers,
  labels: customLabels = {},
}: ImportExportDialogProps<T>) {
  const labels = { ...defaultLabels, ...customLabels }

  const [activeTab, setActiveTab] = useState("export")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult<T> | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportExcel = () => {
    handlers.onExportExcel(exportData, exportColumns, {
      filename: exportOptions.filename || title.toLowerCase().replace(/\s+/g, "_"),
      ...exportOptions,
    })
  }

  const handleExportCSV = () => {
    handlers.onExportCSV(exportData, exportColumns, {
      filename: exportOptions.filename || title.toLowerCase().replace(/\s+/g, "_"),
      ...exportOptions,
    })
  }

  const handleDownloadTemplate = () => {
    handlers.onDownloadTemplate(exportColumns, sampleData, {
      filename: `${title.toLowerCase().replace(/\s+/g, "_")}_template`,
      ...exportOptions,
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
      setImportResult(null)
      setShowPreview(false)
    }
  }

  const handleImportProcess = async () => {
    if (!importFile) return

    setIsProcessing(true)
    try {
      const result = await handlers.onImportFromFile(importFile, importColumns)
      setImportResult(result)
      setShowPreview(true)
    } catch (error) {
      console.error("Import error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImportConfirm = async () => {
    if (!importResult || !importResult.success) return

    try {
      await onImportComplete(importResult.data)
      onOpenChange(false)
      resetImportState()
    } catch (error) {
      console.error("Import confirmation error:", error)
    }
  }

  const resetImportState = () => {
    setImportFile(null)
    setImportResult(null)
    setShowPreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title} {labels.dataManagement}</DialogTitle>
          <DialogDescription>{labels.dataManagementDescription}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">{labels.exportTab}</TabsTrigger>
            <TabsTrigger value="import">{labels.importTab}</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-4">
                <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
                  <Icon name="description" className="mx-auto mb-4 text-green-600" style={{ fontSize: 48 }} />
                  <h3 className="font-semibold mb-2">{labels.excelFile}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{labels.excelDescription}</p>
                  <Button onClick={handleExportExcel} className="w-full">
                    <Icon name="download" size="sm" className="mr-2" />
                    {labels.excelDownload}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
                  <Icon name="description" className="mx-auto mb-4 text-blue-600" style={{ fontSize: 48 }} />
                  <h3 className="font-semibold mb-2">{labels.csvFile}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{labels.csvDescription}</p>
                  <Button onClick={handleExportCSV} variant="outline" className="w-full">
                    <Icon name="download" size="sm" className="mr-2" />
                    {labels.csvDownload}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
                  <Icon name="description" className="mx-auto mb-4 text-purple-600" style={{ fontSize: 48 }} />
                  <h3 className="font-semibold mb-2">{labels.template}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{labels.templateDescription}</p>
                  <Button onClick={handleDownloadTemplate} variant="outline" className="w-full">
                    <Icon name="download" size="sm" className="mr-2" />
                    {labels.templateDownload}
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <Icon name="error" size="sm" />
              <AlertDescription>
                현재 {exportData?.length || 0}{labels.exportAlert}
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            {!showPreview ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-file">{labels.selectFile}</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                  />
                  <p className="text-sm text-muted-foreground">{labels.fileHint}</p>
                </div>

                {importFile && (
                  <Alert>
                    <Icon name="error" size="sm" />
                    <AlertDescription>
                      {labels.selectedFile} {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleImportProcess} disabled={!importFile || isProcessing} className="flex-1">
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {labels.processing}
                      </>
                    ) : (
                      <>
                        <Icon name="visibility" size="sm" className="mr-2" />
                        {labels.preview}
                      </>
                    )}
                  </Button>
                  <Button onClick={handleDownloadTemplate} variant="outline">
                    <Icon name="download" size="sm" className="mr-2" />
                    {labels.template}
                  </Button>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={50} className="w-full" />
                    <p className="text-sm text-center text-muted-foreground">{labels.analyzing}</p>
                  </div>
                )}
              </div>
            ) : (
              importResult && (
                <div className="space-y-4">
                  {/* 결과 요약 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{importResult.summary.total}</div>
                      <div className="text-sm text-muted-foreground">{labels.totalRows}</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{importResult.summary.success}</div>
                      <div className="text-sm text-muted-foreground">{labels.success}</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{importResult.summary.failed}</div>
                      <div className="text-sm text-muted-foreground">{labels.failed}</div>
                    </div>
                  </div>

                  {/* 오류 목록 */}
                  {importResult.errors.length > 0 && (
                    <Alert variant="destructive">
                      <Icon name="error" size="sm" />
                      <AlertDescription>
                        <div className="font-medium mb-2">{labels.fixErrors}</div>
                        <ScrollArea className="h-32">
                          <div className="space-y-1">
                            {importResult.errors.slice(0, 10).map((error, index) => (
                              <div key={index} className="text-sm">
                                {error.row}행 {error.field && `(${error.field})`}: {error.message}
                              </div>
                            ))}
                            {importResult.errors.length > 10 && (
                              <div className="text-sm font-medium">... {labels.moreRows} {importResult.errors.length - 10}{labels.moreErrors}</div>
                            )}
                          </div>
                        </ScrollArea>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* 데이터 미리보기 */}
                  {importResult.data.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{labels.dataPreview}</h4>
                        <Badge variant="outline">{importResult.data.length}{labels.rows}</Badge>
                      </div>
                      <ScrollArea className="h-64 border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {importColumns.map((col) => (
                                <TableHead key={col.key}>{col.title}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {importResult.data.slice(0, 5).map((row, index) => (
                              <TableRow key={index}>
                                {importColumns.map((col) => (
                                  <TableCell key={col.key}>{String(row[col.key as keyof T] || "")}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                      {importResult.data.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center">
                          ... {labels.moreRows} {importResult.data.length - 5}{labels.rows}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <Button onClick={() => setShowPreview(false)} variant="outline">
                      <Icon name="close" size="sm" className="mr-2" />
                      {labels.reselect}
                    </Button>
                    <Button
                      onClick={handleImportConfirm}
                      disabled={!importResult.success || importResult.data.length === 0}
                      className="flex-1"
                    >
                      <Icon name="check_circle" size="sm" className="mr-2" />
                      {labels.confirmImport} ({importResult.data.length}개)
                    </Button>
                  </div>
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
