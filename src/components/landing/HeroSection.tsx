'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'

interface HeroSectionProps {
  isLoggedIn?: boolean
}

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
  const { t } = useLanguage()
  const h = t.landing.hero

  return (
    <section className="py-24 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight mb-6">
        {h.title} <span className="text-primary">{h.titleHighlight}</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">{h.subtitle}</p>
      <div className="flex gap-4 justify-center">
        {isLoggedIn ? (
          <Button asChild size="lg">
            <Link href="/feed">{h.ctaFeed}</Link>
          </Button>
        ) : (
          <>
            <Button asChild size="lg">
              <Link href="/register">{h.ctaStart}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">{h.ctaSignIn}</Link>
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
