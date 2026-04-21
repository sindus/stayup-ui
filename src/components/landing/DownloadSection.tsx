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
    platformKey: 'mac' as const,
  },
  {
    icon: Apple,
    label: 'macOS (Intel)',
    href: `${BASE}/StayUp_0.1.0_x64.dmg`,
    noteKey: 'macNote' as const,
    platformKey: 'mac' as const,
  },
  {
    icon: Monitor,
    label: 'Windows',
    href: `${BASE}/StayUp_0.1.0_x64-setup.exe`,
    noteKey: 'winNote' as const,
    platformKey: 'windows' as const,
  },
  {
    icon: Terminal,
    label: 'Linux',
    href: `${BASE}/StayUp_0.1.0_amd64.AppImage`,
    noteKey: 'linuxNote' as const,
    platformKey: 'linux' as const,
  },
]

const PLATFORM_GUIDES = [
  { key: 'mac' as const, icon: Apple, label: 'macOS' },
  { key: 'windows' as const, icon: Monitor, label: 'Windows' },
  { key: 'linux' as const, icon: Terminal, label: 'Linux' },
]

export function DownloadSection() {
  const { t } = useLanguage()
  const d = t.landing.download

  return (
    <section className="py-20">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Download className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">{d.title}</h2>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">{d.subtitle}</p>
      </div>

      {/* Download buttons */}
      <div className="flex flex-wrap gap-4 justify-center mb-4">
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

      <p className="text-center mb-16">
        <a
          href="https://github.com/sindus/stayup-desktop/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >
          {d.allVersions}
        </a>
      </p>

      {/* Installation guide */}
      <div className="max-w-5xl mx-auto px-4">
        <h3 className="text-xl font-semibold text-center mb-8">{d.installTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLATFORM_GUIDES.map(({ key, icon: Icon, label }) => {
            const steps = d.platforms[key].install
            return (
              <div key={key} className="rounded-lg border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{label}</span>
                </div>
                <ol className="space-y-3">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )
          })}
        </div>

        {/* Uninstall guide */}
        <h3 className="text-xl font-semibold text-center mb-3">{d.uninstallTitle}</h3>
        <p className="text-center text-sm text-muted-foreground mb-8">{d.uninstallSubtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLATFORM_GUIDES.map(({ key, icon: Icon, label }) => {
            const { uninstall: steps, paths } = d.platforms[key]
            return (
              <div key={key} className="rounded-lg border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{label}</span>
                </div>
                <ol className="space-y-3">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-destructive/10 text-destructive text-xs font-medium mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
                {paths.length > 0 && (
                  <ul className="mt-3 space-y-1.5 pl-8">
                    {paths.map((p) => (
                      <li key={p}>
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-foreground break-all">
                          {p}
                        </code>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
