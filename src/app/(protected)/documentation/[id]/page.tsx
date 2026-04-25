import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDocContent } from '@/lib/api-client'
import { DocViewer } from '@/components/documentation/DocViewer'

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Documentation — StayUp' }
}

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('stayup_token')?.value ?? ''

  let data: Awaited<ReturnType<typeof getDocContent>>
  try {
    data = await getDocContent(Number(id), token)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/documentation"
            className="text-xs text-muted-foreground hover:text-foreground mb-1 block"
          >
            ← Retour à la liste
          </Link>
          <h1 className="text-2xl font-bold">{data.doc.name}</h1>
          <a
            href={data.doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {data.doc.url}
          </a>
        </div>
        {data.current && (
          <Link
            href={`/documentation/${id}/history`}
            className="text-sm text-primary hover:underline shrink-0"
          >
            Historique des versions →
          </Link>
        )}
      </div>

      <DocViewer
        content={data.current?.content ?? null}
        version={data.current?.version ?? null}
        scrapedAt={data.current?.scraped_at ?? null}
      />
    </div>
  )
}
