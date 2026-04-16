import { z } from 'zod'

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const createEmployeeSchema = z.object({
  names: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(64, 'El nombre no puede superar 64 caracteres'),
  lastNames: z
    .string()
    .min(1, 'Los apellidos son requeridos')
    .max(64, 'Los apellidos no pueden superar 64 caracteres'),
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .max(64, 'El correo no puede superar 64 caracteres')
    .regex(emailRegex, 'El correo electrónico no es válido'),
  role: z.enum(['SELLER', 'ADMIN'], 'El rol seleccionado no es válido')
})
