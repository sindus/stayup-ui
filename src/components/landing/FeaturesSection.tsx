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
    <section className="py-16">
      <div className="max-w-[1200px] mx-auto px-8">
        <h2 className="text-[36px] font-bold text-center mb-3" style={{ letterSpacing: '-0.03em' }}>
          4 sources, un seul flux
        </h2>
        <p className="text-center text-muted-foreground mb-10">
          Suivez tout ce qui compte dans un feed unifié et personnalisé.
        </p>

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
                const el = e.currentTarget
                el.style.borderColor = 'hsl(var(--border))'
                el.style.boxShadow = `0 0 0 1px color-mix(in srgb, ${color} 12%, transparent)`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'var(--border-subtle)'
                el.style.boxShadow = 'none'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
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
                className="text-[18px] font-bold mb-2"
                style={{ letterSpacing: '-0.02em', color }}
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
