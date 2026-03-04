import { z } from 'zod'

export const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`)
