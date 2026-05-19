'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminCreateRepositoryAction } from '@/lib/admin-actions'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import { ScrapConfigFields } from './ScrapConfigFields'

export function ScrapCreateForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({
    url: '',
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
    const result = await adminCreateRepositoryAction({
      url: form.url,
      type: 'scrap',
      config,
    })
    setPending(false)
    if (result.error) {
      setError(result.error)
    } else {
      setForm({
        url: '',
        articles_selector: '',
        content_selector: '',
        max_scraps: '5',
        retention_days: '15',
      })
      setExclude([])
      setExcludeInput('')
      setShow(false)
      router.refresh()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShow((v) => !v)}>
          {show ? t.admin.cancel : t.admin.addScrapBtn}
        </Button>
      </div>

      {show && (
        <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <h3 className="text-sm font-medium">{t.admin.scrapFormTitle}</h3>
          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="space-y-1">
            <label className="text-xs font-medium">{t.admin.urlLabel}</label>
            <input
              required
              type="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com/blog"
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <ScrapConfigFields
            form={form}
            setForm={(updater) => setForm((prev) => ({ ...prev, ...updater(prev) }))}
            exclude={exclude}
            setExclude={setExclude}
            excludeInput={excludeInput}
            setExcludeInput={setExcludeInput}
          />

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? t.admin.saving : t.admin.save}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
