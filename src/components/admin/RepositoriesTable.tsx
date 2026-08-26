'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminDeleteRepositoryAction, adminClearRepositoryDataAction } from '@/lib/admin-actions'
import type { AdminRepository } from '@/lib/api-client'
import { providerDisplayName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/context/LanguageContext'
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

type ConfirmMode = 'data' | 'full'

export function RepositoriesTable({ repositories }: { repositories: AdminRepository[] }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [pending, setPending] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ id: number; mode: ConfirmMode } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleClearData(repoId: number) {
    setPending(`data-${repoId}`)
    setError(null)
    const result = await adminClearRepositoryDataAction(repoId)
    setPending(null)
    setConfirm(null)
    if (result.error) setError(result.error)
    else router.refresh()
  }

  async function handleDelete(repoId: number) {
    setPending(`delete-${repoId}`)
    setError(null)
    const result = await adminDeleteRepositoryAction(repoId)
    setPending(null)
    setConfirm(null)
    if (result.error) setError(result.error)
    else router.refresh()
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.admin.type}</TableHead>
            <TableHead>{t.admin.url}</TableHead>
            <TableHead className="text-center">{t.admin.subscribers}</TableHead>
            <TableHead className="text-right">{t.admin.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repositories.map((repo) => (
            <TableRow key={repo.id}>
              <TableCell>
                <Badge variant="secondary">
                  {PROVIDER_LABELS[repo.type] ?? providerDisplayName(repo.type)}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm font-mono text-muted-foreground">
                {repo.url}
              </TableCell>
              <TableCell className="text-center text-sm">{repo.subscriber_count}</TableCell>
              <TableCell className="text-right">
                {confirm?.id === repo.id ? (
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-xs text-muted-foreground mr-1">
                      {confirm.mode === 'data'
                        ? t.admin.confirmClearData
                        : t.admin.confirmDeleteFlux}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pending !== null}
                      onClick={() =>
                        confirm.mode === 'data' ? handleClearData(repo.id) : handleDelete(repo.id)
                      }
                    >
                      {pending !== null ? '…' : t.admin.confirm}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirm(null)}>
                      {t.admin.cancel}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirm({ id: repo.id, mode: 'data' })}
                    >
                      {t.admin.clearData}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setConfirm({ id: repo.id, mode: 'full' })}
                    >
                      {t.admin.delete}
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {repositories.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                {t.admin.noFlux}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
