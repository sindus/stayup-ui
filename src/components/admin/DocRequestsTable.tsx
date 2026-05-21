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
import { DocRequestApproveDialog } from './DocRequestApproveDialog'
import { adminRejectDocRequestAction } from '@/lib/admin-actions'
import type { DocRequest } from '@/types'

function StatusBadge({ status }: { status: DocRequest['status'] }) {
  if (status === 'pending') {
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
        En attente
      </Badge>
    )
  }
  if (status === 'approved') {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
        Approuvé
      </Badge>
    )
  }
  if (status === 'rejected') {
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
        Refusé
      </Badge>
    )
  }
  return <Badge variant="secondary">{status}</Badge>
}

export function DocRequestsTable({ requests }: { requests: DocRequest[] }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [approveTarget, setApproveTarget] = useState<DocRequest | null>(null)
  const [rejectPending, setRejectPending] = useState<string | null>(null)

  async function handleReject(requestId: string) {
    setRejectPending(requestId)
    await adminRejectDocRequestAction(requestId)
    setRejectPending(null)
    router.refresh()
  }

  if (requests.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">{t.admin.noDocRequests}</p>
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
        <DocRequestApproveDialog request={approveTarget} onClose={() => setApproveTarget(null)} />
      )}
    </>
  )
}
