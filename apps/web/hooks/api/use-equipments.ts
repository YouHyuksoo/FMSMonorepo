/**
 * @file apps/web/hooks/api/use-equipments.ts
 * @description 설비 관련 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  equipmentApi,
  Equipment,
  EquipmentFilter,
  EquipmentCategory,
  Location,
} from '@/lib/api/equipment';

// Query Keys
export const equipmentKeys = {
  all: ['equipments'] as const,
  lists: () => [...equipmentKeys.all, 'list'] as const,
  list: (filter?: EquipmentFilter) => [...equipmentKeys.lists(), filter] as const,
  details: () => [...equipmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...equipmentKeys.details(), id] as const,
  statistics: (organizationId?: string) => [...equipmentKeys.all, 'statistics', organizationId] as const,
  categories: ['equipment-categories'] as const,
  categoryTree: ['equipment-categories', 'tree'] as const,
  locations: ['locations'] as const,
};

// 설비 목록 조회
export function useEquipments(filter?: EquipmentFilter) {
  return useQuery({
    queryKey: equipmentKeys.list(filter),
    queryFn: () => equipmentApi.getAll(filter),
  });
}

// 설비 상세 조회
export function useEquipment(id: string) {
  return useQuery({
    queryKey: equipmentKeys.detail(id),
    queryFn: () => equipmentApi.getById(id),
    enabled: !!id,
  });
}

// 설비 통계
export function useEquipmentStatistics(organizationId?: string) {
  return useQuery({
    queryKey: equipmentKeys.statistics(organizationId),
    queryFn: () => equipmentApi.getStatistics(organizationId),
  });
}

// 설비 생성
export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Equipment>) => equipmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.statistics() });
    },
  });
}

// 설비 수정
export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Equipment> }) =>
      equipmentApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.statistics() });
    },
  });
}

// 설비 삭제
export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => equipmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.statistics() });
    },
  });
}

// 카테고리 목록
export function useEquipmentCategories() {
  return useQuery({
    queryKey: equipmentKeys.categories,
    queryFn: () => equipmentApi.getCategories(),
  });
}

// 카테고리 트리
export function useEquipmentCategoryTree() {
  return useQuery({
    queryKey: equipmentKeys.categoryTree,
    queryFn: () => equipmentApi.getCategoryTree(),
  });
}

// 카테고리 생성
export function useCreateEquipmentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { code: string; name: string; parentId?: string }) =>
      equipmentApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.categories });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.categoryTree });
    },
  });
}

// 위치 목록
export function useLocations() {
  return useQuery({
    queryKey: equipmentKeys.locations,
    queryFn: () => equipmentApi.getLocations(),
  });
}

// 위치 생성
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Location>) => equipmentApi.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.locations });
    },
  });
}
