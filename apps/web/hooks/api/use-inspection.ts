/**
 * @file apps/web/hooks/api/use-inspection.ts
 * @description 점검 관련 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  inspectionMasterApi,
  inspectionScheduleApi,
  inspectionResultApi,
  InspectionMaster,
  InspectionSchedule,
  InspectionResult,
  MasterFilter,
  ScheduleFilter,
  InspectionType,
  InspectionFrequency,
  InspectionScheduleStatus,
  InspectionResultStatus,
  InspectionItem,
} from '@/lib/api/inspection';

// Query Keys
export const masterKeys = {
  all: ['inspection-masters'] as const,
  lists: () => [...masterKeys.all, 'list'] as const,
  list: (filter?: MasterFilter) => [...masterKeys.lists(), filter] as const,
  details: () => [...masterKeys.all, 'detail'] as const,
  detail: (id: string) => [...masterKeys.details(), id] as const,
};

export const scheduleKeys = {
  all: ['inspection-schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (filter?: ScheduleFilter) => [...scheduleKeys.lists(), filter] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  overdue: () => [...scheduleKeys.all, 'overdue'] as const,
  upcoming: (days?: number) => [...scheduleKeys.all, 'upcoming', days] as const,
};

export const resultKeys = {
  all: ['inspection-results'] as const,
  lists: () => [...resultKeys.all, 'list'] as const,
  list: (filter?: any) => [...resultKeys.lists(), filter] as const,
  details: () => [...resultKeys.all, 'detail'] as const,
  detail: (id: string) => [...resultKeys.details(), id] as const,
  statistics: (equipmentId?: string, startDate?: string, endDate?: string) =>
    [...resultKeys.all, 'statistics', equipmentId, startDate, endDate] as const,
};

// === 점검 마스터 ===

export function useInspectionMasters(filter?: MasterFilter) {
  return useQuery({
    queryKey: masterKeys.list(filter),
    queryFn: () => inspectionMasterApi.getAll(filter),
  });
}

export function useInspectionMaster(id: string) {
  return useQuery({
    queryKey: masterKeys.detail(id),
    queryFn: () => inspectionMasterApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateInspectionMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      code: string;
      name: string;
      description?: string;
      type: InspectionType;
      frequency: InspectionFrequency;
      items?: Omit<InspectionItem, 'id' | 'masterId'>[];
    }) => inspectionMasterApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.lists() });
    },
  });
}

export function useUpdateInspectionMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InspectionMaster> }) =>
      inspectionMasterApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: masterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: masterKeys.detail(id) });
    },
  });
}

export function useDeleteInspectionMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inspectionMasterApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.lists() });
    },
  });
}

// === 점검 일정 ===

export function useInspectionSchedules(filter?: ScheduleFilter) {
  return useQuery({
    queryKey: scheduleKeys.list(filter),
    queryFn: () => inspectionScheduleApi.getAll(filter),
  });
}

export function useInspectionSchedule(id: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(id),
    queryFn: () => inspectionScheduleApi.getById(id),
    enabled: !!id,
  });
}

export function useOverdueInspectionSchedules() {
  return useQuery({
    queryKey: scheduleKeys.overdue(),
    queryFn: () => inspectionScheduleApi.getOverdue(),
  });
}

export function useUpcomingInspectionSchedules(days?: number) {
  return useQuery({
    queryKey: scheduleKeys.upcoming(days),
    queryFn: () => inspectionScheduleApi.getUpcoming(days),
  });
}

export function useCreateInspectionSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      masterId: string;
      equipmentId: string;
      scheduledDate: string;
      dueDate: string;
    }) => inspectionScheduleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.upcoming() });
    },
  });
}

export function useCreateBulkInspectionSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      masterId: string;
      equipmentIds: string[];
      scheduledDate: string;
      dueDate: string;
    }) => inspectionScheduleApi.createBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.upcoming() });
    },
  });
}

export function useUpdateInspectionSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InspectionSchedule> }) =>
      inspectionScheduleApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) });
    },
  });
}

export function useDeleteInspectionSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inspectionScheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
    },
  });
}

// === 점검 결과 ===

export function useInspectionResults(filter?: any) {
  return useQuery({
    queryKey: resultKeys.list(filter),
    queryFn: () => inspectionResultApi.getAll(filter),
  });
}

export function useInspectionResult(id: string) {
  return useQuery({
    queryKey: resultKeys.detail(id),
    queryFn: () => inspectionResultApi.getById(id),
    enabled: !!id,
  });
}

export function useInspectionResultStatistics(
  equipmentId?: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: resultKeys.statistics(equipmentId, startDate, endDate),
    queryFn: () => inspectionResultApi.getStatistics(equipmentId, startDate, endDate),
  });
}

export function useStartInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => inspectionResultApi.start(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: resultKeys.lists() });
    },
  });
}

export function useSaveInspectionItemResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resultId,
      itemResults,
    }: {
      resultId: string;
      itemResults: {
        itemId: string;
        value?: string;
        numericValue?: number;
        status: InspectionResultStatus;
        remarks?: string;
        photoPath?: string;
      }[];
    }) => inspectionResultApi.saveItemResults(resultId, itemResults),
    onSuccess: (_, { resultId }) => {
      queryClient.invalidateQueries({ queryKey: resultKeys.detail(resultId) });
    },
  });
}

export function useCompleteInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resultId,
      data,
    }: {
      resultId: string;
      data: {
        remarks?: string;
        itemResults: {
          itemId: string;
          value?: string;
          numericValue?: number;
          status: InspectionResultStatus;
          remarks?: string;
          photoPath?: string;
        }[];
      };
    }) => inspectionResultApi.complete(resultId, data),
    onSuccess: (_, { resultId }) => {
      queryClient.invalidateQueries({ queryKey: resultKeys.lists() });
      queryClient.invalidateQueries({ queryKey: resultKeys.detail(resultId) });
      queryClient.invalidateQueries({ queryKey: resultKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
    },
  });
}
