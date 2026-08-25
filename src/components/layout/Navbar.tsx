'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuroraWordmark } from '@/components/ui/aurora-mark'
import { UserMenu } from './UserMenu'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { LinkPendingSpinner } from '@/components/ui/link-pending-spinner'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

interface NavbarProps {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export function Navbar({ user }: NavbarProps) {
  const { t } = useLanguage()
  const pathname = usePathname()

  const tabs = [{ label: t.nav.myFeed, href: '/feed' }]

  const initial = user.name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <header
      className="sticky top-0 z-40 h-[52px] flex items-center shrink-0 backdrop-blur"
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border-soft)',
      }}
    >
      <div className="w-full px-4 flex items-center justify-between gap-4">
        <Link href="/feed" className="flex items-center gap-2 shrink-0">
          <AuroraWordmark size={14} />
        </Link>

        <nav className="flex items-center gap-1">
          {tabs.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 text-[13px] rounded-md transition-colors',
                  active
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                style={
                  active
                    ? {
                        background: 'var(--surface-2)',
                        border: '1px solid hsl(var(--border))',
                      }
                    : undefined
                }
              >
                {label}
                <LinkPendingSpinner />
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold"
            style={{
              background: 'linear-gradient(135deg, var(--peach), var(--lavender))',
              color: 'var(--peach-on)',
            }}
            title={user.name}
          >
            {initial}
          </div>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
