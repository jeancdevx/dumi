import { z } from 'zod'

import { emailRegex } from './constants'

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})
