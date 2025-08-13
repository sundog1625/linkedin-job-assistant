import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 初始化Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 添加CORS头
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
    const jobData = await request.json()
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase未配置'
      }, { status: 500, headers: corsHeaders })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 固定用户ID（实际应用中应该从session获取）
    const userId = '550e8400-e29b-41d4-a716-446655440000' // 有效的UUID格式
    
    // 构建职位数据
    const job = {
      user_id: userId,
      linkedin_url: jobData.url,
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      description: jobData.description || '',
      requirements: jobData.requirements || [],
      required_skills: jobData.skills || [],
      experience_required: jobData.experience || null,
      salary_range: jobData.salary || null,
      job_type: jobData.job_type || null,
      posted_date: jobData.posted_date || null,
      applicant_count: jobData.applicant_count || null,
      match_score: jobData.match_score || null,
      status: jobData.status || 'saved',
      applied_date: null,
      interview_date: null,
      notes: '',
      tags: [],
    }
    
    console.log('准备保存职位:', job)
    
    // 检查是否已存在相同的职位URL
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('id')
      .eq('user_id', userId)
      .eq('linkedin_url', job.linkedin_url)
      .single()
    
    if (existingJob) {
      return NextResponse.json({
        success: false,
        error: '该职位已在您的Job Tracker中'
      }, { status: 409, headers: corsHeaders })
    }
    
    // 保存到数据库
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select()
      .single()
    
    if (error) {
      console.error('保存职位失败:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500, headers: corsHeaders })
    }
    
    console.log('职位保存成功:', data)
    
    return NextResponse.json({
      success: true,
      job: data,
      message: '职位已成功添加到Job Tracker'
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500, headers: corsHeaders })
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase未配置'
      }, { status: 500, headers: corsHeaders })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    const userId = '550e8400-e29b-41d4-a716-446655440000' // 有效的UUID格式
    
    // 获取URL参数
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    // 按状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    // 搜索功能
    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,location.ilike.%${search}%`)
    }
    
    const { data: jobs, error } = await query
    
    if (error) {
      console.error('获取职位失败:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500, headers: corsHeaders })
    }
    
    return NextResponse.json({
      success: true,
      jobs: jobs || []
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500, headers: corsHeaders })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { jobId, ...updates } = await request.json()
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase未配置'
      }, { status: 500, headers: corsHeaders })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 更新职位状态或其他字段
    const { data, error } = await supabase
      .from('jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single()
    
    if (error) {
      console.error('更新职位失败:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500, headers: corsHeaders })
    }
    
    return NextResponse.json({
      success: true,
      job: data
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500, headers: corsHeaders })
  }
}