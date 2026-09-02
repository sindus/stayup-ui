'use server'

import { redirect } from 'next/navigation'
import { getServerTranslations } from './serverLang'
import { fetchAuthConfig, probeApiUrl } from './api-client'
import {
  addInstanceEntry,
  hostOf,
  readInstances,
  removeInstanceEntry,
  renameInstanceEntry,
  setPrimaryInstanceEntry,
  updateInstanceTokenEntry,
} from './instances'

// Le serveur va réellement appeler cette URL avec le token du visiteur : `new URL()`
// seul accepterait `file:` ou `http://169.254.169.254` — une primitive SSRF vers le
// réseau interne de l'hébergeur.
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

function normalizeUrl(url: string): string | null {
  const trimmed = url.trim().replace(/\/$/, '')
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
  if (isPrivateHost(parsed.hostname)) return null
  return trimmed
}

async function resolveName(url: string): Promise<string> {
  const config = await fetchAuthConfig(url).catch(() => null)
  return config?.name?.trim() || hostOf(url)
}

async function loginFor(url: string, email: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const { token } = (await res.json()) as { token?: string }
    return token ?? null
  } catch {
    return null
  }
}

/** Sonde une instance avant l'écran de connexion : nom d'affichage + mode
 *  d'inscription (pour proposer, ou non, « créer un compte »). Sur le web,
 *  l'ajout d'une instance secondaire se fait par e-mail / mot de passe
 *  (l'aller-retour OAuth ne peut pas revenir sur cette origine). */
export async function probeInstanceAction(
  url: string,
): Promise<{ error?: string; name?: string; registrationMode?: 'open' | 'approval' }> {
  const t = await getServerTranslations()
  const clean = normalizeUrl(url)
  if (!clean) return { error: t.errors.privateApiUrl }
  const probe = await probeApiUrl(clean)
  if (!probe.ok) {
    return {
      error:
        probe.reason === 'unreachable' ? t.instances.urlUnreachable : t.instances.urlIncompatible,
    }
  }
  return {
    name: probe.config.name?.trim() || hostOf(clean),
    registrationMode: probe.config.registrationMode,
  }
}

/** Crée un compte sur une instance puis l'ajoute. `{ pending: true }` : l'instance
 *  est en `REGISTRATION_MODE=approval`, le compte attend un admin — rien n'est
 *  ajouté, l'utilisateur reviendra se connecter une fois validé. */
export async function registerInstanceAction(
  url: string,
  name: string,
  email: string,
  password: string,
): Promise<{ error?: string; pending?: boolean }> {
  const t = await getServerTranslations()
  const clean = normalizeUrl(url)
  if (!clean) return { error: t.errors.privateApiUrl }
  if ((await readInstances()).some((i) => i.url === clean)) {
    return { error: t.instances.alreadyAdded }
  }

  let res: Response
  try {
    res = await fetch(`${clean}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      cache: 'no-store',
    })
  } catch {
    return { error: t.instances.urlUnreachable }
  }

  if (res.status === 202) return { pending: true }
  if (!res.ok) {
    return { error: res.status === 409 ? t.errors.emailTaken : t.errors.generic }
  }

  const { token } = (await res.json().catch(() => ({}))) as { token?: string }
  if (!token) return { error: t.errors.generic }
  await addInstanceEntry({ url: clean, name: await resolveName(clean), token })
  return {}
}

export async function addInstanceAction(
  url: string,
  email: string,
  password: string,
): Promise<{ error?: string }> {
  const t = await getServerTranslations()
  const clean = normalizeUrl(url)
  if (!clean) return { error: t.errors.privateApiUrl }
  if ((await readInstances()).some((i) => i.url === clean)) {
    return { error: t.instances.alreadyAdded }
  }
  const token = await loginFor(clean, email, password)
  if (!token) return { error: t.errors.invalidCredentials }
  await addInstanceEntry({ url: clean, name: await resolveName(clean), token })
  return {}
}

export async function reconnectInstanceAction(
  id: string,
  email: string,
  password: string,
): Promise<{ error?: string }> {
  const t = await getServerTranslations()
  const target = (await readInstances()).find((i) => i.id === id)
  if (!target) return { error: t.errors.generic }
  const token = await loginFor(target.url, email, password)
  if (!token) return { error: t.errors.invalidCredentials }
  await updateInstanceTokenEntry(id, token)
  return {}
}

export async function renameInstanceAction(id: string, name: string): Promise<void> {
  const trimmed = name.trim()
  if (trimmed) await renameInstanceEntry(id, trimmed)
}

export async function setPrimaryInstanceAction(id: string): Promise<void> {
  await setPrimaryInstanceEntry(id)
}

/** Retire une instance. Retirer la primaire déconnecte entièrement (comportement
 *  identique au logout). */
export async function removeInstanceAction(id: string): Promise<void> {
  const outcome = await removeInstanceEntry(id)
  if (outcome === 'cleared') redirect('/')
}
