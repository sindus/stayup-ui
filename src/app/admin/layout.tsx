import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { logoutAction } from '@/lib/auth-actions'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

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
            <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
              <rect width="26" height="26" rx="6" fill="var(--teal)" />
              <path d="M13 6L19.5 15H15V20H11V15H6.5L13 6Z" fill="#09090b" />
            </svg>
            <span className="font-semibold text-[14px]" style={{ letterSpacing: '-0.02em' }}>
              StayUp
            </span>
          </Link>
          <span
            className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--rose-dim)', color: 'var(--rose)' }}
          >
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          <AdminSidebar />
        </nav>

        {/* Footer user card */}
        <div
          className="mx-3 mb-3 rounded-lg p-3 flex items-center gap-2"
          style={{ background: 'var(--surface-2)', border: '1px solid hsl(var(--border))' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--teal), oklch(0.65 0.22 280))' }}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono text-muted-foreground truncate">{session.email}</p>
          </div>
          <form action={logoutAction}>
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
