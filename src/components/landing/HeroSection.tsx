import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="py-24 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight mb-6">
        Restez à jour,{' '}
        <span className="text-primary">sans effort</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
        StayUp agrège les dernières mises à jour de vos projets GitHub et chaînes YouTube en un seul
        flux personnalisé.
      </p>
      <div className="flex gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/register">Commencer gratuitement</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    </section>
  )
}
