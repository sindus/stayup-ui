'use client'

import ReactMarkdown from 'react-markdown'
import { useLanguage } from '@/context/LanguageContext'

interface DocViewerProps {
  content: string | null
  version: number | null
  scrapedAt: string | null
}

export function DocViewer({ content, version, scrapedAt }: DocViewerProps) {
  const { t, lang } = useLanguage()
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US'

  if (!content) {
    return (
      <p className="text-sm text-muted-foreground italic py-12 text-center">
        {t.documentation.noContentScrapped}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {version !== null && (
        <p className="text-xs text-muted-foreground">
          {t.documentation.version} {version}
          {scrapedAt && (
            <>
              {' '}
              ·{' '}
              {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
                new Date(scrapedAt),
              )}
            </>
          )}
        </p>
      )}
      <div className="prose prose-sm max-w-none bg-muted/40 rounded-lg p-4 overflow-auto max-h-[70vh] [&_img]:max-w-full [&_img]:rounded [&_pre]:overflow-x-auto [&_code]:text-xs">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
