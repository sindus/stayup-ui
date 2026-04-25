'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminDeleteDocAction, adminCreateDocAction } from '@/lib/admin-actions'
import type { AdminDocRegistry } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function DocRegistryTable({ registries }: { registries: AdminDocRegistry[] }) {
  const router = useRouter()
  const [pending, setPending] = useState<number | null>(null)
  const [confirm, setConfirm] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', config: '' })
  const [addPending, setAddPending] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  async function handleDelete(docId: number) {
    setPending(docId)
    setError(null)
    const result = await adminDeleteDocAction(docId)
    setPending(null)
    setConfirm(null)
    if (result.error) setError(result.error)
    else router.refresh()
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddPending(true)
    setAddError(null)
    let config: Record<string, unknown> = {}
    if (form.config.trim()) {
      try {
        config = JSON.parse(form.config)
      } catch {
        setAddError('Configuration JSON invalide.')
        setAddPending(false)
        return
      }
    }
    const result = await adminCreateDocAction({ name: form.name, url: form.url, config })
    setAddPending(false)
    if (result.error) {
      setAddError(result.error)
    } else {
      setForm({ name: '', url: '', config: '' })
      setShowAdd(false)
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? 'Annuler' : '+ Ajouter un doc'}
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <h3 className="text-sm font-medium">Nouveau doc</h3>
          {addError && <p className="text-xs text-destructive">{addError}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Nom</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="React Docs"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">URL</label>
              <input
                required
                type="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://react.dev"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">
              Config JSON <span className="text-muted-foreground font-normal">(optionnel)</span>
            </label>
            <textarea
              value={form.config}
              onChange={(e) => setForm((f) => ({ ...f, config: e.target.value }))}
              placeholder='{"chapters": [{"page": "https://react.dev/reference/react", "path": ".reference-content"}]}'
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={addPending}>
              {addPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="text-center">Version</TableHead>
            <TableHead className="text-center">Abonnés</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registries.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium text-sm">{doc.name}</TableCell>
              <TableCell className="max-w-xs truncate text-xs font-mono text-muted-foreground">
                {doc.url}
              </TableCell>
              <TableCell className="text-center text-sm">
                {doc.current_version ?? <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell className="text-center text-sm">{doc.subscriber_count}</TableCell>
              <TableCell className="text-right">
                {confirm === doc.id ? (
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-xs text-muted-foreground mr-1">Supprimer ?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pending !== null}
                      onClick={() => handleDelete(doc.id)}
                    >
                      {pending === doc.id ? '…' : 'Confirmer'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirm(null)}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirm(doc.id)}
                  >
                    Supprimer
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {registries.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Aucun doc enregistré
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
