import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { adminListProvidersAction } from '@/lib/admin-actions'
import { ProvidersTable } from '@/components/admin/ProvidersTable'

export default async function AdminProvidersPage() {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const providers = await adminListProvidersAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Providers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajout d&apos;un flux par un utilisateur : automatique ou sur approbation.
        </p>
      </div>
      <ProvidersTable providers={providers} />
    </div>
  )
}
