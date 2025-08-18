import { NextRequest, NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    // 免费在线简历模板资源
    const onlineTemplates = [
      {
        id: 'github-resume',
        name: 'GitHub Style Resume',
        description: '类似GitHub个人主页的简历模板',
        url: 'https://github.com/resume/resume.github.com',
        preview: 'https://resume.github.io/',
        features: ['开源', '响应式', 'Markdown支持'],
        category: 'tech'
      },
      {
        id: 'jsonresume',
        name: 'JSON Resume',
        description: '基于JSON的开源简历标准',
        url: 'https://jsonresume.org/',
        preview: 'https://registry.jsonresume.org/',
        features: ['JSON格式', '多主题', '开源'],
        category: 'standard'
      },
      {
        id: 'resumake',
        name: 'Resumake',
        description: '免费的在线简历制作工具',
        url: 'https://resumake.io/',
        preview: 'https://resumake.io/',
        features: ['免费', '在线编辑', 'PDF导出'],
        category: 'online'
      },
      {
        id: 'reactive-resume',
        name: 'Reactive Resume',
        description: '免费开源的简历构建器',
        url: 'https://rxresu.me/',
        preview: 'https://rxresu.me/',
        features: ['开源', '多模板', '实时预览'],
        category: 'builder'
      },
      {
        id: 'latex-resume',
        name: 'LaTeX Resume Templates',
        description: '高质量的LaTeX简历模板',
        url: 'https://www.latextemplates.com/cat/curricula-vitae',
        preview: 'https://www.latextemplates.com/cat/curricula-vitae',
        features: ['专业排版', '高质量PDF', '学术友好'],
        category: 'academic'
      },
      {
        id: 'awesome-cv',
        name: 'Awesome CV',
        description: '现代化的LaTeX简历模板',
        url: 'https://github.com/posquit0/Awesome-CV',
        preview: 'https://raw.githubusercontent.com/posquit0/Awesome-CV/master/examples/resume.png',
        features: ['GitHub 8k+ stars', '多语言', '现代设计'],
        category: 'modern'
      },
      {
        id: 'deedy-resume',
        name: 'Deedy Resume',
        description: '简洁优雅的单页简历模板',
        url: 'https://github.com/deedy/Deedy-Resume',
        preview: 'https://raw.githubusercontent.com/deedy/Deedy-Resume/master/sample-image.png',
        features: ['单页设计', '技术导向', '开源'],
        category: 'minimal'
      },
      {
        id: 'moderncv',
        name: 'ModernCV',
        description: 'LaTeX现代简历文档类',
        url: 'https://github.com/xdanaux/moderncv',
        preview: 'https://ctan.org/pkg/moderncv',
        features: ['多种样式', '可定制', '专业'],
        category: 'professional'
      }
    ]

    // 根据分类分组
    const categorizedTemplates = {
      tech: onlineTemplates.filter(t => t.category === 'tech'),
      online: onlineTemplates.filter(t => t.category === 'online'),
      academic: onlineTemplates.filter(t => t.category === 'academic'),
      modern: onlineTemplates.filter(t => t.category === 'modern'),
      professional: onlineTemplates.filter(t => t.category === 'professional'),
      all: onlineTemplates
    }

    // 使用指南
    const usageGuide = {
      step1: '选择适合您行业和风格的模板',
      step2: '访问模板网站或GitHub仓库',
      step3: '下载模板或fork到您的GitHub',
      step4: '将我们生成的简历内容填入模板',
      step5: '根据模板说明生成最终PDF',
      tips: [
        '技术类职位推荐使用GitHub Style或Awesome CV',
        '学术类职位推荐使用LaTeX模板',
        '快速制作推荐使用在线工具如Resumake',
        '所有模板都支持自定义和修改'
      ]
    }

    return NextResponse.json({
      success: true,
      templates: categorizedTemplates,
      usageGuide,
      totalCount: onlineTemplates.length,
      message: '已获取免费在线简历模板资源'
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('获取在线模板失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取模板失败，请重试'
    }, { status: 500, headers: corsHeaders })
  }
}