import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession, getToken } from '@/lib/session'
import { adminGetUser, getUserFeed } from '@/lib/api-client'
import { UserFluxesTable } from '@/components/admin/UserFluxesTable'
import { EditUserDialog } from '@/components/admin/EditUserDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const token = await getToken()
  const { id } = await params

  const [user, feed] = await Promise.all([
    adminGetUser(id, token as string).catch(() => null),
    getUserFeed(id, token as string).catch(() => ({ repositories: [], connectors: {} })),
  ])

  if (!user) notFound()

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/users">← Utilisateurs</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <EditUserDialog user={user} onSuccess={() => {}} />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Flux ({feed.repositories.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <UserFluxesTable userId={id} repositories={feed.repositories} />
        </CardContent>
      </Card>
    </div>
  )
}
