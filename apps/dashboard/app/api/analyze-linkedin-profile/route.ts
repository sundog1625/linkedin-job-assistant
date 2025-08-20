import { NextRequest, NextResponse } from 'next/server'

// Profile section weights for 100-point scale
const SECTION_WEIGHTS = {
  photo: 5,
  banner: 3,
  headline: 10,
  openToWork: 3,
  about: 15,
  experience: 20,
  skills: 10,
  url: 2,
  education: 8,
  featured: 4,
  certifications: 5,
  recommendations: 15
}

interface ProfileData {
  profileUrl?: string
  profileText?: string
  sections?: {
    photo?: boolean
    banner?: string
    headline?: string
    openToWork?: boolean
    about?: string
    experience?: any[]
    skills?: string[]
    customUrl?: boolean
    education?: any[]
    featured?: any[]
    certifications?: any[]
    recommendations?: any[]
  }
}

interface SectionAnalysis {
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

function analyzeProfilePhoto(hasPhoto?: boolean): Partial<SectionAnalysis> {
  if (hasPhoto) {
    return {
      status: 'completed',
      score: SECTION_WEIGHTS.photo,
      percentage: 100,
      currentContent: 'Professional profile photo uploaded',
      suggestions: [],
      aiRecommendation: 'Your profile photo is set. Ensure it\'s professional, well-lit, and shows your face clearly.'
    }
  }
  return {
    status: 'warning',
    score: 0,
    percentage: 0,
    currentContent: 'No profile photo',
    suggestions: [
      'Upload a professional headshot',
      'Use good lighting and a clean background',
      'Dress professionally',
      'Smile and make eye contact with the camera'
    ],
    aiRecommendation: 'Profiles with photos receive 21x more views and 36x more messages. Upload a professional headshot immediately.'
  }
}

function analyzeBanner(banner?: string): Partial<SectionAnalysis> {
  if (!banner || banner === 'default') {
    return {
      status: 'suggestion',
      score: SECTION_WEIGHTS.banner * 0.3,
      percentage: 30,
      currentContent: 'Using default LinkedIn banner',
      suggestions: [
        'Create a custom banner that reflects your profession',
        'Include your tagline or value proposition',
        'Use your company branding if appropriate',
        'Ensure 1584x396px resolution'
      ],
      aiRecommendation: 'A custom banner can increase profile views by 15%. Create one that showcases your industry expertise or personal brand.'
    }
  }
  return {
    status: 'completed',
    score: SECTION_WEIGHTS.banner,
    percentage: 100,
    currentContent: 'Custom banner uploaded',
    suggestions: [],
    aiRecommendation: 'Great custom banner! Ensure it aligns with your professional brand and is updated regularly.'
  }
}

function analyzeHeadline(headline?: string): Partial<SectionAnalysis> {
  if (!headline) {
    return {
      status: 'warning',
      score: 0,
      percentage: 0,
      currentContent: 'No headline',
      suggestions: [
        'Add a compelling headline',
        'Include key skills and value proposition',
        'Use relevant keywords for search',
        'Keep it under 220 characters'
      ],
      aiRecommendation: 'Your headline is crucial for search visibility. Add one immediately with your role and key expertise.'
    }
  }

  const score = calculateHeadlineScore(headline)
  const percentage = Math.round((score / SECTION_WEIGHTS.headline) * 100)
  
  return {
    status: percentage >= 80 ? 'completed' : percentage >= 50 ? 'suggestion' : 'warning',
    score,
    percentage,
    currentContent: headline,
    suggestions: percentage < 100 ? [
      'Include more relevant keywords',
      'Add your unique value proposition',
      'Mention key technologies or skills',
      'Make it more specific to your target role'
    ] : [],
    aiRecommendation: percentage >= 80 
      ? 'Excellent headline with strong keywords and clear positioning.'
      : 'Enhance your headline with more specific skills and industry keywords to improve searchability.'
  }
}

function calculateHeadlineScore(headline: string): number {
  let score = 0
  const maxScore = SECTION_WEIGHTS.headline
  
  // Length check (ideal: 80-220 characters)
  const length = headline.length
  if (length >= 80 && length <= 220) score += maxScore * 0.2
  else if (length >= 40) score += maxScore * 0.1
  
  // Keywords check
  const keywords = ['engineer', 'developer', 'manager', 'specialist', 'expert', 'leader', 'strategist']
  const hasKeyword = keywords.some(kw => headline.toLowerCase().includes(kw))
  if (hasKeyword) score += maxScore * 0.3
  
  // Special characters (pipe separators are good)
  if (headline.includes('|')) score += maxScore * 0.2
  
  // Skills mentioned
  const skills = ['react', 'python', 'java', 'aws', 'ai', 'ml', 'cloud', 'agile']
  const skillCount = skills.filter(skill => headline.toLowerCase().includes(skill)).length
  score += Math.min(maxScore * 0.3, (skillCount / 3) * maxScore * 0.3)
  
  return Math.min(score, maxScore)
}

function analyzeAbout(about?: string): Partial<SectionAnalysis> {
  if (!about) {
    return {
      status: 'warning',
      score: 0,
      percentage: 0,
      currentContent: 'No about section',
      suggestions: [
        'Write a compelling about section',
        'Include your professional story',
        'Highlight key achievements',
        'Add a clear call-to-action'
      ],
      aiRecommendation: 'The about section is crucial for engagement. Add a 3-4 paragraph summary highlighting your expertise, achievements, and goals.'
    }
  }

  const wordCount = about.split(/\s+/).length
  let score = 0
  
  if (wordCount >= 100) score += SECTION_WEIGHTS.about * 0.4
  else if (wordCount >= 50) score += SECTION_WEIGHTS.about * 0.2
  
  // Check for structure (paragraphs)
  const paragraphs = about.split('\n\n').length
  if (paragraphs >= 3) score += SECTION_WEIGHTS.about * 0.2
  
  // Keywords and achievements
  const hasAchievements = /\d+%|\d+x|increased|improved|led|managed|built/i.test(about)
  if (hasAchievements) score += SECTION_WEIGHTS.about * 0.2
  
  // Call to action
  const hasCTA = /contact|reach out|connect|email|available/i.test(about)
  if (hasCTA) score += SECTION_WEIGHTS.about * 0.2
  
  const percentage = Math.round((score / SECTION_WEIGHTS.about) * 100)
  
  return {
    status: percentage >= 80 ? 'completed' : percentage >= 50 ? 'suggestion' : 'warning',
    score,
    percentage,
    currentContent: `${wordCount} words, ${paragraphs} paragraphs`,
    suggestions: percentage < 100 ? [
      wordCount < 100 ? 'Expand to at least 100 words' : null,
      !hasAchievements ? 'Include quantifiable achievements' : null,
      !hasCTA ? 'Add a call-to-action' : null,
      paragraphs < 3 ? 'Structure with 3-4 paragraphs' : null
    ].filter(Boolean) as string[] : [],
    aiRecommendation: percentage >= 80
      ? 'Strong about section! Keep it updated with recent achievements.'
      : `Improve your about section by ${wordCount < 100 ? 'expanding the content' : 'adding more specific achievements and a clear call-to-action'}.`
  }
}

function analyzeExperience(experience?: any[]): Partial<SectionAnalysis> {
  if (!experience || experience.length === 0) {
    return {
      status: 'warning',
      score: 0,
      percentage: 0,
      currentContent: 'No experience listed',
      suggestions: [
        'Add all relevant work experience',
        'Include detailed role descriptions',
        'Add quantifiable achievements',
        'Use action verbs'
      ],
      aiRecommendation: 'Experience section is critical. Add all your professional roles with detailed descriptions and achievements.'
    }
  }

  let score = 0
  const positionCount = experience.length
  
  // Points for having positions
  if (positionCount >= 3) score += SECTION_WEIGHTS.experience * 0.3
  else if (positionCount >= 1) score += SECTION_WEIGHTS.experience * 0.15
  
  // Check for descriptions and bullet points
  const hasDescriptions = experience.filter(exp => exp.description && exp.description.length > 50).length
  score += (hasDescriptions / positionCount) * SECTION_WEIGHTS.experience * 0.4
  
  // Check for achievements/metrics
  const hasMetrics = experience.some(exp => 
    exp.description && /\d+%|\d+x|increased|improved|achieved/i.test(exp.description)
  )
  if (hasMetrics) score += SECTION_WEIGHTS.experience * 0.3
  
  const percentage = Math.round((score / SECTION_WEIGHTS.experience) * 100)
  
  return {
    status: percentage >= 80 ? 'completed' : percentage >= 50 ? 'suggestion' : 'warning',
    score,
    percentage,
    currentContent: `${positionCount} positions listed`,
    suggestions: percentage < 100 ? [
      'Add bullet points with specific achievements',
      'Include metrics and quantifiable results',
      'Use strong action verbs',
      'Ensure each role has 3-5 bullet points'
    ] : [],
    aiRecommendation: percentage >= 80
      ? 'Good experience section. Ensure all achievements are quantified where possible.'
      : 'Enhance each role with 3-5 bullet points focusing on impact and achievements, not just responsibilities.'
  }
}

function analyzeSkills(skills?: string[]): Partial<SectionAnalysis> {
  const skillCount = skills?.length || 0
  let score = 0
  
  if (skillCount >= 30) score = SECTION_WEIGHTS.skills
  else if (skillCount >= 20) score = SECTION_WEIGHTS.skills * 0.8
  else if (skillCount >= 10) score = SECTION_WEIGHTS.skills * 0.5
  else if (skillCount >= 5) score = SECTION_WEIGHTS.skills * 0.3
  
  const percentage = Math.round((score / SECTION_WEIGHTS.skills) * 100)
  
  return {
    status: percentage >= 80 ? 'completed' : percentage >= 50 ? 'suggestion' : 'warning',
    score,
    percentage,
    currentContent: `${skillCount} skills listed`,
    suggestions: skillCount < 30 ? [
      'Add more relevant skills (aim for 30-50)',
      'Include both technical and soft skills',
      'Prioritize in-demand skills in your industry',
      'Get endorsements for top skills'
    ] : ['Get more endorsements for your top skills'],
    aiRecommendation: skillCount >= 30
      ? 'Good skill coverage. Focus on getting endorsements for your top 5 skills.'
      : `Add ${30 - skillCount} more relevant skills. LinkedIn allows up to 50 skills for maximum visibility.`
  }
}

function analyzeRecommendations(recommendations?: any[]): Partial<SectionAnalysis> {
  const count = recommendations?.length || 0
  let score = 0
  
  if (count >= 3) score = SECTION_WEIGHTS.recommendations
  else if (count >= 2) score = SECTION_WEIGHTS.recommendations * 0.6
  else if (count >= 1) score = SECTION_WEIGHTS.recommendations * 0.3
  
  const percentage = Math.round((score / SECTION_WEIGHTS.recommendations) * 100)
  
  return {
    status: percentage >= 80 ? 'completed' : percentage >= 50 ? 'suggestion' : 'warning',
    score,
    percentage,
    currentContent: `${count} recommendations`,
    suggestions: count < 3 ? [
      'Request recommendations from colleagues',
      'Give recommendations to receive them',
      'Focus on managers and senior colleagues',
      'Request specific, detailed recommendations'
    ] : [],
    aiRecommendation: count >= 3
      ? 'Excellent! Recommendations greatly enhance credibility.'
      : `Recommendations increase profile credibility by 40%. Aim for at least 3. You need ${3 - count} more.`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProfileData = await request.json()
    
    // Extract profile data (in production, this would parse LinkedIn HTML or use LinkedIn API)
    const profileSections = body.sections || {}
    
    // Analyze each section
    const sections: SectionAnalysis[] = [
      {
        id: 'photo',
        name: 'Profile Photo',
        maxScore: SECTION_WEIGHTS.photo,
        ...analyzeProfilePhoto(profileSections.photo)
      },
      {
        id: 'banner',
        name: 'Banner',
        maxScore: SECTION_WEIGHTS.banner,
        ...analyzeBanner(profileSections.banner)
      },
      {
        id: 'headline',
        name: 'Headline',
        maxScore: SECTION_WEIGHTS.headline,
        ...analyzeHeadline(profileSections.headline)
      },
      {
        id: 'openToWork',
        name: 'Open To Work',
        maxScore: SECTION_WEIGHTS.openToWork,
        status: profileSections.openToWork ? 'completed' : 'suggestion',
        score: profileSections.openToWork ? SECTION_WEIGHTS.openToWork : 0,
        percentage: profileSections.openToWork ? 100 : 0,
        currentContent: profileSections.openToWork ? 'Activated' : 'Not activated',
        suggestions: profileSections.openToWork ? [] : [
          'Enable "Open to Work" for 40% more recruiter visibility',
          'Specify preferred job titles and locations',
          'Choose appropriate visibility settings'
        ],
        aiRecommendation: profileSections.openToWork 
          ? 'Great! You\'re visible to recruiters actively looking for candidates.'
          : 'Activating "Open to Work" can increase recruiter InMails by 40%. Consider enabling it.'
      },
      {
        id: 'about',
        name: 'About',
        maxScore: SECTION_WEIGHTS.about,
        ...analyzeAbout(profileSections.about)
      },
      {
        id: 'experience',
        name: 'Experience',
        maxScore: SECTION_WEIGHTS.experience,
        ...analyzeExperience(profileSections.experience)
      },
      {
        id: 'skills',
        name: 'Skills',
        maxScore: SECTION_WEIGHTS.skills,
        ...analyzeSkills(profileSections.skills)
      },
      {
        id: 'url',
        name: 'LinkedIn URL',
        maxScore: SECTION_WEIGHTS.url,
        status: profileSections.customUrl ? 'completed' : 'warning',
        score: profileSections.customUrl ? SECTION_WEIGHTS.url : 0,
        percentage: profileSections.customUrl ? 100 : 0,
        currentContent: profileSections.customUrl ? 'Custom URL set' : 'Using default URL',
        suggestions: profileSections.customUrl ? [] : [
          'Customize your LinkedIn URL',
          'Use format: linkedin.com/in/firstname-lastname',
          'Remove numbers and random characters'
        ],
        aiRecommendation: profileSections.customUrl
          ? 'Perfect! Your custom URL looks professional.'
          : 'A custom URL improves your professional brand. Set it in your LinkedIn settings.'
      },
      {
        id: 'education',
        name: 'Education',
        maxScore: SECTION_WEIGHTS.education,
        status: profileSections.education?.length > 0 ? 'completed' : 'warning',
        score: profileSections.education?.length > 0 ? SECTION_WEIGHTS.education * 0.7 : 0,
        percentage: profileSections.education?.length > 0 ? 70 : 0,
        currentContent: `${profileSections.education?.length || 0} education entries`,
        suggestions: [
          'Add relevant coursework',
          'Include GPA if 3.5 or higher',
          'Add honors and awards',
          'Include relevant projects'
        ],
        aiRecommendation: 'Education adds credibility. Include all degrees, certifications, and relevant coursework.'
      },
      {
        id: 'featured',
        name: 'Featured',
        maxScore: SECTION_WEIGHTS.featured,
        status: profileSections.featured?.length > 0 ? 'completed' : 'suggestion',
        score: profileSections.featured?.length > 0 ? SECTION_WEIGHTS.featured : 0,
        percentage: profileSections.featured?.length > 0 ? 100 : 0,
        currentContent: `${profileSections.featured?.length || 0} featured items`,
        suggestions: profileSections.featured?.length > 0 ? [] : [
          'Add portfolio pieces',
          'Feature published articles',
          'Include presentations or videos',
          'Showcase your best work'
        ],
        aiRecommendation: 'Featured content increases engagement by 25%. Add 2-3 of your best work samples.'
      },
      {
        id: 'certifications',
        name: 'Licenses & Certifications',
        maxScore: SECTION_WEIGHTS.certifications,
        status: profileSections.certifications?.length > 0 ? 'completed' : 'suggestion',
        score: profileSections.certifications?.length > 0 
          ? Math.min(SECTION_WEIGHTS.certifications, profileSections.certifications.length * 2)
          : 0,
        percentage: profileSections.certifications?.length > 0 
          ? Math.min(100, profileSections.certifications.length * 40)
          : 0,
        currentContent: `${profileSections.certifications?.length || 0} certifications`,
        suggestions: [
          'Add industry-relevant certifications',
          'Include online course certificates',
          'Keep certifications current',
          'Add credential IDs and links'
        ],
        aiRecommendation: 'Certifications validate your expertise. Add all relevant professional certifications.'
      },
      {
        id: 'recommendations',
        name: 'Recommendations',
        maxScore: SECTION_WEIGHTS.recommendations,
        ...analyzeRecommendations(profileSections.recommendations)
      }
    ] as SectionAnalysis[]

    // Calculate total score (out of 100)
    const totalScore = sections.reduce((sum, section) => sum + section.score, 0)
    const totalPercentage = Math.round(totalScore)

    // Generate AI-powered overall recommendation
    const overallRecommendation = generateOverallRecommendation(totalPercentage, sections)

    return NextResponse.json({
      success: true,
      score: totalScore,
      percentage: totalPercentage,
      sections,
      overallRecommendation,
      topPriorities: getTopPriorities(sections)
    })

  } catch (error) {
    console.error('Profile analysis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateOverallRecommendation(percentage: number, sections: SectionAnalysis[]): string {
  if (percentage >= 90) {
    return "Outstanding! Your LinkedIn profile is in the top 5% for optimization. Focus on maintaining freshness with regular updates and new content."
  } else if (percentage >= 75) {
    return "Excellent profile! You're well-positioned for opportunities. Focus on the remaining gaps to reach elite status."
  } else if (percentage >= 60) {
    return "Good foundation! Your profile is better than average. Addressing the highlighted issues will significantly boost your visibility."
  } else if (percentage >= 40) {
    return "Your profile needs attention. You're missing key elements that recruiters look for. Follow the prioritized recommendations below."
  } else {
    return "Critical improvements needed. Your profile is significantly underoptimized. Start with the high-priority items to quickly improve visibility."
  }
}

function getTopPriorities(sections: SectionAnalysis[]): string[] {
  const priorities: string[] = []
  
  // Sort sections by potential impact (weight * missing percentage)
  const sectionImpacts = sections
    .filter(s => s.percentage < 100)
    .map(s => ({
      name: s.name,
      impact: s.maxScore * (1 - s.percentage / 100),
      suggestion: s.suggestions[0] || s.aiRecommendation
    }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3)
  
  sectionImpacts.forEach(section => {
    priorities.push(`${section.name}: ${section.suggestion}`)
  })
  
  return priorities
}