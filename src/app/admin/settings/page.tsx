import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { AdminPasswordForm } from '@/components/admin/AdminPasswordForm'

export default async function AdminSettingsPage() {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-semibold">Mon compte</h1>
        <p className="text-sm text-muted-foreground mt-1">{session.email}</p>
      </div>
      <AdminPasswordForm />
    </div>
  )
}
