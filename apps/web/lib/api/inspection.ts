/**
 * @file apps/web/lib/api/inspection.ts
 * @description 점검 관련 API
 */

import { apiClient, PaginatedResponse } from './client';
import { Equipment } from './equipment';

export type InspectionType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'SPECIAL';
export type InspectionFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY';
export type InspectionInputType = 'OK_NG' | 'NUMERIC' | 'SELECT' | 'TEXT' | 'PHOTO';
export type InspectionScheduleStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
export type InspectionResultStatus = 'PASS' | 'FAIL' | 'CONDITIONAL';

export interface InspectionMaster {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: InspectionType;
  frequency: InspectionFrequency;
  items: InspectionItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionItem {
  id: string;
  masterId: string;
  sequence: number;
  name: string;
  description?: string;
  method?: string;
  standard?: string;
  inputType: InspectionInputType;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  options?: any;
  isRequired: boolean;
}

export interface InspectionSchedule {
  id: string;
  masterId: string;
  master?: InspectionMaster;
  equipmentId: string;
  equipment?: Equipment;
  scheduledDate: string;
  dueDate: string;
  status: InspectionScheduleStatus;
  results?: InspectionResult[];
  createdAt: string;
  updatedAt: string;
}

export interface InspectionResult {
  id: string;
  scheduleId: string;
  schedule?: InspectionSchedule;
  inspectorId: string;
  inspector?: { id: string; name: string };
  status: InspectionResultStatus;
  startedAt: string;
  completedAt?: string;
  remarks?: string;
  itemResults: InspectionItemResult[];
  createdAt: string;
  updatedAt: string;
}

export interface InspectionItemResult {
  id: string;
  resultId: string;
  itemId: string;
  item?: InspectionItem;
  value?: string;
  numericValue?: number;
  status: InspectionResultStatus;
  remarks?: string;
  photoPath?: string;
}

export interface MasterFilter {
  search?: string;
  type?: InspectionType;
  isActive?: boolean;
  skip?: number;
  take?: number;
}

export interface ScheduleFilter {
  masterId?: string;
  equipmentId?: string;
  status?: InspectionScheduleStatus;
  startDate?: string;
  endDate?: string;
  skip?: number;
  take?: number;
}

export const inspectionMasterApi = {
  getAll: async (filter?: MasterFilter): Promise<PaginatedResponse<InspectionMaster>> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await apiClient.get<PaginatedResponse<InspectionMaster>>(`/inspection-masters?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<InspectionMaster> => {
    const response = await apiClient.get<InspectionMaster>(`/inspection-masters/${id}`);
    return response.data;
  },

  create: async (data: {
    code: string;
    name: string;
    description?: string;
    type: InspectionType;
    frequency: InspectionFrequency;
    items?: Omit<InspectionItem, 'id' | 'masterId'>[];
  }): Promise<InspectionMaster> => {
    const response = await apiClient.post<InspectionMaster>('/inspection-masters', data);
    return response.data;
  },

  update: async (id: string, data: Partial<InspectionMaster>): Promise<InspectionMaster> => {
    const response = await apiClient.patch<InspectionMaster>(`/inspection-masters/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/inspection-masters/${id}`);
  },

  addItem: async (masterId: string, item: Omit<InspectionItem, 'id' | 'masterId'>): Promise<InspectionItem> => {
    const response = await apiClient.post<InspectionItem>(`/inspection-masters/${masterId}/items`, item);
    return response.data;
  },

  updateItem: async (itemId: string, data: Partial<InspectionItem>): Promise<InspectionItem> => {
    const response = await apiClient.patch<InspectionItem>(`/inspection-masters/items/${itemId}`, data);
    return response.data;
  },

  deleteItem: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/inspection-masters/items/${itemId}`);
  },
};

export const inspectionScheduleApi = {
  getAll: async (filter?: ScheduleFilter): Promise<PaginatedResponse<InspectionSchedule>> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await apiClient.get<PaginatedResponse<InspectionSchedule>>(`/inspection-schedules?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<InspectionSchedule> => {
    const response = await apiClient.get<InspectionSchedule>(`/inspection-schedules/${id}`);
    return response.data;
  },

  create: async (data: {
    masterId: string;
    equipmentId: string;
    scheduledDate: string;
    dueDate: string;
  }): Promise<InspectionSchedule> => {
    const response = await apiClient.post<InspectionSchedule>('/inspection-schedules', data);
    return response.data;
  },

  createBulk: async (data: {
    masterId: string;
    equipmentIds: string[];
    scheduledDate: string;
    dueDate: string;
  }): Promise<{ count: number }> => {
    const response = await apiClient.post<{ count: number }>('/inspection-schedules/bulk', data);
    return response.data;
  },

  update: async (id: string, data: Partial<InspectionSchedule>): Promise<InspectionSchedule> => {
    const response = await apiClient.patch<InspectionSchedule>(`/inspection-schedules/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/inspection-schedules/${id}`);
  },

  getOverdue: async (): Promise<InspectionSchedule[]> => {
    const response = await apiClient.get<InspectionSchedule[]>('/inspection-schedules/overdue');
    return response.data;
  },

  getUpcoming: async (days?: number): Promise<InspectionSchedule[]> => {
    const params = days ? `?days=${days}` : '';
    const response = await apiClient.get<InspectionSchedule[]>(`/inspection-schedules/upcoming${params}`);
    return response.data;
  },
};

export const inspectionResultApi = {
  getAll: async (filter?: {
    scheduleId?: string;
    inspectorId?: string;
    status?: InspectionResultStatus;
    startDate?: string;
    endDate?: string;
    skip?: number;
    take?: number;
  }): Promise<PaginatedResponse<InspectionResult>> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await apiClient.get<PaginatedResponse<InspectionResult>>(`/inspection-results?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<InspectionResult> => {
    const response = await apiClient.get<InspectionResult>(`/inspection-results/${id}`);
    return response.data;
  },

  start: async (scheduleId: string): Promise<InspectionResult> => {
    const response = await apiClient.post<InspectionResult>(`/inspection-results/start/${scheduleId}`);
    return response.data;
  },

  saveItemResults: async (resultId: string, itemResults: {
    itemId: string;
    value?: string;
    numericValue?: number;
    status: InspectionResultStatus;
    remarks?: string;
    photoPath?: string;
  }[]): Promise<InspectionResult> => {
    const response = await apiClient.patch<InspectionResult>(`/inspection-results/${resultId}/items`, { itemResults });
    return response.data;
  },

  complete: async (resultId: string, data: {
    remarks?: string;
    itemResults: {
      itemId: string;
      value?: string;
      numericValue?: number;
      status: InspectionResultStatus;
      remarks?: string;
      photoPath?: string;
    }[];
  }): Promise<InspectionResult> => {
    const response = await apiClient.patch<InspectionResult>(`/inspection-results/${resultId}/complete`, data);
    return response.data;
  },

  getStatistics: async (equipmentId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (equipmentId) params.append('equipmentId', equipmentId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(`/inspection-results/statistics?${params}`);
    return response.data;
  },
};
