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
import { adminApproveScrapRequestAction } from '@/lib/admin-actions'
import { ScrapConfigFields } from './ScrapConfigFields'
import type { ScrapRequest } from '@/types'

interface ScrapRequestApproveDialogProps {
  request: ScrapRequest
  onClose: () => void
}

export function ScrapRequestApproveDialog({ request, onClose }: ScrapRequestApproveDialogProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const [url, setUrl] = useState(request.url)
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

    const config: Record<string, unknown> = {
      articles_selector: form.articles_selector,
      content_selector: form.content_selector,
      max_scraps: Number(form.max_scraps),
      retention_days: Number(form.retention_days),
    }
    if (exclude.length > 0) config.exclude = exclude

    const result = await adminApproveScrapRequestAction(request.id, { url, config })
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

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="space-y-1">
              <label className="text-xs font-medium">{t.admin.urlLabel}</label>
              <input
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <ScrapConfigFields
              form={form}
              setForm={setForm}
              exclude={exclude}
              setExclude={setExclude}
              excludeInput={excludeInput}
              setExcludeInput={setExcludeInput}
            />
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
