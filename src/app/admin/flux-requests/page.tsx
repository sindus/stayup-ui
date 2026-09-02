import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { getServerTranslations } from '@/lib/serverLang'
import { adminListFluxRequestsAction } from '@/lib/admin-actions'
import { FluxRequestsTable } from '@/components/admin/FluxRequestsTable'

export default async function AdminFluxRequestsPage() {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const [requests, t] = await Promise.all([adminListFluxRequestsAction(), getServerTranslations()])
  const p = t.admin.pages

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{p.fluxRequestsTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {p.fluxRequestsCount.replace(
            '{n}',
            String(requests.filter((r) => r.status === 'pending').length),
          )}
        </p>
      </div>
      <FluxRequestsTable requests={requests} />
    </div>
  )
}
