'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'

interface CtaButtonsProps {
  isLoggedIn?: boolean
}

export function CtaButtons({ isLoggedIn }: CtaButtonsProps) {
  const { t } = useLanguage()
  const c = t.landing.cta

  return (
    <section className="py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">{c.title}</h2>
      <p className="text-muted-foreground mb-8">
        {isLoggedIn ? c.subtitleLoggedIn : c.subtitleGuest}
      </p>
      <div className="flex gap-4 justify-center">
        {isLoggedIn ? (
          <Button asChild size="lg">
            <Link href="/feed">{c.ctaFeed}</Link>
          </Button>
        ) : (
          <>
            <Button asChild size="lg">
              <Link href="/register">{c.ctaStart}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">{c.ctaSignIn}</Link>
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
