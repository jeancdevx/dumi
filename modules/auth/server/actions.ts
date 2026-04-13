'use server'

import { cookies } from 'next/headers'

import { decodeJwt } from 'jose'

import {
  confirmEmailSchema,
  registerSchema,
  resendCodeSchema,
  signInSchema
} from '../schemas'

const API_BASE_URL = process.env.API_BASE_URL
const API_VERSION = process.env.API_VERSION
const COGNITO_REGION = process.env.AWS_COGNITO_REGION
const COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID
const TENANT_SETUP_CHECK_METHOD =
  process.env.TENANT_SETUP_CHECK_METHOD || 'token-claim'
const AUTH_REGISTER_URL = `${API_BASE_URL}/${API_VERSION}/auth/register`
const AUTH_CONFIRM_EMAIL_URL = `${API_BASE_URL}/${API_VERSION}/auth/confirm-email`
const AUTH_RESEND_CODE_URL = `${API_BASE_URL}/${API_VERSION}/auth/resend-code`

type RegisterErrorCode =
  | 'VALIDATION_ERROR'
  | 'USER_EXISTS'
  | 'REGISTER_PARTIAL'
  | 'UNKNOWN'

function getErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') {
    return fallback
  }

  if (
    'message' in data &&
    Array.isArray((data as { message?: unknown }).message)
  ) {
    const joinedMessage = (data as { message: string[] }).message.join(', ')
    return normalizeBackendMessage(joinedMessage)
  }

  if (
    'message' in data &&
    typeof (data as { message?: unknown }).message === 'string'
  ) {
    return normalizeBackendMessage((data as { message: string }).message)
  }

  if (
    'error' in data &&
    typeof (data as { error?: unknown }).error === 'string'
  ) {
    return normalizeBackendMessage((data as { error: string }).error)
  }

  return fallback
}

function normalizeBackendMessage(message: string) {
  const normalized = message.toLowerCase()

  if (
    normalized.includes('usernameexistsexception') ||
    normalized.includes('email already exists') ||
    normalized.includes('user already exists')
  ) {
    return 'Este correo ya esta registrado. Inicia sesion o usa otro correo.'
  }

  if (normalized.includes('code mismatch')) {
    return 'El codigo de verificacion no es correcto. Revisa el correo e intenta nuevamente.'
  }

  if (normalized.includes('invalid verification code')) {
    return 'El codigo de verificacion es invalido. Intenta nuevamente.'
  }

  if (normalized.includes('verification code has expired')) {
    return 'El codigo de verificacion expiro. Solicita uno nuevo.'
  }

  if (normalized.includes('failed to confirm email')) {
    return 'No fue posible confirmar el correo. Intenta nuevamente.'
  }

  if (normalized.includes('failed to resend code')) {
    return 'No fue posible reenviar el codigo. Intenta nuevamente.'
  }

  if (normalized.includes('could not complete user registration')) {
    return 'No se pudo completar el registro. Intenta nuevamente.'
  }

  return message
}

function normalizeAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase()

  if (
    normalized.includes('user already exists') ||
    normalized.includes('usernameexistsexception') ||
    normalized.includes('email already exists')
  ) {
    return {
      message:
        'Este correo ya esta en uso. Si ya te registraste, inicia sesion.',
      code: 'USER_EXISTS' as RegisterErrorCode
    }
  }

  if (normalized.includes('could not create user')) {
    return {
      message:
        'No se pudo completar el registro en este momento. Si recibiste un codigo por correo, puedes confirmarlo abajo.',
      code: 'REGISTER_PARTIAL' as RegisterErrorCode
    }
  }

  return {
    message,
    code: 'UNKNOWN' as RegisterErrorCode
  }
}

function normalizeSignInError(message: string) {
  const normalized = message.toLowerCase()

  if (
    normalized.includes('incorrect username or password') ||
    normalized.includes('invalid email or password') ||
    normalized.includes('user not found') ||
    normalized.includes('notauthorizedexception')
  ) {
    return 'Correo o contrasena incorrectos.'
  }

  if (
    normalized.includes('user is not confirmed') ||
    normalized.includes('usernotconfirmedexception')
  ) {
    return 'Tu correo aun no esta confirmado. Confirma tu cuenta primero.'
  }

  return 'Error al iniciar sesión. Por favor, intenta de nuevo.'
}

