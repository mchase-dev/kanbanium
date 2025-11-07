import { apiClient } from '../lib/api-client'
import type {
  LabelDto,
  CreateLabelRequest,
  Result,
} from '../types/api'

export const labelsApi = {
  // Get all labels for a board
  getLabelsByBoard: async (boardId: string): Promise<LabelDto[]> => {
    const response = await apiClient.get<Result<LabelDto[]>>(`/labels/board/${boardId}`)
    return response.data.data!
  },

  // Create label
  createLabel: async (data: CreateLabelRequest): Promise<LabelDto> => {
    const response = await apiClient.post<Result<LabelDto>>('/labels', data)
    return response.data.data!
  },

  // Update label
  updateLabel: async (id: string, data: { name: string; color: string }): Promise<LabelDto> => {
    const response = await apiClient.put<Result<LabelDto>>(`/labels/${id}`, data)
    return response.data.data!
  },

  // Delete label
  deleteLabel: async (id: string): Promise<void> => {
    await apiClient.delete(`/labels/${id}`)
  },

  // Add label to task
  addTaskLabel: async (taskId: string, labelId: string): Promise<void> => {
    await apiClient.post(`/labels/tasks/${taskId}/labels/${labelId}`)
  },

  // Remove label from task
  removeTaskLabel: async (taskId: string, labelId: string): Promise<void> => {
    await apiClient.delete(`/labels/tasks/${taskId}/labels/${labelId}`)
  },
}
