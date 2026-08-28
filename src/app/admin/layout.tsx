import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession, getAdminToken, isAdminTokenValid } from '@/lib/session'
import { adminLogoutAction } from '@/lib/auth-actions'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AuroraMark } from '@/components/ui/aurora-mark'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // `session.role` vient d'un payload non signé : il ne prouve rien. La porte, c'est
  // l'API, seule à pouvoir vérifier la signature du token.
  const [session, token] = await Promise.all([getAdminSession(), getAdminToken()])
  if (!session || session.role !== 'admin' || !token) redirect('/admin/login')
  if (!(await isAdminTokenValid(token))) redirect('/admin/login')

  const initial = session.email?.charAt(0)?.toUpperCase() ?? 'A'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
      {/* Sidebar */}
      <aside
        className="w-[200px] shrink-0 flex flex-col"
        style={{ background: 'var(--surface)', borderRight: '1px solid hsl(var(--border))' }}
      >
        {/* Logo + Admin badge */}
        <div
          className="flex items-center gap-2 px-4 py-4"
          style={{ borderBottom: '1px solid hsl(var(--border))' }}
        >
          <Link href="/admin" className="flex items-center gap-2">
            <AuroraMark size={22} />
            <span className="font-semibold text-[14px]" style={{ letterSpacing: '-0.015em' }}>
              stayup
            </span>
          </Link>
          <span
            className="text-[9px] uppercase tracking-micro font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--peach-dim)', color: 'var(--peach)' }}
          >
            admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          <AdminSidebar isSuper={session.isSuper} />
        </nav>

        {/* Footer user card */}
        <div
          className="mx-3 mb-3 rounded-lg p-3 flex items-center gap-2"
          style={{ background: 'var(--surface-2)', border: '1px solid hsl(var(--border))' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--peach), var(--lavender))',
              color: 'var(--peach-on)',
            }}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono text-muted-foreground truncate">{session.email}</p>
          </div>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              title="Déconnexion"
            >
              ↗
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
