import type { Metadata } from 'next'
import { LoginPageContent } from '@/components/auth/LoginPageContent'
import { getApiUrl } from '@/lib/apiUrl'

export const metadata: Metadata = {
  title: 'Connexion / Sign in — StayUp',
}

export default async function LoginPage() {
  const apiUrl = await getApiUrl()
  return <LoginPageContent apiUrl={apiUrl} />
}
