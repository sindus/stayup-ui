import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDocContent, getDocHistory } from '@/lib/api-client'
import { HistoryList } from '@/components/documentation/HistoryList'

export const metadata: Metadata = {
  title: 'Historique — StayUp',
}

export default async function DocHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('stayup_token')?.value ?? ''

  let docData: Awaited<ReturnType<typeof getDocContent>>
  try {
    docData = await getDocContent(Number(id), token)
  } catch {
    notFound()
  }

  const versions = await getDocHistory(Number(id), token).catch(() => [])

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/documentation/${id}`}
          className="text-xs text-muted-foreground hover:text-foreground mb-1 block"
        >
          ← Retour au document
        </Link>
        <h1 className="text-2xl font-bold">Historique — {docData.doc.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {versions.length} version{versions.length !== 1 ? 's' : ''}
        </p>
      </div>

      <HistoryList versions={versions} docId={Number(id)} />
    </div>
  )
}
