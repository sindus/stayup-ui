'use client'

import { Download, Monitor, Apple, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'

function makePlatforms(version: string) {
  const base = `https://github.com/stayup-app/stayup-desktop/releases/download/v${version}`
  return [
    {
      icon: Apple,
      label: 'Homebrew',
      href: null,
      noteKey: 'brewNote' as const,
      command: 'brew install --cask stayup-app/tap/stayup',
    },
    {
      icon: Apple,
      label: 'macOS (Apple Silicon)',
      href: `${base}/StayUp_${version}_aarch64.dmg`,
      noteKey: 'macNote' as const,
      command: null,
    },
    {
      icon: Apple,
      label: 'macOS (Intel)',
      href: `${base}/StayUp_${version}_x64.dmg`,
      noteKey: 'macNote' as const,
      command: null,
    },
    {
      icon: Monitor,
      label: 'Windows',
      href: `${base}/StayUp_${version}_x64-setup.exe`,
      noteKey: 'winNote' as const,
      command: null,
    },
    {
      icon: Terminal,
      label: 'Snap',
      href: null,
      noteKey: 'snapNote' as const,
      command: 'sudo snap install stayup',
    },
    {
      icon: Terminal,
      label: 'Linux (.deb)',
      href: `${base}/StayUp_${version}_amd64.deb`,
      noteKey: 'linuxDebNote' as const,
      command: null,
    },
    {
      icon: Terminal,
      label: 'Linux (AppImage)',
      href: `${base}/StayUp_${version}_amd64.AppImage`,
      noteKey: 'linuxNote' as const,
      command: null,
    },
  ]
}

export function DownloadSection({ version }: { version: string }) {
  const { t } = useLanguage()
  const d = t.landing.download
  const linux = d.platforms.linux
  const PLATFORMS = makePlatforms(version)

  const macFormats = [
    {
      label: 'Homebrew',
      mono: true,
      install: d.platforms.brew.install,
      uninstall: d.platforms.brew.uninstall,
      paths: d.platforms.brew.paths,
    },
    {
      label: '.dmg',
      mono: false,
      install: d.platforms.mac.install,
      uninstall: d.platforms.mac.uninstall,
      paths: d.platforms.mac.paths,
    },
  ]

  return (
    <section id="download" className="py-20" style={{ borderTop: '1px solid hsl(var(--border))' }}>
      {/* Header */}
      <div className="text-center mb-10 max-w-[1200px] mx-auto px-8">
        <span
          className="inline-block text-[11px] font-mono font-semibold px-3 py-1 rounded-full mb-4"
          style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
        >
          v{version}
        </span>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Download className="h-5 w-5 text-primary" />
          <h2 className="text-[36px] font-bold" style={{ letterSpacing: '-0.03em' }}>
            {d.title}
          </h2>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto text-[13.5px]">{d.subtitle}</p>
      </div>

      {/* Download buttons */}
      <div className="flex flex-wrap gap-3 justify-center mb-4 max-w-[1200px] mx-auto px-8">
        {PLATFORMS.map((p) => {
          const Icon = p.icon
          if (p.command) {
            return (
              <Button key={p.label} variant="outline" asChild>
                <code
                  className="cursor-pointer font-mono text-xs"
                  onClick={() => navigator.clipboard.writeText(p.command!)}
                  title="Copier"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{p.command}</span>
                </code>
              </Button>
            )
          }
          return (
            <Button key={p.label} variant="outline" asChild>
              <a href={p.href!} target="_blank" rel="noopener noreferrer">
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
          href="https://github.com/stayup-app/stayup-desktop/releases"
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

        {/* macOS */}
        <div
          className="rounded-[10px] p-5 mb-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Apple className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">macOS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {macFormats.map((fmt) => (
              <div key={fmt.label}>
                <p className="text-xs font-semibold text-foreground mb-3">{fmt.label}</p>
                <ol className="space-y-3">
                  {fmt.install.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span
                        className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-mono font-medium mt-0.5"
                        style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={`text-muted-foreground leading-relaxed${fmt.mono ? ' font-mono text-xs break-all' : ''}`}
                      >
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* Windows */}
        <div
          className="rounded-[10px] p-5 mb-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Windows</span>
          </div>
          <ol className="space-y-3">
            {d.platforms.windows.install.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span
                  className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-mono font-medium mt-0.5"
                  style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
                >
                  {i + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Linux */}
        <div
          className="rounded-[10px] p-5 mb-16"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
        >
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
                      <span
                        className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-mono font-medium mt-0.5"
                        style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
                      >
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

        {/* macOS uninstall */}
        <div
          className="rounded-[10px] p-5 mb-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Apple className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">macOS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {macFormats.map((fmt) => (
              <div key={fmt.label}>
                <p className="text-xs font-semibold text-foreground mb-3">{fmt.label}</p>
                <ol className="space-y-3">
                  {fmt.uninstall.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span
                        className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-mono font-medium mt-0.5"
                        style={{ background: 'var(--rose-dim)', color: 'var(--rose)' }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={`text-muted-foreground leading-relaxed${fmt.mono ? ' font-mono text-xs break-all' : ''}`}
                      >
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
                {fmt.paths.length > 0 && (
                  <ul className="mt-3 space-y-1.5 pl-8">
                    {fmt.paths.map((p) => (
                      <li key={p}>
                        <code
                          className="text-xs px-2 py-0.5 rounded font-mono text-foreground break-all"
                          style={{ background: 'var(--surface-2)' }}
                        >
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

        {/* Windows uninstall */}
        <div
          className="rounded-[10px] p-5 mb-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Windows</span>
          </div>
          <ol className="space-y-3">
            {d.platforms.windows.uninstall.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span
                  className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-mono font-medium mt-0.5"
                  style={{ background: 'var(--rose-dim)', color: 'var(--rose)' }}
                >
                  {i + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          {d.platforms.windows.paths.length > 0 && (
            <ul className="mt-3 space-y-1.5 pl-8">
              {d.platforms.windows.paths.map((p) => (
                <li key={p}>
                  <code
                    className="text-xs px-2 py-0.5 rounded font-mono text-foreground break-all"
                    style={{ background: 'var(--surface-2)' }}
                  >
                    {p}
                  </code>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Linux uninstall */}
        <div
          className="rounded-[10px] p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
        >
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
                      <span
                        className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-mono font-medium mt-0.5"
                        style={{ background: 'var(--rose-dim)', color: 'var(--rose)' }}
                      >
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
                        <code
                          className="text-xs px-2 py-0.5 rounded font-mono text-foreground break-all"
                          style={{ background: 'var(--surface-2)' }}
                        >
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
