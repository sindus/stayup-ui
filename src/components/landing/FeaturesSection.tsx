'use client'

import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

const ICONS: Record<string, string> = {
  changelog: '/icons/changelog.svg',
  youtube: '/icons/youtube.svg',
  rss: '/icons/rss.svg',
  scrap: '/icons/scrap.svg',
}

const COLORS: Record<string, { color: string; dimColor: string }> = {
  changelog: { color: 'var(--teal)', dimColor: 'var(--teal-dim)' },
  youtube: { color: 'var(--rose)', dimColor: 'var(--rose-dim)' },
  rss: { color: 'var(--amber)', dimColor: 'var(--amber-dim)' },
  scrap: { color: 'var(--green)', dimColor: 'var(--green-dim)' },
}

export function FeaturesSection() {
  const { t } = useLanguage()
  const f = t.landing.features

  const providers = ['changelog', 'youtube', 'rss', 'scrap'] as const
  const FEATURES = providers.map((provider) => ({
    provider,
    ...f[provider],
    ...COLORS[provider],
    icon: ICONS[provider],
  }))

  return (
    <section id="features" className="py-16">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-10">
          <span
            className="inline-block text-[11px] font-semibold uppercase tracking-micro px-3 py-1 rounded-full mb-4"
            style={{ background: 'var(--peach-dim)', color: 'var(--peach)' }}
          >
            {f.tagline}
          </span>
          <h2 className="font-serif text-[38px] leading-[1.08] tracking-editorial font-normal">
            {f.titleMain}{' '}
            <span className="italic" style={{ color: 'var(--peach)' }}>
              {f.titleAccent}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map(({ provider, title, description, badge, color, dimColor, icon }) => (
            <div
              key={provider}
              className="group rounded-[10px] p-6 transition-all duration-150 cursor-default"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${color} 27%, transparent)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-[9px] flex items-center justify-center"
                  style={{ background: dimColor }}
                >
                  <Image src={icon} width={18} height={18} alt={title} />
                </div>
                <span
                  className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: dimColor, color }}
                >
                  {badge}
                </span>
              </div>

              <h3
                className="text-[18px] font-semibold mb-2 text-foreground"
                style={{ letterSpacing: '-0.01em' }}
              >
                {title}
              </h3>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
