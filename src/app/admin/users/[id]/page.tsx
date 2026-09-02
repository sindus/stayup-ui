import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAdminSession, getAdminToken } from '@/lib/session'
import { getServerLang, getServerTranslations } from '@/lib/serverLang'
import { adminGetUser, getUserFeed } from '@/lib/api-client'
import { UserFluxesTable } from '@/components/admin/UserFluxesTable'
import { EditUserDialog } from '@/components/admin/EditUserDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const token = await getAdminToken()
  const { id } = await params

  const [user, feed, t, lang] = await Promise.all([
    adminGetUser(id, token as string).catch(() => null),
    getUserFeed(id, token as string).catch(() => ({ repositories: [], connectors: {} })),
    getServerTranslations(),
    getServerLang(),
  ])
  const p = t.admin.pages

  if (!user) notFound()

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/users">← {p.backToUsers}</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {p.joinedOn.replace('{date}', new Date(user.created_at).toLocaleDateString(lang))}
              </p>
            </div>
            <EditUserDialog user={user} onSuccess={() => {}} />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {p.userFeeds.replace('{n}', String(feed.repositories.length))}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <UserFluxesTable userId={id} repositories={feed.repositories} />
        </CardContent>
      </Card>
    </div>
  )
}
