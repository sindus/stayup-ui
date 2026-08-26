'use server'

import { cookies } from 'next/headers'
import { API_URL_COOKIE } from './apiUrl'

export async function setApiUrlAction(url: string): Promise<{ error?: 'invalid' }> {
  const trimmed = url.trim().replace(/\/$/, '')
  try {
    new URL(trimmed)
  } catch {
    return { error: 'invalid' }
  }

  const cookieStore = await cookies()
  cookieStore.set(API_URL_COOKIE, trimmed, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
  })
  return {}
}

export async function resetApiUrlAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(API_URL_COOKIE)
}
