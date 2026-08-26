import type { Metadata } from 'next'
import { RegisterPageContent } from '@/components/auth/RegisterPageContent'
import { getApiUrl } from '@/lib/apiUrl'

export const metadata: Metadata = {
  title: 'Inscription / Sign up — StayUp',
}

export default async function RegisterPage() {
  const apiUrl = await getApiUrl()
  return <RegisterPageContent apiUrl={apiUrl} />
}
