import axios, { type InternalAxiosRequestConfig } from 'axios'

import { ROUTES } from '@/config/routes'
import { env } from '@/config/env'
import { useAuthStore } from '@/features/auth/stores/auth.store'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

export const axiosClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const resolveRefreshUrl = () => {
  if (env.VITE_AUTH_TOKEN_URL.includes('/token/')) {
    return env.VITE_AUTH_TOKEN_URL.replace('/token/', '/token/refresh/')
  }

  return env.VITE_AUTH_TOKEN_URL.endsWith('/')
    ? `${env.VITE_AUTH_TOKEN_URL}refresh/`
    : `${env.VITE_AUTH_TOKEN_URL}/refresh/`
}

const redirectToLogin = () => {
  if (window.location.pathname !== ROUTES.login) {
    window.location.href = ROUTES.login
  }
}

axiosClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().tokens?.access

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (error.response?.status !== 401 || env.VITE_USE_MOCK_AUTH) {
      return Promise.reject(error)
    }

    const { tokens, username, setAuthSession, clearAuthSession } = useAuthStore.getState()
    const refreshToken = tokens?.refresh

    if (!refreshToken) {
      clearAuthSession()
      redirectToLogin()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const refreshResponse = await axios.post<{ access: string; refresh?: string }>(
        resolveRefreshUrl(),
        { refresh: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      const nextAccess = refreshResponse.data.access

      if (!nextAccess) {
        throw new Error('Failed to refresh access token')
      }

      const nextTokens = {
        access: nextAccess,
        refresh: refreshResponse.data.refresh ?? refreshToken,
      }

      setAuthSession(username, nextTokens)
      originalRequest.headers.Authorization = `Bearer ${nextAccess}`

      return axiosClient(originalRequest)
    } catch (refreshError) {
      clearAuthSession()
      redirectToLogin()
      return Promise.reject(refreshError)
    }
  },
)
