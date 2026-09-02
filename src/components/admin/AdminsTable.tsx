'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminDeleteAdminAction } from '@/lib/admin-actions'
import type { AdminAccount } from '@/lib/api-client'
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
import { EditAdminDialog } from './EditAdminDialog'

export function AdminsTable({
  admins,
  currentAdminId,
}: {
  admins: AdminAccount[]
  currentAdminId: string
}) {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const [pending, setPending] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setPending(id)
    setError(null)
    const result = await adminDeleteAdminAction(id)
    setPending(null)
    setConfirmId(null)
    if (result.error) setError(result.error)
    else router.refresh()
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.admin.name}</TableHead>
            <TableHead>{t.admin.email}</TableHead>
            <TableHead>{t.admin.role}</TableHead>
            <TableHead>{t.admin.createdOn}</TableHead>
            <TableHead className="text-right">{t.admin.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => {
            // Un super admin ne se supprime ni ne se modifie depuis l'interface ;
            // on ne se supprime pas soi-même non plus.
            const locked = admin.is_super || admin.id === currentAdminId
            return (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">{admin.name}</TableCell>
                <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {admin.is_super ? t.admin.roleSuper : t.admin.roleAdmin}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(admin.created_at).toLocaleDateString(lang)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!admin.is_super && (
                      <EditAdminDialog admin={admin} onSuccess={() => router.refresh()} />
                    )}
                    {locked ? (
                      <span className="text-xs text-muted-foreground pr-2">—</span>
                    ) : confirmId === admin.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={pending === admin.id}
                          onClick={() => handleDelete(admin.id)}
                        >
                          {pending === admin.id ? '…' : t.admin.confirm}
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
                        onClick={() => setConfirmId(admin.id)}
                      >
                        {t.admin.delete}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {admins.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                {t.admin.noAdmins}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
