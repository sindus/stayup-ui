import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { CtaButtons } from '@/components/landing/CtaButtons'
import { getSession } from '@/lib/session'

export default async function LandingPage() {
  const session = await getSession()
  const isLoggedIn = !!session

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <HeroSection isLoggedIn={isLoggedIn} />
        <FeaturesSection />
        <CtaButtons isLoggedIn={isLoggedIn} />
      </div>
    </main>
  )
}
