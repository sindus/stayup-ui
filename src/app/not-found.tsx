import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-serif text-[52px] leading-none" style={{ color: 'var(--peach)' }}>
        404
      </h1>
      <p className="text-muted-foreground">Cette page n&apos;existe pas.</p>
      <Button asChild>
        <Link href="/">Retour à l'accueil</Link>
      </Button>
    </div>
  )
}
