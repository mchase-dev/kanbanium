import { apiClient } from '../lib/api-client'
import type {
  SubTask,
  CreateSubTaskRequest,
  UpdateSubTaskRequest,
  Result,
} from '../types/api'

export const subtasksApi = {
  // Create subtask
  createSubTask: async (data: CreateSubTaskRequest): Promise<SubTask> => {
    const response = await apiClient.post<Result<SubTask>>('/subtasks', data)
    return response.data.data!
  },

  // Update subtask
  updateSubTask: async (id: string, data: UpdateSubTaskRequest): Promise<SubTask> => {
    const response = await apiClient.put<Result<SubTask>>(`/subtasks/${id}`, data)
    return response.data.data!
  },

  // Delete subtask
  deleteSubTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/subtasks/${id}`)
  },

  // Toggle subtask completion
  toggleSubTask: async (id: string): Promise<SubTask> => {
    const response = await apiClient.post<Result<SubTask>>(`/subtasks/${id}/toggle`)
    return response.data.data!
  },
}
