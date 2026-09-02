import Link from 'next/link'
import { AdminLoginContent } from '@/components/admin/AdminLoginContent'
import { AuroraWordmark } from '@/components/ui/aurora-mark'
import { getApiUrl } from '@/lib/apiUrl'

export default async function AdminLoginPage() {
  const apiUrl = await getApiUrl()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <Link href="/" className="mb-8">
        <AuroraWordmark size={15} />
      </Link>

      <AdminLoginContent apiUrl={apiUrl} />
    </div>
  )
}
