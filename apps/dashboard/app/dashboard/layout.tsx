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
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(135deg, #f0f4f7 0%, #e8f0f3 50%, #dce7ec 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Advanced Sidebar with Language Selector */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" style={{
        background: 'transparent'
      }}>
        {children}
      </main>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}