'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download, 
  Plus,
  Briefcase,
  Building,
  Calendar,
  Target
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Job {
  id: string
  title: string
  company: string
  location: string
  status: string
  dateAdded: string
  description?: string
}

interface CoverLetter {
  id: string
  jobId: string
  jobTitle: string
  company: string
  content: string
  createdAt: string
  version: number
}

export default function CoverLettersPage() {
  const { t } = useI18n()
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [customRequirements, setCustomRequirements] = useState('')

  // Load jobs from Job Tracker
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch('/api/jobs')
        if (response.ok) {
          const data = await response.json()
          setJobs(data.jobs || [])
        }
      } catch (error) {
        console.error('Failed to load jobs:', error)
      }
    }
    loadJobs()
  }, [])

  // Load saved cover letters
  useEffect(() => {
    const savedLetters = localStorage.getItem('coverLetters')
    if (savedLetters) {
      setCoverLetters(JSON.parse(savedLetters))
    }
  }, [])

  const generateCoverLetter = async () => {
    if (!selectedJob) {
      toast({
        title: 'Please select a job',
        description: 'Choose a job from your tracker to generate a targeted cover letter',
        variant: 'destructive'
      })
      return
    }

    setIsGenerating(true)
    const job = jobs.find(j => j.id === selectedJob)
    
    try {
      // Mock generation - in production, this would call an AI API
      setTimeout(() => {
        const mockContent = `Dear Hiring Manager,

I am writing to express my strong interest in the ${job?.title} position at ${job?.company}. With my extensive experience in software development and proven track record of delivering high-quality solutions, I am confident I would be a valuable addition to your team.

In my current role as a Senior Software Engineer, I have:
• Led the development of scalable web applications using React and Node.js
• Improved application performance by 40% through optimization techniques
• Mentored junior developers and conducted code reviews
• Collaborated with cross-functional teams to deliver projects on time

I am particularly excited about this opportunity at ${job?.company} because of your commitment to innovation and cutting-edge technology. Your recent work in [specific area] aligns perfectly with my expertise and interests.

${customRequirements ? `\nAdditionally, ${customRequirements}\n` : ''}

I would welcome the opportunity to discuss how my skills and experience can contribute to ${job?.company}'s continued success. Thank you for considering my application.

Best regards,
[Your Name]`

        setGeneratedContent(mockContent)
        
        // Save the cover letter
        const newLetter: CoverLetter = {
          id: Date.now().toString(),
          jobId: selectedJob,
          jobTitle: job?.title || '',
          company: job?.company || '',
          content: mockContent,
          createdAt: new Date().toISOString(),
          version: 1
        }
        
        const updatedLetters = [...coverLetters, newLetter]
        setCoverLetters(updatedLetters)
        localStorage.setItem('coverLetters', JSON.stringify(updatedLetters))
        
        setIsGenerating(false)
        
        toast({
          title: 'Cover letter generated!',
          description: 'Your targeted cover letter has been created successfully'
        })
      }, 2000)
    } catch (error) {
      setIsGenerating(false)
      toast({
        title: 'Generation failed',
        description: 'Please try again',
        variant: 'destructive'
      })
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
    toast({
      title: 'Copied!',
      description: 'Cover letter copied to clipboard'
    })
  }

  const downloadAsFile = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cover-letter-${selectedJob}.txt`
    a.click()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Cover Letters</h1>
        <p className="text-muted-foreground mt-2">
          Generate targeted cover letters for your job applications
        </p>
      </div>

      {/* Job Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Target Job</CardTitle>
          <CardDescription>
            Choose a job from your tracker to generate a targeted cover letter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger>
              <SelectValue placeholder="Select a job from your tracker" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} />
                    <span>{job.title} at {job.company}</span>
                    <Badge variant="outline" className="ml-2">
                      {job.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedJob && (
            <div className="bg-gray-50 p-4 rounded-lg">
              {(() => {
                const job = jobs.find(j => j.id === selectedJob)
                return job ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="text-gray-500" size={16} />
                      <span className="font-medium">{job.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="text-gray-500" size={16} />
                      <span className="text-sm text-gray-600">{job.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="text-gray-500" size={16} />
                      <span className="text-sm text-gray-600">Added: {new Date(job.dateAdded).toLocaleDateString()}</span>
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Requirements (Optional)
            </label>
            <Textarea
              placeholder="Add any specific points you want to emphasize or requirements from the job posting..."
              value={customRequirements}
              onChange={(e) => setCustomRequirements(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={generateCoverLetter} 
            disabled={isGenerating || !selectedJob}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Sparkles className="animate-spin mr-2" size={16} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2" size={16} />
                Generate Cover Letter
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Cover Letter</CardTitle>
            <CardDescription>
              AI-generated cover letter tailored for your selected position
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {generatedContent}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="mr-2" size={16} />
                Copy to Clipboard
              </Button>
              <Button onClick={downloadAsFile} variant="outline">
                <Download className="mr-2" size={16} />
                Download
              </Button>
              <Button variant="outline">
                <FileText className="mr-2" size={16} />
                Save as Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Cover Letters */}
      {coverLetters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Cover Letters</CardTitle>
            <CardDescription>
              Your previously generated cover letters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coverLetters.map((letter) => (
                <div 
                  key={letter.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{letter.jobTitle}</div>
                    <div className="text-sm text-gray-600">{letter.company}</div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(letter.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setGeneratedContent(letter.content)}
                    >
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}