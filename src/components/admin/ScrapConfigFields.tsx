'use client'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'

interface ScrapConfigForm {
  articles_selector: string
  content_selector: string
  max_scraps: string
  retention_days: string
}

interface ScrapConfigFieldsProps {
  form: ScrapConfigForm
  setForm: (updater: (prev: ScrapConfigForm) => ScrapConfigForm) => void
  exclude: string[]
  setExclude: (updater: (prev: string[]) => string[]) => void
  excludeInput: string
  setExcludeInput: (value: string) => void
}

export function ScrapConfigFields({
  form,
  setForm,
  exclude,
  setExclude,
  excludeInput,
  setExcludeInput,
}: ScrapConfigFieldsProps) {
  const { t } = useLanguage()

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

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium">{t.admin.articlesSelector}</label>
          <input
            required
            value={form.articles_selector}
            onChange={(e) => setForm((f) => ({ ...f, articles_selector: e.target.value }))}
            placeholder="ex: h2.post-title a"
            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">{t.admin.contentSelector}</label>
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
        <label className="text-xs font-medium">{t.admin.domExclusions}</label>
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
            {t.common.add}
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
          <label className="text-xs font-medium">{t.admin.maxScraps}</label>
          <input
            type="number"
            min="1"
            value={form.max_scraps}
            onChange={(e) => setForm((f) => ({ ...f, max_scraps: e.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">{t.admin.retention}</label>
          <input
            type="number"
            min="1"
            value={form.retention_days}
            onChange={(e) => setForm((f) => ({ ...f, retention_days: e.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
    </>
  )
}
