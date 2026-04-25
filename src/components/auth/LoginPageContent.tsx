'use client'

import Link from 'next/link'
import { LoginForm } from './LoginForm'
import { OAuthButtons } from './OAuthButtons'
import { useLanguage } from '@/context/LanguageContext'

export function LoginPageContent() {
  const { t } = useLanguage()
  const a = t.auth

  return (
    <div
      className="w-full max-w-[400px] rounded-[14px] p-8"
      style={{
        background: 'var(--surface)',
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
      }}
    >
      <div className="text-center mb-6">
        <h1 className="text-[20px] font-bold mb-1" style={{ letterSpacing: '-0.02em' }}>
          Bon retour
        </h1>
        <p className="text-[13px] text-muted-foreground">{a.loginSubtitle}</p>
      </div>

      <div className="space-y-3 mb-5">
        <OAuthButtons />
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px" style={{ background: 'hsl(var(--border))' }} />
        <span className="text-[11px] text-muted-foreground">ou continuer avec email</span>
        <div className="flex-1 h-px" style={{ background: 'hsl(var(--border))' }} />
      </div>

      <LoginForm />

      <p className="text-center text-[13px] text-muted-foreground mt-5">
        {a.noAccount}{' '}
        <Link
          href="/register"
          className="font-medium transition-colors"
          style={{ color: 'var(--teal)' }}
        >
          {a.signUp}
        </Link>
      </p>
    </div>
  )
}
