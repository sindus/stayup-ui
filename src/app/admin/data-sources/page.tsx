import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { adminListDataSourcesAction } from '@/lib/admin-actions'
import { DataSourcesPanel } from '@/components/admin/DataSourcesPanel'

export default async function AdminDataSourcesPage() {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const data = await adminListDataSourcesAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bases de données</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Une base principale pour l&apos;instance, des bases secondaires pour agréger des flux
          venant d&apos;autres sources.
        </p>
      </div>
      <DataSourcesPanel data={data} />
    </div>
  )
}
