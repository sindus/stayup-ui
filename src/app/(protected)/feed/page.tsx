import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { getCachedUserFeed, getCachedTemplates } from '@/lib/feed-cache'
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

  const [feedData, templates] = await Promise.all([
    getCachedUserFeed(session!.userId, token).catch(() => ({
      repositories: [],
      connectors: {},
    })),
    getCachedTemplates(token),
  ])

  const items: TaggedItem[] = Object.entries(feedData.connectors ?? {})
    .flatMap(([provider, providerItems]) => providerItems.map((item) => ({ provider, item })))
    .sort(
      (a, b) => new Date(getItemDate(b)).getTime() - new Date(getItemDate(a)).getTime(),
    ) as TaggedItem[]

  return <FeedClientView items={items} repositories={feedData.repositories} templates={templates} />
}
