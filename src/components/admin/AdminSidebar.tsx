'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, GitBranch, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Utilisateurs', href: '/admin/users', icon: Users },
  { label: 'Flux', href: '/admin/repositories', icon: GitBranch },
  { label: 'Documentation', href: '/admin/documentation', icon: BookOpen },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
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
