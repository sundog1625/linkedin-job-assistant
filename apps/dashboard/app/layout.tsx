import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LinkedIn Job Assistant',
  description: 'Smart LinkedIn job application assistant with AI-powered insights',
  keywords: ['LinkedIn', 'job search', 'AI', 'career', 'resume', 'interview'],
  authors: [{ name: 'LinkedIn Job Assistant Team' }],
  openGraph: {
    title: 'LinkedIn Job Assistant',
    description: 'Smart LinkedIn job application assistant with AI-powered insights',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkedIn Job Assistant',
    description: 'Smart LinkedIn job application assistant with AI-powered insights',
  },
}

export default async function RootLayout({
  children,
  params: { locale = 'en' }
}: {
  children: React.ReactNode
  params: { locale?: string }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale} className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}