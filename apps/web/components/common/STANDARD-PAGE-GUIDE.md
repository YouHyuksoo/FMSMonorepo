# 표준 페이지 레이아웃 마이그레이션 가이드

## 개요

기존 `DataGrid` 컴포넌트를 사용하는 페이지들을 `@fms/ui`의 `DataTable`과 `StandardPageLayout`을 사용하는 표준 형식으로 마이그레이션하는 가이드입니다.

## 표준 컴포넌트

### 1. StandardPageLayout
- 위치: `@/components/common/standard-page-layout`
- 기능: 탭, 헤더, 통계 카드, 액션 버튼

### 2. DataTable
- 위치: `@/components/common/data-table` (래퍼) 또는 `@fms/ui/data-table` (원본)
- 기능: 필터, 검색, 컬럼 설정, 정렬, 페이지네이션, 인라인 액션

## 마이그레이션 단계

### Step 1: Import 변경

**Before (DataGrid):**
```tsx
import { DataGrid, type Column } from "@/components/ui/DataGrid"
```

**After (DataTable):**
```tsx
import { StandardPageLayout, type TabConfig, type StatCard } from "@/components/common/standard-page-layout"
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/common/data-table"
```

### Step 2: 컬럼 정의 변경

**Before (DataGrid):**
```tsx
const columns: Column<Equipment>[] = [
  {
    id: "code",
    header: "코드",
    width: "120px",
    cell: (item) => item.code,
  },
  {
    id: "status",
    header: "상태",
    width: "100px",
    align: "center",
    cell: (item) => <Badge>{item.status}</Badge>,
  },
]
```

**After (DataTable):**
```tsx
const columns: DataTableColumn<Equipment>[] = [
  {
    key: "code",
    title: "코드",
    width: "120px",
    sortable: true,      // 정렬 가능
    searchable: true,    // 검색 대상
  },
  {
    key: "status",
    title: "상태",
    width: "100px",
    align: "center",
    sortable: true,
    filterable: true,    // 필터 가능
    filterOptions: [     // 필터 옵션
      { label: "가동중", value: "running" },
      { label: "정지", value: "stopped" },
    ],
    render: (value, record) => <Badge>{value}</Badge>,
  },
]
```

### Step 3: 액션 버튼 정의

**Before (DataGrid):**
```tsx
{
  id: "actions",
  header: "작업",
  width: "80px",
  cell: (item) => (
    <div className="flex gap-1">
      <button onClick={() => handleEdit(item)}>
        <Icon name="edit" />
      </button>
      <button onClick={() => handleDelete(item)}>
        <Icon name="delete" />
      </button>
    </div>
  ),
}
```

**After (DataTable):**
```tsx
const actions: DataTableAction<Equipment>[] = [
  {
    key: "edit",
    label: "수정",
    iconName: "edit",
    onClick: (record) => handleEdit(record),
  },
  {
    key: "delete",
    label: "삭제",
    iconName: "delete",
    variant: "destructive",
    onClick: (record) => handleDelete(record),
  },
]
```

### Step 4: 컴포넌트 변경

**Before (DataGrid):**
```tsx
return (
  <div className="p-6">
    <div className="flex justify-between mb-4">
      <h1>설비 관리</h1>
      <Button onClick={handleAdd}>등록</Button>
    </div>

    <DataGrid
      data={filteredData.slice((page - 1) * pageSize, page * pageSize)}
      columns={columns}
      totalCount={filteredData.length}
      currentPage={page}
      onPageChange={setPage}
      itemsPerPage={pageSize}
      onItemsPerPageChange={setPageSize}
      isLoading={loading}
    />
  </div>
)
```

**After (DataTable + StandardPageLayout):**
```tsx
const tabs: TabConfig[] = [
  {
    id: "list",
    label: "목록",
    icon: "list",
    badge: data.length,
    content: (
      <DataTable
        data={data}
        columns={columns}
        actions={actions}
        loading={loading}
        showSearch
        showFilter
        showColumnSettings
        searchPlaceholder="설비코드, 설비명으로 검색..."
        pagination={{
          page,
          pageSize,
          total: data.length,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    ),
  },
]

return (
  <StandardPageLayout
    title="설비 관리"
    tabs={tabs}
    defaultTab="list"
    actions={[
      { label: "가져오기/내보내기", icon: "upload_file", variant: "outline", onClick: openImportExport },
      { label: "등록", icon: "add", onClick: handleAdd },
    ]}
    stats={stats}
  />
)
```

## 주요 변경 사항

| 항목 | DataGrid | DataTable |
|------|----------|-----------|
| 컬럼 키 | `id` | `key` |
| 컬럼 제목 | `header` | `title` |
| 셀 렌더링 | `cell: (item) => ...` | `render: (value, record, index) => ...` |
| 정렬 | 없음 | `sortable: true` |
| 검색 | 외부 구현 | `searchable: true` |
| 필터 | 외부 구현 | `filterable: true`, `filterOptions: [...]` |
| 컬럼 설정 | 없음 | `showColumnSettings` |
| 페이지네이션 | 개별 props | `pagination: { ... }` |
| 액션 버튼 | 컬럼 내 구현 | `actions: [...]` |

## DataTable 주요 Props

```tsx
interface DataTableProps<T> {
  data: T[];                          // 데이터 배열
  columns: DataTableColumn<T>[];      // 컬럼 정의
  actions?: DataTableAction<T>[];     // 액션 버튼
  loading?: boolean;                  // 로딩 상태
  showSearch?: boolean;               // 검색창 표시
  showFilter?: boolean;               // 필터 패널 표시
  showColumnSettings?: boolean;       // 컬럼 설정 표시
  showExport?: boolean;               // 내보내기 버튼
  showImport?: boolean;               // 가져오기 버튼
  selectable?: boolean;               // 행 선택 기능
  searchPlaceholder?: string;         // 검색 placeholder
  pagination?: {                      // 페이지네이션
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  onAdd?: () => void;                 // 추가 버튼 클릭
  inlineActions?: boolean;            // 인라인 액션 (기본: true)
}
```

## StandardPageLayout 주요 Props

```tsx
interface StandardPageLayoutProps {
  title: string;                      // 페이지 제목
  subtitle?: string;                  // 부제목
  tabs?: TabConfig[];                 // 탭 설정
  defaultTab?: string;                // 기본 탭
  actions?: ActionButton[];           // 헤더 액션 버튼
  stats?: StatCard[];                 // 통계 카드
  children?: ReactNode;               // 탭 없이 단일 콘텐츠
  loading?: boolean;                  // 로딩 상태
}
```

## 마이그레이션 대상 페이지

다음 페이지들이 `DataGrid`를 사용하고 있으며 마이그레이션 대상입니다:

- `equipment/master/` - 설비 마스터 관리
- `maintenance/` - 정비 관리
- `preventive/order/` - 예방정비 오더
- `materials/` - 자재 관리
- `failure/` - 고장 관리
- `inspection/` - 점검 관리

## 예시 파일

- 전체 예시: `@/components/common/standard-page-example.tsx`
- 참고 페이지: `equipment/overview/` (이미 DataTable 사용중)
