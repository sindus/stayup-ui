import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CtaButtons() {
  return (
    <section className="py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Prêt à centraliser votre veille ?</h2>
      <p className="text-muted-foreground mb-8">
        Créez votre compte gratuitement et ajoutez votre premier flux en moins d'une minute.
      </p>
      <div className="flex gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/register">S'inscrire</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    </section>
  )
}
