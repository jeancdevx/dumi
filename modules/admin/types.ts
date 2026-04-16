import type { CreateEmployeeFormData } from './schemas'

export type { CreateEmployeeFormData }

export type CreatableRole = 'SELLER' | 'ADMIN'

export interface CreateEmployeeResult {
  success: boolean
  error?: string
  data?: unknown
}

export interface EmployeeWithRoles {
  id: string
  sub: string
  email: string
  names: string
  lastNames: string
  tenantId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  roles: string[]
}

export interface ActionResult {
  success: boolean
  message?: string
  error?: string
}
