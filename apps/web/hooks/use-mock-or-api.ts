/**
 * @file apps/web/hooks/use-mock-or-api.ts
 * @description Mock 데이터와 실제 API를 전환하는 커스텀 훅
 *
 * 초보자 가이드:
 * 1. **주요 개념**: NEXT_PUBLIC_USE_MOCK_API 환경변수에 따라 Mock/API 자동 전환
 * 2. **사용법**:
 *    - useMockOrApi<T>({ mockData, queryKey, queryFn }) 형태로 사용
 *    - CRUD 작업용 useMockOrApiMutation 훅 제공
 * 3. **환경변수**:
 *    - NEXT_PUBLIC_USE_MOCK_API=true → Mock 데이터 사용
 *    - NEXT_PUBLIC_USE_MOCK_API=false 또는 미설정 → 실제 API 사용
 */

import { useState, useCallback, useMemo } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from '@tanstack/react-query';

// ============================================================
// 타입 정의
// ============================================================

/** 기본 엔티티 인터페이스 (모든 엔티티가 id를 가져야 함) */
export interface BaseEntity {
  id: string;
}

/** Mock 데이터 스토어 타입 */
export type MockDataStore<T> = T[];

/** Mock/API 훅 옵션 */
export interface UseMockOrApiOptions<TData, TFilter = unknown> {
  /** 초기 Mock 데이터 */
  mockData: TData[];
  /** React Query 쿼리 키 */
  queryKey: QueryKey;
  /** API 호출 함수 */
  queryFn: (filter?: TFilter) => Promise<TData[] | { items: TData[]; total: number }>;
  /** 필터 조건 */
  filter?: TFilter;
  /** 추가 쿼리 옵션 */
  queryOptions?: Omit<UseQueryOptions<TData[], Error>, 'queryKey' | 'queryFn'>;
  /** Mock 데이터 지연 시간 (ms) - 실제 API 호출처럼 보이게 */
  mockDelay?: number;
}

/** Mock/API 단일 조회 훅 옵션 */
export interface UseMockOrApiSingleOptions<TData> {
  /** 초기 Mock 데이터 */
  mockData: TData[];
  /** React Query 쿼리 키 */
  queryKey: QueryKey;
  /** API 호출 함수 */
  queryFn: (id: string) => Promise<TData>;
  /** 조회할 ID */
  id: string;
  /** 추가 쿼리 옵션 */
  queryOptions?: Omit<UseQueryOptions<TData | undefined, Error>, 'queryKey' | 'queryFn'>;
  /** Mock 데이터 지연 시간 (ms) */
  mockDelay?: number;
}

/** CRUD Mutation 타입 */
export type MutationType = 'create' | 'update' | 'delete';

/** Mutation 훅 옵션 */
export interface UseMockOrApiMutationOptions<TData extends BaseEntity, TInput = Partial<TData>> {
  /** Mutation 타입 */
  type: MutationType;
  /** Mock 데이터 (useState로 관리되는 것) */
  mockData: TData[];
  /** Mock 데이터 업데이트 함수 */
  setMockData: React.Dispatch<React.SetStateAction<TData[]>>;
  /** API 호출 함수 */
  mutationFn: (input: TInput) => Promise<TData | void>;
  /** 무효화할 쿼리 키 목록 */
  invalidateKeys?: QueryKey[];
  /** 추가 Mutation 옵션 */
  mutationOptions?: Omit<UseMutationOptions<TData | void, Error, TInput>, 'mutationFn'>;
  /** Mock 데이터 지연 시간 (ms) */
  mockDelay?: number;
  /** 새 엔티티 ID 생성 함수 (create 시 사용) */
  generateId?: () => string;
}

/** 훅 반환 타입 */
export interface UseMockOrApiReturn<TData> {
  /** 데이터 */
  data: TData[] | undefined;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 */
  error: Error | null;
  /** Mock 모드 여부 */
  isMockMode: boolean;
  /** 데이터 새로고침 */
  refetch: () => void;
}

