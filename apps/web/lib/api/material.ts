/**
 * @file apps/web/lib/api/material.ts
 * @description 자재 관련 API
 */

import { apiClient, PaginatedResponse } from './client';

export interface Material {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId?: string;
  category?: MaterialCategory;
  unit: string;
  unitPrice?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  stocks?: MaterialStock[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialCategory {
  id: string;
  code: string;
  name: string;
  parentId?: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface MaterialStock {
  id: string;
  materialId: string;
  material?: Material;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
}

export interface MaterialTransaction {
  id: string;
  transactionNumber: string;
  materialId: string;
  material?: Material;
  type: 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN';
  fromWarehouseId?: string;
  fromWarehouse?: Warehouse;
  toWarehouseId?: string;
  toWarehouse?: Warehouse;
  quantity: number;
  unitPrice?: number;
  remarks?: string;
  transactionDate: string;
}

export interface MaterialFilter {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  skip?: number;
  take?: number;
}

export const materialApi = {
  // 자재 목록
  getAll: async (filter?: MaterialFilter): Promise<PaginatedResponse<Material>> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await apiClient.get<PaginatedResponse<Material>>(`/materials?${params}`);
    return response.data;
  },

  // 자재 상세
  getById: async (id: string): Promise<Material> => {
    const response = await apiClient.get<Material>(`/materials/${id}`);
    return response.data;
  },

  // 자재 생성
  create: async (data: Partial<Material>): Promise<Material> => {
    const response = await apiClient.post<Material>('/materials', data);
    return response.data;
  },

  // 자재 수정
  update: async (id: string, data: Partial<Material>): Promise<Material> => {
    const response = await apiClient.patch<Material>(`/materials/${id}`, data);
    return response.data;
  },

  // 자재 삭제
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/materials/${id}`);
  },

  // 재고 부족 자재
  getLowStock: async (): Promise<Material[]> => {
    const response = await apiClient.get<Material[]>('/materials/low-stock');
    return response.data;
  },

  // 카테고리 목록
  getCategories: async (): Promise<MaterialCategory[]> => {
    const response = await apiClient.get<MaterialCategory[]>('/materials/categories');
    return response.data;
  },
};

export const warehouseApi = {
  // 창고 목록
  getAll: async (): Promise<Warehouse[]> => {
    const response = await apiClient.get<Warehouse[]>('/warehouses');
    return response.data;
  },

  // 창고 상세
  getById: async (id: string): Promise<Warehouse> => {
    const response = await apiClient.get<Warehouse>(`/warehouses/${id}`);
    return response.data;
  },

  // 창고 생성
  create: async (data: Partial<Warehouse>): Promise<Warehouse> => {
    const response = await apiClient.post<Warehouse>('/warehouses', data);
    return response.data;
  },

  // 창고 재고 요약
  getSummary: async (id: string) => {
    const response = await apiClient.get(`/warehouses/${id}/summary`);
    return response.data;
  },
};

export const stockApi = {
  // 재고 목록
  getAll: async (filter?: { warehouseId?: string; materialId?: string; lowStock?: boolean }): Promise<MaterialStock[]> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await apiClient.get<MaterialStock[]>(`/stocks?${params}`);
    return response.data;
  },

  // 입고
  receipt: async (data: {
    materialId: string;
    warehouseId: string;
    quantity: number;
    unitPrice?: number;
    remarks?: string;
  }): Promise<MaterialStock> => {
    const response = await apiClient.post<MaterialStock>('/stocks/receipt', data);
    return response.data;
  },

  // 출고
  issue: async (data: {
    materialId: string;
    warehouseId: string;
    quantity: number;
    remarks?: string;
  }): Promise<MaterialStock> => {
    const response = await apiClient.post<MaterialStock>('/stocks/issue', data);
    return response.data;
  },

  // 이동
  transfer: async (data: {
    materialId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    remarks?: string;
  }): Promise<MaterialStock> => {
    const response = await apiClient.post<MaterialStock>('/stocks/transfer', data);
    return response.data;
  },

  // 조정
  adjust: async (data: {
    materialId: string;
    warehouseId: string;
    newQuantity: number;
    remarks: string;
  }): Promise<MaterialStock> => {
    const response = await apiClient.post<MaterialStock>('/stocks/adjust', data);
    return response.data;
  },

  // 트랜잭션 조회
  getTransactions: async (filter?: {
    materialId?: string;
    warehouseId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    skip?: number;
    take?: number;
  }): Promise<PaginatedResponse<MaterialTransaction>> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await apiClient.get<PaginatedResponse<MaterialTransaction>>(`/stocks/transactions?${params}`);
    return response.data;
  },
};
