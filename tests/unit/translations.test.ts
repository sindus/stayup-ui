import { describe, it, expect } from 'vitest'
import { en, fr, de, es, it as itLang, pt, ja, zh } from '@/lib/translations'

const dictionaries = { en, fr, de, es, it: itLang, pt, ja, zh }

/** Collects every leaf key path of a nested translation object. */
function keyPaths(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix]
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    keyPaths(value, prefix ? `${prefix}.${key}` : key),
  )
}

describe('translation dictionaries', () => {
  it('exposes the same key paths in every language', () => {
    const referencePaths = keyPaths(en).sort()
    for (const dict of Object.values(dictionaries)) {
      expect(keyPaths(dict).sort()).toEqual(referencePaths)
    }
  })

  it('has no empty string values', () => {
    for (const dict of Object.values(dictionaries)) {
      const empties = keyPaths(dict).filter((path) => {
        const value = path
          .split('.')
          .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)[key], dict)
        return typeof value === 'string' && value.trim() === ''
      })
      expect(empties).toEqual([])
    }
  })

  // Le lien « Docs » a été rétabli quand la page d'auto-hébergement est arrivée :
  // ce test vérifiait son absence, il vérifie maintenant sa présence partout.
  it('exposes the documentation link in every language', () => {
    for (const [lang, dict] of Object.entries(dictionaries)) {
      expect(dict.landing.header.docs, lang).toBeTruthy()
    }
  })

  it('lists only the four supported feed providers', () => {
    for (const dict of Object.values(dictionaries)) {
      expect(Object.keys(dict.feed.providers).sort()).toEqual([
        'changelog',
        'rss',
        'scrap',
        'youtube',
      ])
    }
  })

  it('keeps the nav entries free of a documentation tab', () => {
    for (const dict of Object.values(dictionaries)) {
      expect(Object.keys(dict.nav)).not.toContain('documentation')
    }
  })
})
