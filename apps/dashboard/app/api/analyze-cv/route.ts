import { NextRequest, NextResponse } from 'next/server'

interface CVAnalysisResult {
  score: number
  suggestions: string[]
  atsCompatibility: number
  keywordMatch: string[]
  missingKeywords: string[]
  strengths: string[]
  improvements: string[]
  detailedAnalysis: {
    format: { score: number; feedback: string }
    content: { score: number; feedback: string }
    keywords: { score: number; feedback: string }
    achievements: { score: number; feedback: string }
    skills: { score: number; feedback: string }
  }
}

export async function POST(request: NextRequest) {
  let requestBody: any = {}
  
  try {
    requestBody = await request.json()
    const { cvContent, jobDescription } = requestBody

    if (!cvContent) {
      return NextResponse.json(
        { success: false, error: 'CV content is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY

    if (!apiKey) {
      console.error('No API key found in environment variables')
      // Return fallback analysis if no API key
      const fallbackAnalysis = generateFallbackAnalysis(cvContent, jobDescription)
      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        timestamp: new Date().toISOString(),
        note: 'Using fallback analysis (API key not configured)'
      })
    }

    console.log('🤖 Analyzing CV with AI...')
    console.log('API Key exists:', !!apiKey)
    console.log('API Key preview:', apiKey.substring(0, 20) + '...')

    // Call Claude API for CV analysis
    const analysisPrompt = `
Analyze this CV/Resume and provide a comprehensive assessment. ${jobDescription ? `Also compare it against this job description: ${jobDescription}` : ''}

CV Content:
${cvContent}

Please provide analysis in the following JSON format:
{
  "score": (number 0-100),
  "atsCompatibility": (number 0-100),
  "strengths": [list of 3-5 key strengths],
  "improvements": [list of 3-5 key improvement areas],
  "keywordMatch": [list of relevant keywords found],
  "missingKeywords": [list of important missing keywords],
  "detailedAnalysis": {
    "format": {"score": (0-100), "feedback": "detailed feedback on format and structure"},
    "content": {"score": (0-100), "feedback": "feedback on content quality and relevance"},
    "keywords": {"score": (0-100), "feedback": "keyword optimization feedback"},
    "achievements": {"score": (0-100), "feedback": "quantifiable achievements feedback"},
    "skills": {"score": (0-100), "feedback": "skills section feedback"}
  },
  "suggestions": [list of 5-7 specific actionable suggestions]
}

Focus on:
1. ATS compatibility and keyword optimization
2. Quantifiable achievements and metrics
3. Skills relevance and presentation
4. Overall structure and readability
5. Professional formatting
6. Industry-specific recommendations
`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API request failed: ${response.status}`, errorText)
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('API Response received:', !!result.content)
    
    if (!result.content || !result.content[0] || !result.content[0].text) {
      throw new Error('Invalid API response format')
    }
    
    const analysisText = result.content[0].text

    // Try to parse JSON from the response
    let analysis: CVAnalysisResult
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : analysisText
      analysis = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse AI response, using fallback analysis')
      // Fallback analysis if JSON parsing fails
      analysis = generateFallbackAnalysis(cvContent, jobDescription)
    }

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('CV analysis error:', error)
    
    // Use the already parsed request body for fallback analysis
    const cvContentForFallback = requestBody.cvContent || ''
    const jobDescriptionForFallback = requestBody.jobDescription || ''
    
    // Return fallback analysis on error
    const fallbackAnalysis = generateFallbackAnalysis(cvContentForFallback, jobDescriptionForFallback)

    return NextResponse.json({
      success: true,
      analysis: fallbackAnalysis,
      timestamp: new Date().toISOString(),
      note: 'Fallback analysis used due to API error'
    })
  }
}

function generateFallbackAnalysis(cvContent: string, jobDescription?: string): CVAnalysisResult {
  const wordCount = cvContent.split(/\s+/).length
  const hasQuantifiableAchievements = /\d+%|\d+\+|\$\d+|increased|improved|reduced|achieved/.test(cvContent)
  const hasSkillsSection = /skills?|technologies?|expertise/i.test(cvContent)
  
  let baseScore = 60
  if (wordCount > 300) baseScore += 10
  if (hasQuantifiableAchievements) baseScore += 15
  if (hasSkillsSection) baseScore += 10
  
  const score = Math.min(baseScore, 100)

  return {
    score,
    atsCompatibility: Math.max(50, score - 10),
    strengths: [
      hasSkillsSection ? 'Clear skills section present' : 'Professional structure',
      hasQuantifiableAchievements ? 'Contains quantifiable achievements' : 'Relevant experience listed',
      wordCount > 300 ? 'Comprehensive content' : 'Concise presentation'
    ],
    improvements: [
      !hasQuantifiableAchievements ? 'Add more quantifiable achievements with metrics' : 'Expand on recent achievements',
      wordCount < 200 ? 'Add more detailed descriptions' : 'Optimize keyword density',
      'Ensure ATS compatibility with standard formatting'
    ],
    keywordMatch: extractKeywords(cvContent),
    missingKeywords: jobDescription ? ['leadership', 'project management', 'communication'] : ['relevant industry keywords'],
    detailedAnalysis: {
      format: { 
        score: 75, 
        feedback: 'Standard resume format detected. Consider using bullet points and consistent formatting.' 
      },
      content: { 
        score, 
        feedback: hasQuantifiableAchievements 
          ? 'Good use of metrics and achievements. Continue quantifying your impact.' 
          : 'Add more specific achievements with numbers, percentages, and metrics.'
      },
      keywords: { 
        score: 65, 
        feedback: 'Include more industry-specific keywords to improve ATS compatibility.' 
      },
      achievements: { 
        score: hasQuantifiableAchievements ? 80 : 45, 
        feedback: hasQuantifiableAchievements 
          ? 'Strong quantifiable achievements present.' 
          : 'Add measurable achievements and results from your previous roles.'
      },
      skills: { 
        score: hasSkillsSection ? 85 : 50, 
        feedback: hasSkillsSection 
          ? 'Skills section identified. Ensure it includes relevant technical and soft skills.' 
          : 'Add a dedicated skills section with relevant technical and professional skills.'
      }
    },
    suggestions: [
      'Add more quantifiable achievements with specific metrics',
      'Include relevant industry keywords for ATS optimization',
      'Use strong action verbs to start bullet points',
      'Ensure consistent formatting throughout the document',
      'Add a professional summary section',
      'Include relevant certifications and education',
      'Optimize for both ATS systems and human readers'
    ]
  }
}

function extractKeywords(content: string): string[] {
  const commonKeywords = [
    'management', 'leadership', 'development', 'analysis', 'strategy',
    'project', 'team', 'communication', 'problem-solving', 'innovation'
  ]
  
  return commonKeywords.filter(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  )
}