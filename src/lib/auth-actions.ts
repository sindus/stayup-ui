'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getApiUrl } from './apiUrl'
import { COOKIE_NAME, ADMIN_COOKIE_NAME, decodeToken, getToken } from './session'

// Admin sessions use their own cookie (ADMIN_COOKIE_NAME) so a browser can
// hold a regular user session and an admin session at the same time.
async function setTokenCookie(name: string, token: string) {
  const exp = (
    JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as {
      exp: number
    }
  ).exp
  const maxAge = Math.max(exp - Math.floor(Date.now() / 1000), 0)
  const cookieStore = await cookies()
  cookieStore.set(name, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  })
}

export async function loginAction(email: string, password: string): Promise<{ error?: string }> {
  const apiUrl = await getApiUrl()
  const res = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  })

  if (!res.ok) {
    return { error: 'Identifiants incorrects.' }
  }

  const { token } = (await res.json()) as { token: string }
  await setTokenCookie(COOKIE_NAME, token)
  redirect('/feed')
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
): Promise<{ error?: string }> {
  const apiUrl = await getApiUrl()
  const res = await fetch(`${apiUrl}/auth/register`, {
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
  await setTokenCookie(COOKIE_NAME, token)
  redirect('/feed')
}

export async function adminLoginAction(
  username: string,
  password: string,
): Promise<{ error?: string }> {
  const apiUrl = await getApiUrl()
  const res = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    cache: 'no-store',
  })

  if (!res.ok) {
    return { error: 'Identifiants incorrects.' }
  }

  const { token } = (await res.json()) as { token: string }
  await setTokenCookie(ADMIN_COOKIE_NAME, token)
  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect('/')
}

export async function adminLogoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
  redirect('/admin/login')
}

export async function updateProfileAction(data: {
  name?: string
  email?: string
  password?: string
}): Promise<{ error?: string }> {
  const token = await getToken()
  if (!token) return { error: 'Non authentifié.' }

  const session = decodeToken(token)
  const apiUrl = await getApiUrl()

  const res = await fetch(`${apiUrl}/ui/users/${session.userId}`, {
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
