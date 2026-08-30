'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Star, RotateCw, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormCard } from './FormCard'
import { useLanguage } from '@/context/LanguageContext'
import {
  addInstanceAction,
  probeInstanceAction,
  reconnectInstanceAction,
  removeInstanceAction,
  renameInstanceAction,
  setPrimaryInstanceAction,
} from '@/lib/instances-actions'

export interface InstanceView {
  id: string
  name: string
  host: string
  expired: boolean
}

/** Sous-formulaire e-mail / mot de passe partagé par « ajouter » et « reconnecter ». */
function CredForm({
  idPrefix,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  idPrefix: string
  submitLabel: string
  onSubmit: (email: string, password: string) => Promise<string | null>
  onCancel: () => void
}) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-email`}>{t.instances.email}</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-password`}>{t.instances.password}</Label>
        <Input
          id={`${idPrefix}-password`}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null)
              const err = await onSubmit(email, password)
              if (err) setError(err)
            })
          }
        >
          {pending ? t.instances.connecting : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t.instances.cancel}
        </Button>
      </div>
    </div>
  )
}

export function InstancesCard({ instances }: { instances: InstanceView[] }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [, startTransition] = useTransition()

  const [adding, setAdding] = useState(false)
  const [url, setUrl] = useState('')
  const [probe, setProbe] = useState<{ name: string } | null>(null)
  const [probeError, setProbeError] = useState<string | null>(null)
  const [probing, startProbe] = useTransition()
  const [reconnectId, setReconnectId] = useState<string | null>(null)

  const multi = instances.length > 1

  function resetAdd() {
    setAdding(false)
    setUrl('')
    setProbe(null)
    setProbeError(null)
  }

  return (
    <FormCard title={t.instances.title} desc={t.instances.subtitle}>
      <div className="space-y-3">
        {instances.map((inst, i) => (
          <div
            key={inst.id}
            className="rounded-[10px] border p-3"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-2">
              <input
                defaultValue={inst.name}
                aria-label={t.instances.title}
                onBlur={(e) => {
                  const v = e.target.value.trim()
                  if (v && v !== inst.name) {
                    startTransition(async () => {
                      await renameInstanceAction(inst.id, v)
                      router.refresh()
                    })
                  }
                }}
                className="flex-1 bg-transparent text-sm font-medium outline-none"
              />
              {i === 0 && (
                <span
                  className="rounded px-1.5 py-0.5 text-[11px]"
                  style={{ background: 'var(--peach-dim)', color: 'var(--peach)' }}
                >
                  {t.instances.primary}
                </span>
              )}
            </div>
            <p className="mt-0.5 font-mono text-[12px] text-muted-foreground">{inst.host}</p>
            {inst.expired && (
              <p className="mt-1 text-[12px] text-destructive">{t.instances.expired}</p>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() =>
                    startTransition(async () => {
                      await setPrimaryInstanceAction(inst.id)
                      router.refresh()
                    })
                  }
                  className="flex items-center gap-1 rounded border px-2 py-1 text-[12px]"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <Star size={12} /> {t.instances.makePrimary}
                </button>
              )}
              {inst.expired && (
                <button
                  type="button"
                  onClick={() => setReconnectId(reconnectId === inst.id ? null : inst.id)}
                  className="flex items-center gap-1 rounded border px-2 py-1 text-[12px]"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <RotateCw size={12} /> {t.instances.reconnect}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (i === 0 && !confirm(t.instances.removePrimaryWarning)) return
                  startTransition(async () => {
                    await removeInstanceAction(inst.id)
                    router.refresh()
                  })
                }}
                className="flex items-center gap-1 rounded border px-2 py-1 text-[12px] text-destructive"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <Trash2 size={12} /> {t.instances.remove}
              </button>
            </div>

            {reconnectId === inst.id && (
              <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
                <CredForm
                  idPrefix={`reconnect-${inst.id}`}
                  submitLabel={t.instances.reconnect}
                  onCancel={() => setReconnectId(null)}
                  onSubmit={async (email, password) => {
                    const res = await reconnectInstanceAction(inst.id, email, password)
                    if (res.error) return res.error
                    setReconnectId(null)
                    router.refresh()
                    return null
                  }}
                />
              </div>
            )}
          </div>
        ))}

        {multi && <p className="text-[12px] text-muted-foreground">{t.instances.oauthHint}</p>}

        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-[13px]"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <Plus size={14} /> {t.instances.add}
          </button>
        ) : (
          <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="space-y-1.5">
              <Label htmlFor="new-instance-url">{t.instances.urlLabel}</Label>
              <div className="flex gap-2">
                <Input
                  id="new-instance-url"
                  type="url"
                  placeholder={t.instances.urlPlaceholder}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setProbe(null)
                    setProbeError(null)
                  }}
                />
                <Button
                  type="button"
                  disabled={probing || !url.trim()}
                  onClick={() =>
                    startProbe(async () => {
                      setProbeError(null)
                      const res = await probeInstanceAction(url)
                      if (res.error) setProbeError(res.error)
                      else setProbe({ name: res.name ?? url })
                    })
                  }
                >
                  {t.instances.next}
                </Button>
              </div>
              {probeError && <p className="text-sm text-destructive">{probeError}</p>}
            </div>

            {probe && (
              <div className="mt-3">
                <CredForm
                  idPrefix="add-instance"
                  submitLabel={t.instances.connect}
                  onCancel={resetAdd}
                  onSubmit={async (email, password) => {
                    const res = await addInstanceAction(url, email, password)
                    if (res.error) return res.error
                    resetAdd()
                    router.refresh()
                    return null
                  }}
                />
              </div>
            )}

            {!probe && (
              <button
                type="button"
                onClick={resetAdd}
                className="mt-3 text-[12px] text-muted-foreground underline"
              >
                {t.instances.cancel}
              </button>
            )}
          </div>
        )}
      </div>
    </FormCard>
  )
}
