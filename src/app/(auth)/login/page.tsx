import type { Metadata } from 'next'
import { LoginPageContent } from '@/components/auth/LoginPageContent'
import { fetchAuthConfig } from '@/lib/api-client'
import { getApiUrl } from '@/lib/apiUrl'

export const metadata: Metadata = {
  title: 'Connexion / Sign in — StayUp',
}

export default async function LoginPage() {
  const [apiUrl, config] = await Promise.all([getApiUrl(), fetchAuthConfig()])
  return <LoginPageContent apiUrl={apiUrl} config={config} />
}
