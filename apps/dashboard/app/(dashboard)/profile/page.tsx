'use client'

import { useI18n } from '@/lib/i18n/context'

export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const { t } = useI18n()
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t.profile.title}</h1>
        <p className="text-muted-foreground mt-2">
          {t.profile.subtitle}
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-xl font-semibold mb-2">Profile Analysis</h3>
        <p className="text-gray-500 mb-4">
          Get AI-powered suggestions to improve your LinkedIn profile
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Analyze Profile
        </button>
      </div>
    </div>
  )
}