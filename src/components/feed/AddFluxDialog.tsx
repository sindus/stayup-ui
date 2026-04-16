'use client'

import { useState } from 'react'
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
import type { Provider } from '@/types'

const schema = z
  .object({
    provider: z.enum(['changelog', 'youtube', 'rss', 'scrap']),
    identifier: z.string().min(1, 'Ce champ est requis').max(200),
    articles_selector: z.string().optional(),
    content_selector: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider === 'scrap') {
      if (!data.articles_selector?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ce champ est requis',
          path: ['articles_selector'],
        })
      }
      if (!data.content_selector?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ce champ est requis',
          path: ['content_selector'],
        })
      }
    }
  })

type FormData = z.infer<typeof schema>

interface AddFluxDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const IDENTIFIER_LABELS: Record<Provider, string> = {
  changelog: 'Dépôt GitHub',
  youtube: 'Chaîne YouTube',
  rss: 'URL du flux RSS',
  scrap: 'URL de la page à scraper',
}

const PLACEHOLDERS: Record<Provider, string> = {
  changelog: 'ex: facebook/react ou https://github.com/facebook/react',
  youtube: 'ex: fireship ou https://youtube.com/@fireship',
  rss: 'ex: https://example.com/feed.xml',
  scrap: 'ex: https://example.com/blog',
}

export function AddFluxDialog({ open, onOpenChange }: AddFluxDialogProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { provider: 'changelog' },
  })

  const provider = watch('provider') as Provider

  async function onSubmit(data: FormData) {
    setServerError(null)
    const res = await fetch('/api/fluxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setServerError((body as { error?: string }).error ?? 'Une erreur est survenue.')
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
              <Select value={provider} onValueChange={(v) => setValue('provider', v as Provider)}>
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

            <div className="space-y-2">
              <Label htmlFor="identifier">{IDENTIFIER_LABELS[provider]}</Label>
              <Input
                id="identifier"
                placeholder={PLACEHOLDERS[provider]}
                {...register('identifier')}
              />
              {errors.identifier && (
                <p className="text-sm text-destructive">{errors.identifier.message}</p>
              )}
            </div>

            {provider === 'scrap' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="articles_selector">Sélecteur CSS des articles</Label>
                  <Input
                    id="articles_selector"
                    placeholder="ex: h2.post-title a"
                    {...register('articles_selector')}
                  />
                  {errors.articles_selector && (
                    <p className="text-sm text-destructive">{errors.articles_selector.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_selector">Sélecteur CSS du contenu</Label>
                  <Input
                    id="content_selector"
                    placeholder="ex: article.post-content"
                    {...register('content_selector')}
                  />
                  {errors.content_selector && (
                    <p className="text-sm text-destructive">{errors.content_selector.message}</p>
                  )}
                </div>
              </>
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
