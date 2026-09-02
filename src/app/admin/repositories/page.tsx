import { redirect } from 'next/navigation'
import { getAdminSession, getAdminToken } from '@/lib/session'
import { getServerTranslations } from '@/lib/serverLang'
import { adminListRepositories } from '@/lib/api-client'
import { RepositoriesTable } from '@/components/admin/RepositoriesTable'

export default async function AdminRepositoriesPage() {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const token = await getAdminToken()
  const [repositories, t] = await Promise.all([
    adminListRepositories(token as string).catch(() => []),
    getServerTranslations(),
  ])
  const p = t.admin.pages

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{p.feedsTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {p.feedsDesc.replace('{n}', String(repositories.length))}
        </p>
      </div>
      <RepositoriesTable repositories={repositories} />
    </div>
  )
}
