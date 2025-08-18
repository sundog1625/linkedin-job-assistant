import { NextRequest, NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const { userProfile, jobDescription, jobTitle, company } = await request.json()

    if (!userProfile || !jobDescription) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数：用户档案和职位描述'
      }, { status: 400, headers: corsHeaders })
    }

    // 构建针对性简历生成的提示词
    const prompt = `You are a professional resume consultant. Please generate targeted resume content based on the user's profile information and target position. Please respond in English only.

User Profile:
- Skills: ${Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : userProfile.skills}
- Experience: ${userProfile.experience}
- Education: ${userProfile.education}
- Location: ${userProfile.location}
- Preferred Roles: ${Array.isArray(userProfile.preferredRoles) ? userProfile.preferredRoles.join(', ') : userProfile.preferredRoles}
- Languages: ${Array.isArray(userProfile.languages) ? userProfile.languages.join(', ') : userProfile.languages}

Target Position:
- Job Title: ${jobTitle}
- Company: ${company}
- Job Description: ${jobDescription}

Please generate an optimized resume for this position, including:
1. Highlight skills and experience most relevant to the position
2. Adjust work experience descriptions to match job requirements
3. Emphasize relevant projects and achievements
4. Optimize skill ordering, placing most relevant skills first
5. Add targeted professional objective

IMPORTANT: Generate all content in English. Do not use Chinese text.

Output format should be a well-formatted resume text, NOT JSON. Format like this:

PROFESSIONAL SUMMARY:
[Write a targeted professional summary for this position within 200 words]

TECHNICAL SKILLS:
[List relevant technical skills separated by commas]

SOFT SKILLS:
[List relevant soft skills separated by commas]

LANGUAGES:
[List language proficiencies]

PROFESSIONAL EXPERIENCE:
[Format each job as:]
Job Title @ Company Name (Duration)
• Achievement 1
• Achievement 2
• Technologies used: [list]

KEY PROJECTS:
[Format each project as:]
Project Name
Project description
• Project achievement 1
• Project achievement 2
Tech Stack: [technologies]

EDUCATION:
Degree - School (Year)

CERTIFICATIONS:
[List any relevant certifications]

COVER LETTER:
[Write a targeted cover letter within 300 words]

Please ensure content is truthful and credible. Do not fabricate false information - only reorganize and highlight existing information. Generate clean, readable text without any JSON formatting.`

    // 调用Claude API
    console.log('准备调用Claude API...')
    console.log('ANTHROPIC_API_KEY存在:', !!process.env.ANTHROPIC_API_KEY)
    console.log('CLAUDE_API_KEY存在:', !!process.env.CLAUDE_API_KEY)
    
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || ''
    console.log('使用的API Key存在:', !!apiKey)
    
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    console.log('Claude API响应状态:', claudeResponse.status)
    console.log('Claude API响应headers:', Object.fromEntries(claudeResponse.headers.entries()))
    
    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text()
      console.error('Claude API错误响应:', errorText)
      console.error('响应状态:', claudeResponse.status)
      console.error('响应statusText:', claudeResponse.statusText)
      throw new Error(`Claude API调用失败: ${claudeResponse.status} - ${errorText}`)
    }

    const claudeResult = await claudeResponse.json()
    console.log('Claude API response:', claudeResult)
    
    const aiContent = claudeResult.content?.[0]?.text || ''
    
    if (!aiContent) {
      throw new Error('Claude API返回空内容')
    }

    // 现在AI返回格式化文本，我们直接使用它
    // 不再尝试解析JSON，而是返回干净的文本内容
    const targetedResume = {
      formattedText: aiContent,
      // 为了保持兼容性，也提供基本的结构化数据
      personalInfo: {
        name: userProfile.name || '',
        title: jobTitle,
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        linkedin: userProfile.linkedin || '',
        website: userProfile.website || ''
      },
      summary: aiContent.includes('PROFESSIONAL SUMMARY:') ? 
        aiContent.split('PROFESSIONAL SUMMARY:')[1]?.split('\n\n')[0]?.trim() || '' : 
        'Professional summary based on your background and target position',
      skills: {
        technical: Array.isArray(userProfile.skills) ? userProfile.skills : [],
        soft: ['Communication', 'Teamwork', 'Problem Solving', 'Fast Learning'],
        languages: Array.isArray(userProfile.languages) ? userProfile.languages : ['English (Professional)']
      },
      experience: [],
      projects: [],
      education: [],
      certifications: [],
      keyStrengths: ['Highly relevant experience', 'Strong technical skills', 'Excellent problem-solving abilities'],
      coverLetter: aiContent.includes('COVER LETTER:') ? 
        aiContent.split('COVER LETTER:')[1]?.trim() || '' : 
        'Cover letter tailored to the position and your experience.'
    }

    return NextResponse.json({
      success: true,
      targetedResume,
      jobInfo: {
        title: jobTitle,
        company: company
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('生成针对性简历失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '生成失败，请重试'
    }, { status: 500, headers: corsHeaders })
  }
}