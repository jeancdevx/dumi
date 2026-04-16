import type { CreateEmployeeFormData } from './schemas'

export type { CreateEmployeeFormData }

export type CreatableRole = 'SELLER' | 'ADMIN'

export interface CreateEmployeeResult {
  success: boolean
  error?: string
  data?: unknown
}
