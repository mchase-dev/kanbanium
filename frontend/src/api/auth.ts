import apiClient from '../lib/api-client'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Result,
  User,
  RefreshTokenRequest,
  UpdateProfileRequest,
} from '../types/api'

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<Result<AuthResponse>>('/auth/login', data)
    return response.data.data!
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<Result<AuthResponse>>('/auth/register', data)
    return response.data.data!
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<Result<User>>('/auth/me')
    return response.data.data!
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<Result<AuthResponse>>('/auth/refresh-token', data)
    return response.data.data!
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<Result<User>>('/auth/profile', data)
    return response.data.data!
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}
