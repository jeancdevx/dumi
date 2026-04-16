'use server'

import { cookies } from 'next/headers'

import { createEmployeeSchema } from '../schemas'
import type {
  ActionResult,
  CreateEmployeeFormData,
  CreateEmployeeResult,
  EmployeeWithRoles
} from '../types'

const API_BASE_URL = process.env.API_BASE_URL
const API_VERSION = process.env.API_VERSION

async function getAuthHeaders() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sAccessToken')?.value
  const antiCsrf = cookieStore.get('anti-csrf')?.value

  return {
    accessToken,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `sAccessToken=${accessToken}`,
      ...(antiCsrf && { 'anti-csrf': antiCsrf })
    }
  }
}

export async function getEmployees(): Promise<EmployeeWithRoles[]> {
  const { accessToken, headers } = await getAuthHeaders()

  if (!accessToken) return []

  try {
    const response = await fetch(
      `${API_BASE_URL}/${API_VERSION}/admin/employees`,
      { method: 'GET', headers }
    )

    if (!response.ok) return []

    return await response.json()
  } catch {
    return []
  }
}

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

  const { accessToken, headers } = await getAuthHeaders()

  if (!accessToken) {
    return {
      success: false,
      error: 'No se encontró sesión activa. Por favor, inicia sesión.'
    }
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/${API_VERSION}/admin/employees`,
      { method: 'POST', headers, body: JSON.stringify(parsed.data) }
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

export async function promoteEmployee(
  email: string,
  role: 'SELLER' | 'ADMIN'
): Promise<ActionResult> {
  const { accessToken, headers } = await getAuthHeaders()

  if (!accessToken) {
    return {
      success: false,
      error: 'No se encontró sesión activa. Por favor, inicia sesión.'
    }
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/${API_VERSION}/admin/employees/promote`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ email, role })
      }
    )

    const data = await response.json().catch(() => ({}))

    if (response.status === 403) {
      return {
        success: false,
        error: data.message || 'No tienes permisos para realizar esta acción.'
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          data.message || 'Error del servidor. Por favor, intenta más tarde.'
      }
    }

    return { success: true, message: data.message }
  } catch {
    return {
      success: false,
      error: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
    }
  }
}

export async function revokeEmployee(
  email: string,
  role: 'SELLER' | 'ADMIN'
): Promise<ActionResult> {
  const { accessToken, headers } = await getAuthHeaders()

  if (!accessToken) {
    return {
      success: false,
      error: 'No se encontró sesión activa. Por favor, inicia sesión.'
    }
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/${API_VERSION}/admin/employees/revoke`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ email, role })
      }
    )

    const data = await response.json().catch(() => ({}))

    if (response.status === 403) {
      return {
        success: false,
        error: data.message || 'No tienes permisos para realizar esta acción.'
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          data.message || 'Error del servidor. Por favor, intenta más tarde.'
      }
    }

    return { success: true, message: data.message }
  } catch {
    return {
      success: false,
      error: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
    }
  }
}
