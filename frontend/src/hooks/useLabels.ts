import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { labelsApi } from '../api/labels'
import { taskKeys } from './useTasks'
import type { CreateLabelRequest } from '../types/api'

// Query Keys
export const labelKeys = {
  all: ['labels'] as const,
  lists: () => [...labelKeys.all, 'list'] as const,
  byBoard: (boardId: string) => [...labelKeys.all, 'board', boardId] as const,
}

// Fetch labels by board
export function useLabelsByBoard(boardId: string) {
  return useQuery({
    queryKey: labelKeys.byBoard(boardId),
    queryFn: () => labelsApi.getLabelsByBoard(boardId),
    enabled: !!boardId,
  })
}

// Create label
export function useCreateLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLabelRequest) => labelsApi.createLabel(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: labelKeys.byBoard(variables.boardId) })
      toast.success('Label created successfully')
    },
  })
}

// Update label
export function useUpdateLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; boardId: string; data: { name: string; color: string } }) =>
      labelsApi.updateLabel(id, data),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: labelKeys.byBoard(boardId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('Label updated successfully')
    },
  })
}

// Delete label
export function useDeleteLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; boardId: string }) =>
      labelsApi.deleteLabel(id),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: labelKeys.byBoard(boardId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('Label deleted successfully')
    },
  })
}

// Add label to task
export function useAddTaskLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
      labelsApi.addTaskLabel(taskId, labelId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('Label added to task')
    },
  })
}

// Remove label from task
export function useRemoveTaskLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
      labelsApi.removeTaskLabel(taskId, labelId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('Label removed from task')
    },
  })
}
