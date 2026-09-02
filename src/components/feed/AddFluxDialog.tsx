'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'
import {
  normalizeTemplate,
  buildFluxUrl,
  matchesFormPattern,
  resolveFeedLabel,
  type ProviderTemplate,
} from '@/lib/providerTemplate'
import { providerIcon, providerAccent } from './providerIcons'
import type { InstanceRef } from './FeedClientLayout'
import type { ProviderFlux } from '@/types'

interface ProviderTile {
  id: string
  label: string
  color: string
  dim: string
  icon: React.ReactNode
}

type FormData = { provider: string; identifier: string }

interface AddFluxDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instances?: InstanceRef[]
}

export function AddFluxDialog({ open, onOpenChange, instances = [] }: AddFluxDialogProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [serverError, setServerError] = useState<string | null>(null)
  // Instance cible d'un nouveau flux : la primaire par défaut.
  const [instanceId, setInstanceId] = useState('')
  const activeInstanceId = instanceId || instances[0]?.id || ''
  const instanceQuery = activeInstanceId
    ? `?instanceId=${encodeURIComponent(activeInstanceId)}`
    : ''
  const [tiles, setTiles] = useState<ProviderTile[]>([])
  const [tpls, setTpls] = useState<Record<string, ProviderTemplate | null>>({})
  const [approvals, setApprovals] = useState<Record<string, 'auto' | 'manual'>>({})
  // Flux existants du provider sélectionné — même flux d'ajout pour tous les providers.
  const [fluxes, setFluxes] = useState<ProviderFlux[]>([])
  const [fluxesLoading, setFluxesLoading] = useState(false)
  const [selectedFlux, setSelectedFlux] = useState<ProviderFlux | null>(null)
  const [pickMode, setPickMode] = useState<'existing' | 'new'>('existing')
  // Écran « demande envoyée » (provider en mode `manual`).
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch(`/api/providers${instanceQuery}`)
      .then((r) => r.json())
      .then((data) => {
        const providers =
          (data.providers as {
            name: string
            displayName?: string
            fluxApproval?: 'auto' | 'manual'
            template?: unknown
          }[]) ?? []
        const parsed = providers.map((p) => ({ ...p, tpl: normalizeTemplate(p.template) }))
        setTpls(Object.fromEntries(parsed.map((p) => [p.name, p.tpl])))
        setApprovals(Object.fromEntries(parsed.map((p) => [p.name, p.fluxApproval ?? 'auto'])))
        setTiles(
          parsed.map(({ name, displayName, tpl }) => {
            const color = providerAccent({ name, displayName: displayName ?? name, template: tpl })
            return {
              id: name,
              label: tpl?.display?.name ?? displayName ?? name,
              color,
              dim: tpl?.display?.accent ? `${color}22` : 'var(--surface-2)',
              icon: providerIcon(tpl?.display ?? undefined),
            }
          }),
        )
      })
      .catch(() => {
        setTiles([])
        setTpls({})
        setApprovals({})
      })
  }, [open, instanceQuery])

  const schema = z.object({
    provider: z.string().min(1),
    identifier: z.string().max(200),
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { provider: 'changelog', identifier: '' },
  })

  const provider = watch('provider')

  // Charge les flux existants du provider sélectionné, et choisit le mode par
  // défaut : la liste s'il y a des flux disponibles, sinon le formulaire d'ajout.
  useEffect(() => {
    if (!open || !provider) return
    setFluxesLoading(true)
    fetch(`/api/providers/${provider}/fluxes${instanceQuery}`)
      .then((r) => r.json())
      .then((data) => {
        const list = (data.fluxes as ProviderFlux[]) ?? []
        setFluxes(list)
        setPickMode(list.some((f) => !f.is_subscribed) ? 'existing' : 'new')
      })
      .catch(() => {
        setFluxes([])
        setPickMode('new')
      })
      .finally(() => setFluxesLoading(false))
  }, [open, provider, instanceQuery])

  const available = fluxes.filter((f) => !f.is_subscribed)
  const currentForm = tpls[provider]?.form
  // Libellé / placeholder du champ « ajouter » : ceux du connecteur (`form` du
  // template), avec un repli générique. Aucun provider connu en dur côté app.
  const inputLabel = currentForm?.label ?? t.addFlux.identifierLabels.generic
  const inputPlaceholder = currentForm?.placeholder ?? t.addFlux.placeholders.generic
  // Étiquette d'un flux existant : rendue par le template du connecteur, comme
  // dans la sidebar (repli : URL sans schéma).
  const fluxLabel = (f: ProviderFlux) =>
    resolveFeedLabel(tpls[provider], { url: f.url, config: f.config })

  async function onSubmit(data: FormData) {
    setServerError(null)

    if (pickMode === 'existing') {
      if (!selectedFlux) {
        setServerError(t.addFlux.selectError)
        return
      }
      const res = await fetch(`/api/providers/${data.provider}/fluxes${instanceQuery}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFlux.id,
          ...(selectedFlux.dataSourceId != null ? { dataSourceId: selectedFlux.dataSourceId } : {}),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setServerError((body as { error?: string }).error ?? t.common.error)
        return
      }
      reset()
      onOpenChange(false)
      router.refresh()
      return
    }

    // Ajout d'un nouveau flux (champ piloté par le `form` du template).
    if (!data.identifier.trim()) {
      setServerError(t.addFlux.requiredError)
      return
    }
    if (currentForm && !matchesFormPattern(currentForm, data.identifier)) {
      setServerError(t.addFlux.requiredError)
      return
    }
    const url = currentForm ? buildFluxUrl(currentForm, data.identifier) : data.identifier

    const res = await fetch(`/api/fluxes${instanceQuery}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: data.provider, url }),
    })
    if (res.status === 202) {
      setPending(true)
      return
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setServerError((body as { error?: string }).error ?? t.common.error)
      return
    }

    reset()
    onOpenChange(false)
    router.refresh()
  }

  function handleClose(value: boolean) {
    if (!value) {
      reset()
      setServerError(null)
      setSelectedFlux(null)
      setPickMode('existing')
      setPending(false)
      setInstanceId('')
    }
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t.addFlux.title}</DialogTitle>
            {!pending && <DialogDescription>{t.addFlux.description}</DialogDescription>}
          </DialogHeader>

          <div className="space-y-4 py-4">
            {pending ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t.addFlux.requestSent}</p>
                <p className="text-sm text-muted-foreground">{t.addFlux.requestSentDescription}</p>
              </div>
            ) : (
              <>
                {instances.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="add-flux-instance">{t.addFlux.instance}</Label>
                    <select
                      id="add-flux-instance"
                      value={activeInstanceId}
                      onChange={(e) => {
                        setInstanceId(e.target.value)
                        setSelectedFlux(null)
                      }}
                      className="w-full rounded-[10px] border px-3 py-2 text-[13.5px]"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border-color)' }}
                    >
                      {instances.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{t.addFlux.provider}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {tiles.map((tile) => {
                      const active = provider === tile.id
                      return (
                        <button
                          key={tile.id}
                          type="button"
                          onClick={() => {
                            setValue('provider', tile.id)
                            setValue('identifier', '')
                            setSelectedFlux(null)
                          }}
                          className={cn(
                            'flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-colors border',
                          )}
                          style={
                            active
                              ? {
                                  background: tile.dim,
                                  borderColor: tile.color,
                                  color: 'var(--fg)',
                                }
                              : {
                                  background: 'var(--bg)',
                                  borderColor: 'var(--border-color)',
                                  color: 'var(--fg-soft)',
                                }
                          }
                        >
                          <span style={{ color: tile.color }}>{tile.icon}</span>
                          {tile.label}
                        </button>
                      )
                    })}
                  </div>
                  {errors.provider && (
                    <p className="text-sm text-destructive">{errors.provider.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPickMode('existing')}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      pickMode === 'existing'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t.addFlux.chooseExisting}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickMode('new')}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      pickMode === 'new'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t.addFlux.makeRequest}
                  </button>
                </div>

                {pickMode === 'existing' ? (
                  <div className="space-y-2">
                    <Label>{t.addFlux.scrapRepo}</Label>
                    {fluxesLoading ? (
                      <p className="text-sm text-muted-foreground">{t.addFlux.loading}</p>
                    ) : available.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t.addFlux.noScrapRepos}</p>
                    ) : (
                      <div className="max-h-48 space-y-1 overflow-y-auto">
                        {available.map((f) => (
                          <button
                            key={`${f.dataSourceId ?? 'local'}:${f.id}`}
                            type="button"
                            onClick={() => setSelectedFlux(f)}
                            className={cn(
                              'block w-full truncate rounded-md border px-3 py-2 text-left text-sm transition-colors',
                              selectedFlux?.id === f.id &&
                                selectedFlux?.dataSourceId === f.dataSourceId
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:bg-muted',
                            )}
                          >
                            {fluxLabel(f)}
                            {f.dataSourceName && (
                              <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                                {f.dataSourceName}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="identifier">{inputLabel}</Label>
                    <Input
                      id="identifier"
                      placeholder={inputPlaceholder}
                      {...register('identifier')}
                    />
                    {errors.identifier && (
                      <p className="text-sm text-destructive">{errors.identifier.message}</p>
                    )}
                    {approvals[provider] === 'manual' && (
                      <p className="text-xs text-muted-foreground">
                        {t.addFlux.requestSentDescription}
                      </p>
                    )}
                  </div>
                )}

                {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              {pending ? t.addFlux.close : t.addFlux.cancel}
            </Button>
            {!pending && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t.addFlux.adding : t.addFlux.add}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
