'use server'

import { cookies } from 'next/headers'
import { API_URL_COOKIE } from './apiUrl'

// Le serveur va réellement appeler cette URL, avec le token du visiteur en en-tête :
// `new URL()` seul acceptait donc aussi bien `file:` que `http://169.254.169.254`,
// c'est-à-dire une primitive SSRF vers le réseau interne de l'hébergeur.
function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (h === 'localhost' || h.endsWith('.localhost') || h === '::1' || h === '0.0.0.0') {
    return true
  }
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!v4) return h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80:')
  const [a, b] = [Number(v4[1]), Number(v4[2])]
  if (a === 127 || a === 10 || a === 0) return true
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 169 && b === 254) return true
  return false
}

export async function setApiUrlAction(url: string): Promise<{ error?: 'invalid' | 'private' }> {
  const trimmed = url.trim().replace(/\/$/, '')
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return { error: 'invalid' }
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { error: 'invalid' }
  }
  if (isPrivateHost(parsed.hostname)) {
    return { error: 'private' }
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
