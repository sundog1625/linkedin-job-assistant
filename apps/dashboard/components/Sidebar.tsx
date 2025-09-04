'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  User, 
  MessageSquare, 
  Users, 
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { LanguageSelector } from '@/components/LanguageSelector'

interface SubItem {
  href: string
  label: string
}

interface SidebarItem {
  href: string
  icon: any
  label: string
  badge?: number
  subItems?: SubItem[]
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const { t } = useI18n()

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const sidebarItems: SidebarItem[] = [
    {
      href: '/dashboard/dashboard',
      icon: LayoutDashboard,
      label: t.navigation.dashboard,
    },
    {
      href: '/dashboard/jobs',
      icon: Briefcase,
      label: t.navigation.jobs,
    },
    {
      href: '/dashboard/resume',
      icon: FileText,
      label: t.navigation.resume,
    },
    {
      href: '/dashboard/application-materials',
      icon: FolderOpen,
      label: t.navigation.applicationMaterials,
      subItems: [
        { href: '/dashboard/application-materials/cv', label: t.navigation.cv },
        { href: '/dashboard/application-materials/cover-letters', label: t.navigation.coverLetters },
        { href: '/dashboard/application-materials/linkedin-profile', label: t.navigation.linkedinProfile },
      ]
    },
    {
      href: '/dashboard/profile',
      icon: User,
      label: t.navigation.profile,
    },
    {
      href: '/dashboard/ai-tools',
      icon: Zap,
      label: t.navigation.aiTools,
    },
  ]

  return (
    <div className={cn(
      "bg-white/80 backdrop-blur-xl border-r border-white/20 transition-all duration-300 flex flex-col shadow-2xl",
      collapsed ? "w-16" : "w-64"
    )} style={{
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      background: 'rgba(255, 255, 255, 0.85)',
      borderRight: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-white/20" style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{
              background: 'linear-gradient(135deg, #007AFF, #5856D6)',
              boxShadow: '0 4px 16px rgba(0, 122, 255, 0.4)'
            }}>
              <Briefcase size={22} className="text-white" />
            </div>
            <span className="font-bold text-gray-900" style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              fontSize: '18px',
              fontWeight: '700',
              letterSpacing: '-0.5px',
              color: '#1d1d1f'
            }}>JobAssistant</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 w-10 rounded-xl hover:bg-white/50 transition-all duration-200"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isExpanded = expandedItems.includes(item.href)
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const hasSubItems = item.subItems && item.subItems.length > 0
            
            return (
              <div key={item.href}>
                {hasSubItems ? (
                  <>
                    <div
                      onClick={() => toggleExpanded(item.href)}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer group",
                        isActive 
                          ? "" 
                          : ""
                      )}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, #007AFF, #5856D6)',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
                        backdropFilter: 'blur(10px)'
                      } : {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: '#1d1d1f',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
                          e.currentTarget.style.transform = 'translateX(4px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                          e.currentTarget.style.transform = 'translateX(0px)'
                        }
                      }}
                    >
                      <Icon size={20} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 font-semibold" style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            fontSize: '15px',
                            fontWeight: '600',
                            letterSpacing: '-0.2px'
                          }}>{item.label}</span>
                          <ChevronDown 
                            size={16} 
                            className={cn(
                              "transition-all duration-200",
                              isExpanded ? "rotate-180" : ""
                            )}
                          />
                        </>
                      )}
                    </div>
                    {!collapsed && isExpanded && (
                      <div className="ml-8 mt-2 space-y-2">
                        {item.subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.href
                          return (
                            <Link key={subItem.href} href={subItem.href}>
                              <div
                                className={cn(
                                  "px-4 py-2 rounded-xl text-sm transition-all duration-200 group",
                                  isSubActive ? "" : ""
                                )}
                                style={isSubActive ? {
                                  background: 'rgba(0, 122, 255, 0.15)',
                                  color: '#007AFF',
                                  fontWeight: '600',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(0, 122, 255, 0.2)'
                                } : {
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  color: '#6e6e73',
                                  backdropFilter: 'blur(5px)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSubActive) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'
                                    e.currentTarget.style.color = '#1d1d1f'
                                    e.currentTarget.style.transform = 'translateX(4px)'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSubActive) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                                    e.currentTarget.style.color = '#6e6e73'
                                    e.currentTarget.style.transform = 'translateX(0px)'
                                  }
                                }}
                              >
                                <span style={{
                                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                  fontSize: '14px',
                                  letterSpacing: '-0.1px'
                                }}>{subItem.label}</span>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                        isActive ? "" : ""
                      )}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, #007AFF, #5856D6)',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
                        backdropFilter: 'blur(10px)'
                      } : {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: '#1d1d1f',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
                          e.currentTarget.style.transform = 'translateX(4px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                          e.currentTarget.style.transform = 'translateX(0px)'
                        }
                      }}
                    >
                      <Icon size={20} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 font-semibold" style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            fontSize: '15px',
                            fontWeight: '600',
                            letterSpacing: '-0.2px'
                          }}>{item.label}</span>
                          {item.badge && (
                            <span className="text-white text-xs rounded-full px-2 py-1" style={{
                              background: 'linear-gradient(135deg, #FF3B30, #FF2D92)',
                              fontSize: '11px',
                              fontWeight: '700',
                              boxShadow: '0 2px 8px rgba(255, 59, 48, 0.4)'
                            }}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Language Selector and User Profile Section */}
      <div className="border-t border-white/20" style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Language Selector */}
        <div className="p-4">
          <LanguageSelector collapsed={collapsed} />
        </div>
        
        {/* User Profile Section */}
        {!collapsed && (
          <div className="p-4 pt-0">
            <div className="flex items-center space-x-3 p-4 rounded-2xl group transition-all duration-200" style={{
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'
              e.currentTarget.style.transform = 'scale(1)'
            }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #34C759, #30D158)',
                boxShadow: '0 3px 12px rgba(52, 199, 89, 0.4)'
              }}>
                <User size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1d1d1f',
                  letterSpacing: '-0.2px'
                }}>John Doe</p>
                <p className="text-xs" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6e6e73',
                  letterSpacing: '-0.1px'
                }}>Premium User</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}