'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export interface ServerStatus {
  id: string
  name: string
  /** Token expiré (contrôle local sur `exp`). Le web ne peut pas distinguer
   *  « injoignable » sans requête — vert / rouge seulement. */
  expired: boolean
}

/** Une pastille par serveur suivi, dans la Navbar, à côté du menu profil :
 *  vert = session vivante, rouge = session à reconnecter. Clic → /profile
 *  (carte « Serveurs »). */
export function ServerStatusDots({ servers }: { servers: ServerStatus[] }) {
  const { t } = useLanguage()
  if (servers.length === 0) return null

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={t.serverStatus.title}>
      {servers.map((s) => {
        const label = s.expired ? t.serverStatus.disconnected : t.serverStatus.connected
        return (
          <Link
            key={s.id}
            href="/profile"
            title={`${s.name} — ${label}`}
            aria-label={`${s.name} — ${label}`}
            className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-[var(--surface-2)]"
          >
            <span
              className="h-[11px] w-[11px]"
              style={{
                // `--sage` = le vert du thème (--teal/--green y sont remappés).
                backgroundColor: s.expired ? 'var(--rose)' : 'var(--sage)',
                borderRadius: '9999px',
              }}
            />
          </Link>
        )
      })}
    </div>
  )
}
