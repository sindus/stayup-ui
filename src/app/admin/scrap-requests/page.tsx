import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { adminListScrapRequestsAction } from '@/lib/admin-actions'
import { ScrapRequestsTable } from '@/components/admin/ScrapRequestsTable'

export default async function AdminScrapRequestsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const requests = await adminListScrapRequestsAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Demandes de scraping</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {requests.filter((r) => r.status === 'pending').length} en attente
        </p>
      </div>
      <ScrapRequestsTable requests={requests} />
    </div>
  )
}
