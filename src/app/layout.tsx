import type { Metadata } from 'next'
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import { LanguageProvider } from '@/context/LanguageContext'
import { getServerLang, getServerTranslations } from '@/lib/serverLang'
import './globals.css'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: '400',
  style: ['normal', 'italic'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerTranslations()
  const m = t.landing.meta
  return {
    title: m.title,
    description: m.description,
    openGraph: {
      title: 'StayUp',
      description: m.ogDescription,
      type: 'website',
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getServerLang()

  return (
    <html
      lang={lang}
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className={instrumentSans.className}>
        <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
      </body>
    </html>
  )
}
