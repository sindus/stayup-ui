import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { getCachedUserFeed } from '@/lib/feed-cache'
import { UnifiedFeedList } from '@/components/feed/UnifiedFeedList'

export const metadata: Metadata = {
  title: 'Mon flux — StayUp',
}

export default async function FeedPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  let feedData
  try {
    feedData = await getCachedUserFeed(session!.user.id)
  } catch {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
        <p className="text-sm">Impossible de charger les flux. Veuillez réessayer.</p>
      </div>
    )
  }

  const { changelog, youtube, rss, scrap } = feedData.connectors

  return (
    <div>
      <UnifiedFeedList changelog={changelog} youtube={youtube} rss={rss} scrap={scrap} />
    </div>
  )
}
