import { redirect } from 'next/navigation'
import { getSession, getToken } from '@/lib/session'
import { adminListDocRegistry } from '@/lib/api-client'
import { adminListDocRequestsAction } from '@/lib/admin-actions'
import { DocRegistryTable } from '@/components/admin/DocRegistryTable'
import { DocRequestsTable } from '@/components/admin/DocRequestsTable'

export default async function AdminDocumentationPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const token = await getToken()
  const [registries, requests] = await Promise.all([
    adminListDocRegistry(token as string).catch(() => []),
    adminListDocRequestsAction(),
  ])

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Documentation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {registries.length} doc{registries.length !== 1 ? 's' : ''} —{' '}
            <span className="italic">
              Le scraping est déclenché par le cron hebdomadaire (dimanche minuit UTC).
            </span>
          </p>
        </div>
        <DocRegistryTable registries={registries} />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Demandes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{pendingCount} en attente</p>
        </div>
        <DocRequestsTable requests={requests} />
      </div>
    </div>
  )
}
