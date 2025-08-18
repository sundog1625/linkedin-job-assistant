import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()
    
    // 获取环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Save Profile - Supabase URL:', supabaseUrl)
    console.log('Save Profile - Key exists:', !!supabaseKey)
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase未配置，使用本地存储')
      return NextResponse.json({
        success: true,
        useLocalStorage: true,
        message: '已保存到本地存储（Supabase未配置）'
      })
    }
    
    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 为了简化，我们暂时使用一个固定的userId
    const userId = 'demo-user-001'
    
    const profile = {
      user_id: userId,
      skills: profileData.skills,
      experience: typeof profileData.experience === 'number' ? profileData.experience : 0,
      education: profileData.education,
      location: profileData.location,
      preferences: {
        preferred_locations: [profileData.location],
        job_types: profileData.preferredRoles || [],
        remote_preference: 'any'
      },
      summary: `${profileData.experience}. 掌握技能: ${profileData.skills?.join(', ')}`,
      headline: profileData.preferredRoles?.[0] || '职场专业人士'
    }
    
    console.log('准备保存档案:', profile)
    
    // 使用upsert保存到Supabase（如果存在则更新，不存在则插入）
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profile, {
        onConflict: 'user_id'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Supabase保存错误:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }
    
    console.log('成功保存到Supabase:', data)
    
    return NextResponse.json({
      success: true,
      profile: data,
      message: '简历档案已保存到云端数据库'
    })
    
  } catch (error) {
    console.error('保存简历失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '保存失败'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取用户ID（暂时使用固定值）
    const userId = 'demo-user-001'
    
    const profile = await ProfileService.getUserProfile(userId)
    
    if (!profile) {
      return NextResponse.json({
        success: false,
        message: '未找到用户档案'
      }, { status: 404 })
    }
    
    // 转换为前端需要的格式
    const formattedProfile = {
      skills: profile.skills || [],
      experience: profile.summary || '',
      education: profile.education || '',
      location: profile.location || '',
      preferredRoles: profile.preferences?.job_types || [],
      languages: ['中文', '英语'] // 默认值
    }
    
    return NextResponse.json({
      success: true,
      profile: formattedProfile
    })
    
  } catch (error) {
    console.error('获取简历失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取失败'
    }, { status: 500 })
  }
}