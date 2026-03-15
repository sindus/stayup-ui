import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { CtaButtons } from '@/components/landing/CtaButtons'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <HeroSection />
        <FeaturesSection />
        <CtaButtons />
      </div>
    </main>
  )
}
