'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Sparkles,
  Upload,
  RefreshCw,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface ProfileSection {
  id: string
  name: string
  status: 'completed' | 'suggestion' | 'warning'
  score: number
  maxScore: number
  percentage: number
  currentContent?: string
  suggestions: string[]
  aiRecommendation: string
}

export default function LinkedInProfilePage() {
  const { t } = useI18n()
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [profileUrl, setProfileUrl] = useState('')
  const [profileData, setProfileData] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [profileSections, setProfileSections] = useState<ProfileSection[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [overallRecommendation, setOverallRecommendation] = useState('')
  const [topPriorities, setTopPriorities] = useState<string[]>([])
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

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
    if (!profileUrl.trim() && !profileData.trim()) {
      toast({
        title: 'Input required',
        description: 'Please enter your LinkedIn profile URL or paste profile data',
        variant: 'destructive'
      })
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Parse profile data or extract from URL
      const profileSections = parseProfileInput(profileUrl, profileData)
      
      const response = await fetch('/api/analyze-linkedin-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileUrl: profileUrl || undefined,
          profileText: profileData || undefined,
          sections: profileSections
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      
      if (result.success) {
        setProfileSections(result.sections)
        setTotalScore(result.score)
        setOverallRecommendation(result.overallRecommendation)
        setTopPriorities(result.topPriorities || [])
        setHasAnalyzed(true)
        
        toast({
          title: 'Analysis complete!',
          description: `Your profile scored ${Math.round(result.percentage)}/100`
        })
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Profile analysis failed:', error)
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Simple profile data parser for demo purposes
  const parseProfileInput = (url: string, data: string) => {
    const sections: any = {}
    
    // Basic parsing logic - in production, this would be more sophisticated
    if (data.toLowerCase().includes('photo') || data.toLowerCase().includes('picture')) {
      sections.photo = true
    }
    
    if (data.toLowerCase().includes('banner') || data.toLowerCase().includes('background')) {
      sections.banner = 'custom'
    }
    
    // Look for headline patterns
    const headlineMatch = data.match(/headline[:\s]*([^\n]{10,200})/i)
    if (headlineMatch) {
      sections.headline = headlineMatch[1].trim()
    }
    
    // Look for about section
    const aboutMatch = data.match(/about[:\s]*([^\n]{50,})/i)
    if (aboutMatch) {
      sections.about = aboutMatch[1].trim()
    }
    
    // Look for experience
    if (data.toLowerCase().includes('experience') || data.toLowerCase().includes('work')) {
      sections.experience = [{ description: 'Sample experience' }]
    }
    
    // Look for skills
    const skillsMatch = data.match(/skills?[:\s]*([^\n]+)/i)
    if (skillsMatch) {
      sections.skills = skillsMatch[1].split(',').map(s => s.trim())
    }
    
    // Check for custom URL
    if (url.includes('linkedin.com/in/') && !url.includes('linkedin.com/in/') && url.match(/linkedin\.com\/in\/[a-zA-Z-]+$/)) {
      sections.customUrl = true
    }
    
    // Demo data for immediate testing
    if (!data && !url) {
      sections.photo = true
      sections.headline = 'Senior Software Engineer | Full Stack Developer | React Expert'
      sections.about = 'Experienced software engineer with 5+ years of experience building scalable web applications. Passionate about creating efficient solutions that drive business growth.'
      sections.experience = [
        { description: 'Led development of multiple React applications, increasing user engagement by 40%' },
        { description: 'Implemented microservices architecture improving system performance by 50%' }
      ]
      sections.skills = ['React', 'Node.js', 'TypeScript', 'AWS', 'Python']
      sections.openToWork = false
      sections.customUrl = false
      sections.education = []
      sections.featured = []
      sections.certifications = []
      sections.recommendations = []
    }
    
    return sections
  }

  const runDemoAnalysis = async () => {
    setIsAnalyzing(true)
    setProfileUrl('https://linkedin.com/in/demo-profile')
    
    // Simulate API call
    setTimeout(async () => {
      try {
        await analyzeProfile()
      } catch (error) {
        // Demo analysis with mock data
        const mockSections: ProfileSection[] = [
          {
            id: 'photo',
            name: 'Profile Photo',
            status: 'completed',
            score: 5,
            maxScore: 5,
            percentage: 100,
            currentContent: 'Professional headshot uploaded',
            suggestions: [],
            aiRecommendation: 'Your profile photo looks professional and appropriate.'
          },
          {
            id: 'headline',
            name: 'Headline',
            status: 'completed',
            score: 9,
            maxScore: 10,
            percentage: 90,
            currentContent: 'Senior Software Engineer | Full Stack Developer | React Expert',
            suggestions: ['Add more specific technologies'],
            aiRecommendation: 'Great headline! Consider adding specific frameworks you specialize in.'
          },
          {
            id: 'about',
            name: 'About',
            status: 'suggestion',
            score: 8,
            maxScore: 15,
            percentage: 53,
            currentContent: '120 words, 2 paragraphs',
            suggestions: [
              'Expand to 3-4 paragraphs',
              'Add quantifiable achievements',
              'Include a call-to-action'
            ],
            aiRecommendation: 'Your About section is decent but could be expanded with more specific achievements and metrics.'
          }
        ]
        
        setProfileSections(mockSections)
        setTotalScore(75)
        setOverallRecommendation('Good profile! You\'re well-positioned for opportunities. Focus on the remaining gaps to reach elite status.')
        setTopPriorities([
          'About: Expand to 3-4 paragraphs with more achievements',
          'Skills: Add more relevant skills (aim for 30-50)',
          'Recommendations: Request 2-3 recommendations from colleagues'
        ])
        setHasAnalyzed(true)
      }
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t.applicationMaterials.linkedinProfile.title}</h1>
        <p className="text-muted-foreground mt-2">
          {t.applicationMaterials.linkedinProfile.subtitle}
        </p>
      </div>

      {/* Profile Input */}
      <Card>
        <CardHeader>
          <CardTitle>{t.applicationMaterials.linkedinProfile.analyzeProfile}</CardTitle>
          <CardDescription>
            {t.applicationMaterials.linkedinProfile.analyzeDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                LinkedIn Profile URL
              </label>
              <Textarea
                placeholder="https://linkedin.com/in/your-profile"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Or paste your profile data
              </label>
              <Textarea
                placeholder="Paste your LinkedIn profile text here (about section, headline, experience, etc.)"
                value={profileData}
                onChange={(e) => setProfileData(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            
            <div className="flex gap-4">
              <Button onClick={analyzeProfile} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="animate-spin mr-2" size={16} />
                    {t.applicationMaterials.linkedinProfile.analyzing}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={16} />
                    Analyze Profile
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={runDemoAnalysis} disabled={isAnalyzing}>
                <TrendingUp className="mr-2" size={16} />
                Try Demo Analysis
              </Button>
              <Button variant="outline">
                <Upload className="mr-2" size={16} />
                {t.applicationMaterials.linkedinProfile.uploadData}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      {hasAnalyzed && (
        <Card>
          <CardHeader>
            <CardTitle>{t.applicationMaterials.linkedinProfile.profileScore}</CardTitle>
            <CardDescription>
              {t.applicationMaterials.linkedinProfile.scoreDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold">{totalScore}/100</span>
                <Badge className={cn(
                  "text-lg px-3 py-1",
                  totalScore >= 80 ? "bg-green-500" :
                  totalScore >= 60 ? "bg-yellow-500" :
                  "bg-red-500"
                )}>
                  {totalScore}%
                </Badge>
              </div>
              <Progress value={totalScore} className="h-3" />
              <p className="text-sm text-gray-600">
                {overallRecommendation || (
                  totalScore >= 80 
                    ? t.applicationMaterials.linkedinProfile.excellent
                    : totalScore >= 60
                    ? t.applicationMaterials.linkedinProfile.good
                    : t.applicationMaterials.linkedinProfile.needsWork
                )}
              </p>
              
              {topPriorities.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">🎯 Top Priorities:</h4>
                  <ul className="space-y-1">
                    {topPriorities.map((priority, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                        <span className="font-bold text-blue-600">{index + 1}.</span>
                        <span>{priority}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Sections */}
      {profileSections.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Detailed Analysis</h2>
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
                        {section.status === 'completed' ? t.applicationMaterials.linkedinProfile.optimized :
                         section.status === 'suggestion' ? t.applicationMaterials.linkedinProfile.canImprove :
                         t.applicationMaterials.linkedinProfile.needsAttention}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {section.percentage}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {section.score}/{section.maxScore} {t.applicationMaterials.linkedinProfile.points}
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                  <Progress value={section.percentage} className="h-2 mt-2" />
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="space-y-4">
                    {section.currentContent && (
                      <div>
                        <h4 className="font-medium mb-2">{t.applicationMaterials.linkedinProfile.currentStatus}</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {section.currentContent}
                        </p>
                      </div>
                    )}
                    
                    {section.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">{t.applicationMaterials.linkedinProfile.suggestions}</h4>
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
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="text-blue-500 mt-1" size={16} />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">{t.applicationMaterials.linkedinProfile.aiRecommendation}</h4>
                          <p className="text-sm text-blue-700">{section.aiRecommendation}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      {t.applicationMaterials.linkedinProfile.applyAI}
                    </Button>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}