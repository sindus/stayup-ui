'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Menu, X } from 'lucide-react'
import { AuroraWordmark } from '@/components/ui/aurora-mark'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useLanguage } from '@/context/LanguageContext'

export function LandingHeader() {
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Repasser en desktop referme le menu mobile pour ne pas laisser un panneau fantôme.
  useEffect(() => {
    if (!menuOpen) return
    function onResize() {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [menuOpen])

  // Ancres absolues : l'en-tête sert aussi la doc, où ces sections n'existent pas.
  // Une simple ancre `#features` n'y menait donc nulle part.
  const navLinks = [
    { label: t.landing.header.features, href: '/#features' },
    { label: t.landing.header.download, href: '/#download' },
    { label: t.landing.header.docs, href: '/docs' },
    { label: 'Changelog', href: 'https://github.com/stayup-app/stayup-desktop/releases' },
    { label: 'GitHub', href: 'https://github.com/stayup-app' },
  ]

  const closeMenu = () => setMenuOpen(false)

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-200"
      style={
        scrolled || menuOpen
          ? {
              background: 'rgba(14,17,25,0.85)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid var(--border-soft)',
            }
          : undefined
      }
    >
      <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-3">
        <Link href="/" onClick={closeMenu}>
          <AuroraWordmark size={15} />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[13.5px] text-fg-soft">
          {navLinks.map(({ label, href }) => (
            <Link key={label} href={href} className="hover:text-fg transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="px-3.5 py-2 text-[13.5px] text-fg-soft hover:text-fg rounded-md transition-colors"
          >
            {t.landing.header.signIn}
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-md bg-peach text-[13.5px] font-semibold inline-flex items-center gap-1.5 hover:opacity-95 transition-opacity"
            style={{ color: 'var(--peach-on)' }}
          >
            {t.landing.header.getStarted}
            <ArrowRight size={12} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={t.landing.header.menu}
          aria-expanded={menuOpen}
          className="md:hidden -mr-1.5 inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-soft hover:text-fg transition-colors"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div
          className="md:hidden absolute inset-x-0 top-14 px-5 pb-6 pt-2"
          style={{
            background: 'rgba(14,17,25,0.97)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <nav className="flex flex-col text-[15px] text-fg-soft">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={closeMenu}
                className="py-2.5 hover:text-fg transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex flex-col gap-3 border-t border-[var(--border-soft)] pt-4">
            <Link
              href="/login"
              onClick={closeMenu}
              className="py-1 text-[15px] text-fg-soft hover:text-fg transition-colors"
            >
              {t.landing.header.signIn}
            </Link>
            <Link
              href="/register"
              onClick={closeMenu}
              className="px-4 py-2.5 rounded-md bg-peach text-[14px] font-semibold inline-flex items-center justify-center gap-1.5"
              style={{ color: 'var(--peach-on)' }}
            >
              {t.landing.header.getStarted}
              <ArrowRight size={13} />
            </Link>
            <div className="pt-1">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
