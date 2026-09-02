'use client'

import { useState } from 'react'
import { AdminLoginForm } from './AdminLoginForm'
import { ApiUrlForm } from '@/components/profile/ApiUrlForm'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useLanguage } from '@/context/LanguageContext'

function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

export function AdminLoginContent({ apiUrl }: { apiUrl: string }) {
  const { t } = useLanguage()
  const [showServer, setShowServer] = useState(false)

  return (
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
          {t.admin.login.title}
        </h1>
        <p className="text-[13px] text-muted-foreground">{t.admin.login.subtitle}</p>
      </div>

      <AdminLoginForm />

      <div className="mt-6 border-t border-[var(--border-soft)] pt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowServer((v) => !v)}
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {t.auth.server} · {hostOf(apiUrl)}
        </button>
        <LanguageSwitcher />
      </div>
      {showServer && (
        <div className="mt-3 text-left">
          <ApiUrlForm currentApiUrl={apiUrl} />
        </div>
      )}
    </div>
  )
}
