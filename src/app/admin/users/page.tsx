import { redirect } from 'next/navigation'
import { getAdminSession, getAdminToken } from '@/lib/session'
import { adminListPendingUsersAction } from '@/lib/admin-actions'
import { adminListUsers } from '@/lib/api-client'
import { PendingUsersTable } from '@/components/admin/PendingUsersTable'
import { UsersTable } from '@/components/admin/UsersTable'

export default async function AdminUsersPage() {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const token = await getAdminToken()
  const [users, pending] = await Promise.all([
    adminListUsers(token as string).catch(() => []),
    adminListPendingUsersAction(),
  ])

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Comptes en attente</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {pending.length} en attente d&apos;approbation
            </p>
          </div>
          <PendingUsersTable users={pending} />
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} utilisateur(s)</p>
        </div>
        <UsersTable users={users} />
      </div>
    </div>
  )
}
