import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/users'
import type { GetAllUsersParams, CreateUserRequest, UpdateUserRequest } from '../types/api'
import { message } from 'antd'

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  search: (searchTerm?: string) => [...userKeys.all, 'search', searchTerm] as const,
  list: (params?: GetAllUsersParams) => [...userKeys.all, 'list', params] as const,
}

// Search users
export function useSearchUsers(searchTerm?: string) {
  return useQuery({
    queryKey: userKeys.search(searchTerm),
    queryFn: () => usersApi.searchUsers(searchTerm),
    enabled: searchTerm !== undefined && searchTerm.length >= 2, // Only search if at least 2 characters
  })
}

// Get all users with pagination and filters
export function useGetAllUsers(params?: GetAllUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getAllUsers(params),
  })
}

// Create user
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateUserRequest) => usersApi.createUser(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      message.success('User created successfully')
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.errors?.[0] || 'Failed to create user'
      message.error(errorMsg)
    },
  })
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, ...request }: UpdateUserRequest) =>
      usersApi.updateUser(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      message.success('User updated successfully')
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.errors?.[0] || 'Failed to update user'
      message.error(errorMsg)
    },
  })
}

// Disable user
export function useDisableUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersApi.disableUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      message.success('User disabled successfully')
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.errors?.[0] || 'Failed to disable user'
      message.error(errorMsg)
    },
  })
}

// Enable user
export function useEnableUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersApi.enableUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      message.success('User enabled successfully')
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.errors?.[0] || 'Failed to enable user'
      message.error(errorMsg)
    },
  })
}
