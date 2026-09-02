import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { getServerTranslations } from '@/lib/serverLang'
import { getApiUrl } from '@/lib/apiUrl'
import { AdminPasswordForm } from '@/components/admin/AdminPasswordForm'
import { ApiUrlForm } from '@/components/profile/ApiUrlForm'

export default async function AdminSettingsPage() {
  const session = await getAdminSession()
  if (!session || session.role !== 'admin') redirect('/admin/login')

  const [t, apiUrl] = await Promise.all([getServerTranslations(), getApiUrl()])

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-semibold">{t.admin.pages.accountTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{session.email}</p>
      </div>
      <AdminPasswordForm />
      <ApiUrlForm currentApiUrl={apiUrl} />
    </div>
  )
}
