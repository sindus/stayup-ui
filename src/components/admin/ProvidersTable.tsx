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

type Provider = { name: string; displayName: string; flux_approval: 'auto' | 'manual' }

export function ProvidersTable({ providers }: { providers: Provider[] }) {
  const router = useRouter()
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
            <TableHead>Provider</TableHead>
            <TableHead>Ajout d&apos;un flux</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((p) => (
            <TableRow key={p.name}>
              <TableCell className="font-medium">{p.displayName}</TableCell>
              <TableCell>
                {p.flux_approval === 'manual' ? 'Sur approbation d’un admin' : 'Automatique'}
              </TableCell>
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
                      ? 'Passer sur approbation'
                      : 'Passer en automatique'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {providers.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                Aucun provider
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
