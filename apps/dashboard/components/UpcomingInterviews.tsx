'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Building, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Interview {
  id: string
  job_title: string
  company: string
  interview_date: string
  type: 'phone' | 'video' | 'onsite'
  interviewer?: string
}

interface UpcomingInterviewsProps {
  interviews: Interview[]
}

export function UpcomingInterviews({ interviews }: UpcomingInterviewsProps) {
  const getInterviewTypeColor = (type: string) => {
    switch (type) {
      case 'phone':
        return 'bg-blue-100 text-blue-800'
      case 'video':
        return 'bg-green-100 text-green-800'
      case 'onsite':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (interviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar size={20} />
            <span>Upcoming Interviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Calendar size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No interviews scheduled</p>
            <Button size="sm" variant="outline" asChild>
              <Link href="/interview">Prepare for Interviews</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar size={20} />
            <span>Upcoming Interviews</span>
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/interview">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div key={interview.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{interview.job_title}</h4>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                    <Building size={10} />
                    <span>{interview.company}</span>
                  </div>
                </div>
                <Badge className={`text-xs ${getInterviewTypeColor(interview.type)}`}>
                  {interview.type}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Clock size={10} />
                  <span>{formatDate(interview.interview_date)}</span>
                </div>
                <Button size="sm" variant="outline" className="h-6 text-xs" asChild>
                  <Link href={`/interview/${interview.id}`}>
                    <MessageSquare size={10} className="mr-1" />
                    Prepare
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}