'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 h-14 flex items-center transition-all duration-200"
      style={
        scrolled
          ? {
              background: 'rgba(9,9,11,0.85)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid hsl(var(--border))',
            }
          : undefined
      }
    >
      <div className="w-full max-w-[1200px] mx-auto px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" width={26} height={26} alt="StayUp" />
          <span
            className="font-semibold text-[15px] text-foreground"
            style={{ letterSpacing: '-0.02em' }}
          >
            StayUp
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Feed', href: '/feed' },
            { label: 'Docs', href: '/documentation' },
            { label: 'Download', href: '#download' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[13.5px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Commencer</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
