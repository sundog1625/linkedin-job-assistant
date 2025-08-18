import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key exists:', !!supabaseKey)
  console.log('Key preview:', supabaseKey?.substring(0, 20) + '...')
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      success: false,
      error: 'Supabase环境变量未配置',
      url: supabaseUrl || 'missing',
      keyExists: !!supabaseKey
    })
  }
  
  try {
    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 测试连接 - 尝试查询user_profiles表
    const { data, error, count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('Supabase查询错误:', error)
      return NextResponse.json({
        success: false,
        error: '数据库查询失败',
        details: error.message,
        code: error.code,
        hint: error.hint
      })
    }
    
    // 尝试插入测试数据
    const testProfile = {
      user_id: 'test-' + Date.now(),
      skills: ['JavaScript', 'React'],
      experience: 3,
      education: '测试学历',
      location: '测试地点',
      summary: '这是一个测试档案'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert([testProfile])
      .select()
      .single()
    
    if (insertError) {
      console.error('插入错误:', insertError)
      return NextResponse.json({
        success: false,
        error: '插入测试数据失败',
        details: insertError.message,
        tableExists: true,
        connectionWorks: true
      })
    }
    
    // 删除测试数据
    await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', testProfile.user_id)
    
    return NextResponse.json({
      success: true,
      message: 'Supabase连接成功！',
      tableExists: true,
      canInsert: true,
      canDelete: true,
      testData: insertData
    })
    
  } catch (error) {
    console.error('Supabase连接失败:', error)
    return NextResponse.json({
      success: false,
      error: '连接Supabase失败',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}