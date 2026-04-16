'use server'

import { cookies } from 'next/headers'

import { createEmployeeSchema } from '../schemas'
import type { CreateEmployeeFormData, CreateEmployeeResult } from '../types'

const API_BASE_URL = process.env.API_BASE_URL
const API_VERSION = process.env.API_VERSION

export async function createEmployee(
  data: CreateEmployeeFormData
): Promise<CreateEmployeeResult> {
  const parsed = createEmployeeSchema.safeParse(data)

  if (!parsed.success) {
    return {
      success: false,
      error: 'Por favor, verifica los datos ingresados.'
    }
  }

  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sAccessToken')?.value
  const antiCsrf = cookieStore.get('anti-csrf')?.value

  if (!accessToken) {
    return {
      success: false,
      error: 'No se encontró sesión activa. Por favor, inicia sesión.'
    }
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/${API_VERSION}/admin/employees`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `sAccessToken=${accessToken}`,
          ...(antiCsrf && { 'anti-csrf': antiCsrf })
        },
        body: JSON.stringify(parsed.data)
      }
    )

    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.message || 'No tienes permisos para realizar esta acción.'
      }
    }

    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || 'Datos inválidos. Verifica la información.'
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: 'Error del servidor. Por favor, intenta más tarde.'
      }
    }

    const responseData = await response.json()
    return { success: true, data: responseData }
  } catch {
    return {
      success: false,
      error: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
    }
  }
}
