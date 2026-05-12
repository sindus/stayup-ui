import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { getCachedUserFeed } from '@/lib/feed-cache'
import { getSession } from '@/lib/session'
import { FeedClientView } from '@/components/feed/FeedClientView'
import type { TaggedItem } from '@/types'

export const metadata: Metadata = {
  title: 'Mon flux — StayUp',
}

function getItemDate(tagged: TaggedItem): string {
  const item = tagged.item
  if ('datetime' in item && item.datetime) return item.datetime
  return item.executed_at
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

  const items: TaggedItem[] = [
    ...changelog.map((item) => ({ provider: 'changelog' as const, item })),
    ...youtube.map((item) => ({ provider: 'youtube' as const, item })),
    ...rss.map((item) => ({ provider: 'rss' as const, item })),
    ...scrap.map((item) => ({ provider: 'scrap' as const, item })),
  ].sort((a, b) => new Date(getItemDate(b)).getTime() - new Date(getItemDate(a)).getTime())

  return <FeedClientView items={items} repositories={feedData.repositories} />
}
