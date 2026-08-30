import { cookies } from 'next/headers'
import { COOKIE_NAME, ADMIN_COOKIE_NAME } from './constants'
import { getApiUrl } from './apiUrl'
import { primaryInstance } from './instances'

export { COOKIE_NAME, ADMIN_COOKIE_NAME }

export interface AppSession {
  userId: string
  name: string
  email: string
  role: string
  /** Vrai pour un super admin (habilité à gérer les autres admins). */
  isSuper: boolean
}

/** Décode le payload d'un token. La signature n'est pas vérifiée — seule l'API
 *  connaît JWT_SECRET — donc `role` n'est jamais une preuve : voir
 *  `isAdminTokenValid` pour une décision d'accès. Un token expiré est rejeté ici,
 *  ce qui évite d'afficher une session morte comme si elle était vivante. */
export function decodeToken(token: string): AppSession {
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as {
    sub: string
    name: string
    email: string
    role: string
    is_super?: boolean
    exp?: number
  }
  if (payload.exp !== undefined && payload.exp * 1000 <= Date.now()) {
    throw new Error('Token expired')
  }
  return {
    userId: payload.sub,
    name: payload.name ?? '',
    email: payload.email ?? '',
    role: payload.role ?? 'user',
    isSuper: payload.is_super === true,
  }
}

/** Fait valider le token par l'API (GET /auth/me), qui vérifie sa signature et son
 *  expiration. C'est la seule façon pour ce déploiement — qui ne connaît pas
 *  JWT_SECRET — de savoir si un cookie « admin » est authentique : sans ça, un
 *  payload fabriqué à la main ouvrait tout l'espace /admin. */
export async function isAdminTokenValid(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${await getApiUrl()}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return false
    const body = (await res.json()) as { role?: string }
    return body.role === 'admin'
  } catch {
    return false
  }
}

export async function getSession(): Promise<AppSession | null> {
  const primary = await primaryInstance()
  if (!primary) return null
  try {
    return decodeToken(primary.token)
  } catch {
    return null
  }
}

export async function getToken(): Promise<string | null> {
  return (await primaryInstance())?.token ?? null
}

// Admin sessions use a separate cookie from user sessions, so the same
// browser can be signed in as a regular user and as admin at the same time.

export async function getAdminSession(): Promise<AppSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  if (!token) return null
  try {
    return decodeToken(token)
  } catch {
    return null
  }
}

export async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value ?? null
}
