'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useLanguage } from '@/context/LanguageContext'

export function LandingHeader() {
  const { t } = useLanguage()

  return (
    <header className="flex items-center justify-between h-14">
      <span className="font-semibold text-lg">StayUp</span>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
        >
          {t.landing.header.signIn}
        </Link>
      </div>
    </header>
  )
}
