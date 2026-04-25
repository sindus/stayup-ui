'use client'

import { useTransition } from 'react'
import { subscribeScrapAction, unsubscribeScrapAction } from '@/lib/scrap-actions'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from '@/components/ui/button'
import type { ScrapRepository } from '@/types'

function ScrapCard({ repo }: { repo: ScrapRepository }) {
  const { t } = useLanguage()
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      if (repo.is_subscribed) {
        await unsubscribeScrapAction(repo.id)
      } else {
        await subscribeScrapAction(repo.id)
      }
    })
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium truncate">{repo.url}</p>
        {repo.config.articles_selector && (
          <p className="text-xs text-muted-foreground font-mono truncate">
            {repo.config.articles_selector}
          </p>
        )}
      </div>
      <Button
        size="sm"
        variant={repo.is_subscribed ? 'outline' : 'default'}
        disabled={isPending}
        onClick={toggle}
        className="w-full"
      >
        {isPending ? '…' : repo.is_subscribed ? t.scrap.unsubscribe : t.scrap.subscribe}
      </Button>
    </div>
  )
}

export function ScrapList({ repos }: { repos: ScrapRepository[] }) {
  const { t } = useLanguage()

  if (repos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-12 text-center">{t.scrap.noContent}</p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {repos.map((repo) => (
        <ScrapCard key={repo.id} repo={repo} />
      ))}
    </div>
  )
}
