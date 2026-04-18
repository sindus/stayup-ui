'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminDeleteUserFluxAction } from '@/lib/admin-actions'
import type { UserRepositoryItem } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const PROVIDER_LABELS: Record<string, string> = {
  changelog: 'Changelog',
  youtube: 'YouTube',
  rss: 'RSS',
  scrap: 'Scrap',
}

export function UserFluxesTable({
  userId,
  repositories,
}: {
  userId: string
  repositories: UserRepositoryItem[]
}) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(linkId: string) {
    setPending(linkId)
    setError(null)
    const result = await adminDeleteUserFluxAction(userId, linkId)
    setPending(null)
    setConfirmId(null)
    if (result.error) {
      setError(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Ajouté le</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repositories.map((repo) => (
            <TableRow key={repo.id}>
              <TableCell>
                <Badge variant="secondary">{PROVIDER_LABELS[repo.provider] ?? repo.provider}</Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm font-mono text-muted-foreground">
                {repo.url}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(repo.created_at).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell className="text-right">
                {confirmId === repo.id ? (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pending === repo.id}
                      onClick={() => handleDelete(repo.id)}
                    >
                      {pending === repo.id ? '…' : 'Confirmer'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmId(repo.id)}
                  >
                    Supprimer
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {repositories.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                Aucun flux configuré
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
