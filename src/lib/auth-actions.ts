'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_NAME, decodeToken, getToken } from './session'

const API_URL = process.env.STAYUP_API_URL?.replace(/\/$/, '') ?? ''

async function setTokenCookie(token: string) {
  const exp = (
    JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as {
      exp: number
    }
  ).exp
  const maxAge = Math.max(exp - Math.floor(Date.now() / 1000), 0)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  })
}

export async function loginAction(email: string, password: string): Promise<{ error?: string }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return { error: body.error ?? 'Identifiants incorrects.' }
  }

  const { token } = (await res.json()) as { token: string }
  await setTokenCookie(token)
  redirect('/feed')
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
): Promise<{ error?: string }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    if (res.status === 409) return { error: 'Cette adresse e-mail est déjà utilisée.' }
    return {
      error: body.error ?? "Une erreur est survenue lors de l'inscription.",
    }
  }

  const { token } = (await res.json()) as { token: string }
  await setTokenCookie(token)
  redirect('/feed')
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect('/')
}

export async function updateProfileAction(data: {
  name?: string
  email?: string
  password?: string
}): Promise<{ error?: string }> {
  const token = await getToken()
  if (!token) return { error: 'Non authentifié.' }

  const session = decodeToken(token)

  const res = await fetch(`${API_URL}/ui/users/${session.userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return { error: body.error ?? 'Erreur lors de la mise à jour.' }
  }

  return {}
}
