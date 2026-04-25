import { redirect } from 'next/navigation'
import { getSession, getToken } from '@/lib/session'
import { getScrapRepos } from '@/lib/api-client'
import { ScrapList } from '@/components/feed/ScrapList'

export default async function ScrapPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const token = await getToken()
  const repos = await getScrapRepos(token as string).catch(() => [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Scraping web</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivez les pages web disponibles dans votre flux
        </p>
      </div>
      <ScrapList repos={repos} />
    </div>
  )
}
