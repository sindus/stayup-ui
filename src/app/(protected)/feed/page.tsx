import type { Metadata } from 'next'
import { fanoutFeed, toFeedRepositories } from '@/lib/feed-fanout'
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
  const { connectors, repositories, templates, instanceErrors } = await fanoutFeed()

  const items: TaggedItem[] = Object.entries(connectors)
    .flatMap(([provider, providerItems]) => providerItems.map((item) => ({ provider, item })))
    .sort(
      (a, b) => new Date(getItemDate(b)).getTime() - new Date(getItemDate(a)).getTime(),
    ) as TaggedItem[]

  return (
    <FeedClientView
      items={items}
      repositories={toFeedRepositories(repositories)}
      templates={templates}
      instanceErrors={instanceErrors}
    />
  )
}
