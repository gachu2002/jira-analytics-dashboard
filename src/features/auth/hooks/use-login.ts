import { useMutation } from '@tanstack/react-query'

import { loginWithPassword } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import type { LoginFormValues } from '@/features/auth/schemas/auth.schema'

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: loginWithPassword,
    onSuccess: (tokens, values: LoginFormValues) => {
      setSession({
        username: values.username,
        accessToken: tokens.access,
        refreshToken: tokens.refresh,
      })
    },
  })
}
