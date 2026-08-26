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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'
import { isKnownProvider, type KnownProvider } from '@/types'

type FeedProvider = Exclude<KnownProvider, 'scrap'>

const KNOWN_TILE_STYLE: Record<
  FeedProvider | 'scrap',
  { color: string; dim: string; icon: React.ReactNode }
> = {
  changelog: {
    color: 'var(--peach)',
    dim: 'var(--peach-dim)',
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <path d="M7 1L9.5 4H11.5L7 1ZM7 1L4.5 4H2.5L7 1Z" fill="currentColor" opacity="0.85" />
        <rect x="2" y="4" width="10" height="1" rx="0.5" fill="currentColor" />
        <rect x="3" y="6.5" width="8" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  youtube: {
    color: 'var(--rose)',
    dim: 'var(--rose-dim)',
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="3" width="12" height="8" rx="2" fill="currentColor" />
        <path d="M5.5 5.5L9 7L5.5 8.5V5.5Z" fill="var(--surface)" />
      </svg>
    ),
  },
  rss: {
    color: 'var(--sage)',
    dim: 'var(--sage-dim)',
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <circle cx="3" cy="11" r="1.5" fill="currentColor" />
        <path
          d="M2 7.5C5 7.5 6.5 9 6.5 11.5"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M2 4C7 4 10 7 10 12"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  scrap: {
    color: 'var(--sky)',
    dim: 'var(--sky-dim)',
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <ellipse cx="7" cy="7" rx="2" ry="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
}

// Style neutre pour tout provider découvert dynamiquement (voir GET /connectors/providers)
// et non connu de cette app.
const GENERIC_TILE_STYLE = {
  color: 'var(--muted-foreground)',
  dim: 'var(--surface-2)',
  icon: (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  ),
}

interface ProviderTile {
  id: string
  label: string
  color: string
  dim: string
  icon: React.ReactNode
}

type FormData = {
  provider: string
  identifier: string
  scrapRepoId: string
}

interface ScrapRepo {
  id: number
  url: string
  is_subscribed: boolean
}

interface AddFluxDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddFluxDialog({ open, onOpenChange }: AddFluxDialogProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [serverError, setServerError] = useState<string | null>(null)
  const [scrapRepos, setScrapRepos] = useState<ScrapRepo[]>([])
  const [scrapLoading, setScrapLoading] = useState(false)
  const [scrapMode, setScrapMode] = useState<'select' | 'request'>('select')
  const [requestUrl, setRequestUrl] = useState('')
  const [requestSuccess, setRequestSuccess] = useState(false)
  const [tiles, setTiles] = useState<ProviderTile[]>([])

  // Liste des providers dynamique : vient de l'API, aucun nom n'est codé en dur ici.
  useEffect(() => {
    if (!open) return
    fetch('/api/providers')
      .then((r) => r.json())
      .then((data) => {
        const providers = (data.providers as { name: string; displayName: string }[]) ?? []
        setTiles(
          providers.map(({ name, displayName }) => {
            const known = isKnownProvider(name) ? KNOWN_TILE_STYLE[name] : GENERIC_TILE_STYLE
            const label =
              name === 'changelog'
                ? 'GitHub'
                : name === 'scrap'
                  ? 'Page web'
                  : (t.feed.providers?.[name as KnownProvider] ?? displayName)
            return { id: name, label, ...known }
          }),
        )
      })
      .catch(() => setTiles([]))
  }, [open, t])

  const schema = z
    .object({
      provider: z.string().min(1),
      identifier: z.string().max(200),
      scrapRepoId: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.provider === 'scrap') {
        if (scrapMode === 'select' && !data.scrapRepoId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t.addFlux.selectError,
            path: ['scrapRepoId'],
          })
        }
      } else {
        if (!data.identifier || data.identifier.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t.addFlux.requiredError,
            path: ['identifier'],
          })
        }
      }
    })

  const identifierLabels: Record<FeedProvider, string> = {
    changelog: t.addFlux.identifierLabels.changelog,
    youtube: t.addFlux.identifierLabels.youtube,
    rss: t.addFlux.identifierLabels.rss,
  }

  const placeholders: Record<FeedProvider, string> = {
    changelog: t.addFlux.placeholders.changelog,
    youtube: t.addFlux.placeholders.youtube,
    rss: t.addFlux.placeholders.rss,
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { provider: 'changelog', identifier: '', scrapRepoId: '' },
  })

  const provider = watch('provider')

  useEffect(() => {
    if (provider !== 'scrap') return
    setScrapLoading(true)
    fetch('/api/scrap')
      .then((r) => r.json())
      .then((data) => setScrapRepos((data.repos as ScrapRepo[]) ?? []))
      .catch(() => setScrapRepos([]))
      .finally(() => setScrapLoading(false))
  }, [provider])

  async function onSubmit(data: FormData) {
    setServerError(null)

    if (data.provider === 'scrap' && scrapMode === 'request') {
      if (!requestUrl.trim()) {
        setServerError(t.addFlux.requiredError)
        return
      }
      try {
        new URL(requestUrl)
      } catch {
        setServerError(t.addFlux.requestUrlError)
        return
      }
      const res = await fetch('/api/scrap/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: requestUrl }),
      })
      if (!res.ok) {
        const resBody = await res.json().catch(() => ({}))
        setServerError((resBody as { error?: string }).error ?? t.common.error)
        return
      }
      setRequestSuccess(true)
      return
    }

    const body =
      data.provider === 'scrap'
        ? { provider: 'scrap', scrapRepoId: Number(data.scrapRepoId) }
        : { provider: data.provider, identifier: data.identifier }

    const res = await fetch('/api/fluxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const resBody = await res.json().catch(() => ({}))
      setServerError((resBody as { error?: string }).error ?? t.common.error)
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
      setScrapMode('select')
      setRequestUrl('')
      setRequestSuccess(false)
    }
    onOpenChange(value)
  }

  const availableScrapRepos = scrapRepos.filter((r) => !r.is_subscribed)
  const isKnownFeedProvider =
    provider === 'changelog' || provider === 'youtube' || provider === 'rss'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t.addFlux.title}</DialogTitle>
            {!requestSuccess && <DialogDescription>{t.addFlux.description}</DialogDescription>}
          </DialogHeader>

          <div className="space-y-4 py-4">
            {requestSuccess ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t.addFlux.requestSent}</p>
                <p className="text-sm text-muted-foreground">{t.addFlux.requestSentDescription}</p>
              </div>
            ) : (
              <>
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
                            setValue('scrapRepoId', '')
                            setScrapMode('select')
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

                {provider === 'scrap' ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setScrapMode('select')}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          scrapMode === 'select'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t.addFlux.chooseExisting}
                      </button>
                      <button
                        type="button"
                        onClick={() => setScrapMode('request')}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          scrapMode === 'request'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t.addFlux.makeRequest}
                      </button>
                    </div>

                    {scrapMode === 'select' ? (
                      <div className="space-y-2">
                        <Label htmlFor="scrapRepoId">{t.addFlux.scrapRepo}</Label>
                        {scrapLoading ? (
                          <p className="text-sm text-muted-foreground">{t.addFlux.loading}</p>
                        ) : (
                          <Select
                            value={watch('scrapRepoId')}
                            onValueChange={(v) => setValue('scrapRepoId', v)}
                          >
                            <SelectTrigger id="scrapRepoId">
                              <SelectValue placeholder={t.addFlux.selectScrapRepo} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableScrapRepos.length === 0 ? (
                                <SelectItem value="_none" disabled>
                                  {t.addFlux.noScrapRepos}
                                </SelectItem>
                              ) : (
                                availableScrapRepos.map((r) => (
                                  <SelectItem key={r.id} value={String(r.id)}>
                                    {r.url}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                        {errors.scrapRepoId && (
                          <p className="text-sm text-destructive">{errors.scrapRepoId.message}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="requestUrl">{t.addFlux.requestUrl}</Label>
                        <Input
                          id="requestUrl"
                          type="url"
                          placeholder={t.addFlux.requestUrlPlaceholder}
                          value={requestUrl}
                          onChange={(e) => setRequestUrl(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="identifier">
                      {isKnownFeedProvider
                        ? identifierLabels[provider as FeedProvider]
                        : t.addFlux.identifierLabels.generic}
                    </Label>
                    <Input
                      id="identifier"
                      placeholder={
                        isKnownFeedProvider
                          ? placeholders[provider as FeedProvider]
                          : t.addFlux.placeholders.generic
                      }
                      {...register('identifier')}
                    />
                    {errors.identifier && (
                      <p className="text-sm text-destructive">{errors.identifier.message}</p>
                    )}
                  </div>
                )}

                {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              {requestSuccess ? t.addFlux.close : t.addFlux.cancel}
            </Button>
            {!requestSuccess && (
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