/** 단일 조회 훅 반환 타입 */
export interface UseMockOrApiSingleReturn<TData> {
  /** 데이터 */
  data: TData | undefined;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 */
  error: Error | null;
  /** Mock 모드 여부 */
  isMockMode: boolean;
  /** 데이터 새로고침 */
  refetch: () => void;
}

// ============================================================
// 유틸리티 함수
// ============================================================

/** Mock 모드 여부 확인 */
export function isMockMode(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
  }
  return process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
}

/** 비동기 지연 함수 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 기본 ID 생성 함수 */
function generateDefaultId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================
// 메인 훅: useMockOrApi (목록 조회)
// ============================================================

/**
 * Mock 데이터와 API를 전환하는 커스텀 훅 (목록 조회용)
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, isMockMode } = useMockOrApi<Equipment>({
 *   mockData: mockEquipments,
 *   queryKey: ['equipments', filter],
 *   queryFn: () => equipmentApi.getAll(filter),
 *   filter: { status: 'running' },
 * });
 * ```
 */
export function useMockOrApi<TData extends BaseEntity, TFilter = unknown>({
  mockData: initialMockData,
  queryKey,
  queryFn,
  filter,
  queryOptions,
  mockDelay = 300,
}: UseMockOrApiOptions<TData, TFilter>): UseMockOrApiReturn<TData> & {
  mockData: TData[];
  setMockData: React.Dispatch<React.SetStateAction<TData[]>>;
} {
  const useMock = isMockMode();
  const [mockData, setMockData] = useState<TData[]>(initialMockData);

  // Mock 데이터 필터링 함수
  const filterMockData = useCallback(
    (data: TData[], filterObj?: TFilter): TData[] => {
      if (!filterObj) return data;

      // 기본적인 필터링 로직 (search, status 등 공통 필드)
      return data.filter((item) => {
        const filterEntries = Object.entries(filterObj as Record<string, unknown>);
        return filterEntries.every(([key, value]) => {
          if (value === undefined || value === null || value === '') return true;

          const itemValue = (item as Record<string, unknown>)[key];

          // search 필드는 name, code 등에서 검색
          if (key === 'search' && typeof value === 'string') {
            const searchValue = value.toLowerCase();
            const searchableItem = item as Record<string, unknown>;
            return (
              (searchableItem.name && String(searchableItem.name).toLowerCase().includes(searchValue)) ||
              (searchableItem.code && String(searchableItem.code).toLowerCase().includes(searchValue)) ||
              (searchableItem.description && String(searchableItem.description).toLowerCase().includes(searchValue))
            );
          }

          // skip, take는 필터링에서 제외 (페이지네이션)
          if (key === 'skip' || key === 'take') return true;

          return itemValue === value;
        });
      });
    },
    []
  );

  // Mock 쿼리 함수
  const mockQueryFn = useCallback(async (): Promise<TData[]> => {
    await delay(mockDelay);
    return filterMockData(mockData, filter);
  }, [mockData, filter, mockDelay, filterMockData]);

  // API 쿼리 함수 래핑
  const apiQueryFn = useCallback(async (): Promise<TData[]> => {
    const result = await queryFn(filter);
    // PaginatedResponse 또는 배열 형태 모두 처리
    if (Array.isArray(result)) {
      return result;
    }
    return result.items;
  }, [queryFn, filter]);

  // React Query 훅
  const query = useQuery({
    queryKey,
    queryFn: useMock ? mockQueryFn : apiQueryFn,
    ...queryOptions,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isMockMode: useMock,
    refetch: query.refetch,
    mockData,
    setMockData,
  };
}

// ============================================================
// 단일 조회 훅: useMockOrApiSingle
// ============================================================

/**
 * Mock 데이터와 API를 전환하는 커스텀 훅 (단일 조회용)
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useMockOrApiSingle<Equipment>({
 *   mockData: mockEquipments,
 *   queryKey: ['equipment', id],
 *   queryFn: (id) => equipmentApi.getById(id),
 *   id: '1',
 * });
 * ```
 */
export function useMockOrApiSingle<TData extends BaseEntity>({
  mockData,
  queryKey,
  queryFn,
  id,
  queryOptions,
  mockDelay = 200,
}: UseMockOrApiSingleOptions<TData>): UseMockOrApiSingleReturn<TData> {
  const useMock = isMockMode();

  // Mock 쿼리 함수
  const mockQueryFn = useCallback(async (): Promise<TData | undefined> => {
    await delay(mockDelay);
    return mockData.find((item) => item.id === id);
  }, [mockData, id, mockDelay]);

  // React Query 훅
  const query = useQuery({
    queryKey,
    queryFn: useMock ? mockQueryFn : () => queryFn(id),
    enabled: !!id,
    ...queryOptions,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isMockMode: useMock,
    refetch: query.refetch,
  };
}

// ============================================================
// Mutation 훅: useMockOrApiMutation
// ============================================================

/**
 * Mock 데이터와 API CRUD를 전환하는 Mutation 훅
 *
 * @example
 * ```tsx
 * // Create
 * const createMutation = useMockOrApiMutation<Equipment>({
 *   type: 'create',
 *   mockData,
 *   setMockData,
 *   mutationFn: (data) => equipmentApi.create(data),
 *   invalidateKeys: [['equipments']],
 * });
 *
 * // Update
 * const updateMutation = useMockOrApiMutation<Equipment, { id: string; data: Partial<Equipment> }>({
 *   type: 'update',
 *   mockData,
 *   setMockData,
 *   mutationFn: ({ id, data }) => equipmentApi.update(id, data),
 *   invalidateKeys: [['equipments'], ['equipment', id]],
 * });
 *
 * // Delete
 * const deleteMutation = useMockOrApiMutation<Equipment, string>({
 *   type: 'delete',
 *   mockData,
 *   setMockData,
 *   mutationFn: (id) => equipmentApi.delete(id),
 *   invalidateKeys: [['equipments']],
 * });
 * ```
 */
export function useMockOrApiMutation<TData extends BaseEntity, TInput = Partial<TData>>({
  type,
  mockData,
  setMockData,
  mutationFn,
  invalidateKeys = [],
  mutationOptions,
  mockDelay = 300,
  generateId = generateDefaultId,
}: UseMockOrApiMutationOptions<TData, TInput>) {
  const useMock = isMockMode();
  const queryClient = useQueryClient();

  // Mock Create 함수
  const mockCreate = useCallback(
    async (input: TInput): Promise<TData> => {
      await delay(mockDelay);
      const newItem = {
        ...input,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as TData;
      setMockData((prev) => [...prev, newItem]);
      return newItem;
    },
    [mockDelay, generateId, setMockData]
  );

  // Mock Update 함수
  const mockUpdate = useCallback(
    async (input: TInput): Promise<TData> => {
      await delay(mockDelay);
      // input이 { id, data } 형태라고 가정
      const inputObj = input as { id: string; data: Partial<TData> };
      let updatedItem: TData | undefined;

      setMockData((prev) =>
        prev.map((item) => {
          if (item.id === inputObj.id) {
            updatedItem = {
              ...item,
              ...inputObj.data,
              updatedAt: new Date().toISOString(),
            };
            return updatedItem;
          }
          return item;
        })
      );

      if (!updatedItem) {
        throw new Error(`Item with id ${inputObj.id} not found`);
      }
      return updatedItem;
    },
    [mockDelay, setMockData]
  );

  // Mock Delete 함수
  const mockDelete = useCallback(
    async (input: TInput): Promise<void> => {
      await delay(mockDelay);
      // input이 id(string)라고 가정
      const id = input as string;
      setMockData((prev) => prev.filter((item) => item.id !== id));
    },
    [mockDelay, setMockData]
  );

  // Mutation 함수 선택
  const getMockMutationFn = useCallback(
    (mutationType: MutationType) => {
      switch (mutationType) {
        case 'create':
          return mockCreate;
        case 'update':
          return mockUpdate;
        case 'delete':
          return mockDelete;
        default:
          return mockCreate;
      }
    },
    [mockCreate, mockUpdate, mockDelete]
  );

  // React Query Mutation
  const mutation = useMutation({
    mutationFn: useMock ? getMockMutationFn(type) : mutationFn,
    onSuccess: () => {
      // 쿼리 무효화
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
    ...mutationOptions,
  });

  return {
    ...mutation,
    isMockMode: useMock,
  };
}

// ============================================================
// 통합 CRUD 훅: useMockOrApiCrud
// ============================================================

/** CRUD 훅 옵션 */
export interface UseMockOrApiCrudOptions<TData extends BaseEntity, TFilter = unknown> {
  /** 초기 Mock 데이터 */
  mockData: TData[];
  /** 쿼리 키 베이스 (예: 'equipments') */
  queryKeyBase: string;
  /** API 함수들 */
  api: {
    getAll: (filter?: TFilter) => Promise<TData[] | { items: TData[]; total: number }>;
    getById: (id: string) => Promise<TData>;
    create: (data: Partial<TData>) => Promise<TData>;
    update: (id: string, data: Partial<TData>) => Promise<TData>;
    delete: (id: string) => Promise<void>;
  };
  /** 필터 */
  filter?: TFilter;
  /** Mock 지연 시간 */
  mockDelay?: number;
}

/**
 * 통합 CRUD 훅 - 목록 조회, 생성, 수정, 삭제를 한 번에 제공
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   error,
 *   isMockMode,
 *   createMutation,
 *   updateMutation,
 *   deleteMutation,
 * } = useMockOrApiCrud<Equipment>({
 *   mockData: mockEquipments,
 *   queryKeyBase: 'equipments',
 *   api: equipmentApi,
 *   filter: { status: 'running' },
 * });
 * ```
 */
export function useMockOrApiCrud<TData extends BaseEntity, TFilter = unknown>({
  mockData: initialMockData,
  queryKeyBase,
  api,
  filter,
  mockDelay = 300,
}: UseMockOrApiCrudOptions<TData, TFilter>) {
  const useMock = isMockMode();
  const [mockData, setMockData] = useState<TData[]>(initialMockData);

  // 쿼리 키 생성
  const queryKeys = useMemo(
    () => ({
      all: [queryKeyBase] as const,
      lists: () => [...queryKeys.all, 'list'] as const,
      list: (f?: TFilter) => [...queryKeys.lists(), f] as const,
      details: () => [...queryKeys.all, 'detail'] as const,
      detail: (id: string) => [...queryKeys.details(), id] as const,
    }),
    [queryKeyBase]
  );

  // 목록 조회
  const listResult = useMockOrApi<TData, TFilter>({
    mockData,
    queryKey: queryKeys.list(filter),
    queryFn: api.getAll,
    filter,
    mockDelay,
  });

  // Create Mutation
  const createMutation = useMockOrApiMutation<TData, Partial<TData>>({
    type: 'create',
    mockData,
    setMockData,
    mutationFn: api.create,
    invalidateKeys: [queryKeys.lists()],
    mockDelay,
  });

  // Update Mutation
  const updateMutation = useMockOrApiMutation<TData, { id: string; data: Partial<TData> }>({
    type: 'update',
    mockData,
    setMockData,
    mutationFn: ({ id, data }) => api.update(id, data),
    invalidateKeys: [queryKeys.lists()],
    mockDelay,
  });

  // Delete Mutation
  const deleteMutation = useMockOrApiMutation<TData, string>({
    type: 'delete',
    mockData,
    setMockData,
    mutationFn: api.delete,
    invalidateKeys: [queryKeys.lists()],
    mockDelay,
  });

  // 단일 조회 함수 (ID로 조회)
  const getById = useCallback(
    (id: string) => {
      if (useMock) {
        return mockData.find((item) => item.id === id);
      }
      return undefined; // API 모드에서는 useMockOrApiSingle 훅을 별도로 사용
    },
    [useMock, mockData]
  );

  return {
    // 목록 조회 결과
    data: listResult.data,
    isLoading: listResult.isLoading,
    error: listResult.error,
    isMockMode: useMock,
    refetch: listResult.refetch,

    // Mock 데이터 직접 접근 (필요시)
    mockData,
    setMockData,

    // 단일 조회
    getById,

    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,

    // 쿼리 키 (외부에서 무효화 등에 사용)
    queryKeys,
  };
}

// ============================================================
// Export 기본 타입들
// ============================================================

export type {
  QueryKey,
} from '@tanstack/react-query';
