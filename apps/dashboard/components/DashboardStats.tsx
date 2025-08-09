'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Send, Calendar, Gift, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsProps {
  stats: {
    totalJobs: number
    appliedJobs: number
    interviewsScheduled: number
    offersReceived: number
  }
}

export function DashboardStats({ stats }: StatsProps) {
  const statCards = [
    {
      title: 'Total Jobs Saved',
      value: stats.totalJobs,
      icon: Briefcase,
      description: 'Jobs in your tracker',
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      title: 'Applications Sent',
      value: stats.appliedJobs,
      icon: Send,
      description: 'This month',
      change: '+8%',
      changeType: 'increase' as const,
    },
    {
      title: 'Interviews Scheduled',
      value: stats.interviewsScheduled,
      icon: Calendar,
      description: 'Upcoming interviews',
      change: '+25%',
      changeType: 'increase' as const,
    },
    {
      title: 'Offers Received',
      value: stats.offersReceived,
      icon: Gift,
      description: 'Active offers',
      change: '+50%',
      changeType: 'increase' as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon
        const ChangeIcon = stat.changeType === 'increase' ? TrendingUp : TrendingDown
        
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mb-2">
                {stat.description}
              </p>
              <div className="flex items-center text-xs">
                <ChangeIcon className={`h-3 w-3 mr-1 ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className={
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }>
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}