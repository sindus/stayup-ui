import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { CtaButtons } from '@/components/landing/CtaButtons'
import { DownloadSection } from '@/components/landing/DownloadSection'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { getSession } from '@/lib/session'

export default async function LandingPage() {
  const session = await getSession()
  const isLoggedIn = !!session

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <LandingHeader />
        <HeroSection isLoggedIn={isLoggedIn} />
        <FeaturesSection />
        <DownloadSection />
        <CtaButtons isLoggedIn={isLoggedIn} />
      </div>
    </main>
  )
}
