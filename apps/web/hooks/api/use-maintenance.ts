/**
 * @file apps/web/hooks/api/use-maintenance.ts
 * @description 유지보수 관련 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  maintenanceRequestApi,
  maintenancePlanApi,
  maintenanceWorkApi,
  MaintenanceRequest,
  MaintenancePlan,
  MaintenanceWork,
  RequestFilter,
  PlanFilter,
  MaintenanceType,
  Priority,
  RequestStatus,
  PlanStatus,
  WorkStatus,
} from '@/lib/api/maintenance';

// Query Keys
export const requestKeys = {
  all: ['maintenance-requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (filter?: RequestFilter) => [...requestKeys.lists(), filter] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
  statistics: (startDate?: string, endDate?: string) =>
    [...requestKeys.all, 'statistics', startDate, endDate] as const,
};

export const planKeys = {
  all: ['maintenance-plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (filter?: PlanFilter) => [...planKeys.lists(), filter] as const,
  details: () => [...planKeys.all, 'detail'] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
  upcoming: (days?: number) => [...planKeys.all, 'upcoming', days] as const,
};

export const workKeys = {
  all: ['maintenance-works'] as const,
  lists: () => [...workKeys.all, 'list'] as const,
  list: (filter?: any) => [...workKeys.lists(), filter] as const,
  details: () => [...workKeys.all, 'detail'] as const,
  detail: (id: string) => [...workKeys.details(), id] as const,
  my: (status?: WorkStatus) => [...workKeys.all, 'my', status] as const,
};

// === 유지보수 요청 ===

export function useMaintenanceRequests(filter?: RequestFilter) {
  return useQuery({
    queryKey: requestKeys.list(filter),
    queryFn: () => maintenanceRequestApi.getAll(filter),
  });
}

export function useMaintenanceRequest(id: string) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => maintenanceRequestApi.getById(id),
    enabled: !!id,
  });
}

export function useMaintenanceRequestStatistics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: requestKeys.statistics(startDate, endDate),
    queryFn: () => maintenanceRequestApi.getStatistics(startDate, endDate),
  });
}

export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      equipmentId: string;
      type: MaintenanceType;
      priority?: Priority;
      title: string;
      description: string;
      desiredDate?: string;
    }) => maintenanceRequestApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestKeys.statistics() });
    },
  });
}

export function useUpdateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaintenanceRequest> }) =>
      maintenanceRequestApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
    },
  });
}

export function useUpdateMaintenanceRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      maintenanceRequestApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.statistics() });
    },
  });
}

export function useDeleteMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => maintenanceRequestApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestKeys.statistics() });
    },
  });
}

// === 유지보수 계획 ===

export function useMaintenancePlans(filter?: PlanFilter) {
  return useQuery({
    queryKey: planKeys.list(filter),
    queryFn: () => maintenancePlanApi.getAll(filter),
  });
}

export function useMaintenancePlan(id: string) {
  return useQuery({
    queryKey: planKeys.detail(id),
    queryFn: () => maintenancePlanApi.getById(id),
    enabled: !!id,
  });
}

export function useUpcomingMaintenancePlans(days?: number) {
  return useQuery({
    queryKey: planKeys.upcoming(days),
    queryFn: () => maintenancePlanApi.getUpcoming(days),
  });
}

export function useCreateMaintenancePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
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
    }) => maintenancePlanApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

export function useUpdateMaintenancePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaintenancePlan> }) =>
      maintenancePlanApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
    },
  });
}

export function useUpdateMaintenancePlanStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PlanStatus }) =>
      maintenancePlanApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

export function useDeleteMaintenancePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => maintenancePlanApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.upcoming() });
    },
  });
}

// === 유지보수 작업 ===

export function useMaintenanceWorks(filter?: { planId?: string; assignedToId?: string; status?: WorkStatus }) {
  return useQuery({
    queryKey: workKeys.list(filter),
    queryFn: () => maintenanceWorkApi.getAll(filter),
  });
}

export function useMaintenanceWork(id: string) {
  return useQuery({
    queryKey: workKeys.detail(id),
    queryFn: () => maintenanceWorkApi.getById(id),
    enabled: !!id,
  });
}

export function useMyMaintenanceWorks(status?: WorkStatus) {
  return useQuery({
    queryKey: workKeys.my(status),
    queryFn: () => maintenanceWorkApi.getMyWorks(status),
  });
}

export function useCreateMaintenanceWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { planId: string; assignedToId: string; description?: string }) =>
      maintenanceWorkApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
    },
  });
}

export function useStartMaintenanceWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => maintenanceWorkApi.start(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: workKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workKeys.my() });
    },
  });
}

export function usePauseMaintenanceWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => maintenanceWorkApi.pause(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: workKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workKeys.detail(id) });
    },
  });
}

export function useResumeMaintenanceWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => maintenanceWorkApi.resume(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: workKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workKeys.detail(id) });
    },
  });
}

export function useCompleteMaintenanceWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        workReport: string;
        actualHours?: number;
        usedMaterials?: { materialId: string; quantity: number }[];
      };
    }) => maintenanceWorkApi.complete(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: workKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workKeys.my() });
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

export function useCancelMaintenanceWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => maintenanceWorkApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: workKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workKeys.detail(id) });
    },
  });
}

export function useReassignMaintenanceWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedToId }: { id: string; assignedToId: string }) =>
      maintenanceWorkApi.reassign(id, assignedToId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: workKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workKeys.detail(id) });
    },
  });
}
