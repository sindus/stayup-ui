import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { LanguageProvider } from '@/context/LanguageContext'
import type { Language } from '@/lib/translations'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
  const lang = (cookieStore.get('lang')?.value === 'en' ? 'en' : 'fr') as Language

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
