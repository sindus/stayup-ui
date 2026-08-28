'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Upload } from 'lucide-react'
import { buildOpml, parseOpml, type OpmlFlux } from '@/lib/opml'
import { useLanguage } from '@/context/LanguageContext'
import type { UserRepository } from '@/types'

interface ImportExportButtonsProps {
  fluxes: UserRepository[]
}

type ImportResult = { added: number; skipped: number; unavailable: number }

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('File read error'))
    reader.readAsText(file)
  })
}

export function ImportExportButtons({ fluxes }: ImportExportButtonsProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleExport() {
    const opml = buildOpml(
      fluxes.map((f) => ({ provider: f.provider, url: f.url, identifier: f.identifier })),
      'StayUp',
    )
    const blob = new Blob([opml], { type: 'text/x-opml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stayup-feeds.opml'
    a.click()
    URL.revokeObjectURL(url)
  }

  // `scrap` (et tout provider `manual`) : on ne crée pas de flux à l'import, on
  // s'abonne à un flux déjà validé s'il en existe un pour cette URL.
  async function resolveFluxId(provider: string, url: string): Promise<number | null> {
    const res = await fetch(`/api/providers/${provider}/fluxes`)
    if (!res.ok) return null
    const data = (await res.json()) as { fluxes?: { id: number; url: string }[] }
    return data.fluxes?.find((f) => f.url === url)?.id ?? null
  }

  async function importEntry(entry: OpmlFlux): Promise<'added' | 'unavailable' | 'failed'> {
    if (entry.provider === 'scrap') {
      const id = await resolveFluxId('scrap', entry.url)
      if (id === null) return 'unavailable'
      const res = await fetch('/api/providers/scrap/fluxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      return res.ok ? 'added' : 'failed'
    }

    const res = await fetch('/api/fluxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: entry.provider, url: entry.url }),
    })
    return res.ok ? 'added' : 'failed'
  }

  async function handleImportFile(file: File) {
    setError(null)
    setResult(null)
    const text = await readFileAsText(file)
    const entries = parseOpml(text)
    if (entries.length === 0) {
      setError(t.importExport.invalidFile)
      return
    }

    setImporting(true)
    const existing = new Set(fluxes.map((f) => `${f.provider}:${f.url}`))
    let added = 0
    let skipped = 0
    let unavailable = 0

    for (const entry of entries) {
      if (existing.has(`${entry.provider}:${entry.url}`)) {
        skipped++
        continue
      }
      const outcome = await importEntry(entry)
      if (outcome === 'added') added++
      else if (outcome === 'unavailable') unavailable++
    }

    setImporting(false)
    setResult({ added, skipped, unavailable })
    if (added > 0) router.refresh()
  }

  return (
    <div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleExport}
          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
          style={{ border: '1px solid hsl(var(--border))' }}
          aria-label={t.importExport.export}
          title={t.importExport.export}
        >
          <Download className="h-3 w-3" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          style={{ border: '1px solid hsl(var(--border))' }}
          aria-label={t.importExport.import}
          title={t.importExport.import}
        >
          <Upload className="h-3 w-3" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".opml,.xml,text/x-opml,text/xml"
          data-testid="import-file-input"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void handleImportFile(file)
          }}
        />
      </div>

      {importing && (
        <p className="mt-1 px-2 text-[12px] text-muted-foreground">{t.importExport.importing}</p>
      )}
      {error && (
        <p className="mt-1 px-2 text-[12px] text-destructive">
          {error}{' '}
          <button onClick={() => setError(null)} className="underline">
            {t.importExport.close}
          </button>
        </p>
      )}
      {result && (
        <p className="mt-1 px-2 text-[12px] text-muted-foreground">
          {[
            result.added > 0 && `${result.added} ${t.importExport.added}`,
            result.skipped > 0 && `${result.skipped} ${t.importExport.alreadyPresent}`,
            result.unavailable > 0 && `${result.unavailable} ${t.importExport.unavailable}`,
          ]
            .filter(Boolean)
            .join(' · ')}{' '}
          <button onClick={() => setResult(null)} className="underline">
            {t.importExport.close}
          </button>
        </p>
      )}
    </div>
  )
}
