import { z } from 'zod'

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Jira Analytics Dashboard'),
  VITE_API_BASE_URL: z.url().default('http://localhost:8080'),
  VITE_AUTH_TOKEN_URL: z.url().default('https://backendurl/api/token/'),
  VITE_USE_MOCK_AUTH: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
})

export const env = envSchema.parse(import.meta.env)
