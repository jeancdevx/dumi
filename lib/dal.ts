import 'server-only'

import { cacheLife } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import type { User, UserRole } from '@/modules/auth/types'

const API_BASE_URL = process.env.API_BASE_URL
const API_VERSION = process.env.API_VERSION

function getAuthToken(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const explicitTokenNames = ['accessToken', 'authToken', 'token']

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

async function verifySession() {
  'use cache: private'
  cacheLife('hours')

  const cookieStore = await cookies()
  const accessToken = getAuthToken(cookieStore)

  if (!accessToken) {
    redirect('/sign-in')
  }

  return { isAuth: true, accessToken }
}

export async function getUser(): Promise<User> {
  'use cache: private'
  cacheLife('hours')

  const session = await verifySession()
  const cookieStore = await cookies()
  const serializedCookies = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')

  try {
    const response = await fetch(
      `${API_BASE_URL}/${API_VERSION}/employees/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(serializedCookies && { Cookie: serializedCookies }),
          Authorization: `Bearer ${session.accessToken}`
        }
      }
    )

    if (!response.ok) {
      redirect('/sign-in')
    }

    const user: User = await response.json()
    return user
  } catch {
    console.error('Failed to fetch user')
    redirect('/sign-in')
  }
}

export async function requireRole(role: UserRole): Promise<void> {
  const user = await getUser()

  if (!user.roles.includes(role)) {
    redirect('/unauthorized')
  }
}

export async function requireAnyRole(roles: UserRole[]): Promise<void> {
  const user = await getUser()

  if (!roles.some(r => user.roles.includes(r))) {
    redirect('/unauthorized')
  }
}
