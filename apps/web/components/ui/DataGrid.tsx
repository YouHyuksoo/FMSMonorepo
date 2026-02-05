/**
 * @file src/components/ui/DataGrid.tsx
 * @description
 * Generic Data Grid component based on wbsmaster's EquipmentGridView.
 * Uses manual grid layout (div-based) for precise control over column widths.
 */

"use client";

import { Icon } from "@/components/ui/Icon";
import { ReactNode } from "react";

export interface Column<T> {
  id: string;
  header: ReactNode;
  width: string; // CSS grid-template-columns value (e.g., "150px", "1fr")
  cell: (item: T) => ReactNode;
  align?: "left" | "center" | "right";
}

interface DataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (count: number) => void;
  isLoading?: boolean;
  minWidth?: string; // Minimum width for the grid container to enable horizontal scrolling
  onRowClick?: (item: T) => void;
  showPagination?: boolean;
}

export function DataGrid<T extends { id: string | number }>({
  data,
  columns,
  totalCount = 0,
  currentPage = 1,
  onPageChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
  isLoading = false,
  minWidth = "1200px",
  onRowClick,
  showPagination = true,
}: DataGridProps<T>) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  // Construct grid-template-columns string
  const gridTemplateColumns = columns.map((col) => col.width).join(" ");

  if (isLoading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-background-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl overflow-hidden overflow-x-auto">
      {/* Header */}
      <div
        className="grid gap-2 px-4 py-3 bg-surface dark:bg-background-dark border-b border-border dark:border-border-dark text-xs font-semibold text-text-secondary uppercase"
        style={{ gridTemplateColumns, minWidth }}
      >
        {columns.map((col) => (
          <div key={col.id} className={col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}>
            {col.header}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="p-8 text-center text-surface-dark dark:text-surface">
          <Icon name="inbox" size="xl" className="text-text-secondary mb-4 opacity-20" />
          <p className="text-text-secondary">No data found.</p>
        </div>
      )}

      {/* Data Rows */}
      {data.map((item) => (
        <div
          key={item.id}
          onClick={() => onRowClick?.(item)}
          className={`grid gap-2 px-4 py-3 border-b border-border dark:border-border-dark hover:bg-surface dark:hover:bg-background-dark transition-colors items-center ${onRowClick ? "cursor-pointer" : ""}`}
          style={{ gridTemplateColumns, minWidth }}
        >
          {columns.map((col) => (
            <div key={`${item.id}-${col.id}`} className={col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left leading-relaxed"}>
              {col.cell(item)}
            </div>
          ))}
        </div>
      ))}

      {/* Pagination */}
      {showPagination && totalCount > 0 && onPageChange && onItemsPerPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border dark:border-border-dark">
          {/* Left: Info */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">
              Total <span className="font-bold text-text dark:text-white">{totalCount}</span> items | Showing {" "}
              <span className="font-medium text-text dark:text-white">
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalCount)}
              </span>
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-sm text-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center gap-1">
            {/* First */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="size-8 rounded-lg flex items-center justify-center hover:bg-surface dark:hover:bg-background-dark text-text-secondary hover:text-text dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <Icon name="first_page" size="sm" />
            </button>
            {/* Previous */}
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="size-8 rounded-lg flex items-center justify-center hover:bg-surface dark:hover:bg-background-dark text-text-secondary hover:text-text dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <Icon name="chevron_left" size="sm" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center">
                {(() => {
                const pages: (number | string)[] = [];
                const maxVisible = 5;
                let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                const end = Math.min(totalPages, start + maxVisible - 1);
                if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1);
                }

                if (start > 1) {
                    pages.push(1);
                    if (start > 2) pages.push("...");
                }
                for (let i = start; i <= end; i++) {
                    pages.push(i);
                }
                if (end < totalPages) {
                    if (end < totalPages - 1) pages.push("...");
                    pages.push(totalPages);
                }

                return pages.map((page, idx) =>
                    typeof page === "string" ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-text-secondary">
                        {page}
                    </span>
                    ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`size-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                        currentPage === page
                            ? "bg-primary text-white shadow-sm"
                            : "hover:bg-surface dark:hover:bg-background-dark text-text-secondary hover:text-text dark:hover:text-white"
                        }`}
                    >
                        {page}
                    </button>
                    )
                );
                })()}
            </div>

            {/* Next */}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="size-8 rounded-lg flex items-center justify-center hover:bg-surface dark:hover:bg-background-dark text-text-secondary hover:text-text dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <Icon name="chevron_right" size="sm" />
            </button>
            {/* Last */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="size-8 rounded-lg flex items-center justify-center hover:bg-surface dark:hover:bg-background-dark text-text-secondary hover:text-text dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Last Page"
            >
              <Icon name="last_page" size="sm" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
