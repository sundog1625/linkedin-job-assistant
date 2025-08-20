'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Sparkles,
  Upload,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface ProfileSection {
  id: string
  name: string
  status: 'completed' | 'suggestion' | 'warning'
  score: number
  maxScore: number
  currentContent?: string
  suggestions?: string[]
  aiRecommendation?: string
}

export default function LinkedInProfilePage() {
  const { t } = useI18n()
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [profileUrl, setProfileUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Mock data - in production, this would come from API
  const [profileSections, setProfileSections] = useState<ProfileSection[]>([
    {
      id: 'photo',
      name: 'Profile Photo',
      status: 'completed',
      score: 10,
      maxScore: 10,
      currentContent: 'Professional headshot uploaded',
      suggestions: [],
      aiRecommendation: 'Your profile photo looks professional and appropriate.'
    },
    {
      id: 'banner',
      name: 'Banner',
      status: 'suggestion',
      score: 5,
      maxScore: 10,
      currentContent: 'Generic LinkedIn banner',
      suggestions: [
        'Use a custom banner that reflects your industry',
        'Include your professional tagline or key skills',
        'Ensure high resolution (1584x396px)'
      ],
      aiRecommendation: 'Consider adding a custom banner that showcases your expertise in software development.'
    },
    {
      id: 'headline',
      name: 'Headline',
      status: 'completed',
      score: 15,
      maxScore: 15,
      currentContent: 'Senior Software Engineer | Full Stack Developer | React & Node.js Expert',
      suggestions: [],
      aiRecommendation: 'Excellent headline with keywords and clear value proposition.'
    },
    {
      id: 'openToWork',
      name: 'Open To Work',
      status: 'suggestion',
      score: 0,
      maxScore: 5,
      currentContent: 'Not activated',
      suggestions: [
        'Enable "Open to Work" to increase visibility to recruiters',
        'Specify preferred job titles and locations',
        'Choose visibility settings (all LinkedIn members or recruiters only)'
      ],
      aiRecommendation: 'Activating this feature can increase recruiter views by 40%.'
    },
    {
      id: 'about',
      name: 'About',
      status: 'suggestion',
      score: 10,
      maxScore: 20,
      currentContent: 'Experienced software engineer with 5+ years in web development.',
      suggestions: [
        'Expand to 2-3 paragraphs (minimum 100 words)',
        'Include specific achievements and metrics',
        'Add relevant keywords for SEO',
        'Include a call-to-action'
      ],
      aiRecommendation: 'Your About section needs more detail. Include your unique value proposition, key achievements, and what you\'re looking for next.'
    },
    {
      id: 'experience',
      name: 'Experience',
      status: 'suggestion',
      score: 15,
      maxScore: 20,
      currentContent: '3 positions listed',
      suggestions: [
        'Add bullet points with quantifiable achievements',
        'Include relevant keywords and technologies',
        'Describe impact and results, not just responsibilities'
      ],
      aiRecommendation: 'Add 2-3 bullet points per role focusing on impact and achievements using the STAR method.'
    },
    {
      id: 'skills',
      name: 'Skills',
      status: 'suggestion',
      score: 8,
      maxScore: 10,
      currentContent: '15 skills listed',
      suggestions: [
        'Add up to 50 relevant skills',
        'Prioritize in-demand skills in your industry',
        'Get endorsements for top skills'
      ],
      aiRecommendation: 'Consider adding more specialized skills and getting endorsements from colleagues.'
    },
    {
      id: 'url',
      name: 'LinkedIn URL',
      status: 'warning',
      score: 0,
      maxScore: 5,
      currentContent: 'linkedin.com/in/john-doe-123456789',
      suggestions: [
        'Customize your LinkedIn URL for better branding',
        'Use format: linkedin.com/in/firstname-lastname',
        'Remove numbers and random characters'
      ],
      aiRecommendation: 'Customize your URL to linkedin.com/in/johndoe for better professional branding.'
    },
    {
      id: 'education',
      name: 'Education',
      status: 'warning',
      score: 3,
      maxScore: 10,
      currentContent: 'Bachelor\'s degree listed',
      suggestions: [
        'Add relevant coursework and projects',
        'Include GPA if 3.5 or higher',
        'Add certifications and online courses'
      ],
      aiRecommendation: 'Enhance your education section with relevant coursework and any honors received.'
    },
    {
      id: 'featured',
      name: 'Featured',
      status: 'suggestion',
      score: 0,
      maxScore: 5,
      currentContent: 'No featured content',
      suggestions: [
        'Add links to portfolio projects',
        'Feature published articles or posts',
        'Include media showcasing your work'
      ],
      aiRecommendation: 'Showcase your best work by adding 2-3 featured items.'
    },
    {
      id: 'certifications',
      name: 'Licenses & Certifications',
      status: 'suggestion',
      score: 2,
      maxScore: 5,
      currentContent: '1 certification listed',
      suggestions: [
        'Add relevant industry certifications',
        'Include expiration dates where applicable',
        'Link to credentialing organizations'
      ],
      aiRecommendation: 'Consider adding AWS, Azure, or other relevant tech certifications.'
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      status: 'suggestion',
      score: 0,
      maxScore: 10,
      currentContent: 'No recommendations',
      suggestions: [
        'Request 2-3 recommendations from colleagues',
        'Give recommendations to receive them',
        'Focus on managers and senior colleagues'
      ],
      aiRecommendation: 'Recommendations significantly boost profile credibility. Aim for at least 3.'
    }
  ])

  const totalScore = profileSections.reduce((acc, section) => acc + section.score, 0)
  const maxScore = profileSections.reduce((acc, section) => acc + section.maxScore, 0)
  const scorePercentage = Math.round((totalScore / maxScore) * 100)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-green-500" size={20} />
      case 'suggestion':
        return <AlertCircle className="text-yellow-500" size={20} />
      case 'warning':
        return <XCircle className="text-red-500" size={20} />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'suggestion':
        return 'text-yellow-600 bg-yellow-50'
      case 'warning':
        return 'text-red-600 bg-red-50'
      default:
        return ''
    }
  }

  const analyzeProfile = async () => {
    setIsAnalyzing(true)
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">LinkedIn Profile Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Optimize your LinkedIn profile to attract more opportunities
        </p>
      </div>

      {/* Profile URL Input */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze Your Profile</CardTitle>
          <CardDescription>
            Enter your LinkedIn profile URL or upload your profile data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="https://linkedin.com/in/your-profile"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-4">
              <Button onClick={analyzeProfile} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="animate-spin mr-2" size={16} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={16} />
                    Analyze Profile
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Upload className="mr-2" size={16} />
                Upload Profile Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Score</CardTitle>
          <CardDescription>
            Your LinkedIn profile optimization score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold">{totalScore}/{maxScore}</span>
              <Badge className={cn(
                "text-lg px-3 py-1",
                scorePercentage >= 80 ? "bg-green-500" :
                scorePercentage >= 60 ? "bg-yellow-500" :
                "bg-red-500"
              )}>
                {scorePercentage}%
              </Badge>
            </div>
            <Progress value={scorePercentage} className="h-3" />
            <p className="text-sm text-gray-600">
              {scorePercentage >= 80 
                ? "Excellent! Your profile is well-optimized."
                : scorePercentage >= 60
                ? "Good progress! A few improvements will make your profile stand out."
                : "Your profile needs attention. Follow the suggestions below to improve."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Sections */}
      <div className="space-y-4">
        {profileSections.map((section) => {
          const isExpanded = expandedSections.includes(section.id)
          
          return (
            <Card key={section.id}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(section.status)}
                    <CardTitle className="text-lg">{section.name}</CardTitle>
                    <Badge className={getStatusColor(section.status)}>
                      {section.status === 'completed' ? 'Optimized' :
                       section.status === 'suggestion' ? 'Can Improve' :
                       'Needs Attention'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {section.score}/{section.maxScore} points
                    </span>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="space-y-4">
                  {section.currentContent && (
                    <div>
                      <h4 className="font-medium mb-2">Current Status:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {section.currentContent}
                      </p>
                    </div>
                  )}
                  
                  {section.suggestions && section.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Suggestions:</h4>
                      <ul className="space-y-2">
                        {section.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span className="text-sm text-gray-600">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {section.aiRecommendation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="text-blue-500 mt-1" size={16} />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">AI Recommendation:</h4>
                          <p className="text-sm text-blue-700">{section.aiRecommendation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button variant="outline" size="sm">
                    Apply AI Suggestions
                  </Button>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}