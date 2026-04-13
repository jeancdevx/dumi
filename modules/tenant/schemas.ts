import z from 'zod'

export const createTenantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre de la empresa es obligatorio.')
    .max(100, 'El nombre no puede superar los 100 caracteres.'),
  ruc: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(value => !value || /^(10|20)\d{9}$/.test(value), {
      message: 'El RUC debe iniciar con 10 o 20 y tener 11 dígitos.'
    }),
  address: z
    .string()
    .trim()
    .max(256, 'La dirección no puede superar los 256 caracteres.')
    .optional()
    .or(z.literal(''))
})

export type CreateTenantFormData = z.infer<typeof createTenantSchema>
