import * as XLSX from "xlsx";
import { useTranslation } from "@/lib/language-context";

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: ImportError[];
  summary: {
    total: number;
    success: number;
    failed: number;
  };
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  value?: any;
}

export interface ImportColumn {
  key: string;
  title: string;
  required?: boolean;
  type?: "string" | "number" | "date" | "boolean" | "email";
  validate?: (value: any, row: any) => string | null;
  transform?: (value: any) => any;
}

export class ImportUtils {
  static async importFromFile<T>(
    file: File,
    columns: ImportColumn[]
  ): Promise<ImportResult<T>> {
    try {
      const data = await this.readFile(file);
      return this.processImportData<T>(data, columns);
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, message: `파일 읽기 오류: ${error}` }],
        summary: { total: 0, success: 0, failed: 0 },
      };
    }
  }

  private static readFile(file: File): Promise<any[][]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData as any[][]);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("파일 읽기 실패"));
      reader.readAsBinaryString(file);
    });
  }

  private static processImportData<T>(
    rawData: any[][],
    columns: ImportColumn[]
  ): ImportResult<T> {
    const { t } = useTranslation("common");
    const errors: ImportError[] = [];
    const processedData: T[] = [];

    if (rawData.length === 0) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, message: t("import.empty_file") }],
        summary: { total: 0, success: 0, failed: 0 },
      };
    }

    // 헤더 검증
    const headers = rawData[0];
    const headerValidation = this.validateHeaders(headers, columns);
    if (headerValidation.length > 0) {
      errors.push(...headerValidation);
    }

    // 데이터 행 처리
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNumber = i + 1;

      // 빈 행 건너뛰기
      if (this.isEmptyRow(row)) continue;

      const { data: rowData, errors: rowErrors } = this.processRow<T>(
        row,
        columns,
        rowNumber
      );

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        processedData.push(rowData);
      }
    }

    return {
      success: errors.length === 0,
      data: processedData,
      errors,
      summary: {
        total: rawData.length - 1, // 헤더 제외
        success: processedData.length,
        failed: errors.filter((e) => e.row > 0).length,
      },
    };
  }

  private static validateHeaders(
    headers: any[],
    columns: ImportColumn[]
  ): ImportError[] {
    const { t } = useTranslation("common");
    const errors: ImportError[] = [];
    const expectedHeaders = columns.map((col) => col.title);

    // 필수 헤더 확인
    expectedHeaders.forEach((expectedHeader, index) => {
      if (!headers.includes(expectedHeader)) {
        errors.push({
          row: 1,
          message: t(
            "import.missing_header",
            `필수 헤더가 없습니다: ${expectedHeader}`
          ),
        });
      }
    });

    return errors;
  }

  private static processRow<T>(
    row: any[],
    columns: ImportColumn[],
    rowNumber: number
  ): { data: T; errors: ImportError[] } {
    const errors: ImportError[] = [];
    const data: any = {};

    columns.forEach((column, index) => {
      const value = row[index];
      const fieldErrors = this.validateField(value, column, rowNumber);

      if (fieldErrors.length > 0) {
        errors.push(...fieldErrors);
      } else {
        // 값 변환
        const transformedValue = this.transformValue(value, column);
        data[column.key] = transformedValue;
      }
    });

    return { data: data as T, errors };
  }

  private static validateField(
    value: any,
    column: ImportColumn,
    rowNumber: number
  ): ImportError[] {
    const errors: ImportError[] = [];
    const { t } = useTranslation("common");

    // 필수 필드 검증
    if (column.required && this.isEmpty(value)) {
      errors.push({
        row: rowNumber,
        field: column.key,
        message: t("validation.required", `${column.title}은(는) 필수입니다.`),
        value,
      });
      return errors;
    }

    // 빈 값이면 추가 검증 건너뛰기
    if (this.isEmpty(value)) return errors;

    // 타입별 검증
    switch (column.type) {
      case "number":
        if (isNaN(Number(value))) {
          errors.push({
            row: rowNumber,
            field: column.key,
            message: t(
              "validation.number",
              `${column.title}은(는) 숫자여야 합니다.`
            ),
            value,
          });
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          errors.push({
            row: rowNumber,
            field: column.key,
            message: t(
              "validation.email",
              `${column.title}의 이메일 형식이 올바르지 않습니다.`
            ),
            value,
          });
        }
        break;

      case "date":
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push({
            row: rowNumber,
            field: column.key,
            message: t(
              "validation.date",
              `${column.title}의 날짜 형식이 올바르지 않습니다.`
            ),
            value,
          });
        }
        break;

      case "boolean":
        const boolValue = String(value).toLowerCase();
        if (
          !["y", "n", "yes", "no", "true", "false", "1", "0"].includes(
            boolValue
          )
        ) {
          errors.push({
            row: rowNumber,
            field: column.key,
            message: t(
              "validation.boolean",
              `${column.title}은(는) Y/N 또는 True/False 값이어야 합니다.`
            ),
            value,
          });
        }
        break;
    }

    // 사용자 정의 검증
    if (column.validate) {
      const customError = column.validate(value, {});
      if (customError) {
        errors.push({
          row: rowNumber,
          field: column.key,
          message: customError,
          value,
        });
      }
    }

    return errors;
  }

  private static transformValue(value: any, column: ImportColumn): any {
    if (this.isEmpty(value)) return null;

    // 사용자 정의 변환
    if (column.transform) {
      return column.transform(value);
    }

    // 기본 타입 변환
    switch (column.type) {
      case "number":
        return Number(value);

      case "boolean":
        const boolValue = String(value).toLowerCase();
        return ["y", "yes", "true", "1"].includes(boolValue);

      case "date":
        return new Date(value).toISOString();

      default:
        return String(value).trim();
    }
  }

  private static isEmpty(value: any): boolean {
    return value == null || String(value).trim() === "";
  }

  private static isEmptyRow(row: any[]): boolean {
    return row.every((cell) => this.isEmpty(cell));
  }

  static generateImportPreview<T>(
    result: ImportResult<T>,
    maxRows = 10
  ): {
    previewData: T[];
    hasMore: boolean;
  } {
    return {
      previewData: result.data.slice(0, maxRows),
      hasMore: result.data.length > maxRows,
    };
  }

  static formatImportSummary(result: ImportResult<any>): string {
    const { summary } = result;
    return `총 ${summary.total}개 행 중 ${summary.success}개 성공, ${summary.failed}개 실패`;
  }
}
