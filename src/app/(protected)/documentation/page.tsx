import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { getDocs } from '@/lib/api-client'
import { DocList } from '@/components/documentation/DocList'

export const metadata: Metadata = {
  title: 'Documentation — StayUp',
}

export default async function DocumentationPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('stayup_token')?.value ?? ''

  const docs = await getDocs(token).catch(() => [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documentation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Suivez les mises à jour de la documentation technique.
        </p>
      </div>
      <DocList docs={docs} />
    </div>
  )
}
