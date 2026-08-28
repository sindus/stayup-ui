import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Libellé court d'un flux : le schéma retiré. Le libellé riche par provider
 *  vient désormais de `display.feedLabel` du template (voir resolveFeedLabel). */
export function extractIdentifier(url: string): string {
  return stripUrlScheme(url)
}

export function stripUrlScheme(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/^www\./, '')
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

/** Libellé de repli pour un provider sans traduction connue de l'app (mêmes règles que
 *  le fallback de displayName côté API — voir stayup-api/src/db/providerRegistry.ts). */
export function providerDisplayName(provider: string): string {
  return provider.charAt(0).toUpperCase() + provider.slice(1)
}
