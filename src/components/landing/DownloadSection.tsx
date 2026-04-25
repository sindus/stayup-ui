'use client'

import { Download, Monitor, Apple, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'

const BASE = 'https://github.com/sindus/stayup-desktop/releases/download/v0.2.0'

const PLATFORMS = [
  {
    icon: Apple,
    label: 'macOS (Apple Silicon)',
    href: `${BASE}/StayUp_0.2.0_aarch64.dmg`,
    noteKey: 'macNote' as const,
  },
  {
    icon: Apple,
    label: 'macOS (Intel)',
    href: `${BASE}/StayUp_0.2.0_x64.dmg`,
    noteKey: 'macNote' as const,
  },
  {
    icon: Monitor,
    label: 'Windows',
    href: `${BASE}/StayUp_0.2.0_x64-setup.exe`,
    noteKey: 'winNote' as const,
  },
  {
    icon: Terminal,
    label: 'Linux (.deb)',
    href: `${BASE}/StayUp_0.2.0_amd64.deb`,
    noteKey: 'linuxDebNote' as const,
  },
  {
    icon: Terminal,
    label: 'Linux (AppImage)',
    href: `${BASE}/StayUp_0.2.0_amd64.AppImage`,
    noteKey: 'linuxNote' as const,
  },
]

const SIMPLE_GUIDES = [
  { key: 'mac' as const, icon: Apple, label: 'macOS' },
  { key: 'windows' as const, icon: Monitor, label: 'Windows' },
]

export function DownloadSection() {
  const { t } = useLanguage()
  const d = t.landing.download
  const linux = d.platforms.linux

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

        {/* macOS + Windows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {SIMPLE_GUIDES.map(({ key, icon: Icon, label }) => {
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

        {/* Linux — two formats side by side */}
        <div className="rounded-lg border bg-card p-5 mb-16">
          <div className="flex items-center gap-2 mb-5">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Linux</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {linux.formats.map((fmt) => (
              <div key={fmt.label}>
                <p className="text-xs font-semibold text-foreground mb-3">{fmt.label}</p>
                <ol className="space-y-3">
                  {fmt.install.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground leading-relaxed font-mono text-xs break-all">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* Uninstall guide */}
        <h3 className="text-xl font-semibold text-center mb-3">{d.uninstallTitle}</h3>
        <p className="text-center text-sm text-muted-foreground mb-8">{d.uninstallSubtitle}</p>

        {/* macOS + Windows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {SIMPLE_GUIDES.map(({ key, icon: Icon, label }) => {
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

        {/* Linux uninstall — two formats */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Linux</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {linux.formats.map((fmt) => (
              <div key={fmt.label}>
                <p className="text-xs font-semibold text-foreground mb-3">{fmt.label}</p>
                <ol className="space-y-3">
                  {fmt.uninstall.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-destructive/10 text-destructive text-xs font-medium mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground leading-relaxed font-mono text-xs break-all">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
                {fmt.paths.length > 0 && (
                  <ul className="mt-3 space-y-1.5 pl-8">
                    {fmt.paths.map((p) => (
                      <li key={p}>
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-foreground break-all">
                          {p}
                        </code>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
