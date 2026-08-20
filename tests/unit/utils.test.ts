import { describe, it, expect } from 'vitest'
import {
  cn,
  normalizeIdentifier,
  toRepositoryUrl,
  extractIdentifier,
  stripUrlScheme,
  formatDate,
} from '@/lib/utils'
import type { Provider } from '@/types'

describe('normalizeIdentifier', () => {
  describe('changelog provider', () => {
    it('returns owner/repo as-is', () => {
      expect(normalizeIdentifier('facebook/react', 'changelog')).toBe('facebook/react')
    })

    it('extracts owner/repo from full GitHub URL', () => {
      expect(normalizeIdentifier('https://github.com/facebook/react', 'changelog')).toBe(
        'facebook/react',
      )
    })

    it('strips .git suffix from URL', () => {
      expect(normalizeIdentifier('https://github.com/facebook/react.git', 'changelog')).toBe(
        'facebook/react',
      )
    })

    it('strips a trailing slash from the matched path', () => {
      expect(normalizeIdentifier('https://github.com/facebook/react/', 'changelog')).toBe(
        'facebook/react',
      )
    })

    it('trims whitespace', () => {
      expect(normalizeIdentifier('  facebook/react  ', 'changelog')).toBe('facebook/react')
    })

    it('strips the http:// github prefix when the path has no second segment', () => {
      expect(normalizeIdentifier('http://github.com/facebook', 'changelog')).toBe('facebook')
    })

    it('strips .git from a bare owner/repo value', () => {
      expect(normalizeIdentifier('facebook/react.git', 'changelog')).toBe('facebook/react')
    })
  })

  describe('youtube provider', () => {
    it('returns handle as-is (without @)', () => {
      expect(normalizeIdentifier('fireship', 'youtube')).toBe('fireship')
    })

    it('strips leading @ from handle', () => {
      expect(normalizeIdentifier('@fireship', 'youtube')).toBe('fireship')
    })

    it('extracts handle from full YouTube URL with @', () => {
      expect(normalizeIdentifier('https://youtube.com/@fireship', 'youtube')).toBe('fireship')
    })

    it('extracts handle from youtube.com/user/ URL', () => {
      expect(normalizeIdentifier('https://youtube.com/user/fireship', 'youtube')).toBe('fireship')
    })

    it('extracts the id from a youtube.com/channel/ URL', () => {
      expect(normalizeIdentifier('https://youtube.com/channel/UC123abc', 'youtube')).toBe(
        'UC123abc',
      )
    })

    it('ignores query parameters after the handle', () => {
      expect(normalizeIdentifier('https://youtube.com/@fireship?sub=1', 'youtube')).toBe('fireship')
    })
  })

  describe('rss and scrap providers', () => {
    it('returns the trimmed URL unchanged for rss', () => {
      expect(normalizeIdentifier('  https://example.com/feed.xml ', 'rss')).toBe(
        'https://example.com/feed.xml',
      )
    })

    it('returns the trimmed URL unchanged for scrap', () => {
      expect(normalizeIdentifier(' https://example.com/blog ', 'scrap')).toBe(
        'https://example.com/blog',
      )
    })
  })
})

describe('toRepositoryUrl', () => {
  it('builds a GitHub URL for changelog', () => {
    expect(toRepositoryUrl('facebook/react', 'changelog')).toBe(
      'https://github.com/facebook/react/',
    )
  })

  it('builds a YouTube handle URL for youtube', () => {
    expect(toRepositoryUrl('fireship', 'youtube')).toBe('https://www.youtube.com/@fireship')
  })

  it('returns the identifier unchanged for rss', () => {
    expect(toRepositoryUrl('https://example.com/feed.xml', 'rss')).toBe(
      'https://example.com/feed.xml',
    )
  })

  it('returns the identifier unchanged for scrap', () => {
    expect(toRepositoryUrl('https://example.com/blog', 'scrap')).toBe('https://example.com/blog')
  })
})

describe('extractIdentifier', () => {
  it('extracts owner/repo from a GitHub URL', () => {
    expect(extractIdentifier('https://github.com/facebook/react/', 'changelog')).toBe(
      'facebook/react',
    )
  })

  it('handles deeply nested changelog paths and only takes the first two segments', () => {
    expect(extractIdentifier('https://github.com/vercel/next.js/releases', 'changelog')).toBe(
      'vercel/next.js',
    )
  })

  it('extracts the handle from a YouTube URL, keeping the @', () => {
    expect(extractIdentifier('https://www.youtube.com/@fireship', 'youtube')).toBe('@fireship')
  })

  it('extracts hostname + path for rss', () => {
    expect(extractIdentifier('https://blog.example.com/feed.xml', 'rss')).toBe(
      'blog.example.com/feed.xml',
    )
  })

  it('extracts only the hostname for scrap', () => {
    expect(extractIdentifier('https://news.ycombinator.com/newest', 'scrap')).toBe(
      'news.ycombinator.com',
    )
  })

  it('returns the raw URL for an unknown provider', () => {
    expect(extractIdentifier('https://example.com/x', 'unknown' as Provider)).toBe(
      'https://example.com/x',
    )
  })

  it('returns the original string when the URL is invalid', () => {
    expect(extractIdentifier('not-a-url', 'changelog')).toBe('not-a-url')
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
