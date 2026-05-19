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
import { adminApproveDocRequestAction } from '@/lib/admin-actions'
import type { DocRequest } from '@/types'

interface DocRequestApproveDialogProps {
  request: DocRequest
  onClose: () => void
}

export function DocRequestApproveDialog({ request, onClose }: DocRequestApproveDialogProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const [name, setName] = useState('')
  const [url, setUrl] = useState(request.url)
  const [configRaw, setConfigRaw] = useState('{}')
  const [configError, setConfigError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setConfigError(null)

    let config: Record<string, unknown> = {}
    try {
      config = JSON.parse(configRaw) as Record<string, unknown>
    } catch {
      setConfigError(t.admin.invalidJson)
      return
    }

    setPending(true)
    const result = await adminApproveDocRequestAction(request.id, { name, url, config })
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
            <DialogTitle>{t.admin.approveDocFormTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <p className="text-xs text-muted-foreground">
              {t.admin.requestFrom} : <span className="font-medium">{request.user_email}</span>
            </p>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="space-y-1">
              <label className="text-xs font-medium">{t.admin.docNameLabel}</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: React Docs"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

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

            <div className="space-y-1">
              <label className="text-xs font-medium">{t.admin.configJsonOptional}</label>
              <textarea
                value={configRaw}
                onChange={(e) => setConfigRaw(e.target.value)}
                rows={4}
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {configError && <p className="text-xs text-destructive">{configError}</p>}
            </div>
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
