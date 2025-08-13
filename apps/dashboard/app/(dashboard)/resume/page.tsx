'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

export const dynamic = 'force-dynamic'

interface UserProfile {
  skills: string[]
  experience: string
  education: string
  location: string
  preferredRoles: string[]
  languages: string[]
}

export default function ResumePage() {
  const [resumeText, setResumeText] = useState('')
  const [language, setLanguage] = useState('zh-CN')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedProfile, setAnalyzedProfile] = useState<UserProfile | null>(null)
  const [showSetupMode, setShowSetupMode] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // 检查URL参数是否包含setup=true
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('setup') === 'true') {
      setShowSetupMode(true)
    }
  }, [])

  const analyzeResume = async () => {
    if (!resumeText.trim() || resumeText.length < 50) {
      toast({
        title: "简历内容不足",
        description: "请输入更完整的简历内容（至少50个字符）",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    
    try {
      // 调用Claude API分析简历
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          language
        })
      })

      if (!response.ok) {
        throw new Error('分析失败，请重试')
      }

      const result = await response.json()
      
      if (result.success) {
        setAnalyzedProfile(result.profile)
        toast({
          title: "分析完成",
          description: "AI已成功分析您的简历内容"
        })
      } else {
        throw new Error(result.error || '分析失败')
      }
    } catch (error) {
      console.error('Resume analysis failed:', error)
      toast({
        title: "分析失败",
        description: error instanceof Error ? error.message : "请重试",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveProfile = async () => {
    if (!analyzedProfile) return
    
    try {
      // 这里可以调用API保存到数据库
      // 也可以保存到localStorage作为临时方案
      localStorage.setItem('userProfile', JSON.stringify(analyzedProfile))
      
      toast({
        title: "保存成功",
        description: "您的简历档案已保存",
      })
      
      // 关闭当前窗口或跳转回LinkedIn
      if (window.opener) {
        window.close()
      }
    } catch (error) {
      toast({
        title: "保存失败",
        description: "请重试",
        variant: "destructive"
      })
    }
  }

  const handleEdit = () => {
    setEditMode(true)
  }

  const updateField = (field: keyof UserProfile, value: any) => {
    if (!analyzedProfile) return
    
    setAnalyzedProfile({
      ...analyzedProfile,
      [field]: value
    })
  }

  if (showSetupMode) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">📝 智能简历设置</h1>
          <p className="text-gray-600 mt-2">
            上传简历内容，AI自动提取关键信息
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📄 上传您的简历
            </CardTitle>
            <CardDescription>
              支持文本格式或复制粘贴简历内容，AI将自动分析并提取关键信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📋 简历内容
              </label>
              <Textarea
                placeholder="请粘贴您的简历内容，或直接输入个人信息：

• 基本信息（姓名、联系方式）
• 工作经验和成就
• 技能和专长
• 教育背景
• 项目经验
• 语言能力等"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                🌐 分析语言:
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">中文</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                  <SelectItem value="ja-JP">日本語</SelectItem>
                  <SelectItem value="ko-KR">한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={analyzeResume}
                disabled={isAnalyzing || !resumeText.trim()}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    AI正在分析...
                  </>
                ) : (
                  <>🤖 AI分析简历</>
                )}
              </Button>
              <Button variant="outline" onClick={() => setEditMode(true)}>
                ✏️ 手动填写
              </Button>
            </div>
          </CardContent>
        </Card>

        {analyzedProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 AI分析结果
              </CardTitle>
              <CardDescription>
                请检查并确认AI提取的信息是否准确
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">💼 核心技能</label>
                    <Input
                      value={Array.isArray(analyzedProfile.skills) ? analyzedProfile.skills.join(', ') : ''}
                      onChange={(e) => updateField('skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      placeholder="如: React, JavaScript, Python"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📚 工作经验</label>
                    <Textarea
                      value={analyzedProfile.experience}
                      onChange={(e) => updateField('experience', e.target.value)}
                      placeholder="描述您的工作经验"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🎓 教育背景</label>
                    <Input
                      value={analyzedProfile.education}
                      onChange={(e) => updateField('education', e.target.value)}
                      placeholder="如: 计算机科学本科, 北京大学"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📍 期望地点</label>
                    <Input
                      value={analyzedProfile.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="如: 北京, 上海, 远程工作"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🎯 期望职位</label>
                    <Input
                      value={Array.isArray(analyzedProfile.preferredRoles) ? analyzedProfile.preferredRoles.join(', ') : ''}
                      onChange={(e) => updateField('preferredRoles', e.target.value.split(',').map(r => r.trim()).filter(r => r))}
                      placeholder="如: 前端工程师, 全栈开发"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🌐 语言能力</label>
                    <Input
                      value={Array.isArray(analyzedProfile.languages) ? analyzedProfile.languages.join(', ') : ''}
                      onChange={(e) => updateField('languages', e.target.value.split(',').map(l => l.trim()).filter(l => l))}
                      placeholder="如: 中文（母语）, 英语（流利）"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-700 min-w-[80px]">💼 技能:</span>
                    <div className="flex flex-wrap gap-2">
                      {analyzedProfile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-700 min-w-[80px]">📚 经验:</span>
                    <span className="text-gray-600">{analyzedProfile.experience}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-700 min-w-[80px]">🎓 教育:</span>
                    <span className="text-gray-600">{analyzedProfile.education}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-700 min-w-[80px]">📍 地点:</span>
                    <span className="text-gray-600">{analyzedProfile.location}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-700 min-w-[80px]">🎯 职位:</span>
                    <div className="flex flex-wrap gap-2">
                      {analyzedProfile.preferredRoles.map((role, index) => (
                        <Badge key={index} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-700 min-w-[80px]">🌐 语言:</span>
                    <span className="text-gray-600">{analyzedProfile.languages.join(', ')}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <Button onClick={saveProfile} className="flex-1">
                  💾 保存档案
                </Button>
                <Button variant="outline" onClick={handleEdit}>
                  ✏️ 编辑
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // 正常的简历管理页面
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Resume Manager</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage multiple resume versions
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-xl font-semibold mb-2">Resume Builder</h3>
        <p className="text-gray-500 mb-4">
          Create tailored resumes for different job opportunities
        </p>
        <Button onClick={() => setShowSetupMode(true)}>
          Create Resume
        </Button>
      </div>
    </div>
  )
}