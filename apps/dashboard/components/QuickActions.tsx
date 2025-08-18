'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Plus, 
  FileText, 
  User, 
  MessageSquare, 
  Zap,
  Search
} from 'lucide-react'

export function QuickActions() {
  const quickActions = [
    {
      title: 'Add New Job',
      description: 'Manually add a job to your tracker',
      icon: Plus,
      href: '/jobs/new',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Create Resume',
      description: 'Generate a new resume version',
      icon: FileText,
      href: '/resume?setup=true',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Optimize Profile',
      description: 'Get LinkedIn profile suggestions',
      icon: User,
      href: '/profile',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Practice Interview',
      description: 'Prepare for upcoming interviews',
      icon: MessageSquare,
      href: '/interview',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      title: 'AI Assistant',
      description: 'Generate content with AI',
      icon: Zap,
      href: '/ai-tools',
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      title: 'Find Jobs',
      description: 'Search for new opportunities',
      icon: Search,
      href: '/jobs/search',
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            
            return (
              <Link key={action.title} href={action.href}>
                <Button
                  variant="ghost"
                  className="h-auto flex-col p-4 space-y-2 hover:bg-gray-50"
                >
                  <div className={`p-3 rounded-lg text-white ${action.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-xs">{action.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}