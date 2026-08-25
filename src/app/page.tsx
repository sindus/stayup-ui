import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { DownloadSection } from '@/components/landing/DownloadSection'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { AuroraWordmark } from '@/components/ui/aurora-mark'
import { getSession } from '@/lib/session'

async function getLatestVersion(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/stayup-app/stayup-desktop/releases/latest',
      {
        next: { revalidate: 3600 },
      },
    )
    if (!res.ok) throw new Error()
    const data = await res.json()
    return (data.tag_name as string).replace(/^v/, '')
  } catch {
    return '0.3.8'
  }
}

export default async function LandingPage() {
  const [session, version] = await Promise.all([getSession(), getLatestVersion()])
  const isLoggedIn = !!session

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--bg)',
        backgroundImage:
          'radial-gradient(ellipse 80% 40% at 50% -10%, var(--peach-dim), transparent)',
      }}
    >
      <LandingHeader />
      <HeroSection isLoggedIn={isLoggedIn} version={version} />
      <FeaturesSection />
      <DownloadSection version={version} />

      <footer className="py-8" style={{ borderTop: '1px solid var(--border-soft)' }}>
        <div className="max-w-[1200px] mx-auto px-8 flex items-center justify-between">
          <AuroraWordmark size={13} />
          <nav className="flex gap-6 text-[12px] text-muted-foreground">
            <a
              href="https://github.com/stayup-app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fg transition-colors"
            >
              GitHub
            </a>
            <a href="#download" className="hover:text-fg transition-colors">
              Télécharger
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
