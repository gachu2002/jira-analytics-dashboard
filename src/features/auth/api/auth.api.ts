import { useMutation } from '@tanstack/react-query'

import type { LoginPayload } from '@/features/auth/types/auth.types'
import { authService } from '@/services/auth.service'

export const useLoginMutation = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
  })
