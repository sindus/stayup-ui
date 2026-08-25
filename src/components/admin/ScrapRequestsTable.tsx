'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrapRequestApproveDialog } from './ScrapRequestApproveDialog'
import { adminRejectScrapRequestAction } from '@/lib/admin-actions'
import type { ScrapRequest } from '@/types'

function StatusBadge({ status }: { status: ScrapRequest['status'] }) {
  if (status === 'pending') {
    return (
      <Badge style={{ background: 'var(--peach-dim)', color: 'var(--peach)' }}>En attente</Badge>
    )
  }
  if (status === 'approved') {
    return <Badge style={{ background: 'var(--sage-dim)', color: 'var(--sage)' }}>Approuvé</Badge>
  }
  if (status === 'rejected') {
    return <Badge style={{ background: 'var(--rose-dim)', color: 'var(--rose)' }}>Refusé</Badge>
  }
  return <Badge variant="secondary">{status}</Badge>
}

export function ScrapRequestsTable({ requests }: { requests: ScrapRequest[] }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [approveTarget, setApproveTarget] = useState<ScrapRequest | null>(null)
  const [rejectPending, setRejectPending] = useState<string | null>(null)

  async function handleReject(requestId: string) {
    setRejectPending(requestId)
    await adminRejectScrapRequestAction(requestId)
    setRejectPending(null)
    router.refresh()
  }

  if (requests.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">{t.admin.noScrapRequests}</p>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Statut</TableHead>
            <TableHead>{t.admin.url}</TableHead>
            <TableHead>{t.admin.email}</TableHead>
            <TableHead>{t.admin.createdOn}</TableHead>
            <TableHead>{t.admin.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell>
                <StatusBadge status={req.status} />
              </TableCell>
              <TableCell className="max-w-xs truncate font-mono text-xs">{req.url}</TableCell>
              <TableCell className="text-sm">{req.user_email}</TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {new Date(req.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {req.status === 'pending' && (
                  <div className="flex items-center gap-1">
                    <Button size="sm" onClick={() => setApproveTarget(req)}>
                      {t.admin.approveRequest}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={rejectPending === req.id}
                      onClick={() => handleReject(req.id)}
                    >
                      {rejectPending === req.id ? '…' : t.admin.rejectRequest}
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {approveTarget && (
        <ScrapRequestApproveDialog request={approveTarget} onClose={() => setApproveTarget(null)} />
      )}
    </>
  )
}
