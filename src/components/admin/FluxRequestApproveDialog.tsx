'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import { adminApproveFluxRequestAction } from '@/lib/admin-actions'
import { ScrapConfigFields } from './ScrapConfigFields'
import type { FluxRequest } from '@/types'

interface FluxRequestApproveDialogProps {
  request: FluxRequest
  onClose: () => void
}

export function FluxRequestApproveDialog({ request, onClose }: FluxRequestApproveDialogProps) {
  const router = useRouter()
  const { t } = useLanguage()

  // Le scraping web garde ses champs de config ; les autres providers n'en ont pas.
  const isScrap = request.provider === 'scrap'
  const [form, setForm] = useState({
    articles_selector: '',
    content_selector: '',
    max_scraps: '5',
    retention_days: '15',
  })
  const [exclude, setExclude] = useState<string[]>([])
  const [excludeInput, setExcludeInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    let config: Record<string, unknown> | undefined
    if (isScrap) {
      config = {
        articles_selector: form.articles_selector,
        content_selector: form.content_selector,
        max_scraps: Number(form.max_scraps),
        retention_days: Number(form.retention_days),
      }
      if (exclude.length > 0) config.exclude = exclude
    }

    const result = await adminApproveFluxRequestAction(request.id, config ? { config } : {})
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
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t.admin.approveFormTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <p className="text-xs text-muted-foreground">
              {t.admin.requestFrom} : <span className="font-medium">{request.user_email}</span>
            </p>
            <p className="text-xs">
              <span className="text-muted-foreground">{request.provider}</span>{' '}
              <span className="font-mono">{request.url}</span>
            </p>

            {error && <p className="text-xs text-destructive">{error}</p>}

            {isScrap && (
              <ScrapConfigFields
                form={form}
                setForm={setForm}
                exclude={exclude}
                setExclude={setExclude}
                excludeInput={excludeInput}
                setExcludeInput={setExcludeInput}
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t.admin.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t.admin.saving : t.admin.approveRequest}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
