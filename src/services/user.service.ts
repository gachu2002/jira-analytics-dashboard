import { http } from '@/services/http'

export const userService = {
  me: async () => http.get('/users/me'),
}
