'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { subscribeDocAction, unsubscribeDocAction } from '@/lib/documentation-actions'
import { useLanguage } from '@/context/LanguageContext'

interface SubscribeButtonProps {
  docId: number
  isSubscribed: boolean
}

export function SubscribeButton({ docId, isSubscribed }: SubscribeButtonProps) {
  const [isPending, startTransition] = useTransition()
  const { t } = useLanguage()

  function handleClick() {
    startTransition(async () => {
      if (isSubscribed) {
        await unsubscribeDocAction(docId)
      } else {
        await subscribeDocAction(docId)
      }
    })
  }

  return (
    <Button
      variant={isSubscribed ? 'outline' : 'default'}
      size="sm"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? '…' : isSubscribed ? t.documentation.unsubscribe : t.documentation.subscribe}
    </Button>
  )
}