function hasTenantInToken(idToken: string) {
  try {
    const payload = decodeJwt(idToken)
    return Boolean(payload['custom:tenant_id'])
  } catch {
    return false
  }
}

function shouldRequireTenantSetup(idToken: string) {
  switch (TENANT_SETUP_CHECK_METHOD) {
    case 'token-claim':
    default:
      return !hasTenantInToken(idToken)
  }
}

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

  if (!COGNITO_REGION || !COGNITO_CLIENT_ID) {
    return {
      success: false,
      error: 'Configuracion de Cognito incompleta en el frontend.'
    }
  }

  try {
    const response = await fetch(
      `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
        },
        body: JSON.stringify({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: parsedData.data.email,
            PASSWORD: parsedData.data.password
          }
        })
      }
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const cognitoMessage =
        data?.message || data?.Message || data?.error || data?.__type || ''

      return {
        success: false,
        error: normalizeSignInError(cognitoMessage)
      }
    }

    const authenticationResult = data?.AuthenticationResult
    const idToken = authenticationResult?.IdToken
    const accessToken = authenticationResult?.AccessToken
    const refreshToken = authenticationResult?.RefreshToken
    const expiresIn = authenticationResult?.ExpiresIn

    if (!idToken) {
      return {
        success: false,
        error: 'No se pudo obtener el token de sesion.'
      }
    }

    const secureCookie = process.env.NODE_ENV === 'production'

    const cookieStore = await cookies()

    cookieStore.set('authToken', idToken, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      path: '/',
      ...(expiresIn && { maxAge: expiresIn })
    })

    if (accessToken) {
      cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: 'lax',
        path: '/',
        ...(expiresIn && { maxAge: expiresIn })
      })
    }

    if (refreshToken) {
      cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: 'lax',
        path: '/'
      })
    }

    const requiresTenantSetup = shouldRequireTenantSetup(idToken)

    return {
      success: true,
      requiresTenantSetup,
      tokenType: authenticationResult?.TokenType || 'Bearer'
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

export const register = async (formData: FormData) => {
  const name = formData.get('name')
  const lastName = formData.get('lastName')
  const email = formData.get('email')
  const password = formData.get('password')

  const parsedData = registerSchema.safeParse({
    name,
    lastName,
    email,
    password
  })

  if (!parsedData.success) {
    return {
      success: false,
      code: 'VALIDATION_ERROR' as RegisterErrorCode,
      error: 'Por favor, revisa los datos del formulario.'
    }
  }

  try {
    const response = await fetch(AUTH_REGISTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parsedData.data)
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const backendMessage = getErrorMessage(
        data,
        'No fue posible registrar la cuenta. Intenta nuevamente.'
      )
      const parsedError = normalizeAuthErrorMessage(backendMessage)

      return {
        success: false,
        code: parsedError.code,
        error: parsedError.message
      }
    }

    return {
      success: true,
      email: parsedData.data.email,
      data
    }
  } catch (error) {
    console.error('Error during register:', error)
    return {
      success: false,
      error: 'Ocurrió un error al registrar la cuenta. Intenta nuevamente.'
    }
  }
}

export const confirmEmail = async (formData: FormData) => {
  const email = formData.get('email')
  const code = formData.get('code')

  const parsedData = confirmEmailSchema.safeParse({ email, code })

  if (!parsedData.success) {
    return {
      success: false,
      error: 'El código debe tener exactamente 6 dígitos.'
    }
  }

  try {
    const response = await fetch(AUTH_CONFIRM_EMAIL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parsedData.data)
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        success: false,
        error: getErrorMessage(
          data,
          'No fue posible confirmar el correo. Verifica el código e intenta nuevamente.'
        )
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error during email confirmation:', error)
    return {
      success: false,
      error: 'Ocurrió un error al confirmar el correo. Intenta nuevamente.'
    }
  }
}

export const resendCode = async (formData: FormData) => {
  const email = formData.get('email')

  const parsedData = resendCodeSchema.safeParse({ email })

  if (!parsedData.success) {
    return {
      success: false,
      error: 'Correo inválido para reenviar el código.'
    }
  }

  try {
    const response = await fetch(AUTH_RESEND_CODE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parsedData.data)
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        success: false,
        error: getErrorMessage(
          data,
          'No fue posible reenviar el código. Intenta nuevamente.'
        )
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error during resend code:', error)
    return {
      success: false,
      error: 'Ocurrió un error al reenviar el código. Intenta nuevamente.'
    }
  }
}
