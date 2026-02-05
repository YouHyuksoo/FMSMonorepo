"use client";

/**
 * @file packages/ui/src/data-table.tsx
 * @description wbsmaster 스타일의 CSS Grid 기반 데이터 테이블 컴포넌트
 *
 * 초보자 가이드:
 * 1. **주요 개념**: CSS Grid 기반 테이블, 인라인 액션 버튼
 * 2. **사용 방법**: DataTable에 data, columns를 전달
 * 3. **스타일**: wbsmaster 색상 시스템 (bg-surface, text-text 등)
 */

import type React from "react";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Checkbox } from "./checkbox";
import { Icon } from "./icon";
import { cn } from "@fms/utils";

/**
 * 테이블 컬럼 정의
 */
export interface DataTableColumn<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  filterOptions?: Array<{ label: string; value: any }>;
  hidden?: boolean;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
}

/**
 * 테이블 액션 정의
 */
export interface DataTableAction<T> {
  key: string;
  label: string;
  /** @deprecated Use iconName instead */
  icon?: React.ComponentType<{ className?: string }>;
  /** Material Symbol icon name */
  iconName?: string;
  onClick: (record: T) => void;
  variant?: "default" | "destructive";
  disabled?: (record: T) => boolean;
  hidden?: (record: T) => boolean;
}

/**
 * 다국어 라벨 (외부에서 주입)
 */
export interface DataTableLabels {
  search?: string;
  add?: string;
  noData?: string;
  loading?: string;
  clearSelection?: string;
  selectedItems?: (count: number) => string;
  filteredItems?: (filtered: number, total: number) => string;
  totalItems?: (count: number) => string;
  selectedCount?: (count: number) => string;
  actions?: string;
  filterAll?: string;
  filterPlaceholder?: (title: string) => string;
  resetFilter?: string;
  itemsPerPage?: string;
  first?: string;
  previous?: string;
  next?: string;
  last?: string;
  showing?: (start: number, end: number, total: number) => string;
  pageInfo?: (current: number, total: number) => string;
}

/**
 * 기본 라벨
 */
const defaultLabels: Required<DataTableLabels> = {
  search: "Search...",
  add: "Add",
  noData: "No data",
  loading: "Loading...",
  clearSelection: "Clear selection",
  selectedItems: (count) => `${count} item(s) selected`,
  filteredItems: (filtered, total) =>
    `Filtered ${filtered} items (total ${total})`,
  totalItems: (count) => `Total ${count} items`,
  selectedCount: (count) => `${count} selected`,
  actions: "Actions",
  filterAll: "All",
  filterPlaceholder: (title) => `${title} filter`,
  resetFilter: "Reset filters",
  itemsPerPage: "Items per page:",
  first: "First",
  previous: "Previous",
  next: "Next",
  last: "Last",
  showing: (start, end, total) => `Showing ${start}-${end} of ${total} items`,
  pageInfo: (current, total) => `${current} / ${total}`,
};

/**
 * DataTable props
 */
export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  onAdd?: () => void;
  loading?: boolean;
  searchPlaceholder?: string;
  title?: string;
  subtitle?: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  addButtonText?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showExport?: boolean;
  showImport?: boolean;
  showColumnSettings?: boolean;
  selectable?: boolean;
  onSelectedRowsChange?: (selectedRows: T[]) => void;
  selectedRows?: T[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  onExport?: () => void;
  onImport?: () => void;
  emptyMessage?: string;
  stickyHeader?: boolean;
  maxHeight?: string;
  /** 다국어 라벨 (외부에서 주입) */
  labels?: DataTableLabels;
  /** 날짜 포맷 로케일 (기본: ko-KR) */
  dateLocale?: string;
  /** 인라인 액션 버튼 사용 (기본: true) */
  inlineActions?: boolean;
  /** 하단 요약 정보 표시 여부 (기본: false) */
  showSummary?: boolean;
}

/**
 * 날짜 셀 클라이언트 전용 렌더링 컴포넌트
 */
function DateCell({
  value,
  locale = "ko-KR",
}: {
  value: any;
  locale?: string;
}) {
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setDateStr(
        date.toLocaleString(locale, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "UTC",
        })
      );
    }
  }, [value, locale]);

  return <>{dateStr}</>;
}

// ISO 8601 날짜 형식 정규식
const ISO_DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;

const formatValue = (value: any, locale?: string): React.ReactNode => {
  if (value == null) return "";
  if (value instanceof Date) {
    return <DateCell value={value} locale={locale} />;
  }
  if (typeof value === "string" && ISO_DATE_REGEX.test(value)) {
    return <DateCell value={value} locale={locale} />;
  }
  if (typeof value === "boolean") return value ? "Y" : "N";
  return String(value);
};

