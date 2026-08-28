import { describe, it, expect } from 'vitest'
import { cn, extractIdentifier, stripUrlScheme, formatDate } from '@/lib/utils'

describe('extractIdentifier', () => {
  // Le libellé riche par provider vient désormais de `display.feedLabel` (voir
  // providerTemplate.resolveFeedLabel) ; extractIdentifier n'est plus qu'un repli
  // générique : le schéma et `www.` retirés.
  it('strips the scheme and www.', () => {
    expect(extractIdentifier('https://www.blog.example.com/feed.xml')).toBe(
      'blog.example.com/feed.xml',
    )
  })

  it('keeps the path as-is otherwise', () => {
    expect(extractIdentifier('https://github.com/facebook/react')).toBe('github.com/facebook/react')
  })

  it('leaves a non-URL string untouched', () => {
    expect(extractIdentifier('not-a-url')).toBe('not-a-url')
  })
})

describe('stripUrlScheme', () => {
  it('strips https://', () => {
    expect(stripUrlScheme('https://example.com/a')).toBe('example.com/a')
  })

  it('strips http://', () => {
    expect(stripUrlScheme('http://example.com')).toBe('example.com')
  })

  it('strips https:// together with www.', () => {
    expect(stripUrlScheme('https://www.example.com')).toBe('example.com')
  })

  it('strips a leading www. with no scheme', () => {
    expect(stripUrlScheme('www.example.com')).toBe('example.com')
  })

  it('leaves a bare host untouched', () => {
    expect(stripUrlScheme('example.com')).toBe('example.com')
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resolves tailwind conflicts', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })
})

describe('formatDate', () => {
  it('formats an ISO string using the fr-FR locale', () => {
    const result = formatDate('2026-03-14T15:09:00.000Z')
    expect(result).toMatch(/2026/)
    expect(result).toMatch(/mars/)
  })

  it('accepts a Date instance', () => {
    const result = formatDate(new Date('2026-01-02T03:04:00.000Z'))
    expect(result).toMatch(/2026/)
    expect(result).toMatch(/janv/)
  })
})
