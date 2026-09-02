import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { getServerTranslations } from '@/lib/serverLang'
import { adminListDataSourcesAction } from '@/lib/admin-actions'
import { DataSourcesPanel } from '@/components/admin/DataSourcesPanel'

export default async function AdminDataSourcesPage() {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const [data, t] = await Promise.all([adminListDataSourcesAction(), getServerTranslations()])
  const p = t.admin.pages

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{p.dataSourcesTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{p.dataSourcesDesc}</p>
      </div>
      <DataSourcesPanel data={data} />
    </div>
  )
}
