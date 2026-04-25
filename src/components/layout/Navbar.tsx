'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { UserMenu } from './UserMenu'
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

  const tabs = [
    { label: t.nav.myFeed, href: '/feed' },
    { label: t.nav.documentation, href: '/documentation' },
  ]

  const initial = user.name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <header
      className="sticky top-0 z-40 h-[52px] flex items-center shrink-0 backdrop-blur"
      style={{
        background: 'rgba(9,9,11,0.85)',
        borderBottom: '1px solid hsl(var(--border))',
      }}
    >
      <div className="w-full px-4 flex items-center justify-between gap-4">
        <Link href="/feed" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.svg" width={22} height={22} alt="StayUp" />
          <span className="font-semibold text-[14px]" style={{ letterSpacing: '-0.02em' }}>
            StayUp
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {tabs.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-1 text-[13px] rounded-md transition-colors',
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
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold text-foreground"
            style={{
              background: 'linear-gradient(135deg, var(--teal), oklch(0.65 0.22 280))',
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
