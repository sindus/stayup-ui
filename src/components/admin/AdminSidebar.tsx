'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, GitBranch, Inbox, SlidersHorizontal, ShieldCheck, KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Utilisateurs', href: '/admin/users', icon: Users },
  { label: 'Flux', href: '/admin/repositories', icon: GitBranch },
  { label: 'Providers', href: '/admin/providers', icon: SlidersHorizontal },
  { label: 'Demandes de flux', href: '/admin/flux-requests', icon: Inbox },
]

// Réservé au super admin : la gestion des autres administrateurs.
const SUPER_ITEMS = [{ label: 'Admins', href: '/admin/admins', icon: ShieldCheck }]

const ACCOUNT_ITEM = { label: 'Mon compte', href: '/admin/settings', icon: KeyRound }

export function AdminSidebar({ isSuper = false }: { isSuper?: boolean }) {
  const pathname = usePathname()
  const items = [...NAV_ITEMS, ...(isSuper ? SUPER_ITEMS : []), ACCOUNT_ITEM]

  return (
    <>
      {items.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={`${label}-${href}`}
            href={href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-[13px] transition-colors',
              active
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground',
            )}
            style={
              active
                ? {
                    background: 'var(--surface-2)',
                    outline: '1px solid hsl(var(--border))',
                  }
                : undefined
            }
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </Link>
        )
      })}
    </>
  )
}
