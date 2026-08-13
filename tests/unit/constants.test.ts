import { describe, it, expect } from 'vitest'
import { COOKIE_NAME } from '@/lib/constants'

describe('COOKIE_NAME', () => {
  it('is the session cookie name shared by the middleware and server actions', () => {
    expect(COOKIE_NAME).toBe('stayup_token')
  })
})
