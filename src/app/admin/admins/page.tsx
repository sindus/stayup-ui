import { redirect } from 'next/navigation'
import { getAdminSession, getAdminToken } from '@/lib/session'
import { getServerTranslations } from '@/lib/serverLang'
import { adminListAdmins } from '@/lib/api-client'
import { AdminsTable } from '@/components/admin/AdminsTable'
import { CreateAdminDialog } from '@/components/admin/CreateAdminDialog'

export default async function AdminsPage() {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')
  // La gestion des admins est réservée au super admin.
  if (!session.isSuper) redirect('/admin')

  const token = await getAdminToken()
  const [admins, t] = await Promise.all([
    adminListAdmins(token as string).catch(() => []),
    getServerTranslations(),
  ])
  const p = t.admin.pages

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{p.adminsTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {p.adminsCount.replace('{n}', String(admins.length))}
          </p>
        </div>
        <CreateAdminDialog />
      </div>
      <AdminsTable admins={admins} currentAdminId={session.userId} />
    </div>
  )
}
