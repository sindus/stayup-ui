import { describe, it, expect } from 'vitest'
import { fr, en } from '@/lib/translations'

/** Collects every leaf key path of a nested translation object. */
function keyPaths(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix]
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    keyPaths(value, prefix ? `${prefix}.${key}` : key),
  )
}

describe('translation dictionaries', () => {
  it('exposes the same key paths in both languages', () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(fr).sort())
  })

  it('has no empty string values', () => {
    for (const dict of [fr, en]) {
      const empties = keyPaths(dict).filter((path) => {
        const value = path
          .split('.')
          .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)[key], dict)
        return typeof value === 'string' && value.trim() === ''
      })
      expect(empties).toEqual([])
    }
  })

  it('no longer exposes documentation keys', () => {
    const paths = [...keyPaths(fr), ...keyPaths(en)]
    expect(paths.filter((p) => /doc/i.test(p))).toEqual([])
  })

  it('lists only the four supported feed providers', () => {
    expect(Object.keys(fr.feed.providers).sort()).toEqual(['changelog', 'rss', 'scrap', 'youtube'])
    expect(Object.keys(en.feed.providers).sort()).toEqual(['changelog', 'rss', 'scrap', 'youtube'])
  })

  it('keeps the nav entries free of a documentation tab', () => {
    expect(Object.keys(fr.nav)).not.toContain('documentation')
    expect(Object.keys(en.nav)).not.toContain('documentation')
  })
})
