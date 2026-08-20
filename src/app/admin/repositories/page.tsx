import { redirect } from 'next/navigation'
import { getAdminSession, getAdminToken } from '@/lib/session'
import { adminListRepositories } from '@/lib/api-client'
import { RepositoriesTable } from '@/components/admin/RepositoriesTable'
import { ScrapCreateForm } from '@/components/admin/ScrapCreateForm'

export default async function AdminRepositoriesPage() {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const token = await getAdminToken()
  const repositories = await adminListRepositories(token as string).catch(() => [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Flux</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {repositories.length} flux —{' '}
          <span className="italic">
            &quot;Vider données&quot; supprime le contenu collecté sans toucher aux abonnements.
            &quot;Supprimer&quot; purge tout (données + abonnements + flux).
          </span>
        </p>
      </div>
      <ScrapCreateForm />
      <RepositoriesTable repositories={repositories} />
    </div>
  )
}
