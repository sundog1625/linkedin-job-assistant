'use client'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold">LinkedIn Job Assistant</h1>
        </div>
      </header>

      <div className="flex">
        {/* Simple Sidebar */}
        <nav className="w-64 bg-white shadow-sm h-screen">
          <div className="p-4 space-y-2">
            <Link href="/dashboard" className="block p-3 rounded bg-blue-50 text-blue-700 font-medium">
              📊 Dashboard
            </Link>
            <Link href="/jobs" className="block p-3 rounded hover:bg-gray-50">
              💼 Jobs
            </Link>
            <Link href="/resume" className="block p-3 rounded hover:bg-gray-50">
              📄 Resume
            </Link>
            <Link href="/profile" className="block p-3 rounded hover:bg-gray-50">
              👤 Profile
            </Link>
            <Link href="/ai-tools" className="block p-3 rounded hover:bg-gray-50">
              🤖 AI Tools
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}