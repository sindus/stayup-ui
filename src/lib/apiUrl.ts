import { cookies } from 'next/headers'

export const API_URL_COOKIE = 'stayup_api_url'

// URL de l'API par défaut de ce déploiement (variable d'env fixée au build/déploiement).
export const DEFAULT_API_URL = process.env.STAYUP_API_URL?.replace(/\/$/, '') ?? ''

/** URL de l'API à utiliser pour la requête courante : la surcharge posée par le
 *  visiteur (cookie, réglable depuis /profile) si présente, sinon l'URL par défaut de
 *  ce déploiement. */
export async function getApiUrl(): Promise<string> {
  const cookieStore = await cookies()
  const override = cookieStore.get(API_URL_COOKIE)?.value?.replace(/\/$/, '')
  return override || DEFAULT_API_URL
}
