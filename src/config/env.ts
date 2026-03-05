import { z } from 'zod'

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Jira Analytics Dashboard'),
  VITE_API_BASE_URL: z.url().default('http://localhost:8080'),
})

export const env = envSchema.parse(import.meta.env)
