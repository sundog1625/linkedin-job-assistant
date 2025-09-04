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
  const [improvingSection, setImprovingSection] = useState<string | null>(null)
  const [sectionImprovements, setSectionImprovements] = useState<{[key: string]: any}>({})
  const [analysisMode, setAnalysisMode] = useState<'fast' | 'deep'>('fast')

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
      const response = await fetch('/api/analyze-linkedin-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileUrl: profileUrl.trim() || undefined,
          profileText: profileData.trim() || undefined,
          analysisMode: analysisMode
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

  // Note: Profile parsing is now handled by AI in the backend
  const parseProfileInput = (url: string, data: string) => {
    // This function is no longer used since AI handles parsing on the backend
    // Keeping it for backwards compatibility, but it returns empty object
    return {}
  }

  const runDemoAnalysis = async () => {
    setIsAnalyzing(true)
    setProfileUrl('https://linkedin.com/in/demo-profile')
    setProfileData(`Senior Software Engineer | Full Stack Developer | React Expert

I'm a passionate software engineer with 5+ years of experience building scalable web applications. Currently working at Tech Corp where I lead a team of 5 developers.

EXPERIENCE:
- Senior Software Engineer at Tech Corp (2022-Present)
- Software Engineer at StartupXYZ (2020-2022)

SKILLS:
React, TypeScript, Node.js, Python, AWS, Docker, MongoDB, PostgreSQL

EDUCATION:
B.S. Computer Science, University of Technology (2020)

I'm always open to connecting with fellow developers and discussing new opportunities in full-stack development.`)
    
    // Use real analysis instead of mock data
    setTimeout(async () => {
      try {
        await analyzeProfile()
      } catch (error) {
        console.error('Demo analysis failed:', error)
        toast({
          title: 'Demo analysis failed',
          description: 'Please try entering your profile data manually',
          variant: 'destructive'
        })
      }
      setIsAnalyzing(false)
    }, 1000)
  }

  const improveSection = async (section: ProfileSection) => {
    setImprovingSection(section.id)
    
    try {
      const response = await fetch('/api/improve-linkedin-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: section.id,
          sectionName: section.name,
          currentContent: section.currentContent,
          currentScore: section.score,
          maxScore: section.maxScore,
          profileContext: {
            headline: profileSections.find(s => s.id === 'headline')?.currentContent,
            about: profileSections.find(s => s.id === 'about')?.currentContent,
            experience: profileSections.find(s => s.id === 'experience')?.currentContent,
            skills: profileSections.find(s => s.id === 'skills')?.currentContent,
            profileUrl: profileUrl
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate improvement')
      }

      const result = await response.json()
      
      if (result.success) {
        setSectionImprovements(prev => ({
          ...prev,
          [section.id]: result.improvement
        }))
        
        toast({
          title: 'AI improvement generated!',
          description: `Improvement suggestions for ${section.name} are ready`
        })
      } else {
        throw new Error(result.error || 'Failed to generate improvement')
      }
    } catch (error) {
      console.error('Section improvement failed:', error)
      toast({
        title: 'Improvement generation failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setImprovingSection(null)
    }
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
                {t.applicationMaterials.linkedinProfile.profileUrl}
              </label>
              <Textarea
                placeholder={t.applicationMaterials.linkedinProfile.profileUrlPlaceholder}
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {t.applicationMaterials.linkedinProfile.orPasteData}
              </label>
              <Textarea
                placeholder={t.applicationMaterials.linkedinProfile.pasteDataPlaceholder}
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
                    {t.applicationMaterials.linkedinProfile.analyzeBtn}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={runDemoAnalysis} disabled={isAnalyzing}>
                <TrendingUp className="mr-2" size={16} />
                {t.applicationMaterials.linkedinProfile.tryDemo}
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
                  <h4 className="font-medium text-blue-900 mb-2">{t.applicationMaterials.linkedinProfile.topPriorities}</h4>
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
          <h2 className="text-2xl font-bold">{t.applicationMaterials.linkedinProfile.detailedAnalysis}</h2>
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
                    
                    {/* AI Improvement Section */}
                    {sectionImprovements[section.id] && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="text-green-600" size={16} />
                          <h4 className="font-medium text-green-900">{t.applicationMaterials.linkedinProfile.improvementSuggestions}</h4>
                        </div>
                        
                        {sectionImprovements[section.id].improvements?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-green-800 mb-2">{t.applicationMaterials.linkedinProfile.specificImprovements}</h5>
                            <ul className="space-y-1">
                              {sectionImprovements[section.id].improvements.map((improvement: string, index: number) => (
                                <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                                  <span className="text-green-500 mt-1">•</span>
                                  <span>{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {sectionImprovements[section.id].recommendedContent && (
                          <div>
                            <h5 className="font-medium text-green-800 mb-2">{t.applicationMaterials.linkedinProfile.recommendedContent}</h5>
                            <div className="text-sm text-green-700 bg-green-100 p-3 rounded border-l-4 border-green-400">
                              <pre className="whitespace-pre-wrap font-sans">{sectionImprovements[section.id].recommendedContent}</pre>
                            </div>
                          </div>
                        )}
                        
                        {sectionImprovements[section.id].keywords?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-green-800 mb-2">{t.applicationMaterials.linkedinProfile.keywordSuggestions}</h5>
                            <div className="flex flex-wrap gap-2">
                              {sectionImprovements[section.id].keywords.map((keyword: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {sectionImprovements[section.id].impact && (
                          <div>
                            <h5 className="font-medium text-green-800 mb-2">{t.applicationMaterials.linkedinProfile.whyImportant}</h5>
                            <p className="text-sm text-green-700">{sectionImprovements[section.id].impact}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => improveSection(section)}
                        disabled={improvingSection === section.id}
                      >
                        {improvingSection === section.id ? (
                          <>
                            <Sparkles className="animate-spin mr-2" size={14} />
                            {t.applicationMaterials.linkedinProfile.generating}
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2" size={14} />
                            {t.applicationMaterials.linkedinProfile.aiImprovement}
                          </>
                        )}
                      </Button>
                      
                      {sectionImprovements[section.id] && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => {
                            // Copy improvement to clipboard
                            navigator.clipboard.writeText(sectionImprovements[section.id].recommendedContent || sectionImprovements[section.id].fullResponse)
                            toast({
                              title: t.applicationMaterials.linkedinProfile.copiedToClipboard,
                              description: t.applicationMaterials.linkedinProfile.copiedDescription
                            })
                          }}
                        >
                          {t.applicationMaterials.linkedinProfile.copySuggestion}
                        </Button>
                      )}
                    </div>
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