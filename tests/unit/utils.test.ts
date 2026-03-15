import { describe, it, expect } from 'vitest'
import { normalizeIdentifier, cn } from '@/lib/utils'

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

    it('trims whitespace', () => {
      expect(normalizeIdentifier('  facebook/react  ', 'changelog')).toBe('facebook/react')
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
