import { z } from 'zod'

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const createEmployeeSchema = z.object({
  names: z.string().min(1, 'El nombre es requerido'),
  lastNames: z.string().min(1, 'Los apellidos son requeridos'),
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .regex(emailRegex, 'El correo electrónico no es válido'),
  role: z.enum(['SELLER', 'ADMIN'], 'El rol seleccionado no es válido')
})
