import { redirect } from 'next/navigation'
import { getSession, getToken } from '@/lib/session'
import { adminListDocRegistry } from '@/lib/api-client'
import { DocRegistryTable } from '@/components/admin/DocRegistryTable'

export default async function AdminDocumentationPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const token = await getToken()
  const registries = await adminListDocRegistry(token as string).catch(() => [])

  return (
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
  )
}
