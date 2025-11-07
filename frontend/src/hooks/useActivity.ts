import { useQuery } from '@tanstack/react-query'
import { activityApi } from '../api/activity'
import type { GetActivityParams } from '../types/api'

// Query Keys
export const activityKeys = {
  all: ['activity'] as const,
  list: (filters: string) => [...activityKeys.all, filters] as const,
}

// Get activity
export function useActivity(params?: GetActivityParams) {
  return useQuery({
    queryKey: activityKeys.list(JSON.stringify(params || {})),
    queryFn: () => activityApi.getActivity(params),
  })
}
