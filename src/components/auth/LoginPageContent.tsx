'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LoginForm } from './LoginForm'
import { OAuthButtons } from './OAuthButtons'
import { ApiUrlForm } from '@/components/profile/ApiUrlForm'
import { useLanguage } from '@/context/LanguageContext'
import type { AuthConfig } from '@/lib/api-client'

export function LoginPageContent({
  apiUrl,
  config = null,
}: {
  apiUrl: string
  config?: AuthConfig | null
}) {
  const { t } = useLanguage()
  const a = t.auth
  const [showServer, setShowServer] = useState(false)

  // Une API trop ancienne pour /auth/config → on propose tout, comme avant.
  const oauth = config?.oauth ?? { github: true, google: true }
  const hasOAuth = oauth.github || oauth.google

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
        <h1 className="font-serif text-[26px] leading-[1.15] tracking-editorial font-normal mb-1.5">
          {a.loginTitle}
        </h1>
        <p className="text-[13px] text-muted-foreground">{a.loginSubtitle}</p>
      </div>

      {hasOAuth && (
        <>
          <div className="space-y-3 mb-5">
            <OAuthButtons apiUrl={apiUrl} providers={oauth} />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border-soft)' }} />
            <span className="text-[11px] text-muted-foreground uppercase">{a.or}</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-soft)' }} />
          </div>
        </>
      )}

      <LoginForm />

      <p className="text-center text-[13px] text-muted-foreground mt-5">
        {a.noAccount}{' '}
        <Link
          href="/register"
          className="font-medium transition-colors"
          style={{ color: 'var(--peach)' }}
        >
          {a.signUp}
        </Link>
      </p>

      <div className="mt-6 border-t border-[var(--border-soft)] pt-4 text-center">
        <button
          type="button"
          onClick={() => setShowServer((v) => !v)}
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {a.server} · {hostOf(apiUrl)}
        </button>
        {showServer && (
          <div className="mt-3 text-left">
            <ApiUrlForm currentApiUrl={apiUrl} />
          </div>
        )}
      </div>
    </div>
  )
}

function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
