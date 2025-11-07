import { apiClient } from '../lib/api-client'
import type {
  User,
  Result,
  PaginatedList,
  GetAllUsersParams,
  CreateUserRequest,
  UpdateUserRequest
} from '../types/api'

export const usersApi = {
  searchUsers: async (searchTerm?: string): Promise<User[]> => {
    const params = searchTerm ? { searchTerm } : {}
    const response = await apiClient.get<Result<User[]>>('/users/search', { params })
    return response.data.data!
  },

  getAllUsers: async (params?: GetAllUsersParams): Promise<PaginatedList<User>> => {
    const response = await apiClient.get<Result<PaginatedList<User>>>('/users', { params })
    return response.data.data!
  },

  createUser: async (request: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<Result<User>>('/users', request)
    return response.data.data!
  },

  updateUser: async (userId: string, request: Omit<UpdateUserRequest, 'userId'>): Promise<User> => {
    const response = await apiClient.put<Result<User>>(`/users/${userId}`, request)
    return response.data.data!
  },

  disableUser: async (userId: string): Promise<void> => {
    await apiClient.post<Result>(`/users/${userId}/disable`)
  },

  enableUser: async (userId: string): Promise<void> => {
    await apiClient.post<Result>(`/users/${userId}/enable`)
  },
}
