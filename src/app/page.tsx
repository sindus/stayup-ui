import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { DownloadSection } from '@/components/landing/DownloadSection'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { getSession } from '@/lib/session'

export default async function LandingPage() {
  const session = await getSession()
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
      <HeroSection isLoggedIn={isLoggedIn} />
      <FeaturesSection />
      <DownloadSection />
    </div>
  )
}
