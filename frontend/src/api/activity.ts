import { apiClient } from '../lib/api-client'
import type { ActivityDto, GetActivityParams, Result } from '../types/api'

export const activityApi = {
  getActivity: async (params?: GetActivityParams): Promise<ActivityDto[]> => {
    const response = await apiClient.get<Result<ActivityDto[]>>('/activity', { params })
    return response.data.data!
  },
}
