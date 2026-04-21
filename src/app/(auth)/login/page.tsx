import type { Metadata } from 'next'
import { LoginPageContent } from '@/components/auth/LoginPageContent'

export const metadata: Metadata = {
  title: 'Connexion / Sign in — StayUp',
}

export default function LoginPage() {
  return <LoginPageContent />
}
