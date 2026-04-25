'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminCreateRepositoryAction } from '@/lib/admin-actions'
import { Button } from '@/components/ui/button'

export function ScrapCreateForm() {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({
    url: '',
    articles_selector: '',
    content_selector: '',
    max_scraps: '5',
    retention_days: '15',
  })
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const result = await adminCreateRepositoryAction({
      url: form.url,
      type: 'scrap',
      config: {
        articles_selector: form.articles_selector,
        content_selector: form.content_selector,
        max_scraps: Number(form.max_scraps),
        retention_days: Number(form.retention_days),
      },
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
      setShow(false)
      router.refresh()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShow((v) => !v)}>
          {show ? 'Annuler' : '+ Ajouter un flux scrap'}
        </Button>
      </div>

      {show && (
        <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <h3 className="text-sm font-medium">Nouveau flux scraping web</h3>
          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="space-y-1">
            <label className="text-xs font-medium">URL de la page</label>
            <input
              required
              type="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com/blog"
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Sélecteur CSS des articles</label>
              <input
                required
                value={form.articles_selector}
                onChange={(e) => setForm((f) => ({ ...f, articles_selector: e.target.value }))}
                placeholder="ex: h2.post-title a"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Sélecteur CSS du contenu</label>
              <input
                required
                value={form.content_selector}
                onChange={(e) => setForm((f) => ({ ...f, content_selector: e.target.value }))}
                placeholder="ex: article.post-content"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Max scraps</label>
              <input
                type="number"
                min="1"
                value={form.max_scraps}
                onChange={(e) => setForm((f) => ({ ...f, max_scraps: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Rétention (jours)</label>
              <input
                type="number"
                min="1"
                value={form.retention_days}
                onChange={(e) => setForm((f) => ({ ...f, retention_days: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
