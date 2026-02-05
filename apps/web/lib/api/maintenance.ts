/**
 * @file apps/web/lib/api/maintenance.ts
 * @description 유지보수 관련 API
 */

import { apiClient, PaginatedResponse } from './client';
import { Equipment } from './equipment';

export type MaintenanceType = 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE' | 'IMPROVEMENT';
export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
export type PlanStatus = 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WorkStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface MaintenanceRequest {
  id: string;
  requestNumber: string;
  equipmentId: string;
  equipment?: Equipment;
  requesterId: string;
  requester?: { id: string; name: string; email: string };
  type: MaintenanceType;
  priority: Priority;
  status: RequestStatus;
  title: string;
  description: string;
  requestedDate: string;
  desiredDate?: string;
  plans?: MaintenancePlan[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenancePlan {
  id: string;
  planNumber: string;
  requestId?: string;
  request?: MaintenanceRequest;
  equipmentId: string;
  equipment?: Equipment;
  type: MaintenanceType;
  status: PlanStatus;
  title: string;
  description?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  estimatedHours?: number;
  estimatedCost?: number;
  works?: MaintenanceWork[];
  materials?: { materialId: string; material?: any; quantity: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceWork {
  id: string;
  workNumber: string;
  planId: string;
  plan?: MaintenancePlan;
  assignedToId: string;
  assignedTo?: { id: string; name: string; email: string };
  status: WorkStatus;
  description?: string;
  startedAt?: string;
  completedAt?: string;
  actualHours?: number;
  workReport?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestFilter {
  search?: string;
  equipmentId?: string;
  status?: RequestStatus;
  type?: MaintenanceType;
  priority?: Priority;
  requesterId?: string;
  startDate?: string;
  endDate?: string;
  skip?: number;
  take?: number;
}

export interface PlanFilter {
  search?: string;
  equipmentId?: string;
  requestId?: string;
  status?: PlanStatus;
  type?: MaintenanceType;
  startDate?: string;
  endDate?: string;
  skip?: number;
  take?: number;
}

export const maintenanceRequestApi = {
  getAll: async (filter?: RequestFilter): Promise<PaginatedResponse<MaintenanceRequest>> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await apiClient.get<PaginatedResponse<MaintenanceRequest>>(`/maintenance-requests?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<MaintenanceRequest> => {
    const response = await apiClient.get<MaintenanceRequest>(`/maintenance-requests/${id}`);
    return response.data;
  },

  create: async (data: {
    equipmentId: string;
    type: MaintenanceType;
    priority?: Priority;
    title: string;
    description: string;
    desiredDate?: string;
  }): Promise<MaintenanceRequest> => {
    const response = await apiClient.post<MaintenanceRequest>('/maintenance-requests', data);
    return response.data;
  },

  update: async (id: string, data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> => {
    const response = await apiClient.patch<MaintenanceRequest>(`/maintenance-requests/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: RequestStatus): Promise<MaintenanceRequest> => {
    const response = await apiClient.patch<MaintenanceRequest>(`/maintenance-requests/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/maintenance-requests/${id}`);
  },

  getStatistics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(`/maintenance-requests/statistics?${params}`);
    return response.data;
  },
};

export const maintenancePlanApi = {
  getAll: async (filter?: PlanFilter): Promise<PaginatedResponse<MaintenancePlan>> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await apiClient.get<PaginatedResponse<MaintenancePlan>>(`/maintenance-plans?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<MaintenancePlan> => {
    const response = await apiClient.get<MaintenancePlan>(`/maintenance-plans/${id}`);
    return response.data;
  },

  create: async (data: {
    requestId?: string;
    equipmentId: string;
    type: MaintenanceType;
    title: string;
    description?: string;
    plannedStartDate: string;
    plannedEndDate: string;
    estimatedHours?: number;
    estimatedCost?: number;
    materials?: { materialId: string; quantity: number }[];
  }): Promise<MaintenancePlan> => {
    const response = await apiClient.post<MaintenancePlan>('/maintenance-plans', data);
    return response.data;
  },

  update: async (id: string, data: Partial<MaintenancePlan>): Promise<MaintenancePlan> => {
    const response = await apiClient.patch<MaintenancePlan>(`/maintenance-plans/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: PlanStatus): Promise<MaintenancePlan> => {
    const response = await apiClient.patch<MaintenancePlan>(`/maintenance-plans/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/maintenance-plans/${id}`);
  },

  getUpcoming: async (days?: number): Promise<MaintenancePlan[]> => {
    const params = days ? `?days=${days}` : '';
    const response = await apiClient.get<MaintenancePlan[]>(`/maintenance-plans/upcoming${params}`);
    return response.data;
  },
};

export const maintenanceWorkApi = {
  getAll: async (filter?: { planId?: string; assignedToId?: string; status?: WorkStatus; skip?: number; take?: number }): Promise<PaginatedResponse<MaintenanceWork>> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await apiClient.get<PaginatedResponse<MaintenanceWork>>(`/maintenance-works?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<MaintenanceWork> => {
    const response = await apiClient.get<MaintenanceWork>(`/maintenance-works/${id}`);
    return response.data;
  },

  getMyWorks: async (status?: WorkStatus): Promise<MaintenanceWork[]> => {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get<MaintenanceWork[]>(`/maintenance-works/my${params}`);
    return response.data;
  },

  create: async (data: { planId: string; assignedToId: string; description?: string }): Promise<MaintenanceWork> => {
    const response = await apiClient.post<MaintenanceWork>('/maintenance-works', data);
    return response.data;
  },

  start: async (id: string): Promise<MaintenanceWork> => {
    const response = await apiClient.patch<MaintenanceWork>(`/maintenance-works/${id}/start`);
    return response.data;
  },

  pause: async (id: string): Promise<MaintenanceWork> => {
    const response = await apiClient.patch<MaintenanceWork>(`/maintenance-works/${id}/pause`);
    return response.data;
  },

  resume: async (id: string): Promise<MaintenanceWork> => {
    const response = await apiClient.patch<MaintenanceWork>(`/maintenance-works/${id}/resume`);
    return response.data;
  },

  complete: async (id: string, data: {
    workReport: string;
    actualHours?: number;
    usedMaterials?: { materialId: string; quantity: number }[];
  }): Promise<MaintenanceWork> => {
    const response = await apiClient.patch<MaintenanceWork>(`/maintenance-works/${id}/complete`, data);
    return response.data;
  },

  cancel: async (id: string): Promise<MaintenanceWork> => {
    const response = await apiClient.patch<MaintenanceWork>(`/maintenance-works/${id}/cancel`);
    return response.data;
  },

  reassign: async (id: string, assignedToId: string): Promise<MaintenanceWork> => {
    const response = await apiClient.patch<MaintenanceWork>(`/maintenance-works/${id}/reassign`, { assignedToId });
    return response.data;
  },
};
