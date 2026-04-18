import { cookies } from 'next/headers'
import { COOKIE_NAME } from './constants'

export { COOKIE_NAME }

export interface AppSession {
  userId: string
  name: string
  email: string
  role: string
}

export function decodeToken(token: string): AppSession {
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as {
    sub: string
    name: string
    email: string
    role: string
  }
  return {
    userId: payload.sub,
    name: payload.name ?? '',
    email: payload.email ?? '',
    role: payload.role ?? 'user',
  }
}

export async function getSession(): Promise<AppSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    return decodeToken(token)
  } catch {
    return null
  }
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value ?? null
}
