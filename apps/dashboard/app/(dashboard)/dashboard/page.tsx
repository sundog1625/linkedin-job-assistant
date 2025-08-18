'use client'

import { useI18n } from '@/lib/i18n/context'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { t } = useI18n()
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t.navigation.dashboard}</h1>
        <p className="text-muted-foreground mt-2">
          {t.dashboard.welcome}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-blue-600">{t.dashboard.stats.jobsTracked}</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-green-600">{t.dashboard.stats.applications}</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-yellow-600">{t.dashboard.stats.interviews}</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-purple-600">{t.dashboard.stats.offers}</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{t.dashboard.recentActivity}</h2>
        <p className="text-gray-500">{t.dashboard.noActivity}</p>
      </div>
    </div>
  )
}