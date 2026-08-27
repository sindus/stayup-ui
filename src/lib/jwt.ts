// Décodeur de payload compatible edge runtime. Il NE VÉRIFIE PAS la signature :
// n'importe qui peut fabriquer un payload. Il ne sert donc qu'à des redirections de
// confort (middleware) ; toute décision d'accès réelle doit être confirmée par l'API,
// seule à connaître JWT_SECRET — voir isAdminTokenValid() dans lib/session.ts.
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
