import * as XLSX from "xlsx";
import { useTranslation } from "@/lib/language-context";

export interface ExportColumn {
  key: string;
  title: string;
  width?: number;
  format?: (value: any) => string;
}

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

export class ExportUtils {
  static exportToExcel<T>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = "export",
      sheetName = "Sheet1",
      includeHeaders = true,
      dateFormat = "yyyy-mm-dd",
    } = options;

    // 워크북 생성
    const workbook = XLSX.utils.book_new();

    // 헤더 생성
    const headers = includeHeaders ? columns.map((col) => col.title) : [];

    // 데이터 변환
    const rows = data.map((item) =>
      columns.map((col) => {
        const value = this.getValue(item, col.key);
        return col.format ? col.format(value) : this.formatValue(value);
      })
    );

    // 전체 데이터 (헤더 + 데이터)
    const worksheetData = includeHeaders ? [headers, ...rows] : rows;

    // 워크시트 생성
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // 컬럼 너비 설정
    const columnWidths = columns.map((col) => ({ width: col.width || 15 }));
    worksheet["!cols"] = columnWidths;

    // 헤더 스타일 설정 (가능한 경우)
    if (includeHeaders) {
      const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "E2E8F0" } },
          };
        }
      }
    }

    // 워크북에 워크시트 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 파일 다운로드
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);
  }

  static exportToCSV<T>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions = {}
  ): void {
    const { filename = "export", includeHeaders = true } = options;

    // CSV 데이터 생성
    const csvData: string[][] = [];

    // 헤더 추가
    if (includeHeaders) {
      csvData.push(columns.map((col) => col.title));
    }

    // 데이터 추가
    data.forEach((item) => {
      const row = columns.map((col) => {
        const value = this.getValue(item, col.key);
        const formatted = col.format
          ? col.format(value)
          : this.formatValue(value);
        return this.escapeCsvValue(formatted);
      });
      csvData.push(row);
    });

    // CSV 문자열 생성
    const csvContent = csvData.map((row) => row.join(",")).join("\n");

    // BOM 추가 (한글 깨짐 방지)
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // 다운로드
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    this.downloadBlob(blob, `${filename}_${timestamp}.csv`);
  }

  static createTemplate<T>(
    columns: ExportColumn[],
    sampleData: Partial<T>[] = [],
    options: ExportOptions = {}
  ): void {
    const { filename = "template", sheetName = "Template" } = options;

    // 워크북 생성
    const workbook = XLSX.utils.book_new();

    // 헤더
    const headers = columns.map((col) => col.title);

    // 샘플 데이터 변환
    const sampleRows = sampleData.map((item) =>
      columns.map((col) => {
        const value = this.getValue(item, col.key);
        return col.format ? col.format(value) : this.formatValue(value);
      })
    );

    // 워크시트 데이터
    const worksheetData = [headers, ...sampleRows];

    // 워크시트 생성
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // 컬럼 너비 설정
    const columnWidths = columns.map((col) => ({ width: col.width || 20 }));
    worksheet["!cols"] = columnWidths;

    // 헤더 스타일
    const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } },
        };
      }
    }

    // 설명 시트 추가
    const instructionData = [
      ["템플릿 사용 방법"],
      [""],
      ["1. 이 템플릿을 사용하여 데이터를 입력하세요."],
      ["2. 헤더 행은 수정하지 마세요."],
      ["3. 필수 필드는 반드시 입력해야 합니다."],
      ["4. 날짜 형식: YYYY-MM-DD"],
      ["5. 완료 후 파일을 업로드하세요."],
      [""],
      ["필드 설명:"],
      ...columns.map((col) => [
        `${col.title}: ${this.getFieldDescription(col)}`,
      ]),
    ];

    const instructionSheet = XLSX.utils.aoa_to_sheet(instructionData);
    instructionSheet["!cols"] = [{ width: 50 }];

    // 워크북에 시트 추가
    XLSX.utils.book_append_sheet(workbook, instructionSheet, "사용방법");
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 다운로드
    XLSX.writeFile(workbook, `${filename}_template.xlsx`);
  }

  private static getValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  private static formatValue(value: any): string {
    if (value == null) return "";
    if (value instanceof Date) return value.toISOString().split("T")[0];
    if (typeof value === "boolean") return value ? "Y" : "N";
    return String(value);
  }

  private static escapeCsvValue(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private static getFieldDescription(column: ExportColumn): string {
    const { t } = useTranslation("common");
    // 필드 타입에 따른 설명 생성
    const descriptions: Record<string, string> = {
      code: t("export.field_description.code"),
      name: t("export.field_description.name"),
      email: t("export.field_description.email"),
      date: t("export.field_description.date"),
      number: t("export.field_description.number"),
      boolean: t("export.field_description.boolean"),
    };

    // 컬럼 키에서 타입 추정
    const key = column.key.toLowerCase();
    if (key.includes("email")) return descriptions.email;
    if (key.includes("date")) return descriptions.date;
    if (key.includes("code")) return descriptions.code;
    if (key.includes("count") || key.includes("number"))
      return descriptions.number;

    return t("export.field_description.default");
  }
}
