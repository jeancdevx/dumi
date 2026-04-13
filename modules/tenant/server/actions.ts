'use server'

import { cookies } from 'next/headers'

import { createTenantSchema } from '../schemas'

const API_BASE_URL = process.env.API_BASE_URL
const API_VERSION = process.env.API_VERSION

function getAuthToken(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  // Backend JWT strategy validates Cognito ID token claims (aud/email/custom claims). esto hace que el token de sesión de NextAuth no funcione directamente, ya que no es un JWT válido para Cognito. Por eso, buscamos explícitamente cookies que puedan contener el token de autenticación, en lugar de asumir un nombre específico. lo escribo porque no lo hice y me pase 30 minutos buscando el error
  const explicitTokenNames = ['authToken', 'accessToken', 'token']

  for (const cookieName of explicitTokenNames) {
    const token = cookieStore.get(cookieName)?.value
    if (token) {
      return token
    }
  }

  const fallbackTokenCookie = cookieStore
    .getAll()
    .find(cookie => cookie.name.toLowerCase().includes('token'))

  return fallbackTokenCookie?.value
}

function normalizeErrorMessage(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('unauthorized')) {
    return 'Tu sesion no es valida para crear empresa. Cierra sesion e inicia nuevamente.'
  }

  if (normalized.includes('workspace already setup')) {
    return 'Tu empresa ya fue configurada previamente.'
  }

  if (normalized.includes('tenant setup already completed')) {
    return 'La configuración de empresa ya está completada o en proceso.'
  }

  if (normalized.includes('ruc must start with 10 or 20')) {
    return 'El RUC debe iniciar con 10 o 20 y tener 11 dígitos.'
  }

  return message
}

function getErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') {
    return fallback
  }

  if (
    'message' in data &&
    Array.isArray((data as { message?: unknown }).message)
  ) {
    const joinedMessage = (data as { message: string[] }).message.join(', ')
    return normalizeErrorMessage(joinedMessage)
  }

  if (
    'message' in data &&
    typeof (data as { message?: unknown }).message === 'string'
  ) {
    return normalizeErrorMessage((data as { message: string }).message)
  }

  if (
    'error' in data &&
    typeof (data as { error?: unknown }).error === 'string'
  ) {
    return normalizeErrorMessage((data as { error: string }).error)
  }

  return fallback
}

export const createTenant = async (formData: FormData) => {
  const rawName = formData.get('name')
  const rawRuc = formData.get('ruc')
  const rawAddress = formData.get('address')

  const parsedData = createTenantSchema.safeParse({
    name: rawName,
    ruc: rawRuc,
    address: rawAddress
  })

  if (!parsedData.success) {
    const firstIssue = parsedData.error.issues[0]
    return {
      success: false,
      error: firstIssue?.message || 'Por favor, revisa los datos ingresados.'
    }
  }

  if (!API_BASE_URL || !API_VERSION) {
    return {
      success: false,
      error: 'Configuración de API incompleta en el frontend.'
    }
  }

  const cookieStore = await cookies()
  const token = getAuthToken(cookieStore)

  if (!token) {
    return {
      success: false,
      error: 'No se encontró una sesión activa. Inicia sesión nuevamente.'
    }
  }

  const payload = {
    name: parsedData.data.name,
    ...(parsedData.data.ruc ? { ruc: parsedData.data.ruc } : {}),
    ...(parsedData.data.address ? { address: parsedData.data.address } : {})
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/${API_VERSION}/tenant/setup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        success: false,
        error: getErrorMessage(
          data,
          'No se pudo crear la empresa. Intenta nuevamente.'
        )
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error during tenant setup:', error)
    return {
      success: false,
      error: 'Ocurrió un error al crear la empresa. Intenta nuevamente.'
    }
  }
}
