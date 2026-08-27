'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/** Sommaire latéral : suit la section visible pendant le défilement. */
export function DocNav({
  title,
  entries,
}: {
  title: string
  entries: { id: string; label: string; nested?: boolean }[]
}) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const sections = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id)
      },
      // Une bande étroite en haut de l'écran : la section « active » est celle qui
      // vient de passer sous l'en-tête, pas celle qui occupe le plus de place.
      { rootMargin: '-72px 0px -70% 0px', threshold: 0 },
    )
    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
  }, [entries])

  return (
    <nav
      aria-label={title}
      className="hidden lg:block w-[240px] shrink-0 sticky top-14 self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-4"
    >
      <p
        className="text-[10px] font-mono font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'var(--dim)' }}
      >
        {title}
      </p>
      <ul className="space-y-0.5">
        {entries.map(({ id, label, nested }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? 'location' : undefined}
              className={cn(
                'block rounded-md py-1.5 text-[13.5px] transition-colors hover:text-fg',
                nested ? 'pl-5 pr-2.5' : 'px-2.5',
              )}
              style={
                active === id
                  ? { background: 'var(--surface)', color: 'var(--fg)' }
                  : { color: 'var(--fg-soft)' }
              }
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Onglets des options de déploiement. */
export function DocTabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [current, setCurrent] = useState(0)

  return (
    <div>
      <div
        role="tablist"
        className="flex flex-wrap gap-1 mb-4 p-1 rounded-lg w-fit"
        style={{ background: 'var(--surface)' }}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            id={`doc-tab-${i}`}
            aria-selected={current === i}
            aria-controls={`doc-panel-${i}`}
            onClick={() => setCurrent(i)}
            className="px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors"
            style={
              current === i
                ? { background: 'var(--peach-dim)', color: 'var(--peach)' }
                : { color: 'var(--fg-soft)' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`doc-panel-${i}`}
          aria-labelledby={`doc-tab-${i}`}
          hidden={current !== i}
        >
          {current === i && tab.content}
        </div>
      ))}
    </div>
  )
}

/** Checklist cochable — l'état ne vit que le temps de la visite, c'est un aide-mémoire. */
export function DocChecklist({ items }: { items: { code: string; label: string }[] }) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false))

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={item.code}>
          <button
            type="button"
            aria-pressed={done[i]}
            onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
            className="flex w-full items-start gap-3 rounded-[10px] p-3 text-left transition-colors"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
          >
            <span
              aria-hidden
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[11px] font-bold"
              style={
                done[i]
                  ? { background: 'var(--sage)', color: 'var(--peach-on)' }
                  : { border: '1px solid var(--border-color)' }
              }
            >
              {done[i] ? '✓' : ''}
            </span>
            <span
              className="text-[14px] leading-relaxed"
              style={{
                color: done[i] ? 'var(--dim)' : 'var(--fg-soft)',
                textDecoration: done[i] ? 'line-through' : undefined,
              }}
            >
              <code
                className="font-mono text-[13px] px-1.5 py-0.5 rounded mr-1.5"
                style={{ background: 'var(--surface-2)', color: 'var(--peach)' }}
              >
                {item.code}
              </code>
              {item.label}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
