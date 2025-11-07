import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { commentsApi } from '../api/comments'
import { taskKeys } from './useTasks'
import type { CreateCommentRequest, UpdateCommentRequest } from '../types/api'

// Query Keys
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  byTask: (taskId: string) => [...commentKeys.all, 'task', taskId] as const,
}

// Fetch comments by task
export function useCommentsByTask(taskId: string) {
  return useQuery({
    queryKey: commentKeys.byTask(taskId),
    queryFn: () => commentsApi.getCommentsByTask(taskId),
    enabled: !!taskId,
  })
}

// Create comment
export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentsApi.createComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byTask(variables.taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) })
      toast.success('Comment added')
    },
  })
}

// Update comment
export function useUpdateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; taskId: string; data: UpdateCommentRequest }) =>
      commentsApi.updateComment(id, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byTask(taskId) })
      toast.success('Comment updated')
    },
  })
}

// Delete comment
export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string }) =>
      commentsApi.deleteComment(id),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byTask(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      toast.success('Comment deleted')
    },
  })
}
