'use client'

import { useLanguage } from '@/context/LanguageContext'
import type { Language } from '@/lib/translations'

const LANGUAGE_LABELS: Record<Language, string> = {
  en: '🇬🇧 English',
  fr: '🇫🇷 Français',
  de: '🇩🇪 Deutsch',
  es: '🇪🇸 Español',
  it: '🇮🇹 Italiano',
  pt: '🇵🇹 Português',
  ja: '🇯🇵 日本語',
  zh: '🇨🇳 中文',
}

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage()

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Language)}
      aria-label={t.common.language}
      className="bg-transparent text-sm leading-none px-1 py-0.5 rounded opacity-65 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {(Object.keys(LANGUAGE_LABELS) as Language[]).map((code) => (
        <option key={code} value={code}>
          {LANGUAGE_LABELS[code]}
        </option>
      ))}
    </select>
  )
}
