'use client'

import { useI18n } from '@/lib/i18n/context'

export const dynamic = 'force-dynamic'

export default function AIToolsPage() {
  const { t } = useI18n()
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">🤖 {t.aiTools.title}</h1>
        <p className="text-muted-foreground mt-2">
          {t.aiTools.subtitle}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-4">✉️</div>
          <h3 className="font-semibold mb-2">Email Templates</h3>
          <p className="text-gray-500 text-sm mb-4">
            Generate follow-up emails, thank you notes, and networking messages
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            Generate Email
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="font-semibold mb-2">Cover Letters</h3>
          <p className="text-gray-500 text-sm mb-4">
            Create personalized cover letters for job applications
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            Create Cover Letter
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="font-semibold mb-2">LinkedIn Posts</h3>
          <p className="text-gray-500 text-sm mb-4">
            Generate engaging LinkedIn posts to build your professional brand
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            Write Post
          </button>
        </div>
      </div>
    </div>
  )
}