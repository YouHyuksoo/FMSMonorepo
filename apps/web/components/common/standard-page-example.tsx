/**
 * @file apps/web/components/common/standard-page-example.tsx
 * @description 표준 페이지 레이아웃 사용 예시 - 마이그레이션 참고용
 *
 * 초보자 가이드:
 * 1. **사용법**: 이 파일을 참고하여 기존 페이지를 표준 형식으로 변환
 * 2. **핵심 컴포넌트**: StandardPageLayout + DataTable (@fms/ui)
 * 3. **주요 기능**: 탭, 통계 카드, 필터, 검색, 컬럼 설정, 페이지네이션
 */

"use client";

import { useState, useMemo } from "react";
import { StandardPageLayout, type TabConfig, type StatCard, type ActionButton } from "./standard-page-layout";
import { DataTable, type DataTableColumn, type DataTableAction } from "./data-table";
import { Badge } from "@fms/ui/badge";
import { useCrudState } from "@/hooks/use-crud-state";
import { useToast } from "@/hooks/use-toast";

// ============================================
// 1. 타입 정의
// ============================================
interface ExampleItem {
  id: string;
  code: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 2. Mock 데이터 (실제로는 API에서 가져옴)
// ============================================
const mockData: ExampleItem[] = [
  { id: "1", code: "EX-001", name: "예시 항목 1", type: "type_a", status: "active", createdAt: "2024-01-01", updatedAt: "2024-01-15" },
  { id: "2", code: "EX-002", name: "예시 항목 2", type: "type_b", status: "inactive", createdAt: "2024-01-02", updatedAt: "2024-01-16" },
  { id: "3", code: "EX-003", name: "예시 항목 3", type: "type_a", status: "pending", createdAt: "2024-01-03", updatedAt: "2024-01-17" },
  // ... 더 많은 데이터
];

// ============================================
// 3. 상태별 Badge 렌더링 함수
// ============================================
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "활성", variant: "default" },
  inactive: { label: "비활성", variant: "secondary" },
  pending: { label: "대기중", variant: "outline" },
};

const typeConfig: Record<string, { label: string }> = {
  type_a: { label: "유형 A" },
  type_b: { label: "유형 B" },
};

