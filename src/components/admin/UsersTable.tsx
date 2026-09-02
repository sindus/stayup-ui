'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminDeleteUserAction } from '@/lib/admin-actions'
import type { AdminUser } from '@/lib/api-client'
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
import { EditUserDialog } from './EditUserDialog'

export function UsersTable({ users }: { users: AdminUser[] }) {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const [pending, setPending] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(userId: string) {
    setPending(userId)
    setError(null)
    const result = await adminDeleteUserAction(userId)
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
            <TableHead>{t.admin.name}</TableHead>
            <TableHead>{t.admin.email}</TableHead>
            <TableHead>{t.admin.createdOn}</TableHead>
            <TableHead className="text-right">{t.admin.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(user.created_at).toLocaleDateString(lang)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/users/${user.id}`}>{t.admin.fluxLinks}</Link>
                  </Button>
                  <EditUserDialog user={user} onSuccess={() => router.refresh()} />
                  {confirmId === user.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pending === user.id}
                        onClick={() => handleDelete(user.id)}
                      >
                        {pending === user.id ? '…' : t.admin.confirm}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>
                        {t.admin.cancel}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setConfirmId(user.id)}
                    >
                      {t.admin.delete}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                {t.admin.noUsers}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
