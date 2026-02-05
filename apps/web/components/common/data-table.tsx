"use client";

/**
 * @file apps/web/components/common/data-table.tsx
 * @description @fms/ui의 DataTable을 래핑하여 i18n을 주입하는 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: @fms/ui의 DataTable에 useTranslation을 통한 다국어 라벨 주입
 * 2. **사용 방법**: 기존과 동일하게 사용 (하위 호환성 유지)
 */

import {
  DataTable as BaseDataTable,
  type DataTableProps as BaseDataTableProps,
  type DataTableColumn,
  type DataTableAction,
  type DataTableLabels,
  type Column,
} from "@fms/ui/data-table";
import { useTranslation } from "@/lib/language-context";

// 타입 re-export (하위 호환성 유지)
export type { DataTableColumn, DataTableAction, DataTableLabels, Column };

// DataTableProps 타입 export
export type DataTableProps<T> = BaseDataTableProps<T>;

/**
 * i18n이 적용된 DataTable 래퍼 컴포넌트
 */
export function DataTable<T extends Record<string, any>>(
  props: BaseDataTableProps<T>
) {
  const { t } = useTranslation("common");

  // 한국어 라벨 생성
  const koreanLabels: DataTableLabels = {
    search: `${t("common.search")}...`,
    add: t("common.add"),
    noData: t("common.noData"),
    loading: "로딩 중...",
    clearSelection: "선택 해제",
    selectedItems: (count) => `${count}개 항목이 선택됨`,
    filteredItems: (filtered, total) =>
      `필터링된 ${filtered}개 항목 (전체 ${total}개)`,
    totalItems: (count) => `총 ${count}개 항목`,
    selectedCount: (count) => `${count}개 선택됨`,
    actions: "작업",
    filterAll: "전체",
    filterPlaceholder: (title) => `${title} 필터`,
    resetFilter: "필터 초기화",
    itemsPerPage: "페이지당 항목:",
    first: "처음",
    previous: "이전",
    next: "다음",
    last: "마지막",
    showing: (start, end, total) =>
      `총 ${total}개 항목 중 ${start}-${end}개 표시`,
    pageInfo: (current, total) => `${current} / ${total}`,
  };

  return (
    <BaseDataTable
      {...props}
      labels={{ ...koreanLabels, ...props.labels }}
      dateLocale="ko-KR"
    />
  );
}
