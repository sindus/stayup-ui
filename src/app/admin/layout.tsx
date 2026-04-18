import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { logoutAction } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-semibold">
              StayUp Admin
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/admin/users"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Utilisateurs
              </Link>
              <Link
                href="/admin/repositories"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Flux
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{session.email}</span>
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit">
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}
