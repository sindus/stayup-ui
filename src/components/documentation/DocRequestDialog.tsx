'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/context/LanguageContext'

export function DocRequestDialog() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const res = await fetch('/api/doc/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    setPending(false)

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? t.common.error)
      return
    }

    setSuccess(true)
  }

  function handleClose(value: boolean) {
    if (!value) {
      setUrl('')
      setError(null)
      setSuccess(false)
    }
    setOpen(value)
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        {t.documentation.requestBtn}
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.documentation.requestTitle}</DialogTitle>
          </DialogHeader>

          {success ? (
            <div className="py-4 space-y-1">
              <p className="text-sm font-medium">{t.documentation.requestSuccess}</p>
              <p className="text-sm text-muted-foreground">{t.documentation.requestSuccessDesc}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="py-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="doc-request-url">{t.documentation.requestUrlLabel}</Label>
                  <Input
                    id="doc-request-url"
                    type="url"
                    required
                    placeholder={t.documentation.requestUrlPlaceholder}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                  {t.common.cancel}
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? '…' : t.documentation.requestSubmit}
                </Button>
              </DialogFooter>
            </form>
          )}

          {success && (
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>{t.common.close}</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
