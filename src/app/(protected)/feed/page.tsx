import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { getCachedUserFeed } from '@/lib/feed-cache'
import { getSession } from '@/lib/session'
import { UnifiedFeedList } from '@/components/feed/UnifiedFeedList'

export const metadata: Metadata = {
  title: 'Mon flux — StayUp',
}

export default async function FeedPage() {
  const session = await getSession()
  const cookieStore = await cookies()
  const token = cookieStore.get('stayup_token')?.value ?? ''

  const feedData = await getCachedUserFeed(session!.userId, token).catch(() => ({
    repositories: [],
    connectors: { changelog: [], youtube: [], rss: [], scrap: [] },
  }))

  const { changelog = [], youtube = [], rss = [], scrap = [] } = feedData.connectors ?? {}

  return (
    <div>
      <UnifiedFeedList changelog={changelog} youtube={youtube} rss={rss} scrap={scrap} />
    </div>
  )
}
