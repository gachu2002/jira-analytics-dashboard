import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

import { env } from '@/config/env'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

type AuthRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  skipAuthRefresh?: boolean
}

let refreshPromise: Promise<string> | null = null

async function refreshAccessTokenWithStore() {
  const refreshToken = useAuthStore.getState().session?.refreshToken

  if (!refreshToken) {
    throw new Error('Missing refresh token')
  }

  if (!refreshPromise) {
    useAuthStore.getState().setRefreshingSession(true)

    refreshPromise = http
      .post<{ access: string }>(
        '/api/token/refresh/',
        { refresh: refreshToken },
        { skipAuthRefresh: true } as AuthRequestConfig,
      )
      .then((response) => {
        useAuthStore.getState().updateAccessToken(response.data.access)
        return response.data.access
      })
      .catch((error) => {
        useAuthStore.getState().clearSession()
        throw error
      })
      .finally(() => {
        useAuthStore.getState().setRefreshingSession(false)
        refreshPromise = null
      })
  }

  return refreshPromise
}

export function setupAuthInterceptors() {
  const requestInterceptor = http.interceptors.request.use((config) => {
    const accessToken = useAuthStore.getState().session?.accessToken

    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`)
    }

    return config
  })

  const responseInterceptor = http.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as AuthRequestConfig | undefined

      if (
        error.response?.status !== 401 ||
        !config ||
        config._retry ||
        config.skipAuthRefresh
      ) {
        return Promise.reject(error)
      }

      try {
        config._retry = true
        const accessToken = await refreshAccessTokenWithStore()
        config.headers.set('Authorization', `Bearer ${accessToken}`)
        return http(config)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    },
  )

  return () => {
    http.interceptors.request.eject(requestInterceptor)
    http.interceptors.response.eject(responseInterceptor)
  }
}
