import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { getSession } from '@/lib/session'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}
    >
      <Navbar user={{ id: session.userId, name: session.name, email: session.email }} />
      <main className="flex-1 flex overflow-hidden">{children}</main>
    </div>
  )
}
