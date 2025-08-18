'use client'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

import { Sidebar } from '@/components/Sidebar'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Advanced Sidebar with Language Selector */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}