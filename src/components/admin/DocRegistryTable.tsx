'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  adminDeleteDocAction,
  adminCreateDocAction,
  adminUpdateDocAction,
} from '@/lib/admin-actions'
import type { AdminDocRegistry } from '@/lib/api-client'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function EditDocDialog({ doc, onClose }: { doc: AdminDocRegistry; onClose: () => void }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [name, setName] = useState(doc.name)
  const [url, setUrl] = useState(doc.url)
  const [configRaw, setConfigRaw] = useState(JSON.stringify(doc.config, null, 2))
  const [configError, setConfigError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setConfigError(null)

    let config: Record<string, unknown> = {}
    try {
      config = JSON.parse(configRaw) as Record<string, unknown>
    } catch {
      setConfigError(t.admin.invalidJson)
      return
    }

    setPending(true)
    const result = await adminUpdateDocAction(doc.id, { name, url, config })
    setPending(false)

    if (result.error) {
      setError(result.error)
    } else {
      onClose()
      router.refresh()
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t.admin.editDoc}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">{t.admin.name}</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">{t.admin.url}</label>
                <input
                  required
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">{t.admin.configJson}</label>
              <textarea
                value={configRaw}
                onChange={(e) => setConfigRaw(e.target.value)}
                rows={12}
                className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {configError && <p className="text-xs text-destructive">{configError}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t.admin.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t.admin.saving : t.admin.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DocRegistryTable({ registries }: { registries: AdminDocRegistry[] }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [pending, setPending] = useState<number | null>(null)
  const [confirm, setConfirm] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', config: '' })
  const [addPending, setAddPending] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<AdminDocRegistry | null>(null)

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
        setAddError(t.admin.invalidJson)
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
          {showAdd ? t.admin.cancel : t.admin.addDocBtn}
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <h3 className="text-sm font-medium">{t.admin.newDoc}</h3>
          {addError && <p className="text-xs text-destructive">{addError}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">{t.admin.name}</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="React Docs"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">{t.admin.url}</label>
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
            <label className="text-xs font-medium">{t.admin.configJsonOptional}</label>
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
              {addPending ? t.admin.saving : t.admin.save}
            </Button>
          </div>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.admin.name}</TableHead>
            <TableHead>{t.admin.url}</TableHead>
            <TableHead className="text-center">{t.admin.version}</TableHead>
            <TableHead className="text-center">{t.admin.subscribers}</TableHead>
            <TableHead className="text-right">{t.admin.actions}</TableHead>
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
                    <span className="text-xs text-muted-foreground mr-1">
                      {t.admin.confirmDelete}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pending !== null}
                      onClick={() => handleDelete(doc.id)}
                    >
                      {pending === doc.id ? '…' : t.admin.confirm}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirm(null)}>
                      {t.admin.cancel}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditTarget(doc)}>
                      {t.admin.editConfig}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setConfirm(doc.id)}
                    >
                      {t.admin.delete}
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {registries.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                {t.admin.noDoc}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {editTarget && <EditDocDialog doc={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  )
}
