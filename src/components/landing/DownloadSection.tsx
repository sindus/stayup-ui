'use client'

import { Download, Monitor, Apple, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'

const BASE = 'https://github.com/sindus/stayup-desktop/releases/download/v0.1.0'

const PLATFORMS = [
  {
    icon: Apple,
    label: 'macOS (Apple Silicon)',
    href: `${BASE}/StayUp_0.1.0_aarch64.dmg`,
    noteKey: 'macNote' as const,
  },
  {
    icon: Apple,
    label: 'macOS (Intel)',
    href: `${BASE}/StayUp_0.1.0_x64.dmg`,
    noteKey: 'macNote' as const,
  },
  {
    icon: Monitor,
    label: 'Windows',
    href: `${BASE}/StayUp_0.1.0_x64-setup.exe`,
    noteKey: 'winNote' as const,
  },
  {
    icon: Terminal,
    label: 'Linux',
    href: `${BASE}/StayUp_0.1.0_amd64.AppImage`,
    noteKey: 'linuxNote' as const,
  },
]

export function DownloadSection() {
  const { t } = useLanguage()
  const d = t.landing.download

  return (
    <section className="py-20 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Download className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-bold">{d.title}</h2>
      </div>
      <p className="text-muted-foreground max-w-xl mx-auto mb-10">{d.subtitle}</p>
      <div className="flex flex-wrap gap-4 justify-center">
        {PLATFORMS.map((p) => {
          const Icon = p.icon
          return (
            <Button key={p.label} variant="outline" size="lg" asChild>
              <a href={p.href} target="_blank" rel="noopener noreferrer">
                <Icon className="mr-2 h-4 w-4" />
                <span>{p.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">{d[p.noteKey]}</span>
              </a>
            </Button>
          )
        })}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        {d.allVersions.split('|')[0]}
        <a
          href="https://github.com/sindus/stayup-desktop/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          {d.allVersions}
        </a>
      </p>
    </section>
  )
}
