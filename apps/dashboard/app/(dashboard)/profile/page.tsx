'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Camera, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Star
} from 'lucide-react'

interface ProfileSection {
  id: string
  name: string
  icon: React.ComponentType<{ size?: number }>
  score: number
  maxScore: number
  status: 'completed' | 'needs_improvement' | 'missing'
  suggestions: string[]
}

export default function ProfilePage() {
  const [profileScore, setProfileScore] = useState(75)
  const [sections, setSections] = useState<ProfileSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      // In real app, this would fetch from LinkedIn API and Supabase
      setSections(getMockProfileSections())
      calculateOverallScore()
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateOverallScore = () => {
    const sections = getMockProfileSections()
    const totalScore = sections.reduce((sum, section) => sum + section.score, 0)
    const maxTotal = sections.reduce((sum, section) => sum + section.maxScore, 0)
    const overall = Math.round((totalScore / maxTotal) * 100)
    setProfileScore(overall)
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'text-green-600 bg-green-100'
    if (percentage >= 60) return 'text-blue-600 bg-blue-100'
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-500" />
      case 'needs_improvement':
        return <AlertCircle size={20} className="text-yellow-500" />
      case 'missing':
        return <AlertCircle size={20} className="text-red-500" />
      default:
        return <AlertCircle size={20} className="text-gray-500" />
    }
  }

  const improvementTips = [
    "Add a professional headshot - profiles with photos get 14x more views",
    "Optimize your headline with relevant keywords for your industry",
    "Write a compelling summary that tells your professional story",
    "Add at least 5 relevant skills to your profile",
    "Get 3+ recommendations from colleagues or clients",
    "Share industry insights regularly to increase visibility"
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-linkedin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">LinkedIn Profile Optimizer</h1>
          <p className="text-muted-foreground mt-2">
            Improve your LinkedIn profile to attract more opportunities and stand out to recruiters
          </p>
        </div>
        <Button variant="linkedin">
          <LinkIcon size={16} className="mr-2" />
          View LinkedIn Profile
        </Button>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Score Circle */}
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-linkedin">{profileScore}%</div>
                  <div className="text-sm text-gray-600">Profile Score</div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 bg-linkedin text-white rounded-full p-2">
                <TrendingUp size={20} />
              </div>
            </div>

            {/* Score Details */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl font-bold mb-2">
                {profileScore >= 80 ? 'Excellent Profile!' : 
                 profileScore >= 60 ? 'Good Profile' : 
                 profileScore >= 40 ? 'Needs Improvement' : 'Incomplete Profile'}
              </h2>
              <p className="text-gray-600 mb-4">
                {profileScore >= 80 
                  ? 'Your profile is well-optimized and likely to attract recruiters.'
                  : profileScore >= 60
                  ? 'Your profile is good but has room for improvement.'
                  : 'Your profile needs work to maximize your visibility.'
                }
              </p>
              <Progress value={profileScore} className="w-full max-w-md mx-auto lg:mx-0" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          const percentage = (section.score / section.maxScore) * 100
          
          return (
            <Card key={section.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon size={20} className="text-gray-600" />
                    </div>
                    <CardTitle className="text-lg">{section.name}</CardTitle>
                  </div>
                  {getStatusIcon(section.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Score</span>
                    <Badge className={getScoreColor(section.score, section.maxScore)}>
                      {section.score}/{section.maxScore}
                    </Badge>
                  </div>
                  
                  <Progress value={percentage} className="w-full" />
                  
                  {/* Suggestions */}
                  {section.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">Suggestions:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {section.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Star size={12} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled={section.status === 'completed'}
                  >
                    {section.status === 'completed' ? 'Completed' : 'Improve This'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Improvement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp size={20} className="text-linkedin" />
            <span>Quick Improvement Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {improvementTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="bg-linkedin text-white rounded-full p-1 flex-shrink-0 mt-0.5">
                  <CheckCircle size={12} />
                </div>
                <span className="text-sm text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-linkedin">85%</div>
              <div className="text-sm text-gray-600">Average Score</div>
              <div className="text-xs text-gray-500">Software Engineers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">92%</div>
              <div className="text-sm text-gray-600">Top 10%</div>
              <div className="text-xs text-gray-500">In Your Field</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">78%</div>
              <div className="text-sm text-gray-600">Your Goal</div>
              <div className="text-xs text-gray-500">Next Milestone</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getMockProfileSections(): ProfileSection[] {
  return [
    {
      id: 'photo',
      name: 'Profile Photo',
      icon: Camera,
      score: 10,
      maxScore: 10,
      status: 'completed',
      suggestions: []
    },
    {
      id: 'banner',
      name: 'Background Banner',
      icon: ImageIcon,
      score: 5,
      maxScore: 10,
      status: 'needs_improvement',
      suggestions: ['Add a professional background image that reflects your industry']
    },
    {
      id: 'headline',
      name: 'Headline',
      icon: User,
      score: 7,
      maxScore: 10,
      status: 'needs_improvement',
      suggestions: [
        'Include relevant keywords for your target role',
        'Mention your key skills or specializations'
      ]
    },
    {
      id: 'summary',
      name: 'About Section',
      icon: User,
      score: 6,
      maxScore: 10,
      status: 'needs_improvement',
      suggestions: [
        'Tell your professional story in 2-3 paragraphs',
        'Include quantifiable achievements',
        'Add a call-to-action at the end'
      ]
    },
    {
      id: 'experience',
      name: 'Experience',
      icon: Briefcase,
      score: 8,
      maxScore: 10,
      status: 'completed',
      suggestions: []
    },
    {
      id: 'education',
      name: 'Education',
      icon: GraduationCap,
      score: 9,
      maxScore: 10,
      status: 'completed',
      suggestions: []
    },
    {
      id: 'skills',
      name: 'Skills',
      icon: Award,
      score: 5,
      maxScore: 10,
      status: 'needs_improvement',
      suggestions: [
        'Add at least 5 more relevant skills',
        'Get endorsements from colleagues'
      ]
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      icon: Star,
      score: 2,
      maxScore: 10,
      status: 'missing',
      suggestions: [
        'Request recommendations from managers and colleagues',
        'Offer to write recommendations for others first'
      ]
    }
  ]
}