import { cookies } from 'next/headers'
import { LANG_COOKIE_NAME } from './constants'
import { en, fr, de, es, it, pt, ja, zh, type Language, type Translations } from './translations'

const dictionaries: Record<Language, Translations> = { en, fr, de, es, it, pt, ja, zh }
const SUPPORTED_LANGUAGES = Object.keys(dictionaries) as Language[]

/** Resolves the visitor's language from the `lang` cookie, for Server Components that
 *  render before LanguageProvider (page <title>, meta tags, and any content on the
 *  same request as the initial HTML). Defaults to English, matching LanguageProvider. */
export async function getServerLang(): Promise<Language> {
  const cookieStore = await cookies()
  const cookieLang = cookieStore.get(LANG_COOKIE_NAME)?.value
  return SUPPORTED_LANGUAGES.includes(cookieLang as Language) ? (cookieLang as Language) : 'en'
}

export async function getServerTranslations(): Promise<Translations> {
  return dictionaries[await getServerLang()]
}
