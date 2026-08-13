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

type AllProvider = 'changelog' | 'youtube' | 'rss' | 'scrap'
type FeedProvider = 'changelog' | 'youtube' | 'rss'

type FormData = {
  provider: AllProvider
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

  const schema = z
    .object({
      provider: z.enum(['changelog', 'youtube', 'rss', 'scrap']),
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

  const provider = watch('provider') as AllProvider

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
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={provider}
                    onValueChange={(v) => {
                      setValue('provider', v as AllProvider)
                      setValue('identifier', '')
                      setValue('scrapRepoId', '')
                      setScrapMode('select')
                    }}
                  >
                    <SelectTrigger id="provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="changelog">
                        {t.feed.providers?.changelog ?? 'GitHub Changelog'}
                      </SelectItem>
                      <SelectItem value="youtube">
                        {t.feed.providers?.youtube ?? 'YouTube'}
                      </SelectItem>
                      <SelectItem value="rss">{t.feed.providers?.rss ?? 'RSS'}</SelectItem>
                      <SelectItem value="scrap">
                        {t.feed.providers?.scrap ?? 'Scraping web'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Label htmlFor="identifier">{identifierLabels[provider as FeedProvider]}</Label>
                    <Input
                      id="identifier"
                      placeholder={placeholders[provider as FeedProvider]}
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
