import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'hsl(var(--background))',
        backgroundImage:
          'radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.72 0.22 195 / 0.06), transparent)',
      }}
    >
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Image src="/logo.svg" width={32} height={32} alt="StayUp" />
        <span className="font-semibold text-lg" style={{ letterSpacing: '-0.02em' }}>
          StayUp
        </span>
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
