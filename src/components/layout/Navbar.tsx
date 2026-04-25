'use client'

import Link from 'next/link'
import { UserMenu } from './UserMenu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useLanguage } from '@/context/LanguageContext'

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

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/feed" className="font-semibold text-lg">
          StayUp
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/feed"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.nav.myFeed}
          </Link>
          <Link
            href="/documentation"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.nav.documentation}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          <UserMenu user={user} />
        </nav>
      </div>
    </header>
  )
}
