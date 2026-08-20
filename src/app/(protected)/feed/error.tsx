'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function FeedError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <p className="text-sm text-destructive">{t.common.error}</p>
      <button onClick={reset} className="text-sm text-muted-foreground underline">
        {t.feed.retry}
      </button>
    </div>
  )
}
