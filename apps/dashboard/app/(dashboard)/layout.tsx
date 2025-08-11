'use client'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}