import Link from 'next/link'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'hsl(var(--background))' }}
    >
      <Link href="/" className="flex items-center gap-2 mb-8">
        <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
          <rect width="26" height="26" rx="6" fill="var(--teal)" />
          <path d="M13 6L19.5 15H15V20H11V15H6.5L13 6Z" fill="#09090b" />
        </svg>
        <span className="font-semibold text-[15px]" style={{ letterSpacing: '-0.02em' }}>
          StayUp
        </span>
      </Link>

      <div
        className="w-full max-w-sm rounded-[14px] p-8"
        style={{
          background: 'var(--surface)',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        }}
      >
        <div className="text-center mb-6">
          <h1 className="text-[20px] font-bold mb-1" style={{ letterSpacing: '-0.02em' }}>
            Administration
          </h1>
          <p className="text-[13px] text-muted-foreground">Accès restreint</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  )
}
