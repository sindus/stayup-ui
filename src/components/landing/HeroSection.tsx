'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

const MOCK_ITEMS = [
  { provider: 'changelog', repo: 'vercel/next.js', version: 'v15.3.0', time: '2h' },
  { provider: 'youtube', channel: 'Fireship', title: 'React 19 is Here', time: '4h' },
  { provider: 'rss', source: 'CSS Tricks', title: 'Modern CSS Grid Layout', time: '6h' },
  { provider: 'changelog', repo: 'facebook/react', version: 'v19.1.0', time: '8h' },
  { provider: 'scrap', source: 'tailwindcss.com', title: 'New utility classes', time: '12h' },
  { provider: 'youtube', channel: 'Theo', title: 'The Future of TypeScript', time: '1d' },
  { provider: 'changelog', repo: 'shadcn/ui', version: 'v2.5.0', time: '1d' },
]

const PROVIDER_COLORS: Record<string, string> = {
  changelog: 'var(--teal)',
  youtube: 'var(--rose)',
  rss: 'var(--amber)',
  scrap: 'var(--green)',
}

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  changelog: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1L9.5 4H11.5L7 1ZM7 1L4.5 4H2.5L7 1Z" fill="currentColor" opacity="0.8" />
      <rect x="2" y="4" width="10" height="1" rx="0.5" fill="currentColor" />
      <rect x="3" y="6.5" width="8" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="3" y="8.5" width="6" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
    </svg>
  ),
  youtube: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3" width="12" height="8" rx="2" fill="currentColor" />
      <path d="M5.5 5.5L9 7L5.5 8.5V5.5Z" fill="white" />
    </svg>
  ),
  rss: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="3" cy="11" r="1.5" fill="currentColor" />
      <path
        d="M2 7.5C5 7.5 6.5 9 6.5 11.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M2 4C7 4 10 7 10 12"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  ),
  scrap: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <ellipse cx="7" cy="7" rx="2" ry="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
}

interface HeroSectionProps {
  isLoggedIn?: boolean
}

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
  return (
    <section className="py-20">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <div className="max-w-[520px]">
            <div
              className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold tracking-wide"
              style={{
                background: 'var(--teal-dim)',
                border: '1px solid var(--teal-mid)',
                color: 'var(--teal)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
              v0.2.0 — Disponible maintenant
            </div>

            <h1
              className="text-[56px] font-bold leading-[1.05] mb-5"
              style={{ letterSpacing: '-0.04em' }}
            >
              Restez à jour.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--teal), oklch(0.65 0.22 210))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Toujours.
              </span>
            </h1>

            <p className="text-[17px] text-muted-foreground leading-[1.65] max-w-[440px] mb-8">
              StayUp agrège changelogs GitHub, vidéos YouTube, flux RSS et pages web en un seul feed
              personnalisé.
            </p>

            <div className="flex items-center gap-3 mb-10">
              {isLoggedIn ? (
                <Button size="lg" asChild>
                  <Link href="/feed">Mes flux →</Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link href="/register">Créer un compte gratuit</Link>
                  </Button>
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/feed">Voir le feed →</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-6">
              {[
                { value: '4 sources', label: 'GitHub · YouTube · RSS · Web' },
                { value: 'Desktop', label: 'Mac · Windows · Linux' },
              ].map(({ value, label }) => (
                <div key={value}>
                  <div className="text-sm font-semibold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — Feed Mockup */}
          <div
            className="hidden lg:block rounded-xl overflow-hidden"
            style={{
              background: 'var(--surface)',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
          >
            {/* Window chrome */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              <div className="flex items-center gap-1.5">
                {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">stayup — feed</span>
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
              >
                ● live
              </span>
            </div>

            {/* Feed items */}
            <div>
              {MOCK_ITEMS.map((item, i) => {
                const color = PROVIDER_COLORS[item.provider]
                const icon = PROVIDER_ICONS[item.provider]
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                    style={{
                      borderBottom:
                        i < MOCK_ITEMS.length - 1 ? '1px solid var(--border-subtle)' : undefined,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface-2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = ''
                    }}
                  >
                    <span style={{ color }}>{icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-mono text-muted-foreground truncate block">
                        {item.repo ?? item.channel ?? item.source}
                      </span>
                      {item.version ? (
                        <span
                          className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            background: `color-mix(in srgb, ${color} 15%, transparent)`,
                            color,
                          }}
                        >
                          {item.version}
                        </span>
                      ) : (
                        <span className="text-[13px] text-foreground truncate block">
                          {item.title}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                      {item.time}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
