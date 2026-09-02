import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { getSession, isTokenExpired } from '@/lib/session'
import { readInstances } from '@/lib/instances'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const servers = (await readInstances()).map((i) => ({
    id: i.id,
    name: i.name,
    expired: isTokenExpired(i.token),
  }))

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}
    >
      <Navbar
        user={{ id: session.userId, name: session.name, email: session.email }}
        servers={servers}
      />
      <main className="flex-1 flex overflow-hidden">{children}</main>
    </div>
  )
}
