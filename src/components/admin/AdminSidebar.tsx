'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users,
  GitBranch,
  Inbox,
  SlidersHorizontal,
  ShieldCheck,
  KeyRound,
  Database,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

export function AdminSidebar({ isSuper = false }: { isSuper?: boolean }) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const nav = t.admin.nav

  const items = [
    { label: nav.users, href: '/admin/users', icon: Users },
    { label: nav.feeds, href: '/admin/repositories', icon: GitBranch },
    { label: nav.providers, href: '/admin/providers', icon: SlidersHorizontal },
    { label: nav.fluxRequests, href: '/admin/flux-requests', icon: Inbox },
    { label: nav.dataSources, href: '/admin/data-sources', icon: Database },
    // Réservé au super admin : la gestion des autres administrateurs.
    ...(isSuper ? [{ label: nav.admins, href: '/admin/admins', icon: ShieldCheck }] : []),
    { label: nav.account, href: '/admin/settings', icon: KeyRound },
  ]

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
