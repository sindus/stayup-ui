import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { getSession } from '@/lib/session'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={{ id: session.userId, name: session.name, email: session.email }} />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
