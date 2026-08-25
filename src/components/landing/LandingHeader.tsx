'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AuroraWordmark } from '@/components/ui/aurora-mark'

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
              background: 'rgba(14,17,25,0.85)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid var(--border-soft)',
            }
          : undefined
      }
    >
      <div className="w-full max-w-[1200px] mx-auto px-8 flex items-center justify-between">
        <Link href="/">
          <AuroraWordmark size={15} />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[13.5px] text-fg-soft">
          {[
            { label: 'Fonctionnalités', href: '#features' },
            { label: 'Télécharger', href: '#download' },
            { label: 'Changelog', href: 'https://github.com/stayup-app/stayup-desktop/releases' },
            { label: 'GitHub', href: 'https://github.com/stayup-app' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="hover:text-fg transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="px-3.5 py-2 text-[13.5px] text-fg-soft hover:text-fg rounded-md transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-md bg-peach text-[13.5px] font-semibold inline-flex items-center gap-1.5 hover:opacity-95 transition-opacity"
            style={{ color: 'var(--peach-on)' }}
          >
            Commencer
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </header>
  )
}
