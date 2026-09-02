'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  adminAddDataSourceAction,
  adminDeleteDataSourceAction,
  adminTestDataSourceAction,
} from '@/lib/admin-actions'
import { useLanguage } from '@/context/LanguageContext'
import type { DataSource, DataSourceProbe, DataSourcesResponse } from '@/lib/api-client'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-[13px]">{value}</span>
    </div>
  )
}

function AddDialog({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage()
  const d = t.admin.dataSources
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [probe, setProbe] = useState<DataSourceProbe | null>(null)
  const [pending, setPending] = useState<'test' | 'add' | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setName('')
    setUrl('')
    setProbe(null)
    setError(null)
    setPending(null)
  }

  async function test() {
    setPending('test')
    setError(null)
    setProbe(await adminTestDataSourceAction(url.trim()))
    setPending(null)
  }

  async function confirm() {
    setPending('add')
    setError(null)
    const result = await adminAddDataSourceAction({ name: name.trim(), url: url.trim() })
    setPending(null)
    if (result.error) {
      setError(result.error)
      return
    }
    setOpen(false)
    reset()
    onDone()
  }

  const canConfirm = name.trim() !== '' && probe?.ok === true && probe.connectors.length > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">{d.addSecondary}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{d.newSecondary}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="ds-name">{d.name}</Label>
            <Input
              id="ds-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={d.namePlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ds-url">{d.connectionUrl}</Label>
            <Input
              id="ds-url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setProbe(null)
              }}
              placeholder="postgres://user:pass@host:5432/db"
            />
            <p className="text-[12px] text-muted-foreground">{d.connectionHint}</p>
          </div>

          {probe?.ok === false && <p className="text-sm text-destructive">{probe.error}</p>}
          {probe?.ok === true && (
            <div className="rounded-md border border-border p-3 text-[13px]">
              <p>
                {d.engine} <span className="font-mono">{probe.engine}</span>
              </p>
              {probe.connectors.length > 0 ? (
                <p className="mt-1">
                  {d.connectorsFound}{' '}
                  <span className="font-mono">{probe.connectors.join(', ')}</span>
                </p>
              ) : (
                <p className="mt-1 text-destructive">{d.noConnectors}</p>
              )}
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={test}
              disabled={pending !== null || url.trim() === ''}
            >
              {pending === 'test' ? d.testing : d.test}
            </Button>
            <Button type="button" onClick={confirm} disabled={pending !== null || !canConfirm}>
              {pending === 'add' ? d.adding : d.confirm}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SourceRow({ source, onDone }: { source: DataSource; onDone: () => void }) {
  const { t } = useLanguage()
  const d = t.admin.dataSources
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function remove() {
    if (!window.confirm(d.removeConfirm.replace('{name}', source.name))) {
      return
    }
    setPending(true)
    setError(null)
    const result = await adminDeleteDataSourceAction(source.id)
    setPending(false)
    if (result.error) setError(result.error)
    else onDone()
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{source.name}</TableCell>
      <TableCell className="font-mono text-[13px]">{source.engine}</TableCell>
      <TableCell className="font-mono text-[13px]">{source.host}</TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {new Date(source.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        {error && <span className="mr-2 text-xs text-destructive">{error}</span>}
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          disabled={pending}
          onClick={remove}
        >
          {pending ? '…' : d.remove}
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function DataSourcesPanel({ data }: { data: DataSourcesResponse | null }) {
  const router = useRouter()
  const { t } = useLanguage()
  const d = t.admin.dataSources
  const refresh = () => router.refresh()

  if (!data) {
    return <p className="text-sm text-destructive">{d.loadError}</p>
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: 'var(--border-color)', background: 'var(--surface)' }}
      >
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {d.primary}
        </p>
        <InfoRow label={d.engine} value={data.primary.engine} />
        <InfoRow label={d.host} value={data.primary.host} />
        <p className="mt-3 text-[12px] text-muted-foreground">{d.primaryHint}</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{d.secondaryTitle}</h2>
          <p className="text-sm text-muted-foreground mt-1">{d.secondaryDesc}</p>
        </div>
        <AddDialog onDone={refresh} />
      </div>

      {data.sources.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">{d.noSecondary}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{d.name}</TableHead>
              <TableHead>{d.engine}</TableHead>
              <TableHead>{d.host}</TableHead>
              <TableHead>{d.colAddedOn}</TableHead>
              <TableHead className="text-right">{t.admin.providersTable.action}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.sources.map((s) => (
              <SourceRow key={s.id} source={s} onDone={refresh} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
