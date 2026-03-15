import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="font-semibold text-lg">
            StayUp
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">{children}</main>
    </div>
  )
}
