'use server'

import { cookies } from 'next/headers'

import { signInSchema } from '../schemas'

const API_BASE_URL = process.env.API_BASE_URL
const API_VERSION = process.env.API_VERSION
const AUTH_SIGN_IN_URL = `${API_BASE_URL}/${API_VERSION}/auth/signin`

export const signIn = async (formData: FormData) => {
  const email = formData.get('email')
  const password = formData.get('password')

  const parsedData = signInSchema.safeParse({ email, password })

  if (!parsedData.success) {
    return {
      success: false,
      error: 'Por favor, verifica los datos ingresados.'
    }
  }

  try {
    const response = await fetch(AUTH_SIGN_IN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: parsedData.data.email,
        password: parsedData.data.password
      }),
      credentials: 'include'
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      if (response.status >= 500) {
        return {
          success: false,
          error: 'Error del servidor. Por favor, intenta más tarde.'
        }
      }

      return {
        success: false,
        error:
          data?.message ||
          data?.error ||
          'Error al iniciar sesión. Por favor, intenta de nuevo.'
      }
    }

    const cookieStore = await cookies()
    const setCookieHeaders = response.headers.getSetCookie()

    for (const cookieHeader of setCookieHeaders) {
      const [cookieNameValue, ...attributes] = cookieHeader.split(';')
      const [name, value] = cookieNameValue.split('=')

      const cookieOptions: {
        httpOnly?: boolean
        secure?: boolean
        sameSite?: 'lax' | 'strict' | 'none'
        maxAge?: number
        path?: string
        expires?: Date
      } = {}

      for (const attr of attributes) {
        const trimmedAttr = attr.trim()
        if (trimmedAttr.toLowerCase() === 'httponly') {
          cookieOptions.httpOnly = true
        } else if (trimmedAttr.toLowerCase() === 'secure') {
          cookieOptions.secure = true
        } else if (trimmedAttr.toLowerCase().startsWith('samesite=')) {
          const sameSiteValue = trimmedAttr.split('=')[1].toLowerCase()
          cookieOptions.sameSite = sameSiteValue as 'lax' | 'strict' | 'none'
        } else if (trimmedAttr.toLowerCase().startsWith('max-age=')) {
          cookieOptions.maxAge = parseInt(trimmedAttr.split('=')[1])
        } else if (trimmedAttr.toLowerCase().startsWith('path=')) {
          cookieOptions.path = trimmedAttr.split('=')[1]
        } else if (trimmedAttr.toLowerCase().startsWith('expires=')) {
          cookieOptions.expires = new Date(trimmedAttr.substring(8))
        }
      }

      cookieStore.set(
        name.trim(),
        decodeURIComponent(value.trim()),
        cookieOptions
      )
    }

    return {
      success: true,
      user: data?.user || null
    }
  } catch (error) {
    console.error('Error during sign in:', error)
    return {
      success: false,
      error:
        'Ocurrió un error durante el inicio de sesión. Por favor, intenta de nuevo.'
    }
  }
}
