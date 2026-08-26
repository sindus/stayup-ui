'use client'

import { useState } from 'react'
import { Rss } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import { AddFluxDialog } from './AddFluxDialog'

export function EmptyFeed() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center">
        <div
          aria-hidden
          className="absolute inset-[-14px] rounded-full"
          style={{ background: 'radial-gradient(circle, var(--peach-dim), transparent 70%)' }}
        />
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}
        >
          <Rss className="h-6 w-6" style={{ color: 'var(--peach)' }} />
        </div>
      </div>
      <h2 className="font-serif text-[26px] leading-[1.15] tracking-editorial font-normal mb-2">
        {t.feed.empty.title}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm">{t.feed.empty.description}</p>
      <Button onClick={() => setOpen(true)}>{t.feed.empty.cta}</Button>
      <AddFluxDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
