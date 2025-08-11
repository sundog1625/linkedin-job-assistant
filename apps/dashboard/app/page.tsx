'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🚀</span>
              <span className="text-xl font-bold text-gray-900">LinkedIn Job Assistant</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="default">
                  Enter Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Job Application Assistant
          </h1>
          <p className="text-xl text-gray-600">
            Smart analysis, personalized insights, and automated tracking
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-gray-600">Jobs Saved</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-gray-600">Applied</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">--%</div>
            <div className="text-gray-600">Match Score</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-gray-600">Interviews</div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">🎯 Getting Started</h2>
          <ol className="space-y-4 text-lg">
            <li>✅ Chrome Extension installed and active</li>
            <li>📋 Browse LinkedIn jobs to see AI analysis</li>
            <li>💾 Save interesting jobs for tracking</li>
            <li>📊 Manage applications in this dashboard</li>
          </ol>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full p-6 h-auto flex-col space-y-2">
              <span className="text-2xl">📊</span>
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline" className="w-full p-6 h-auto flex-col space-y-2">
              <span className="text-2xl">💼</span>
              <span>Jobs</span>
            </Button>
          </Link>
          <Link href="/resume">
            <Button variant="outline" className="w-full p-6 h-auto flex-col space-y-2">
              <span className="text-2xl">📄</span>
              <span>Resume</span>
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline" className="w-full p-6 h-auto flex-col space-y-2">
              <span className="text-2xl">👤</span>
              <span>Profile</span>
            </Button>
          </Link>
          <Link href="/ai-tools">
            <Button variant="outline" className="w-full p-6 h-auto flex-col space-y-2">
              <span className="text-2xl">🤖</span>
              <span>AI Tools</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}