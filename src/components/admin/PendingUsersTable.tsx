'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { adminApprovePendingUserAction, adminRejectPendingUserAction } from '@/lib/admin-actions'
import type { AdminPendingUser } from '@/lib/api-client'
import { useLanguage } from '@/context/LanguageContext'

export function PendingUsersTable({ users }: { users: AdminPendingUser[] }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(id: string, action: typeof adminApprovePendingUserAction) {
    setPending(id)
    setError(null)
    const result = await action(id)
    setPending(null)
    if (result.error) setError(result.error)
    else router.refresh()
  }

  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">{t.admin.pendingUsersNone}</p>
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.admin.name}</TableHead>
            <TableHead>{t.admin.email}</TableHead>
            <TableHead>{t.admin.signupMethod}</TableHead>
            <TableHead>{t.admin.createdOn}</TableHead>
            <TableHead className="text-right">{t.admin.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell className="text-sm">{u.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {u.method === 'password' ? t.admin.signupPassword : u.method}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {new Date(u.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    disabled={pending === u.id}
                    onClick={() => run(u.id, adminApprovePendingUserAction)}
                  >
                    {pending === u.id ? '…' : t.admin.approveRequest}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={pending === u.id}
                    onClick={() => run(u.id, adminRejectPendingUserAction)}
                  >
                    {t.admin.rejectRequest}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
