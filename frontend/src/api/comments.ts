import { apiClient } from '../lib/api-client'
import type {
  CommentDto,
  CreateCommentRequest,
  UpdateCommentRequest,
  Result,
} from '../types/api'

export const commentsApi = {
  // Get comments by task
  getCommentsByTask: async (taskId: string): Promise<CommentDto[]> => {
    const response = await apiClient.get<Result<CommentDto[]>>(`/comments/task/${taskId}`)
    return response.data.data!
  },

  // Create comment
  createComment: async (data: CreateCommentRequest): Promise<CommentDto> => {
    const response = await apiClient.post<Result<CommentDto>>('/comments', data)
    return response.data.data!
  },

  // Update comment
  updateComment: async (id: string, data: UpdateCommentRequest): Promise<CommentDto> => {
    const response = await apiClient.put<Result<CommentDto>>(`/comments/${id}`, data)
    return response.data.data!
  },

  // Delete comment
  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`/comments/${id}`)
  },
}
