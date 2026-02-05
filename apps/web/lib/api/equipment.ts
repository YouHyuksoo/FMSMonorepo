/**
 * @file apps/web/lib/api/equipment.ts
 * @description 설비 관련 API
 */

import { apiClient, PaginatedResponse } from './client';

// 타입 정의
export interface Equipment {
  id: string;
  code: string;
  name: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  categoryId: string;
  category?: EquipmentCategory;
  organizationId: string;
  organization?: { id: string; name: string };
  locationId?: string;
  location?: Location;
  status: 'OPERATING' | 'IDLE' | 'MAINTENANCE' | 'BREAKDOWN' | 'DISPOSED';
  criticality: 'HIGH' | 'MEDIUM' | 'LOW';
  installDate?: string;
  warrantyEndDate?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  specifications?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentCategory {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  parent?: EquipmentCategory;
  children?: EquipmentCategory[];
}

export interface Location {
  id: string;
  code: string;
  name: string;
  building?: string;
  floor?: string;
  area?: string;
}

export interface EquipmentFilter {
  search?: string;
  categoryId?: string;
  organizationId?: string;
  locationId?: string;
  status?: string;
  criticality?: string;
  skip?: number;
  take?: number;
}

export interface EquipmentStatistics {
  total: number;
  byStatus: Record<string, number>;
  byCriticality: Record<string, number>;
}

export const equipmentApi = {
  // 설비 목록
  getAll: async (filter?: EquipmentFilter): Promise<PaginatedResponse<Equipment>> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await apiClient.get<PaginatedResponse<Equipment>>(`/equipments?${params}`);
    return response.data;
  },

  // 설비 상세
  getById: async (id: string): Promise<Equipment> => {
    const response = await apiClient.get<Equipment>(`/equipments/${id}`);
    return response.data;
  },

  // 설비 생성
  create: async (data: Partial<Equipment>): Promise<Equipment> => {
    const response = await apiClient.post<Equipment>('/equipments', data);
    return response.data;
  },

  // 설비 수정
  update: async (id: string, data: Partial<Equipment>): Promise<Equipment> => {
    const response = await apiClient.patch<Equipment>(`/equipments/${id}`, data);
    return response.data;
  },

  // 설비 삭제
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/equipments/${id}`);
  },

  // 통계
  getStatistics: async (organizationId?: string): Promise<EquipmentStatistics> => {
    const params = organizationId ? `?organizationId=${organizationId}` : '';
    const response = await apiClient.get<EquipmentStatistics>(`/equipments/statistics${params}`);
    return response.data;
  },

  // 카테고리 목록
  getCategories: async (): Promise<EquipmentCategory[]> => {
    const response = await apiClient.get<EquipmentCategory[]>('/equipment-categories');
    return response.data;
  },

  // 카테고리 트리
  getCategoryTree: async (): Promise<EquipmentCategory[]> => {
    const response = await apiClient.get<EquipmentCategory[]>('/equipment-categories/tree');
    return response.data;
  },

  // 카테고리 생성
  createCategory: async (data: { code: string; name: string; parentId?: string }): Promise<EquipmentCategory> => {
    const response = await apiClient.post<EquipmentCategory>('/equipment-categories', data);
    return response.data;
  },

  // 위치 목록
  getLocations: async (): Promise<Location[]> => {
    const response = await apiClient.get<Location[]>('/locations');
    return response.data;
  },

  // 위치 생성
  createLocation: async (data: Partial<Location>): Promise<Location> => {
    const response = await apiClient.post<Location>('/locations', data);
    return response.data;
  },
};
