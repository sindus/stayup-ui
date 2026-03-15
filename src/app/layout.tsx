import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
