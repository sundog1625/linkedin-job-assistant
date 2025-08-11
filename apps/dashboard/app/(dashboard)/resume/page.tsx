'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileText, 
  Download, 
  Edit,
  Copy,
  Trash2,
  Eye,
  Sparkles,
  Target,
  Calendar,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'

interface CVVersion {
  id: string
  title: string
  content: string
  version: number
  is_active: boolean
  job_id?: string
  job_title?: string
  created_at: string
}

export default function ResumePage() {
  const [cvVersions, setCvVersions] = useState<CVVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewCVDialog, setShowNewCVDialog] = useState(false)
  const [newCVTitle, setNewCVTitle] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')

  useEffect(() => {
    loadCVVersions()
  }, [])

  const loadCVVersions = async () => {
    try {
      setLoading(true)
      // In real app, this would fetch from Supabase
      setCvVersions(getMockCVs())
    } catch (error) {
      console.error('Error loading CV versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCVs = cvVersions.filter(cv =>
    cv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cv.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const createNewCV = async () => {
    if (!newCVTitle.trim()) return

    const newCV: CVVersion = {
      id: Date.now().toString(),
      title: newCVTitle,
      content: getDefaultCVContent(),
      version: cvVersions.length + 1,
      is_active: false,
      job_id: selectedJobId || undefined,
      job_title: selectedJobId ? 'Software Engineer at Google' : undefined,
      created_at: new Date().toISOString()
    }

    setCvVersions([newCV, ...cvVersions])
    setNewCVTitle('')
    setSelectedJobId('')
    setShowNewCVDialog(false)
  }

  const setActiveCV = (id: string) => {
    setCvVersions(cvVersions.map(cv => ({
      ...cv,
      is_active: cv.id === id
    })))
  }

  const duplicateCV = (cv: CVVersion) => {
    const duplicated: CVVersion = {
      ...cv,
      id: Date.now().toString(),
      title: `${cv.title} (Copy)`,
      version: cvVersions.length + 1,
      is_active: false,
      created_at: new Date().toISOString()
    }
    setCvVersions([duplicated, ...cvVersions])
  }

  const deleteCV = (id: string) => {
    setCvVersions(cvVersions.filter(cv => cv.id !== id))
  }

  const downloadCV = (cv: CVVersion) => {
    const element = document.createElement('a')
    const file = new Blob([cv.content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${cv.title}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const generateCVForJob = async (jobId: string) => {
    // AI-powered CV generation for specific job
    const optimizedCV: CVVersion = {
      id: Date.now().toString(),
      title: `CV for Software Engineer at Google`,
      content: getOptimizedCVContent(),
      version: cvVersions.length + 1,
      is_active: false,
      job_id: jobId,
      job_title: 'Software Engineer at Google',
      created_at: new Date().toISOString()
    }

    setCvVersions([optimizedCV, ...cvVersions])
  }

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
          <h1 className="text-3xl font-bold">Resume Manager</h1>
          <p className="text-muted-foreground mt-2">
            Create, customize, and manage multiple resume versions for different opportunities
          </p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => generateCVForJob('job-123')}>
            <Sparkles size={16} className="mr-2" />
            AI Generate
          </Button>
          <Dialog open={showNewCVDialog} onOpenChange={setShowNewCVDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                New Resume
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Resume</DialogTitle>
                <DialogDescription>
                  Create a new resume version. You can start from scratch or base it on a specific job.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Resume Title</label>
                  <Input
                    placeholder="e.g., Senior Developer Resume, Frontend Focus..."
                    value={newCVTitle}
                    onChange={(e) => setNewCVTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Job (Optional)</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    <option value="">General Resume</option>
                    <option value="job-1">Software Engineer at Google</option>
                    <option value="job-2">Full Stack Developer at Meta</option>
                    <option value="job-3">Senior Developer at Netflix</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewCVDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createNewCV} disabled={!newCVTitle.trim()}>
                    Create Resume
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search resumes by title or job..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline">
                {cvVersions.length} Total
              </Badge>
              <Badge variant="secondary">
                {cvVersions.filter(cv => cv.is_active).length} Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CV Versions Grid */}
      {filteredCVs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No resumes found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create your first resume to get started with job applications'
              }
            </p>
            <Button onClick={() => setShowNewCVDialog(true)}>
              <Plus size={16} className="mr-2" />
              Create Your First Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCVs.map((cv) => (
            <Card key={cv.id} className={`hover:shadow-lg transition-all ${
              cv.is_active ? 'ring-2 ring-linkedin border-linkedin' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {cv.title}
                    </CardTitle>
                    {cv.job_title && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center">
                        <Target size={12} className="mr-1" />
                        {cv.job_title}
                      </p>
                    )}
                  </div>
                  {cv.is_active && (
                    <Badge variant="default" className="ml-2">Active</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Preview */}
                  <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-600 line-clamp-3">
                    {cv.content.substring(0, 150)}...
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{formatRelativeTime(cv.created_at)}</span>
                    </div>
                    <span>Version {cv.version}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href={`/resume/${cv.id}/edit`}>
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant={cv.is_active ? "outline" : "default"}
                      onClick={() => cv.is_active ? null : setActiveCV(cv.id)}
                      disabled={cv.is_active}
                    >
                      {cv.is_active ? 'Active' : 'Set Active'}
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/resume/${cv.id}/preview`}>
                            <Eye size={14} className="mr-2" />
                            Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadCV(cv)}>
                          <Download size={14} className="mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateCV(cv)}>
                          <Copy size={14} className="mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => deleteCV(cv.id)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Create different resume versions for different types of roles</li>
            <li>• Use the AI generator to optimize your resume for specific jobs</li>
            <li>• Set one resume as active to use for quick applications</li>
            <li>• Download resumes in PDF format for best compatibility</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

// Mock data and helpers
function getMockCVs(): CVVersion[] {
  return [
    {
      id: '1',
      title: 'Senior Frontend Developer Resume',
      content: getDefaultCVContent(),
      version: 1,
      is_active: true,
      created_at: '2024-01-20T10:00:00Z'
    },
    {
      id: '2',
      title: 'Full Stack Engineer Resume',
      content: getDefaultCVContent(),
      version: 2,
      is_active: false,
      job_id: 'job-123',
      job_title: 'Full Stack Engineer at Meta',
      created_at: '2024-01-18T10:00:00Z'
    },
    {
      id: '3',
      title: 'Backend Developer Resume',
      content: getDefaultCVContent(),
      version: 3,
      is_active: false,
      created_at: '2024-01-15T10:00:00Z'
    }
  ]
}

function getDefaultCVContent(): string {
  return `John Doe
Senior Software Engineer

CONTACT INFORMATION
Email: john.doe@email.com
Phone: (555) 123-4567
Location: San Francisco, CA
LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 8+ years of experience developing scalable web applications and leading cross-functional teams. Expertise in React, Node.js, and cloud technologies.

TECHNICAL SKILLS
• Languages: JavaScript, TypeScript, Python, Java
• Frontend: React, Vue.js, HTML5, CSS3, Sass
• Backend: Node.js, Express, Django, Spring Boot
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS, Google Cloud, Docker, Kubernetes
• Tools: Git, Jenkins, Jira, Figma

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020 - Present
• Led development of customer portal serving 100K+ users
• Reduced page load times by 40% through performance optimization
• Mentored 5 junior developers and established code review processes

Software Engineer | StartupXYZ | 2018 - 2020
• Built microservices architecture handling 1M+ requests daily
• Implemented CI/CD pipeline reducing deployment time by 60%
• Collaborated with product team to deliver features ahead of schedule

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2018

CERTIFICATIONS
• AWS Certified Solutions Architect
• Google Cloud Professional Developer`
}

function getOptimizedCVContent(): string {
  return `John Doe
Senior Software Engineer

CONTACT INFORMATION
Email: john.doe@email.com
Phone: (555) 123-4567
Location: San Francisco, CA
LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Results-driven Senior Software Engineer with 8+ years of experience building large-scale distributed systems and leading high-performance engineering teams. Proven expertise in modern web technologies, cloud infrastructure, and agile development practices. Passionate about creating exceptional user experiences and driving technical excellence.

TECHNICAL SKILLS
• Languages: JavaScript, TypeScript, Python, Java, Go
• Frontend: React, Next.js, Vue.js, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express, Django, Spring Boot, GraphQL
• Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
• Cloud: AWS, Google Cloud, Azure, Docker, Kubernetes, Terraform
• Tools: Git, Jenkins, CircleCI, Jira, Figma, DataDog

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020 - Present
• Architected and led development of customer-facing portal serving 100K+ daily active users with 99.9% uptime
• Optimized application performance achieving 40% reduction in page load times and 25% improvement in Core Web Vitals
• Led cross-functional team of 8 engineers, establishing best practices for code reviews, testing, and deployment
• Implemented real-time features using WebSocket connections, improving user engagement by 30%
• Mentored 5 junior developers, with 100% retention and 3 promotions within the team

Software Engineer | StartupXYZ | 2018 - 2020
• Designed and built microservices architecture processing 1M+ API requests daily with sub-100ms response times
• Established CI/CD pipeline using Jenkins and Docker, reducing deployment time from 2 hours to 15 minutes
• Collaborated closely with product managers and designers to deliver 15+ major features ahead of schedule
• Implemented comprehensive monitoring and alerting system, reducing production incidents by 50%

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2018
GPA: 3.8/4.0, Dean's List

CERTIFICATIONS & ACHIEVEMENTS
• AWS Certified Solutions Architect - Professional
• Google Cloud Professional Developer
• Certified Scrum Master (CSM)
• Speaker at React Conf 2023 - "Building Scalable Component Libraries"

PROJECTS
• Open Source Contributor: React Testing Library (2K+ GitHub stars)
• Technical Blog: medium.com/@johndoe (10K+ followers, 50+ articles)
• Side Project: Developer tool with 5K+ active users`
}