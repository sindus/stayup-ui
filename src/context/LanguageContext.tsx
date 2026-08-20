'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  en,
  fr,
  de,
  es,
  it,
  pt,
  ja,
  zh,
  type Translations,
  type Language,
} from '@/lib/translations'

const dictionaries: Record<Language, Translations> = { en, fr, de, es, it, pt, ja, zh }

interface LanguageContextType {
  lang: Language
  t: Translations
  setLang: (l: Language) => void
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({
  children,
  initialLang = 'en',
}: {
  children: ReactNode
  initialLang?: Language
}) {
  const [lang, setLangState] = useState<Language>(initialLang)
  const router = useRouter()

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`
    router.refresh()
  }

  return (
    <LanguageContext.Provider value={{ lang, t: dictionaries[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
