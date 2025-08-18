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
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { LanguageSelector } from '@/components/LanguageSelector'
interface SidebarItem {
  href: string
  icon: any
  label: string
  badge?: number
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { t } = useI18n()

  const sidebarItems: SidebarItem[] = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: t.navigation.dashboard,
    },
    {
      href: '/jobs',
      icon: Briefcase,
      label: t.navigation.jobs,
    },
    {
      href: '/resume',
      icon: FileText,
      label: t.navigation.resume,
    },
    {
      href: '/profile',
      icon: User,
      label: t.navigation.profile,
    },
    {
      href: '/ai-tools',
      icon: Zap,
      label: t.navigation.aiTools,
    },
  ]

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-linkedin rounded-lg flex items-center justify-center">
              <Briefcase size={20} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">JobAssistant</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group",
                    isActive 
                      ? "bg-linkedin text-white" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon size={20} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Language Selector and User Profile Section */}
      <div className="border-t border-gray-200">
        {/* Language Selector */}
        <div className="p-4">
          <LanguageSelector collapsed={collapsed} />
        </div>
        
        {/* User Profile Section */}
        {!collapsed && (
          <div className="p-4 pt-0">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Premium User</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}