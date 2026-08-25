import Link from 'next/link'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import { AuroraWordmark } from '@/components/ui/aurora-mark'

export default function AdminLoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <Link href="/" className="mb-8">
        <AuroraWordmark size={15} />
      </Link>

      <div
        className="w-full max-w-sm rounded-[14px] p-8"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        }}
      >
        <div className="text-center mb-6">
          <h1 className="font-serif text-[24px] leading-[1.15] tracking-editorial font-normal mb-1">
            Administration
          </h1>
          <p className="text-[13px] text-muted-foreground">Accès restreint</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  )
}
