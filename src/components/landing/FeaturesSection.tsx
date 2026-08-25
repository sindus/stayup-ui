'use client'

import Image from 'next/image'

const FEATURES = [
  {
    provider: 'changelog',
    title: 'GitHub Changelog',
    description:
      'Suivez les releases de vos dépôts GitHub préférés. Notes de mise à jour dès la publication.',
    color: 'var(--teal)',
    dimColor: 'var(--teal-dim)',
    icon: '/icons/changelog.svg',
    badge: 'v2.1.0',
  },
  {
    provider: 'youtube',
    title: 'Chaînes YouTube',
    description:
      "Restez informé des dernières vidéos de vos créateurs favoris. Titre, thumbnail et lien en un coup d'œil.",
    color: 'var(--rose)',
    dimColor: 'var(--rose-dim)',
    icon: '/icons/youtube.svg',
    badge: 'New video',
  },
  {
    provider: 'rss',
    title: 'Flux RSS',
    description:
      "Agrégez n'importe quel flux RSS ou Atom. Blogs tech, actualités, podcasts — tout en un endroit.",
    color: 'var(--amber)',
    dimColor: 'var(--amber-dim)',
    icon: '/icons/rss.svg',
    badge: 'Atom · RSS',
  },
  {
    provider: 'scrap',
    title: 'Web Scraping',
    description:
      "Surveillez les pages web qui n'ont pas de flux RSS. Détectez les changements automatiquement.",
    color: 'var(--green)',
    dimColor: 'var(--green-dim)',
    icon: '/icons/scrap.svg',
    badge: 'HTML · JSON',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-10">
          <span
            className="inline-block text-[11px] font-semibold uppercase tracking-micro px-3 py-1 rounded-full mb-4"
            style={{ background: 'var(--peach-dim)', color: 'var(--peach)' }}
          >
            Quatre sources, un seul flux
          </span>
          <h2 className="font-serif text-[38px] leading-[1.08] tracking-editorial font-normal">
            Tout ce que tu suis,{' '}
            <span className="italic" style={{ color: 'var(--peach)' }}>
              rangé chronologiquement
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map(({ provider, title, description, color, dimColor, icon, badge }) => (
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
