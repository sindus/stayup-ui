import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { adminListDocRequestsAction } from '@/lib/admin-actions'
import { DocRequestsTable } from '@/components/admin/DocRequestsTable'

export default async function AdminDocRequestsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const requests = await adminListDocRequestsAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Demandes de documentation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {requests.filter((r) => r.status === 'pending').length} en attente
        </p>
      </div>
      <DocRequestsTable requests={requests} />
    </div>
  )
}
