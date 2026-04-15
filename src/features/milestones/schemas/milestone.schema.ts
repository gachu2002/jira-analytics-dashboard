import { z } from 'zod'

export const projectFormSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  description: z.string().trim(),
  pm: z.number().int().positive('Required'),
  pl: z.number().int().positive('Required'),
})

export const milestoneFormSchema = z
  .object({
    projectId: z.number().int().positive('Required'),
    name: z.string().trim().min(1, 'Required'),
    description: z.string().trim(),
    keys: z.string().trim(),
    labels: z.string().trim(),
    members: z.string().trim(),
    start_date: z.string().min(1, 'Required'),
    end_date: z.string().min(1, 'Required'),
  })
  .refine((value) => value.start_date <= value.end_date, {
    path: ['end_date'],
    message: 'End must be after start',
  })

export type ProjectFormValues = z.infer<typeof projectFormSchema>
export type MilestoneFormValues = z.infer<typeof milestoneFormSchema>
