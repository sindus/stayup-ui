import type { Metadata } from 'next'
import { DM_Sans, JetBrains_Mono } from 'next/font/google'
import { cookies } from 'next/headers'
import { LanguageProvider } from '@/context/LanguageContext'
import type { Language } from '@/lib/translations'
import './globals.css'

const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'de', 'es', 'it', 'pt', 'ja', 'zh']

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'StayUp — Restez à jour',
  description:
    'Suivez les dernières mises à jour de vos projets GitHub et chaînes YouTube en un seul endroit.',
  openGraph: {
    title: 'StayUp',
    description: 'Agrégateur de mises à jour GitHub et YouTube',
    type: 'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const cookieLang = cookieStore.get('lang')?.value
  const lang: Language = SUPPORTED_LANGUAGES.includes(cookieLang as Language)
    ? (cookieLang as Language)
    : 'en'

  return (
    <html lang={lang} className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className={dmSans.className}>
        <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
      </body>
    </html>
  )
}
