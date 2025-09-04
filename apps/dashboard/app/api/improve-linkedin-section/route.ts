import { NextRequest, NextResponse } from 'next/server'

interface ImprovementRequest {
  sectionId: string
  sectionName: string
  currentContent?: string
  currentScore: number
  maxScore: number
  profileContext?: {
    headline?: string
    about?: string
    experience?: any[]
    skills?: string[]
    profileUrl?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ImprovementRequest = await request.json()
    
    const { sectionId, sectionName, currentContent, currentScore, maxScore, profileContext } = body
    
    console.log('🤖 Generating AI improvement for section:', sectionName)
    
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'AI service not available' },
        { status: 503 }
      )
    }

    // Create context-aware prompt based on section type
    const improvementPrompt = createSectionPrompt(sectionId, sectionName, currentContent, currentScore, maxScore, profileContext)
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: improvementPrompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status}`)
    }

    const result = await response.json()
    const improvementText = result.content[0].text
    
    // Parse the response to extract structured improvement advice
    const improvement = parseImprovementResponse(improvementText, sectionId)
    
    return NextResponse.json({
      success: true,
      improvement,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI improvement generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate improvement suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function createSectionPrompt(
  sectionId: string, 
  sectionName: string, 
  currentContent: string | undefined, 
  currentScore: number, 
  maxScore: number,
  profileContext: any
): string {
  const percentage = Math.round((currentScore / maxScore) * 100)
  const contextInfo = profileContext ? `
Profile Context:
- Headline: ${profileContext.headline || 'Not provided'}
- About: ${profileContext.about ? profileContext.about.substring(0, 100) + '...' : 'Not provided'}
- Experience: ${profileContext.experience?.length || 0} positions listed
- Skills: ${profileContext.skills?.length || 0} skills listed
- Profile URL: ${profileContext.profileUrl || 'Not provided'}
` : ''

  const basePrompt = `You are a LinkedIn optimization expert. Help improve the "${sectionName}" section of a LinkedIn profile.

Current Status:
- Section: ${sectionName} (${sectionId})
- Current Score: ${currentScore}/${maxScore} (${percentage}%)
- Current Content: ${currentContent || 'No content provided'}

${contextInfo}

Please provide improvement suggestions in the following format:

## Specific Improvements
[Provide 3-5 specific, actionable improvements for this section]

## Recommended Content
[If applicable, provide example content or templates]

## Keywords to Include
[Suggest relevant keywords for this section]

## Why This Matters
[Explain the impact of improving this section]

Focus on practical, actionable advice that can be implemented immediately.`

  // Add section-specific guidance
  switch (sectionId) {
    case 'headline':
      return basePrompt + `

Section-Specific Tips for Headlines:
- Should be 120-220 characters
- Include job title, key skills, and value proposition
- Use keywords recruiters search for
- Be specific rather than generic
- Consider using "|" to separate elements`

    case 'about':
      return basePrompt + `

Section-Specific Tips for About Section:
- Should be 3-5 paragraphs (300-500 words)
- Start with a strong opening line
- Include quantifiable achievements
- Tell your professional story
- End with a call-to-action
- Use first person ("I" not "he/she")
- Include relevant keywords naturally`

    case 'experience':
      return basePrompt + `

Section-Specific Tips for Experience:
- Use strong action verbs (Led, Achieved, Implemented)
- Include quantifiable results (increased sales by 25%)
- Focus on impact, not just responsibilities
- Use 3-5 bullet points per role
- Include relevant keywords
- Show progression and growth`

    case 'skills':
      return basePrompt + `

Section-Specific Tips for Skills:
- Include 30-50 relevant skills
- Mix technical and soft skills
- Prioritize skills relevant to target roles
- Include emerging/trending skills in your field
- Get endorsements for top skills`

    default:
      return basePrompt
  }
}

function parseImprovementResponse(text: string, sectionId: string): any {
  // Simple parsing - in production, you might want more sophisticated parsing
  const sections = text.split('##').filter(section => section.trim())
  
  const improvement: any = {
    sectionId,
    improvements: [],
    recommendedContent: '',
    keywords: [],
    impact: '',
    fullResponse: text
  }
  
  sections.forEach(section => {
    const lines = section.trim().split('\n').filter(line => line.trim())
    const title = lines[0]?.toLowerCase().trim()
    const content = lines.slice(1).join('\n').trim()
    
    if (title.includes('specific improvements')) {
      // Extract bullet points or numbered lists
      const bulletRegex = /[-•*]\s*(.+)/g
      const numberRegex = /\d+\.\s*(.+)/g
      let matches = content.match(bulletRegex) || content.match(numberRegex)
      if (matches) {
        improvement.improvements = matches.map(match => 
          match.replace(/^[-•*\d\.]\s*/, '').trim()
        )
      } else {
        improvement.improvements = content.split('\n').filter(line => line.trim())
      }
    } else if (title.includes('recommended content')) {
      improvement.recommendedContent = content
    } else if (title.includes('keywords')) {
      // Extract keywords from text
      const keywordText = content.toLowerCase()
      const keywordMatches = keywordText.match(/[\w\s]+/g)
      if (keywordMatches) {
        improvement.keywords = keywordMatches
          .join(' ')
          .split(/[,\n]/)
          .map(k => k.trim())
          .filter(k => k.length > 2)
          .slice(0, 10)
      }
    } else if (title.includes('why this matters') || title.includes('impact')) {
      improvement.impact = content
    }
  })
  
  return improvement
}