import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { AppError, ErrorType } from './error-handler'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Check for network errors
    if (!error.response) {
      return Promise.reject(
        new AppError(
          'Network error. Please check your internet connection.',
          ErrorType.NETWORK,
          undefined,
          error
        )
      )
    }

    const status = error.response.status
    const responseData = error.response.data as any

    // Handle 401 Unauthorized - try to refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          return Promise.reject(
            new AppError(
              'Your session has expired. Please log in again.',
              ErrorType.AUTHENTICATION,
              401,
              error
            )
          )
        }

        // Try to refresh the token
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data.data

        // Update tokens
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(
          new AppError(
            'Your session has expired. Please log in again.',
            ErrorType.AUTHENTICATION,
            401,
            refreshError
          )
        )
      }
    }

    // Determine error type and create appropriate AppError
    let errorType: ErrorType
    let errorMessage: string

    if (status === 403) {
      errorType = ErrorType.AUTHORIZATION
      errorMessage = responseData?.message || "You don't have permission to perform this action."
    } else if (status === 404) {
      errorType = ErrorType.NOT_FOUND
      errorMessage = responseData?.message || 'The requested resource was not found.'
    } else if (status >= 400 && status < 500) {
      errorType = ErrorType.VALIDATION
      errorMessage = responseData?.message || responseData?.error || 'Invalid input. Please check your data.'
    } else if (status >= 500) {
      errorType = ErrorType.SERVER
      errorMessage = 'Server error. Please try again later.'
    } else {
      errorType = ErrorType.UNKNOWN
      errorMessage = responseData?.message || responseData?.error || 'An unexpected error occurred.'
    }

    return Promise.reject(new AppError(errorMessage, errorType, status, error))
  }
)

export default apiClient
