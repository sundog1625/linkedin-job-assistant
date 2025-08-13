import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { resumeText, language = 'zh-CN' } = await request.json()

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({
        success: false,
        error: '简历内容太短，请提供完整的简历信息'
      }, { status: 400 })
    }

    // 语言配置
    const languageConfigs = {
      'zh-CN': {
        analysisInstruction: '请分析以下简历内容，生成一个简洁、有见地的中文总结（150字以内）',
        outputRequirement: '必须使用简体中文回复'
      },
      'en-US': {
        analysisInstruction: 'Please analyze the following resume content and generate a concise, insightful English summary (within 150 words)',
        outputRequirement: 'Must respond in English'
      },
      'ja-JP': {
        analysisInstruction: '以下の履歴書内容を分析し、簡潔で洞察に富んだ日本語の要約（150文字以内）を生成してください',
        outputRequirement: '日本語で返答してください'
      },
      'ko-KR': {
        analysisInstruction: '다음 이력서 내용을 분석하여 간결하고 통찰력 있는 한국어 요약(150자 이내)을 생성해주세요',
        outputRequirement: '한국어로 답변해주세요'
      }
    }

    const config = languageConfigs[language as keyof typeof languageConfigs] || languageConfigs['zh-CN']

    const prompt = `${config.analysisInstruction}，并从中提取结构化信息：

简历内容：
${resumeText}

请分析上述简历内容，提取以下信息并以JSON格式返回：

{
  "skills": ["技能1", "技能2", "技能3"],
  "experience": "工作经验的详细描述",
  "education": "教育背景信息",
  "location": "期望工作地点或当前所在地",
  "preferredRoles": ["期望职位1", "期望职位2"],
  "languages": ["语言能力1", "语言能力2"]
}

**提取要求**:
1. skills: 从简历中识别所有技术技能、工具、编程语言等
2. experience: 总结工作经验，包括年限、主要成就、项目经验
3. education: 提取学历、专业、学校等教育信息
4. location: 识别期望工作地点或现居住地
5. preferredRoles: 根据经验推断适合的职位类型
6. languages: 提取语言能力

**注意事项**:
- 只返回JSON格式，不要其他说明文字
- 如果某个字段信息不足，设为空字符串或空数组
- ${config.outputRequirement}`

    console.log('🌐 调用Claude API分析简历...')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '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',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    console.log('📥 API响应状态:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Claude API错误:', errorText)
      throw new Error(`Claude API调用失败: ${response.status}`)
    }

    const apiData = await response.json()
    console.log('✅ Claude API成功返回')

    const fullText = apiData.content[0].text.trim()

    try {
      // 尝试解析JSON响应
      let jsonMatch = fullText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('未找到JSON格式响应')
      }

      const parsedProfile = JSON.parse(jsonMatch[0])

      // 验证和清理数据
      const cleanedProfile = {
        skills: Array.isArray(parsedProfile.skills) ? parsedProfile.skills.filter(s => s && s.trim()) : [],
        experience: parsedProfile.experience || '',
        education: parsedProfile.education || '',
        location: parsedProfile.location || '',
        preferredRoles: Array.isArray(parsedProfile.preferredRoles) ? parsedProfile.preferredRoles.filter(r => r && r.trim()) : [],
        languages: Array.isArray(parsedProfile.languages) ? parsedProfile.languages.filter(l => l && l.trim()) : ['中文']
      }

      console.log('🎯 简历分析完成:', cleanedProfile)

      return NextResponse.json({
        success: true,
        profile: cleanedProfile,
        message: '简历分析完成'
      })

    } catch (parseError) {
      console.error('❌ 解析AI响应失败:', parseError)
      console.log('📝 原始响应:', fullText)

      return NextResponse.json({
        success: false,
        error: '简历分析结果解析失败，请重试',
        rawResponse: fullText
      }, { status: 500 })
    }

  } catch (error) {
    console.error('💥 简历分析失败:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '简历分析失败，请重试'
    }, { status: 500 })
  }
}