/**
 * wbsmaster 스타일 CSS Grid 기반 데이터 테이블
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns: initialColumns,
  actions = [],
  onAdd,
  loading = false,
  searchPlaceholder,
  title,
  subtitle,
  headerLeft,
  headerRight,
  addButtonText,
  showSearch = true,
  showFilter = true,
  showExport = false,
  showImport = false,
  showColumnSettings = true,
  selectable = false,
  onSelectedRowsChange,
  selectedRows = [],
  pagination,
  onExport,
  onImport,
  emptyMessage,
  stickyHeader = false,
  maxHeight = "calc(100vh - 200px)",
  labels: externalLabels,
  dateLocale = "ko-KR",
  inlineActions = true,
  showSummary = false,
}: DataTableProps<T>) {
  const labels: Required<DataTableLabels> = useMemo(
    () => ({ ...defaultLabels, ...externalLabels }),
    [externalLabels]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const searchPlaceholderText = searchPlaceholder ?? labels.search;
  const addButtonTextText = addButtonText ?? labels.add;
  const emptyMessageText = emptyMessage ?? labels.noData;

  const getValue = useCallback((record: T, key: string): any => {
    if (!record || !key) return "";
    try {
      if (Object.prototype.hasOwnProperty.call(record, key)) {
        return record[key as keyof T] ?? "";
      }
      if (key.includes(".")) {
        const nestedValue = key
          .split(".")
          .reduce(
            (obj, k) =>
              obj && typeof obj === "object"
                ? (obj as Record<string, any>)[k]
                : undefined,
            record
          );
        return nestedValue ?? "";
      }
      return record[key as keyof T] ?? "";
    } catch {
      return "";
    }
  }, []);

  const visibleColumns = useMemo(() => {
    return initialColumns.filter(
      (col) => !hiddenColumns.has(String(col.key)) && !col.hidden
    );
  }, [initialColumns, hiddenColumns]);

  // 검색 및 필터링
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((item) => {
      if (searchTerm && showSearch) {
        const searchMatch = visibleColumns.some((column) => {
          if (!column.searchable) return false;
          const columnKey = (column as any).accessorKey || column.key;
          const value = getValue(item, String(columnKey));
          return value
            ? String(value).toLowerCase().includes(searchTerm.toLowerCase())
            : false;
        });
        if (!searchMatch) return false;
      }

      for (const [columnKey, filterValue] of Object.entries(columnFilters)) {
        if (filterValue !== undefined && filterValue !== "") {
          const itemValue = getValue(item, columnKey);
          if (Array.isArray(filterValue)) {
            if (!filterValue.includes(itemValue)) return false;
          } else {
            if (itemValue !== filterValue) return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, columnFilters, visibleColumns, showSearch, getValue]);

  // 정렬
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getValue(a, sortColumn);
      const bValue = getValue(b, sortColumn);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = aValue ? String(aValue).toLowerCase() : "";
      const bStr = bValue ? String(bValue).toLowerCase() : "";

      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection, getValue]);

  // 페이지네이션
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination]);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleColumnFilter = (columnKey: string, value: any) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setColumnFilters({});
    setSortColumn("");
    setSortDirection("asc");
  };

  const toggleColumn = (columnKey: string) => {
    setHiddenColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedRowsChange?.(paginatedData);
    } else {
      onSelectedRowsChange?.([]);
    }
  };

  const handleSelectRow = (record: T, checked: boolean) => {
    if (checked) {
      onSelectedRowsChange?.([...selectedRows, record]);
    } else {
      onSelectedRowsChange?.(
        selectedRows.filter((row) => row.id !== record.id)
      );
    }
  };

  const isRowSelected = (record: T) => {
    return selectedRows.some((row) => row.id === record.id);
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((record) => isRowSelected(record));
  const isIndeterminate =
    paginatedData.some((record) => isRowSelected(record)) && !isAllSelected;

  // Grid template columns 계산
  const gridTemplateColumns = useMemo(() => {
    const cols: string[] = [];
    if (selectable) cols.push("50px");
    if (inlineActions && actions.length > 0) {
      cols.push(`${Math.max(actions.length * 36, 80)}px`);
    }
    visibleColumns.forEach((col) => {
      cols.push(col.width || "1fr");
    });
    if (!inlineActions && actions.length > 0) cols.push("100px");
    return cols.join(" ");
  }, [visibleColumns, selectable, actions.length, inlineActions]);

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {headerLeft ? (
            headerLeft
          ) : (
            <div>
              {title && (
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
              )}
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 검색 */}
          {showSearch && (
            <div className="relative">
              <Icon name="search" size="sm" className="absolute left-2 top-2.5 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholderText}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          )}

          {/* 필터 토글 */}
          {showFilter && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              title="필터"
            >
              <Icon name="filter_list" size="sm" />
            </Button>
          )}

          {/* 필터 초기화 */}
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            title={labels.resetFilter}
          >
            <Icon name="refresh" size="sm" />
          </Button>

          {/* 컬럼 설정 */}
          {showColumnSettings && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" title="컬럼 설정">
                  <Icon name="settings" size="sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {initialColumns.map((column) => (
                  <DropdownMenuItem
                    key={String(column.key)}
                    onClick={() => toggleColumn(String(column.key))}
                  >
                    <Checkbox
                      checked={
                        !hiddenColumns.has(String(column.key)) && !column.hidden
                      }
                      className="mr-2"
                    />
                    {column.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 내보내기 */}
          {!headerRight && showExport && onExport && (
            <Button variant="outline" size="icon" onClick={onExport} title="엑셀 다운로드">
              <Icon name="download" size="sm" />
            </Button>
          )}

          {/* 가져오기 */}
          {!headerRight && showImport && onImport && (
            <Button variant="outline" size="icon" onClick={onImport} title="가져오기">
              <Icon name="upload" size="sm" />
            </Button>
          )}

          {/* 추가 버튼 */}
          {!headerRight && onAdd && (
            <Button onClick={onAdd}>
              <Icon name="add" size="sm" className="mr-2" />
              {addButtonTextText}
            </Button>
          )}

          {/* 커스텀 헤더 오른쪽 */}
          {headerRight}
        </div>
      </div>

      {/* 필터 패널 */}
      {showFilters && showFilter && (
        <div className="bg-muted/50 p-4 rounded-lg border border-border dark:border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleColumns
              .filter((column) => column.filterable)
              .map((column) => {
                const columnKey = (column as any).accessorKey || column.key;
                return (
                  <div key={String(columnKey)} className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{column.title}</label>
                    {column.filterOptions ? (
                      <Select
                        value={columnFilters[String(columnKey)] || ""}
                        onValueChange={(value) =>
                          handleColumnFilter(
                            String(columnKey),
                            value === "all" ? "" : value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={labels.filterAll} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{labels.filterAll}</SelectItem>
                          {column.filterOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder={labels.filterPlaceholder(column.title)}
                        value={columnFilters[String(columnKey)] || ""}
                        onChange={(e) =>
                          handleColumnFilter(String(columnKey), e.target.value)
                        }
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 선택된 행 정보 */}
      {selectable && selectedRows.length > 0 && (
        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              {labels.selectedItems(selectedRows.length)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectedRowsChange?.([])}
            >
              {labels.clearSelection}
            </Button>
          </div>
        </div>
      )}

      {/* CSS Grid 기반 테이블 */}
      <div className="bg-card dark:bg-card border border-border dark:border-border rounded-xl overflow-hidden">
        <div
          className="overflow-auto"
          style={{ maxHeight: stickyHeader ? maxHeight : "none" }}
        >
          {/* 테이블 헤더 */}
          <div
            className={cn(
              "grid gap-2 px-4 py-3",
              "bg-muted/50 dark:bg-muted/20",
              "border-b border-border dark:border-border",
              "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
              "min-w-[800px]",
              stickyHeader && "sticky top-0 z-10"
            )}
            style={{ gridTemplateColumns }}
          >
            {selectable && (
              <div className="flex items-center">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onCheckedChange={handleSelectAll}
                />
              </div>
            )}
            {inlineActions && actions.length > 0 && (
              <div className="flex items-center">{labels.actions}</div>
            )}
            {visibleColumns.map((column) => (
              <div
                key={String(column.key)}
                className={cn(
                  "flex items-center gap-1",
                  column.sortable && "cursor-pointer hover:text-foreground",
                  column.align === "center" && "justify-center",
                  column.align === "right" && "justify-end"
                )}
                onClick={() =>
                  column.sortable && handleSort(String(column.key))
                }
              >
                {column.title}
                {column.sortable && (
                  <div className="flex flex-col -space-y-1.5">
                    <Icon
                      name="expand_less"
                      size="xs"
                      className={cn(
                        sortColumn === String(column.key) &&
                          sortDirection === "asc"
                          ? "text-primary"
                          : "text-muted-foreground/50"
                      )}
                    />
                    <Icon
                      name="expand_more"
                      size="xs"
                      className={cn(
                        sortColumn === String(column.key) &&
                          sortDirection === "desc"
                          ? "text-primary"
                          : "text-muted-foreground/50"
                      )}
                    />
                  </div>
                )}
              </div>
            ))}
            {!inlineActions && actions.length > 0 && (
              <div className="flex items-center">{labels.actions}</div>
            )}
          </div>

          {/* 빈 목록 */}
          {!loading && paginatedData.length === 0 && (
            <div className="p-8 text-center">
              <Icon name="inbox" size="xl" className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{emptyMessageText}</p>
            </div>
          )}

          {/* 로딩 */}
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <span className="mt-2 text-muted-foreground">{labels.loading}</span>
            </div>
          )}

          {/* 데이터 행 */}
          {!loading &&
            paginatedData.map((record, index) => (
              <div
                key={record.id || index}
                className={cn(
                  "grid gap-2 px-4 py-1 items-center",
                  "data-table-row",
                  "transition-colors cursor-default",
                  "min-w-[800px]",
                  isRowSelected(record) && "bg-primary/5 dark:bg-primary/10"
                )}
                style={{ gridTemplateColumns }}
                data-state={isRowSelected(record) ? "selected" : undefined}
              >
                {selectable && (
                  <div className="flex items-center">
                    <Checkbox
                      checked={isRowSelected(record)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(record, checked as boolean)
                      }
                    />
                  </div>
                )}
                {/* 인라인 액션 버튼 */}
                {inlineActions && actions.length > 0 && (
                  <div className="flex items-center gap-1">
                    {actions
                      .filter((action) => !action.hidden?.(record))
                      .map((action) => {
                        const ActionIcon = action.icon;
                        const isDestructive = action.variant === "destructive";
                        return (
                          <button
                            key={action.key}
                            onClick={() => action.onClick(record)}
                            disabled={action.disabled?.(record)}
                            className={cn(
                              "p-1.5 rounded transition-colors",
                              "hover:bg-primary/10",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                              isDestructive && "hover:bg-destructive/10"
                            )}
                            title={action.label}
                          >
                            {action.iconName ? (
                              <Icon
                                name={action.iconName}
                                size="xs"
                                className={cn(
                                  isDestructive ? "text-destructive" : "text-primary"
                                )}
                              />
                            ) : ActionIcon ? (
                              <ActionIcon
                                className={cn(
                                  "h-4 w-4",
                                  isDestructive ? "text-destructive" : "text-primary"
                                )}
                              />
                            ) : null}
                          </button>
                        );
                      })}
                  </div>
                )}
                {/* 데이터 셀 */}
                {visibleColumns.map((column) => (
                  <div
                    key={String(column.key)}
                    className={cn(
                      "text-sm text-foreground truncate",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right"
                    )}
                  >
                    {column.render
                      ? column.render(
                          getValue(record, String(column.key)),
                          record,
                          index
                        )
                      : formatValue(
                          getValue(record, String(column.key)),
                          dateLocale
                        )}
                  </div>
                ))}
                {/* 드롭다운 액션 */}
                {!inlineActions && actions.length > 0 && (
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Icon name="more_horiz" size="sm" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions
                          .filter((action) => !action.hidden?.(record))
                          .map((action) => {
                            const ActionIcon = action.icon;
                            return (
                              <DropdownMenuItem
                                key={action.key}
                                onClick={() => action.onClick(record)}
                                disabled={action.disabled?.(record)}
                                className={
                                  action.variant === "destructive"
                                    ? "text-destructive"
                                    : ""
                                }
                              >
                                {action.iconName ? (
                                  <Icon name={action.iconName} size="sm" className="mr-2" />
                                ) : ActionIcon ? (
                                  <ActionIcon className="mr-2 h-4 w-4" />
                                ) : null}
                                {action.label}
                              </DropdownMenuItem>
                            );
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* 페이지네이션 */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {labels.showing(
              (pagination.page - 1) * pagination.pageSize + 1,
              Math.min(pagination.page * pagination.pageSize, pagination.total),
              pagination.total
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{labels.itemsPerPage}</span>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) =>
                  pagination.onPageSizeChange(Number.parseInt(value))
                }
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.page === 1}
              >
                {labels.first}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                {labels.previous}
              </Button>
              <span className="px-3 py-1 text-sm text-foreground">
                {labels.pageInfo(
                  pagination.page,
                  Math.ceil(pagination.total / pagination.pageSize)
                )}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.pageSize)
                }
              >
                {labels.next}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  pagination.onPageChange(
                    Math.ceil(pagination.total / pagination.pageSize)
                  )
                }
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.pageSize)
                }
              >
                {labels.last}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 요약 정보 (showSummary가 true일 때만 표시) */}
      {showSummary && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {searchTerm || Object.keys(columnFilters).length > 0
              ? labels.filteredItems(sortedData.length, data.length)
              : labels.totalItems(data.length)}
          </div>
          {selectedRows.length > 0 && (
            <div>{labels.selectedCount(selectedRows.length)}</div>
          )}
        </div>
      )}
    </div>
  );
}

// 이전 버전과의 호환성을 위한 Column 타입 별칭
export type Column<T> = DataTableColumn<T>;
