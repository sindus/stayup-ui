import type { Metadata } from 'next'
import { RegisterPageContent } from '@/components/auth/RegisterPageContent'

export const metadata: Metadata = {
  title: 'Inscription / Sign up — StayUp',
}

export default function RegisterPage() {
  return <RegisterPageContent />
}
