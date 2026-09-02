'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { adminSetProviderApprovalAction } from '@/lib/admin-actions'
import { useLanguage } from '@/context/LanguageContext'

type Provider = { name: string; displayName: string; flux_approval: 'auto' | 'manual' }

export function ProvidersTable({ providers }: { providers: Provider[] }) {
  const router = useRouter()
  const { t } = useLanguage()
  const pt = t.admin.providersTable
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle(p: Provider) {
    setPending(p.name)
    setError(null)
    const next = p.flux_approval === 'auto' ? 'manual' : 'auto'
    const result = await adminSetProviderApprovalAction(p.name, next)
    setPending(null)
    if (result.error) setError(result.error)
    else router.refresh()
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{pt.provider}</TableHead>
            <TableHead>{pt.addingFeed}</TableHead>
            <TableHead className="text-right">{pt.action}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((p) => (
            <TableRow key={p.name}>
              <TableCell className="font-medium">{p.displayName}</TableCell>
              <TableCell>{p.flux_approval === 'manual' ? pt.onApproval : pt.auto}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending === p.name}
                  onClick={() => toggle(p)}
                >
                  {pending === p.name
                    ? '…'
                    : p.flux_approval === 'auto'
                      ? pt.switchToApproval
                      : pt.switchToAuto}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {providers.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                {pt.none}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
