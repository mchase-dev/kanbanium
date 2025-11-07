import { useQuery } from '@tanstack/react-query'
import { referenceDataApi } from '../api/reference-data'

// Query Keys
export const referenceDataKeys = {
  all: ['referenceData'] as const,
  statuses: () => [...referenceDataKeys.all, 'statuses'] as const,
  taskTypes: () => [...referenceDataKeys.all, 'taskTypes'] as const,
}

// Fetch statuses
export function useStatuses() {
  return useQuery({
    queryKey: referenceDataKeys.statuses(),
    queryFn: referenceDataApi.getStatuses,
    staleTime: 5 * 60 * 1000, // 5 minutes - reference data doesn't change often
  })
}

// Fetch task types
export function useTaskTypes() {
  return useQuery({
    queryKey: referenceDataKeys.taskTypes(),
    queryFn: referenceDataApi.getTaskTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes - reference data doesn't change often
  })
}
