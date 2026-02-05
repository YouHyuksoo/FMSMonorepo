/**
 * @file apps/web/hooks/api/use-materials.ts
 * @description 자재 관련 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  materialApi,
  warehouseApi,
  stockApi,
  Material,
  MaterialFilter,
  Warehouse,
} from '@/lib/api/material';

// Query Keys
export const materialKeys = {
  all: ['materials'] as const,
  lists: () => [...materialKeys.all, 'list'] as const,
  list: (filter?: MaterialFilter) => [...materialKeys.lists(), filter] as const,
  details: () => [...materialKeys.all, 'detail'] as const,
  detail: (id: string) => [...materialKeys.details(), id] as const,
  lowStock: () => [...materialKeys.all, 'low-stock'] as const,
  categories: () => [...materialKeys.all, 'categories'] as const,
};

export const warehouseKeys = {
  all: ['warehouses'] as const,
  detail: (id: string) => [...warehouseKeys.all, id] as const,
  summary: (id: string) => [...warehouseKeys.all, id, 'summary'] as const,
};

export const stockKeys = {
  all: ['stocks'] as const,
  list: (filter?: any) => [...stockKeys.all, 'list', filter] as const,
  transactions: (filter?: any) => [...stockKeys.all, 'transactions', filter] as const,
};

// 자재 목록
export function useMaterials(filter?: MaterialFilter) {
  return useQuery({
    queryKey: materialKeys.list(filter),
    queryFn: () => materialApi.getAll(filter),
  });
}

// 자재 상세
export function useMaterial(id: string) {
  return useQuery({
    queryKey: materialKeys.detail(id),
    queryFn: () => materialApi.getById(id),
    enabled: !!id,
  });
}

// 재고 부족 자재
export function useLowStockMaterials() {
  return useQuery({
    queryKey: materialKeys.lowStock(),
    queryFn: () => materialApi.getLowStock(),
  });
}

// 자재 카테고리
export function useMaterialCategories() {
  return useQuery({
    queryKey: materialKeys.categories(),
    queryFn: () => materialApi.getCategories(),
  });
}

// 자재 생성
export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Material>) => materialApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
    },
  });
}

// 자재 수정
export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Material> }) =>
      materialApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.detail(id) });
    },
  });
}

// 자재 삭제
export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => materialApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
    },
  });
}

// 창고 목록
export function useWarehouses() {
  return useQuery({
    queryKey: warehouseKeys.all,
    queryFn: () => warehouseApi.getAll(),
  });
}

// 창고 상세
export function useWarehouse(id: string) {
  return useQuery({
    queryKey: warehouseKeys.detail(id),
    queryFn: () => warehouseApi.getById(id),
    enabled: !!id,
  });
}

// 창고 재고 요약
export function useWarehouseSummary(id: string) {
  return useQuery({
    queryKey: warehouseKeys.summary(id),
    queryFn: () => warehouseApi.getSummary(id),
    enabled: !!id,
  });
}

// 창고 생성
export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Warehouse>) => warehouseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.all });
    },
  });
}

// 재고 목록
export function useStocks(filter?: { warehouseId?: string; materialId?: string; lowStock?: boolean }) {
  return useQuery({
    queryKey: stockKeys.list(filter),
    queryFn: () => stockApi.getAll(filter),
  });
}

// 재고 트랜잭션
export function useStockTransactions(filter?: any) {
  return useQuery({
    queryKey: stockKeys.transactions(filter),
    queryFn: () => stockApi.getTransactions(filter),
  });
}

// 입고
export function useStockReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      materialId: string;
      warehouseId: string;
      quantity: number;
      unitPrice?: number;
      remarks?: string;
    }) => stockApi.receipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      queryClient.invalidateQueries({ queryKey: materialKeys.all });
    },
  });
}

// 출고
export function useStockIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      materialId: string;
      warehouseId: string;
      quantity: number;
      remarks?: string;
    }) => stockApi.issue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      queryClient.invalidateQueries({ queryKey: materialKeys.all });
    },
  });
}

// 이동
export function useStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      materialId: string;
      fromWarehouseId: string;
      toWarehouseId: string;
      quantity: number;
      remarks?: string;
    }) => stockApi.transfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
    },
  });
}

// 조정
export function useStockAdjust() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      materialId: string;
      warehouseId: string;
      newQuantity: number;
      remarks: string;
    }) => stockApi.adjust(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      queryClient.invalidateQueries({ queryKey: materialKeys.all });
    },
  });
}
