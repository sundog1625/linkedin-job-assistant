'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  ExternalLink, 
  Building, 
  MapPin, 
  Calendar 
} from 'lucide-react'
import { formatRelativeTime, getJobStatusColor } from '@/lib/utils'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  company: string
  location: string
  status: string
  match_score?: { overall: number }
  created_at: string
  linkedin_url: string
}

interface RecentJobsProps {
  jobs: Job[]
}

export function RecentJobs({ jobs }: RecentJobsProps) {
  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase size={20} />
            <span>Recent Jobs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground mb-4">No jobs saved yet</p>
            <Button asChild>
              <Link href="/jobs">Browse Jobs</Link>
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
            <Briefcase size={20} />
            <span>Recent Jobs</span>
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/jobs">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{job.title}</h4>
                  {job.match_score && (
                    <Badge variant="outline" className="text-xs">
                      {job.match_score.overall}% match
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Building size={12} />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin size={12} />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{formatRelativeTime(job.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${getJobStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={job.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={12} />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}