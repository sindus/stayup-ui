// Edge-runtime-compatible JWT payload decoder (no signature verification)
export function decodeJwtPayload(token: string): {
  role?: string
  sub?: string
  exp?: number
} {
  try {
    const part = token.split('.')[1]
    if (!part) return {}
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64)) as { role?: string; sub?: string; exp?: number }
  } catch {
    return {}
  }
}
