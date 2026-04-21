'use client'

import { useLanguage } from '@/context/LanguageContext'
import type { Language } from '@/lib/translations'

const FLAGS: Record<Language, string> = { fr: '🇫🇷', en: '🇬🇧' }

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Langue / Language">
      {(['fr', 'en'] as Language[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          title={l === 'fr' ? 'Français' : 'English'}
          aria-label={l === 'fr' ? 'Français' : 'English'}
          className={`text-base leading-none px-1 py-0.5 rounded transition-opacity ${
            lang === l ? 'opacity-100' : 'opacity-35 hover:opacity-65'
          }`}
        >
          {FLAGS[l]}
        </button>
      ))}
    </div>
  )
}
