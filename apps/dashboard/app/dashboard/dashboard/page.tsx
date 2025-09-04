'use client'

import { useI18n } from '@/lib/i18n/context'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { t } = useI18n()
  
  return (
    <div className="space-y-8 p-8">
      {/* Header Section */}
      <div className="p-6 rounded-3xl" style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 className="text-4xl font-bold mb-2" style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          fontWeight: '800',
          letterSpacing: '-1px',
          color: '#1d1d1f',
          background: 'linear-gradient(135deg, #007AFF, #5856D6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>{t.navigation.dashboard}</h1>
        <p className="text-lg" style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          fontWeight: '500',
          color: '#6e6e73',
          letterSpacing: '-0.2px'
        }}>
          {t.dashboard.welcome}
        </p>
      </div>
      
      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: t.dashboard.stats.jobsTracked, 
            value: '0',
            gradient: 'linear-gradient(135deg, #007AFF, #5856D6)',
            icon: '📊',
            shadowColor: 'rgba(0, 122, 255, 0.3)'
          },
          { 
            title: t.dashboard.stats.applications, 
            value: '0',
            gradient: 'linear-gradient(135deg, #34C759, #30D158)',
            icon: '📝',
            shadowColor: 'rgba(52, 199, 89, 0.3)'
          },
          { 
            title: t.dashboard.stats.interviews, 
            value: '0',
            gradient: 'linear-gradient(135deg, #FF9500, #FF6B35)',
            icon: '💼',
            shadowColor: 'rgba(255, 149, 0, 0.3)'
          },
          { 
            title: t.dashboard.stats.offers, 
            value: '0',
            gradient: 'linear-gradient(135deg, #FF2D92, #FF3B30)',
            icon: '🎯',
            shadowColor: 'rgba(255, 45, 146, 0.3)'
          }
        ].map((stat, index) => (
          <div key={index} 
            className="p-6 rounded-3xl transition-all duration-300 hover:scale-105 group cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: `0 8px 32px ${stat.shadowColor}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
              e.currentTarget.style.boxShadow = `0 16px 48px ${stat.shadowColor}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px) scale(1)'
              e.currentTarget.style.boxShadow = `0 8px 32px ${stat.shadowColor}`
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
                background: stat.gradient,
                boxShadow: `0 4px 16px ${stat.shadowColor}`
              }}>
                <span style={{ fontSize: '20px' }}>{stat.icon}</span>
              </div>
            </div>
            <h3 className="font-semibold mb-2" style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: '15px',
              fontWeight: '600',
              color: '#6e6e73',
              letterSpacing: '-0.2px'
            }}>{stat.title}</h3>
            <p className="text-3xl font-bold" style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              fontWeight: '800',
              letterSpacing: '-1px',
              color: '#1d1d1f'
            }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="p-8 rounded-3xl transition-all duration-300" style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4" style={{
            background: 'linear-gradient(135deg, #8E8E93, #AEAEB2)',
            boxShadow: '0 4px 16px rgba(142, 142, 147, 0.3)'
          }}>
            <span style={{ fontSize: '20px' }}>📈</span>
          </div>
          <h2 className="text-2xl font-bold" style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            color: '#1d1d1f'
          }}>{t.dashboard.recentActivity}</h2>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
            background: 'rgba(142, 142, 147, 0.1)',
            border: '1px solid rgba(142, 142, 147, 0.2)'
          }}>
            <span style={{ fontSize: '24px', opacity: 0.6 }}>💤</span>
          </div>
          <p style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            fontSize: '16px',
            fontWeight: '500',
            color: '#6e6e73',
            letterSpacing: '-0.2px'
          }}>{t.dashboard.noActivity}</p>
        </div>
      </div>
    </div>
  )
}