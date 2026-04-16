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

  const feedData = await getCachedUserFeed(session!.user.id).catch(() => ({
    repositories: [],
    connectors: { changelog: [], youtube: [], rss: [], scrap: [] },
  }))

  const { changelog, youtube, rss, scrap } = feedData.connectors

  return (
    <div>
      <UnifiedFeedList changelog={changelog} youtube={youtube} rss={rss} scrap={scrap} />
    </div>
  )
}
