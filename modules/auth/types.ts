import z from 'zod'

import {
  confirmCodeSchema,
  confirmEmailSchema,
  registerSchema,
  resendCodeSchema,
  signInSchema
} from './schemas'

export type SignInFormData = z.infer<typeof signInSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ConfirmCodeFormData = z.infer<typeof confirmCodeSchema>
export type ConfirmEmailFormData = z.infer<typeof confirmEmailSchema>
export type ResendCodeFormData = z.infer<typeof resendCodeSchema>

export type UserRole = 'admin' | 'seller'

export interface User {
  id: string
  names: string
  lastNames: string
  email: string
  createdAt: string
  updatedAt: string
  roles: UserRole[]
}

export interface Session {
  user: User
  isAuthenticated: boolean
}
