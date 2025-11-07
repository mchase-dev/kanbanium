import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { subtasksApi } from '../api/subtasks'
import { taskKeys } from './useTasks'
import type { CreateSubTaskRequest, UpdateSubTaskRequest } from '../types/api'

// Create subtask
export function useCreateSubTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSubTaskRequest) => subtasksApi.createSubTask(data),
    onSuccess: (_, variables) => {
      // Invalidate the task detail to refresh subtasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) })
      // Also invalidate board tasks to update subtask counts
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('Subtask created successfully')
    },
  })
}

// Update subtask
export function useUpdateSubTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubTaskRequest }) =>
      subtasksApi.updateSubTask(id, data),
    onSuccess: (subtask) => {
      // Invalidate the task detail
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(subtask.taskId) })
      toast.success('Subtask updated successfully')
    },
  })
}

// Delete subtask
export function useDeleteSubTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string }) =>
      subtasksApi.deleteSubTask(id),
    onSuccess: (_, { taskId }) => {
      // Invalidate the task detail
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      // Also invalidate board tasks to update subtask counts
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('Subtask deleted successfully')
    },
  })
}

// Toggle subtask completion
export function useToggleSubTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => subtasksApi.toggleSubTask(id),
    onSuccess: (subtask) => {
      // Invalidate the task detail
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(subtask.taskId) })
      // Also invalidate board tasks to update completed subtask counts
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}
