import { redirect } from 'next/navigation'
import { getSession, getToken } from '@/lib/session'
import { adminListUsers } from '@/lib/api-client'
import { UsersTable } from '@/components/admin/UsersTable'

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const token = await getToken()
  const users = await adminListUsers(token as string).catch(() => [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground mt-1">{users.length} utilisateur(s)</p>
      </div>
      <UsersTable users={users} />
    </div>
  )
}
