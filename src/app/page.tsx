import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { CtaButtons } from '@/components/landing/CtaButtons'

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const isLoggedIn = !!session?.user

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
