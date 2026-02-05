"use client"

/**
 * @file apps/web/components/common/import-export-dialog.tsx
 * @description 앱 특화 Import/Export 다이얼로그 래퍼
 *
 * 초보자 가이드:
 * 1. **주요 개념**: @fms/ui의 ImportExportDialog를 앱 특화 유틸리티와 연결
 * 2. **사용 방법**: 기존과 동일하게 사용 (handlers prop 자동 주입)
 * 3. **의존성**: ExportUtils, ImportUtils를 handlers로 전달
 */

import {
  ImportExportDialog as BaseImportExportDialog,
  type ImportExportDialogProps as BaseProps,
  type ImportExportHandlers,
  type ExportColumn,
  type ImportColumn,
  type ExportOptions,
  type ImportResult,
  type ImportError,
  type ImportExportLabels,
} from "@fms/ui/import-export-dialog"
import { ExportUtils } from "@/lib/utils/export-utils"
import { ImportUtils } from "@/lib/utils/import-utils"

// 타입 re-export (기존 코드 호환성)
export type { ExportColumn, ImportColumn, ExportOptions, ImportResult, ImportError, ImportExportLabels }

/**
 * 앱용 Props (handlers 제외 - 자동 주입됨)
 */
interface ImportExportDialogProps<T> extends Omit<BaseProps<T>, "handlers"> {
  /** handlers를 직접 전달하려면 사용 (선택) */
  handlers?: ImportExportHandlers<T>
}

/**
 * 기본 handlers - ExportUtils/ImportUtils 연결
 */
function createDefaultHandlers<T>(): ImportExportHandlers<T> {
  return {
    onExportExcel: (data, columns, options) => {
      ExportUtils.exportToExcel(data, columns, options)
    },
    onExportCSV: (data, columns, options) => {
      ExportUtils.exportToCSV(data, columns, options)
    },
    onDownloadTemplate: (columns, sampleData, options) => {
      ExportUtils.createTemplate(columns, sampleData, options)
    },
    onImportFromFile: async (file, columns) => {
      return ImportUtils.importFromFile<T>(file, columns)
    },
  }
}

/**
 * 앱 특화 ImportExportDialog
 * - ExportUtils, ImportUtils가 자동으로 연결됨
 * - 기존 사용법과 100% 호환
 */
export function ImportExportDialog<T extends Record<string, any>>({
  handlers: customHandlers,
  ...props
}: ImportExportDialogProps<T>) {
  const handlers = customHandlers || createDefaultHandlers<T>()

  return <BaseImportExportDialog<T> {...props} handlers={handlers} />
}
