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
        <Button size="sm">+ Ajouter une base secondaire</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle base secondaire</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="ds-name">Nom</Label>
            <Input
              id="ds-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cluster équipe data"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ds-url">URL de connexion</Label>
            <Input
              id="ds-url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setProbe(null)
              }}
              placeholder="postgres://user:pass@host:5432/db"
            />
            <p className="text-[12px] text-muted-foreground">
              Lecture seule. Stockée chiffrée — jamais réaffichée.
            </p>
          </div>

          {probe?.ok === false && <p className="text-sm text-destructive">{probe.error}</p>}
          {probe?.ok === true && (
            <div className="rounded-md border border-border p-3 text-[13px]">
              <p>
                Moteur <span className="font-mono">{probe.engine}</span>
              </p>
              {probe.connectors.length > 0 ? (
                <p className="mt-1">
                  Connecteurs trouvés :{' '}
                  <span className="font-mono">{probe.connectors.join(', ')}</span>
                </p>
              ) : (
                <p className="mt-1 text-destructive">Aucune table connector_* — rien à agréger.</p>
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
              {pending === 'test' ? 'Test…' : 'Tester'}
            </Button>
            <Button type="button" onClick={confirm} disabled={pending !== null || !canConfirm}>
              {pending === 'add' ? 'Ajout…' : 'Confirmer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SourceRow({ source, onDone }: { source: DataSource; onDone: () => void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function remove() {
    if (
      !window.confirm(`Retirer « ${source.name} » ? Les abonnements à ses flux seront supprimés.`)
    ) {
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
          {pending ? '…' : 'Retirer'}
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function DataSourcesPanel({ data }: { data: DataSourcesResponse | null }) {
  const router = useRouter()
  const refresh = () => router.refresh()

  if (!data) {
    return <p className="text-sm text-destructive">Impossible de charger les bases de données.</p>
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: 'var(--border-color)', background: 'var(--surface)' }}
      >
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Base principale
        </p>
        <InfoRow label="Moteur" value={data.primary.engine} />
        <InfoRow label="Hôte" value={data.primary.host} />
        <p className="mt-3 text-[12px] text-muted-foreground">
          Gère l&apos;API, l&apos;admin et les abonnements. Configurée par
          <span className="font-mono"> DATABASE_URL</span>, non modifiable ici.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Bases secondaires</h2>
          <p className="text-sm text-muted-foreground mt-1">
            En lecture seule : seul leur contenu connector_* est agrégé dans les feeds.
          </p>
        </div>
        <AddDialog onDone={refresh} />
      </div>

      {data.sources.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Aucune base secondaire.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Moteur</TableHead>
              <TableHead>Hôte</TableHead>
              <TableHead>Ajoutée le</TableHead>
              <TableHead className="text-right">Action</TableHead>
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
