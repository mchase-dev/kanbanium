import { apiClient } from '../lib/api-client'
import type { StatusDto, TaskTypeDto, Result } from '../types/api'

export const referenceDataApi = {
  getStatuses: async (): Promise<StatusDto[]> => {
    const response = await apiClient.get<Result<StatusDto[]>>('/referencedata/statuses')
    return response.data.data!
  },

  getTaskTypes: async (): Promise<TaskTypeDto[]> => {
    const response = await apiClient.get<Result<TaskTypeDto[]>>('/referencedata/task-types')
    return response.data.data!
  },
}
