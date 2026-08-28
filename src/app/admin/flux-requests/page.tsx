import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { adminListFluxRequestsAction } from '@/lib/admin-actions'
import { FluxRequestsTable } from '@/components/admin/FluxRequestsTable'

export default async function AdminFluxRequestsPage() {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const requests = await adminListFluxRequestsAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Demandes de flux</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {requests.filter((r) => r.status === 'pending').length} en attente
        </p>
      </div>
      <FluxRequestsTable requests={requests} />
    </div>
  )
}
