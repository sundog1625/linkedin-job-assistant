import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // 获取用户ID（暂时使用固定值）
    const userId = 'demo-user-001'
    
    // 获取环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('User Profile - Supabase URL:', supabaseUrl)
    console.log('User Profile - Key exists:', !!supabaseKey)
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase未配置，无法获取用户档案')
      return NextResponse.json({
        success: false,
        message: '数据库未配置，请先配置数据库连接',
        needsSetup: true
      })
    }
    
    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 从Supabase获取用户档案
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 是记录未找到错误
      console.error('Supabase查询错误:', error)
      throw new Error('数据库查询失败')
    }
    
    if (!profile) {
      // 如果没有找到用户档案，返回需要设置的状态
      console.log('未找到用户档案，需要用户设置简历')
      return NextResponse.json({
        success: false,
        message: '未找到用户简历信息，请先在Dashboard中设置您的简历',
        needsSetup: true
      })
    }
    
    // 转换为前端需要的格式
    const formattedProfile = {
      name: profile.headline || '演示用户',
      email: 'demo@example.com', // 暂时硬编码
      phone: '+86 138 0000 0000', // 暂时硬编码
      location: profile.location || '北京',
      skills: profile.skills || ['JavaScript', 'React', 'Node.js'],
      experience: profile.summary || '拥有丰富的软件开发经验',
      education: profile.education || '计算机相关专业',
      preferredRoles: profile.preferences?.job_types || ['软件工程师'],
      languages: ['中文（母语）', '英语（流利）'],
      linkedin: 'https://linkedin.com/in/demo-user',
      website: 'https://demo-user.dev'
    }
    
    return NextResponse.json({
      success: true,
      profile: formattedProfile
    })
    
  } catch (error) {
    console.error('获取用户档案失败:', error)
    
    // 发生错误时返回失败状态
    return NextResponse.json({
      success: false,
      message: '获取用户档案时发生错误，请稍后重试',
      error: error.message,
      needsSetup: true
    })
  }
}