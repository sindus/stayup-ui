import Link from 'next/link'
import { AuroraMark } from '@/components/ui/aurora-mark'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'var(--bg)',
        backgroundImage:
          'radial-gradient(ellipse 60% 50% at 50% 0%, var(--peach-dim), transparent), radial-gradient(ellipse 50% 40% at 10% 20%, var(--lavender-dim), transparent)',
      }}
    >
      <Link href="/" className="mb-8">
        <AuroraMark size={56} />
      </Link>
      {children}
      <Link
        href="/"
        className="mt-6 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Retour à l&apos;accueil
      </Link>
    </div>
  )
}
