import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { getServerTranslations } from '@/lib/serverLang'
import { adminListProvidersAction } from '@/lib/admin-actions'
import { ProvidersTable } from '@/components/admin/ProvidersTable'

export default async function AdminProvidersPage() {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const [providers, t] = await Promise.all([adminListProvidersAction(), getServerTranslations()])
  const p = t.admin.pages

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{p.providersTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{p.providersDesc}</p>
      </div>
      <ProvidersTable providers={providers} />
    </div>
  )
}
