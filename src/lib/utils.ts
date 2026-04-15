import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeIdentifier(
  value: string,
  provider: 'changelog' | 'youtube' | 'rss' | 'scrap',
): string {
  const trimmed = value.trim()

  if (provider === 'changelog') {
    // Accept full GitHub URL or "owner/repo"
    const match = trimmed.match(/github\.com\/([^/]+\/[^/]+)/i)
    if (match) return match[1].replace(/\.git$/, '')
    return trimmed.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '')
  }

  if (provider === 'youtube') {
    // Accept full YouTube URL or just the handle/name
    const match = trimmed.match(/youtube\.com\/(?:@|channel\/|user\/)([^/?\s]+)/i)
    if (match) return match[1]
    return trimmed.replace(/^@/, '')
  }

  // rss and scrap use the URL as-is
  return trimmed
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}
