import type { Metadata } from 'next'
import { RegisterPageContent } from '@/components/auth/RegisterPageContent'
import { fetchAuthConfig } from '@/lib/api-client'
import { getApiUrl } from '@/lib/apiUrl'

export const metadata: Metadata = {
  title: 'Inscription / Sign up — StayUp',
}

export default async function RegisterPage() {
  const [apiUrl, config] = await Promise.all([getApiUrl(), fetchAuthConfig()])
  return <RegisterPageContent apiUrl={apiUrl} config={config} />
}
