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
  const [exclude, setExclude] = useState<string[]>([])
  const [excludeInput, setExcludeInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addExclude() {
    const val = excludeInput.trim()
    if (val && !exclude.includes(val)) {
      setExclude((prev) => [...prev, val])
    }
    setExcludeInput('')
  }

  function removeExclude(selector: string) {
    setExclude((prev) => prev.filter((s) => s !== selector))
  }

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

          <div className="space-y-1">
            <label className="text-xs font-medium">Exclusions DOM (optionnel)</label>
            <div className="flex gap-2">
              <input
                value={excludeInput}
                onChange={(e) => setExcludeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    addExclude()
                  }
                }}
                placeholder="ex: div.ads, .sidebar"
                className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button type="button" size="sm" variant="outline" onClick={addExclude}>
                Ajouter
              </Button>
            </div>
            {exclude.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {exclude.map((selector) => (
                  <span
                    key={selector}
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-mono"
                  >
                    {selector}
                    <button
                      type="button"
                      onClick={() => removeExclude(selector)}
                      className="text-muted-foreground hover:text-foreground leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
