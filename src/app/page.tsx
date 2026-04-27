import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { DownloadSection } from '@/components/landing/DownloadSection'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { getSession } from '@/lib/session'

async function getLatestVersion(): Promise<string> {
  try {
    const res = await fetch('https://api.github.com/repos/sindus/stayup-desktop/releases/latest', {
      next: { revalidate: 3600 },
    })
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
        background: 'hsl(var(--background))',
        backgroundImage:
          'radial-gradient(ellipse 80% 40% at 50% -10%, oklch(0.72 0.22 195 / 0.08), transparent)',
      }}
    >
      <LandingHeader />
      <HeroSection isLoggedIn={isLoggedIn} version={version} />
      <FeaturesSection />
      <DownloadSection version={version} />
    </div>
  )
}
