'use client'

import { useState } from 'react'
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
import type { ScrapRequest } from '@/types'

function StatusBadge({ status }: { status: ScrapRequest['status'] }) {
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
  return <Badge variant="secondary">{status}</Badge>
}

export function ScrapRequestsTable({ requests }: { requests: ScrapRequest[] }) {
  const { t } = useLanguage()
  const [approveTarget, setApproveTarget] = useState<ScrapRequest | null>(null)

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
                  <Button size="sm" onClick={() => setApproveTarget(req)}>
                    {t.admin.approveRequest}
                  </Button>
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
