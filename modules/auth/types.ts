import z from 'zod'

import { signInSchema } from './schemas'

export type SignInFormData = z.infer<typeof signInSchema>

export type UserRole = 'admin' | 'seller'

export interface User {
  id: string
  names: string
  lastNames: string
  email: string
  superTokensId: string
  createdAt: string
  updatedAt: string
  roles: UserRole[]
}

export interface Session {
  user: User
  isAuthenticated: boolean
}
