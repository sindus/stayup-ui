import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDocContent, getDocDiff } from '@/lib/api-client'
import { DiffViewer } from '@/components/documentation/DiffViewer'

export const metadata: Metadata = {
  title: 'Modifications — StayUp',
}

export default async function DocDiffPage({
  params,
}: {
  params: Promise<{ id: string; versionId: string }>
}) {
  const { id, versionId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('stayup_token')?.value ?? ''

  let docData: Awaited<ReturnType<typeof getDocContent>>
  try {
    docData = await getDocContent(Number(id), token)
  } catch {
    notFound()
  }

  let diffData: Awaited<ReturnType<typeof getDocDiff>>
  try {
    diffData = await getDocDiff(Number(id), Number(versionId), token)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/documentation/${id}/history`}
          className="text-xs text-muted-foreground hover:text-foreground mb-1 block"
        >
          ← Retour à l&apos;historique
        </Link>
        <h1 className="text-2xl font-bold">
          Modifications — {docData.doc.name} v{diffData.version}
        </h1>
      </div>

      <DiffViewer diff={diffData.diff} version={diffData.version} scrapedAt={diffData.scraped_at} />
    </div>
  )
}
