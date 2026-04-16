import type { Metadata } from 'next'
import { Rss } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mon flux — StayUp',
}

export default function FeedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
      <Rss className="h-8 w-8 mb-3 opacity-30" />
      <p className="text-sm">Sélectionnez un flux dans la barre latérale</p>
    </div>
  )
}