// ============================================
// 4. 메인 컴포넌트
// ============================================
export function StandardPageExample() {
  const { toast } = useToast();
  const crud = useCrudState<ExampleItem>();

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 데이터 상태 (실제로는 useEffect + API 호출)
  const [data] = useState<ExampleItem[]>(mockData);
  const [loading] = useState(false);

  // ============================================
  // 5. 통계 계산
  // ============================================
  const stats = useMemo((): StatCard[] => {
    const total = data.length;
    const active = data.filter((d) => d.status === "active").length;
    const inactive = data.filter((d) => d.status === "inactive").length;
    const pending = data.filter((d) => d.status === "pending").length;

    return [
      { label: "전체", value: total, icon: "inventory_2", color: "default" },
      { label: "활성", value: active, icon: "check_circle", color: "success" },
      { label: "비활성", value: inactive, icon: "cancel", color: "error" },
      { label: "대기중", value: pending, icon: "schedule", color: "warning" },
    ];
  }, [data]);

  // ============================================
  // 6. DataTable 컬럼 정의
  // ============================================
  const columns: DataTableColumn<ExampleItem>[] = [
    {
      key: "code",
      title: "코드",
      width: "120px",
      sortable: true,
      searchable: true,
    },
    {
      key: "name",
      title: "이름",
      width: "200px",
      sortable: true,
      searchable: true,
    },
    {
      key: "type",
      title: "유형",
      width: "120px",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "유형 A", value: "type_a" },
        { label: "유형 B", value: "type_b" },
      ],
      render: (value) => <Badge variant="outline">{typeConfig[value]?.label || value}</Badge>,
    },
    {
      key: "status",
      title: "상태",
      width: "100px",
      align: "center",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "활성", value: "active" },
        { label: "비활성", value: "inactive" },
        { label: "대기중", value: "pending" },
      ],
      render: (value) => {
        const config = statusConfig[value];
        return <Badge variant={config?.variant || "outline"}>{config?.label || value}</Badge>;
      },
    },
    {
      key: "createdAt",
      title: "생성일",
      width: "120px",
      sortable: true,
    },
    {
      key: "updatedAt",
      title: "수정일",
      width: "120px",
      sortable: true,
    },
  ];

  // ============================================
  // 7. DataTable 액션 정의
  // ============================================
  const tableActions: DataTableAction<ExampleItem>[] = [
    {
      key: "edit",
      label: "수정",
      iconName: "edit",
      onClick: (record) => {
        crud.handleEdit(record);
        toast({ title: "수정 모달 열기", description: `${record.name} 수정` });
      },
    },
    {
      key: "delete",
      label: "삭제",
      iconName: "delete",
      variant: "destructive",
      onClick: (record) => {
        crud.handleDelete(record);
        toast({ title: "삭제 확인", description: `${record.name} 삭제 확인`, variant: "destructive" });
      },
    },
  ];

  // ============================================
  // 8. 헤더 액션 버튼 정의
  // ============================================
  const headerActions: ActionButton[] = [
    {
      label: "가져오기/내보내기",
      icon: "upload_file",
      variant: "outline",
      onClick: () => crud.openImportExport(),
    },
    {
      label: "등록",
      icon: "add",
      onClick: () => crud.handleAdd(),
    },
  ];

  // ============================================
  // 9. 목록 탭 콘텐츠
  // ============================================
  const listTabContent = (
    <DataTable
      data={data}
      columns={columns}
      actions={tableActions}
      loading={loading}
      showSearch
      showFilter
      showColumnSettings
      searchPlaceholder="코드, 이름으로 검색..."
      pagination={{
        page,
        pageSize,
        total: data.length,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
    />
  );

  // ============================================
  // 10. 통계 탭 콘텐츠 (선택 사항)
  // ============================================
  const statsTabContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-surface dark:bg-surface-dark p-6 rounded-xl border border-border dark:border-border-dark">
        <h3 className="text-lg font-semibold mb-4">유형별 현황</h3>
        {/* 차트나 추가 통계 내용 */}
        <p className="text-text-secondary">유형별 데이터 분포 차트가 들어갈 영역</p>
      </div>
      <div className="bg-surface dark:bg-surface-dark p-6 rounded-xl border border-border dark:border-border-dark">
        <h3 className="text-lg font-semibold mb-4">상태별 현황</h3>
        {/* 차트나 추가 통계 내용 */}
        <p className="text-text-secondary">상태별 데이터 분포 차트가 들어갈 영역</p>
      </div>
    </div>
  );

  // ============================================
  // 11. 탭 설정
  // ============================================
  const tabs: TabConfig[] = [
    {
      id: "list",
      label: "목록",
      icon: "list",
      content: listTabContent,
      badge: data.length,
    },
    {
      id: "stats",
      label: "통계",
      icon: "analytics",
      content: statsTabContent,
    },
  ];

  // ============================================
  // 12. 렌더링
  // ============================================
  return (
    <StandardPageLayout
      title="예시 관리"
      subtitle="표준 페이지 레이아웃 사용 예시"
      tabs={tabs}
      defaultTab="list"
      actions={headerActions}
      stats={stats}
      loading={loading}
    />
  );
}

// ============================================
// 탭 없이 단순한 페이지 예시
// ============================================
export function SimplePageExample() {
  const [data] = useState<ExampleItem[]>(mockData);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns: DataTableColumn<ExampleItem>[] = [
    { key: "code", title: "코드", width: "120px", sortable: true, searchable: true },
    { key: "name", title: "이름", sortable: true, searchable: true },
    { key: "status", title: "상태", width: "100px", sortable: true },
  ];

  return (
    <StandardPageLayout
      title="간단한 관리 페이지"
      actions={[{ label: "등록", icon: "add", onClick: () => {} }]}
    >
      <DataTable
        data={data}
        columns={columns}
        showSearch
        showColumnSettings
        pagination={{
          page,
          pageSize,
          total: data.length,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </StandardPageLayout>
  );
}

export default StandardPageExample;
