import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/lib/i18n/context'

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LinkedIn Job Assistant',
  description: 'Smart LinkedIn job application assistant with AI-powered insights',
  keywords: ['LinkedIn', 'job search', 'AI', 'career', 'resume', 'interview'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}