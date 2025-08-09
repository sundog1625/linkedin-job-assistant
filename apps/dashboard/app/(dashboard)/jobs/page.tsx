'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Plus, 
  ExternalLink,
  Calendar,
  MapPin,
  Building,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { JobsService, type Job } from '@/lib/supabase'
import { formatRelativeTime, getJobStatusColor } from '@/lib/utils'
import Link from 'next/link'

const statusOptions = [
  { value: 'all', label: 'All Jobs', count: 0 },
  { value: 'saved', label: 'Saved', count: 0 },
  { value: 'applied', label: 'Applied', count: 0 },
  { value: 'interviewing', label: 'Interviewing', count: 0 },
  { value: 'offer', label: 'Offers', count: 0 },
  { value: 'rejected', label: 'Rejected', count: 0 },
]

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'match_score' | 'company'>('created_at')

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    filterAndSortJobs()
  }, [jobs, searchQuery, selectedStatus, sortBy])

  const loadJobs = async () => {
    try {
      setLoading(true)
      // Mock user ID for now - in real app this would come from auth
      const mockUserId = 'user-123'
      const jobsData = await JobsService.getJobs(mockUserId)
      setJobs(jobsData)
    } catch (error) {
      console.error('Error loading jobs:', error)
      // For demo purposes, use mock data
      setJobs(getMockJobs())
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortJobs = () => {
    let filtered = jobs

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(job => job.status === selectedStatus)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'match_score':
          return (b.match_score?.overall || 0) - (a.match_score?.overall || 0)
        case 'company':
          return a.company.localeCompare(b.company)
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredJobs(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'saved':
        return <Clock size={16} className="text-blue-500" />
      case 'applied':
        return <CheckCircle size={16} className="text-green-500" />
      case 'interviewing':
        return <TrendingUp size={16} className="text-yellow-500" />
      case 'offer':
        return <CheckCircle size={16} className="text-emerald-500" />
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />
      default:
        return <Briefcase size={16} className="text-gray-500" />
    }
  }

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      await JobsService.updateJob(jobId, { status: newStatus as any })
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus as any } : job
      ))
    } catch (error) {
      console.error('Error updating job status:', error)
    }
  }

  const deleteJob = async (jobId: string) => {
    try {
      await JobsService.deleteJob(jobId)
      setJobs(jobs.filter(job => job.id !== jobId))
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  // Update status counts
  const statusCounts = statusOptions.map(option => ({
    ...option,
    count: option.value === 'all' 
      ? jobs.length 
      : jobs.filter(job => job.status === option.value).length
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-linkedin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Job Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your job applications in one place
          </p>
        </div>
        <div className="flex space-x-4">
          <Button asChild>
            <Link href="/jobs/new">
              <Plus size={16} className="mr-2" />
              Add Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search jobs by title, company, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex space-x-2 overflow-x-auto">
              {statusCounts.map((status) => (
                <Button
                  key={status.value}
                  variant={selectedStatus === status.value ? "default" : "outline"}
                  onClick={() => setSelectedStatus(status.value)}
                  className="whitespace-nowrap"
                >
                  {status.label}
                  <Badge variant="secondary" className="ml-2">
                    {status.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter size={16} className="mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy('created_at')}>
                  Date Added
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('match_score')}>
                  Match Score
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('company')}>
                  Company
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedStatus !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Start by adding your first job or browse LinkedIn jobs with our extension'
              }
            </p>
            <Button asChild>
              <Link href="/jobs/new">
                <Plus size={16} className="mr-2" />
                Add Your First Job
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  {/* Job Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      {job.match_score && (
                        <Badge variant="outline" className="font-mono">
                          {job.match_score.overall}% match
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Building size={14} />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatRelativeTime(job.created_at)}</span>
                      </div>
                    </div>

                    {job.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.notes}
                      </p>
                    )}

                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getJobStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={job.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} className="mr-1" />
                          View
                        </a>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => updateJobStatus(job.id, 'applied')}>
                            Mark as Applied
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateJobStatus(job.id, 'interviewing')}>
                            Mark as Interviewing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateJobStatus(job.id, 'offer')}>
                            Mark as Offer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateJobStatus(job.id, 'rejected')}>
                            Mark as Rejected
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Link href={`/jobs/${job.id}/edit`}>Edit Job</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Generate Resume
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Generate Cover Letter
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => deleteJob(job.id)}
                          >
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Mock data for demo purposes
function getMockJobs(): Job[] {
  return [
    {
      id: '1',
      user_id: 'user-123',
      linkedin_url: 'https://linkedin.com/jobs/view/123456789',
      title: 'Senior Frontend Developer',
      company: 'Google',
      location: 'Mountain View, CA',
      description: 'We are looking for a Senior Frontend Developer to join our team...',
      match_score: { skills: 85, experience: 90, education: 75, location: 95, overall: 86 },
      status: 'applied',
      applied_date: '2024-01-15',
      notes: 'Applied through company website. Heard back from recruiter.',
      tags: ['react', 'typescript', 'frontend'],
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      user_id: 'user-123',
      linkedin_url: 'https://linkedin.com/jobs/view/987654321',
      title: 'Full Stack Engineer',
      company: 'Meta',
      location: 'Menlo Park, CA',
      description: 'Join our engineering team to build the next generation of social platforms...',
      match_score: { skills: 92, experience: 85, education: 80, location: 90, overall: 87 },
      status: 'interviewing',
      applied_date: '2024-01-12',
      interview_date: '2024-01-25T14:00:00Z',
      notes: 'Phone screen scheduled for next week.',
      tags: ['fullstack', 'react', 'node.js'],
      created_at: '2024-01-08T10:00:00Z',
      updated_at: '2024-01-18T10:00:00Z'
    },
    {
      id: '3',
      user_id: 'user-123',
      linkedin_url: 'https://linkedin.com/jobs/view/456789123',
      title: 'Software Engineer',
      company: 'Netflix',
      location: 'Los Gatos, CA',
      description: 'Help us scale our streaming platform to millions of users worldwide...',
      match_score: { skills: 78, experience: 70, education: 85, location: 80, overall: 78 },
      status: 'saved',
      notes: 'Interesting role, need to research more about the team.',
      tags: ['backend', 'microservices', 'scala'],
      created_at: '2024-01-05T10:00:00Z',
      updated_at: '2024-01-05T10:00:00Z'
    }
  ]
}