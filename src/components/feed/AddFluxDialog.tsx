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

type AllProvider = 'changelog' | 'youtube' | 'rss' | 'scrap'
type FeedProvider = 'changelog' | 'youtube' | 'rss'

const schema = z
  .object({
    provider: z.enum(['changelog', 'youtube', 'rss', 'scrap']),
    identifier: z.string().max(200),
    scrapRepoId: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.provider === 'scrap') {
      if (!data.scrapRepoId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sélectionnez un flux',
          path: ['scrapRepoId'],
        })
      }
    } else {
      if (!data.identifier || data.identifier.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ce champ est requis',
          path: ['identifier'],
        })
      }
    }
  })

type FormData = z.infer<typeof schema>

interface ScrapRepo {
  id: number
  url: string
  is_subscribed: boolean
}

interface AddFluxDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const IDENTIFIER_LABELS: Record<FeedProvider, string> = {
  changelog: 'Dépôt GitHub',
  youtube: 'Chaîne YouTube',
  rss: 'URL du flux RSS',
}

const PLACEHOLDERS: Record<FeedProvider, string> = {
  changelog: 'ex: facebook/react ou https://github.com/facebook/react',
  youtube: 'ex: fireship ou https://youtube.com/@fireship',
  rss: 'ex: https://example.com/feed.xml',
}

export function AddFluxDialog({ open, onOpenChange }: AddFluxDialogProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [scrapRepos, setScrapRepos] = useState<ScrapRepo[]>([])
  const [scrapLoading, setScrapLoading] = useState(false)

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
      setServerError((resBody as { error?: string }).error ?? 'Une erreur est survenue.')
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
    }
    onOpenChange(value)
  }

  const availableScrapRepos = scrapRepos.filter((r) => !r.is_subscribed)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Ajouter un flux</DialogTitle>
            <DialogDescription>
              Choisissez un provider et renseignez l'identifiant du dépôt ou de la chaîne.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={provider}
                onValueChange={(v) => {
                  setValue('provider', v as AllProvider)
                  setValue('identifier', '')
                  setValue('scrapRepoId', '')
                }}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="changelog">GitHub Changelog</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="rss">RSS</SelectItem>
                  <SelectItem value="scrap">Scraping web</SelectItem>
                </SelectContent>
              </Select>
              {errors.provider && (
                <p className="text-sm text-destructive">{errors.provider.message}</p>
              )}
            </div>

            {provider === 'scrap' ? (
              <div className="space-y-2">
                <Label htmlFor="scrapRepoId">Flux disponible</Label>
                {scrapLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement…</p>
                ) : (
                  <Select
                    value={watch('scrapRepoId')}
                    onValueChange={(v) => setValue('scrapRepoId', v)}
                  >
                    <SelectTrigger id="scrapRepoId">
                      <SelectValue placeholder="Sélectionner un flux" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableScrapRepos.length === 0 ? (
                        <SelectItem value="_none" disabled>
                          Aucun flux disponible
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
                <Label htmlFor="identifier">{IDENTIFIER_LABELS[provider as FeedProvider]}</Label>
                <Input
                  id="identifier"
                  placeholder={PLACEHOLDERS[provider as FeedProvider]}
                  {...register('identifier')}
                />
                {errors.identifier && (
                  <p className="text-sm text-destructive">{errors.identifier.message}</p>
                )}
              </div>
            )}

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Vérification...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
