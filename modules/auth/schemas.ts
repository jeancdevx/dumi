import { z } from 'zod'

import { emailRegex } from './constants'

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .regex(emailRegex, 'Ingresa un correo valido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres')
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(64, 'El nombre no puede superar los 64 caracteres'),
  lastName: z
    .string()
    .min(1, 'El apellido es obligatorio')
    .max(64, 'El apellido no puede superar los 64 caracteres'),
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .regex(emailRegex, 'Ingresa un correo valido')
    .max(64, 'El correo no puede superar los 64 caracteres'),
  password: z
    .string()
    .min(12, 'La contrasena debe tener al menos 12 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/,
      'La contrasena debe incluir mayusculas, minusculas, numeros y simbolos'
    )
})

export const confirmEmailSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .regex(emailRegex, 'Ingresa un correo valido'),
  code: z
    .string()
    .regex(/^\d{6}$/, 'El codigo debe tener exactamente 6 digitos')
})

export const confirmCodeSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, 'El codigo debe tener exactamente 6 digitos')
})

export const resendCodeSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .regex(emailRegex, 'Ingresa un correo valido')
})
