import { apiClient } from '../lib/api-client'
import type {
  TaskDto,
  TaskListDto,
  TaskHistoryDto,
  Watcher,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  AssignTaskRequest,
  SearchTasksRequest,
  MyTaskDto,
  GetMyTasksParams,
  Result,
} from '../types/api'

export const tasksApi = {
  // Task CRUD
  getTask: async (id: string): Promise<TaskDto> => {
    const response = await apiClient.get<Result<TaskDto>>(`/tasks/${id}`)
    return response.data.data!
  },

  getTasksByBoard: async (boardId: string): Promise<TaskListDto[]> => {
    const response = await apiClient.get<Result<TaskListDto[]>>(`/tasks/board/${boardId}`)
    return response.data.data!
  },

  getTasksByColumn: async (columnId: string): Promise<TaskListDto[]> => {
    const response = await apiClient.get<Result<TaskListDto[]>>(`/tasks/column/${columnId}`)
    return response.data.data!
  },

  searchTasks: async (params: SearchTasksRequest): Promise<TaskListDto[]> => {
    const { boardId, ...queryParams } = params
    const response = await apiClient.get<Result<TaskListDto[]>>(
      `/tasks/board/${boardId}/search`,
      { params: queryParams }
    )
    return response.data.data!
  },

  createTask: async (data: CreateTaskRequest): Promise<TaskDto> => {
    const response = await apiClient.post<Result<TaskDto>>('/tasks', data)
    return response.data.data!
  },

  updateTask: async (id: string, data: UpdateTaskRequest): Promise<TaskDto> => {
    const response = await apiClient.put<Result<TaskDto>>(`/tasks/${id}`, data)
    return response.data.data!
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`)
  },

  moveTask: async (id: string, data: MoveTaskRequest): Promise<void> => {
    await apiClient.post(`/tasks/${id}/move`, data)
  },

  archiveTask: async (id: string): Promise<void> => {
    await apiClient.post(`/tasks/${id}/archive`)
  },

  unarchiveTask: async (id: string): Promise<void> => {
    await apiClient.post(`/tasks/${id}/unarchive`)
  },

  assignTask: async (id: string, data: AssignTaskRequest): Promise<void> => {
    await apiClient.post(`/tasks/${id}/assign`, data)
  },

  getTaskHistory: async (id: string): Promise<TaskHistoryDto[]> => {
    const response = await apiClient.get<Result<TaskHistoryDto[]>>(`/tasks/${id}/history`)
    return response.data.data!
  },

  // Watchers
  getWatchers: async (id: string): Promise<Watcher[]> => {
    const response = await apiClient.get<Result<Watcher[]>>(`/tasks/${id}/watchers`)
    return response.data.data!
  },

  addWatcher: async (id: string): Promise<void> => {
    await apiClient.post(`/tasks/${id}/watch`)
  },

  removeWatcher: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}/watch`)
  },

  // My Tasks
  getMyTasks: async (params?: GetMyTasksParams): Promise<MyTaskDto[]> => {
    const response = await apiClient.get<Result<MyTaskDto[]>>('/tasks/my-tasks', { params })
    return response.data.data!
  },
}
