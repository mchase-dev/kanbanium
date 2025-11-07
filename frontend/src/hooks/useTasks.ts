import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tasksApi } from '../api/tasks'
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  AssignTaskRequest,
  SearchTasksRequest,
  GetMyTasksParams,
} from '../types/api'

// Query Keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: string) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  byBoard: (boardId: string) => [...taskKeys.all, 'board', boardId] as const,
  byColumn: (columnId: string) => [...taskKeys.all, 'column', columnId] as const,
  search: ['tasks', 'search'] as const,
  myTasks: (filters: string) => ['tasks', 'my-tasks', filters] as const,
}

// Fetch single task
export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id,
  })
}

// Fetch tasks by board
export function useTasksByBoard(boardId: string) {
  return useQuery({
    queryKey: taskKeys.byBoard(boardId),
    queryFn: () => tasksApi.getTasksByBoard(boardId),
    enabled: !!boardId,
  })
}

// Fetch tasks by column
export function useTasksByColumn(columnId: string) {
  return useQuery({
    queryKey: taskKeys.byColumn(columnId),
    queryFn: () => tasksApi.getTasksByColumn(columnId),
    enabled: !!columnId,
  })
}

// Search tasks
export function useSearchTasks(params: SearchTasksRequest) {
  return useQuery({
    queryKey: taskKeys.list(JSON.stringify(params)),
    queryFn: () => tasksApi.searchTasks(params),
    enabled: !!params.boardId,
  })
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.createTask(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byBoard(variables.boardId) })
      if (variables.columnId) {
        queryClient.invalidateQueries({ queryKey: taskKeys.byColumn(variables.columnId) })
      }
      toast.success('Task created successfully')
    },
  })
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      tasksApi.updateTask(id, data),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) })
      queryClient.invalidateQueries({ queryKey: taskKeys.byBoard(task.boardId) })
      if (task.columnId) {
        queryClient.invalidateQueries({ queryKey: taskKeys.byColumn(task.columnId) })
      }
      toast.success('Task updated successfully')
    },
  })
}

// Delete task
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('Task deleted successfully')
    },
  })
}

// Move task (drag and drop)
export function useMoveTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveTaskRequest }) =>
      tasksApi.moveTask(id, data),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.all })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(taskKeys.all)

      // Optimistically update the cache
      // This would need more sophisticated logic for proper optimistic updates
      // For now, we'll just rely on the server update

      return { previousTasks }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, context.previousTasks)
      }
    },
  })
}

// Archive task
export function useArchiveTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksApi.archiveTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('Task archived successfully')
    },
  })
}

// Unarchive task
export function useUnarchiveTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksApi.unarchiveTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('Task unarchived successfully')
    },
  })
}

// Assign task
export function useAssignTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignTaskRequest }) =>
      tasksApi.assignTask(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('Task assigned successfully')
    },
  })
}

// Get task history
export function useTaskHistory(taskId: string) {
  return useQuery({
    queryKey: [...taskKeys.detail(taskId), 'history'] as const,
    queryFn: () => tasksApi.getTaskHistory(taskId),
    enabled: !!taskId,
  })
}

// Get task watchers
export function useTaskWatchers(taskId: string) {
  return useQuery({
    queryKey: [...taskKeys.detail(taskId), 'watchers'] as const,
    queryFn: () => tasksApi.getWatchers(taskId),
    enabled: !!taskId,
  })
}

// Add watcher
export function useAddWatcher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.addWatcher(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      queryClient.invalidateQueries({ queryKey: [...taskKeys.detail(taskId), 'watchers'] })
      toast.success('You are now watching this task')
    },
  })
}

// Remove watcher
export function useRemoveWatcher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.removeWatcher(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      queryClient.invalidateQueries({ queryKey: [...taskKeys.detail(taskId), 'watchers'] })
      toast.success('You are no longer watching this task')
    },
  })
}

// Get my tasks
export function useMyTasks(params?: GetMyTasksParams) {
  return useQuery({
    queryKey: taskKeys.myTasks(JSON.stringify(params || {})),
    queryFn: () => tasksApi.getMyTasks(params),
  })
}
