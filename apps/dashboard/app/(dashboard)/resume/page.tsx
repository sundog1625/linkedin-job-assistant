'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { SuccessModal } from '@/components/SuccessModal'

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
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // 检查URL参数是否包含setup=true，并加载已保存的档案
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('setup') === 'true') {
      setShowSetupMode(true)
    }
    
    // 尝试加载已保存的档案
    loadSavedProfile()
  }, [])
  
  const loadSavedProfile = async () => {
    try {
      // 先尝试从API加载
      const response = await fetch('/api/save-profile')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.profile) {
          console.log('从数据库加载档案:', result.profile)
          setAnalyzedProfile(result.profile) // 设置到状态中
          toast({
            title: "档案已加载",
            description: "已成功加载您的简历档案"
          })
          return
        }
      }
    } catch (error) {
      console.log('从数据库加载失败，尝试本地存储')
    }
    
    // 如果API失败，从localStorage加载
    const saved = localStorage.getItem('userProfile')
    if (saved) {
      const profile = JSON.parse(saved)
      console.log('从本地存储加载档案:', profile)
      setAnalyzedProfile(profile) // 设置到状态中
      toast({
        title: "档案已加载",
        description: "已从本地存储加载您的简历档案"
      })
    }
  }

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
    console.log('保存按钮被点击了')
    console.log('当前analyzedProfile:', analyzedProfile)
    
    if (!analyzedProfile) {
      console.log('没有分析数据，无法保存')
      return
    }
    
    try {
      // 先保存到localStorage（即时保存）
      localStorage.setItem('userProfile', JSON.stringify(analyzedProfile))
      console.log('已保存到localStorage')
      
      // 调用API保存到数据库
      const response = await fetch('/api/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyzedProfile)
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('已保存到数据库:', result.message)
        
        // 也尝试保存到Chrome扩展的storage（如果可用）
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ userProfile: analyzedProfile }, () => {
            console.log('已保存到Chrome Storage')
          })
        }
        
        // 显示美化的成功弹窗
        setSuccessMessage(result.message || "您的简历档案已保存到云端数据库")
        setShowSuccessModal(true)
        
        // 延迟重置状态，让用户看到成功效果
        setTimeout(() => {
          setShowSetupMode(false)
          setAnalyzedProfile(null)
          setResumeText('')
        }, 2000)
      } else {
        throw new Error(result.error || '保存失败')
      }
      
    } catch (error) {
      console.error('保存失败:', error)
      
      // 即使API失败，localStorage已经保存了
      toast({
        title: "保存到本地",
        description: "已保存到本地存储，云端保存失败",
        variant: "default"
      })
      
      alert('已保存到本地存储')
      
      // 依然返回主页面
      setShowSetupMode(false)
      setAnalyzedProfile(null)
      setResumeText('')
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
                  <div className="flex gap-4 mt-4">
                    <Button onClick={() => setEditMode(false)} className="flex-1">
                      ✅ 完成编辑
                    </Button>
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
        <h1 className="text-3xl font-bold">📝 Resume Manager</h1>
        <p className="text-muted-foreground mt-2">
          管理您的简历档案和求职信息
        </p>
      </div>
      
      {/* 如果已有保存的档案，显示档案信息 */}
      {analyzedProfile ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>✅ 您的简历档案</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditMode(!editMode)}>
                  {editMode ? '完成' : '✏️ 编辑'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowSetupMode(true)}>
                  🔄 重新分析
                </Button>
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => {
                    // 添加URL参数以便在Jobs页面显示提示
                    window.location.href = '/jobs?action=generate-resume&from=resume-manager'
                  }}
                >
                  🎯 生成针对性简历
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              您的简历信息已保存，LinkedIn Job Assistant将使用这些信息进行职位匹配
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <div className="space-y-4">
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
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🎓 教育背景</label>
                  <Input
                    value={analyzedProfile.education}
                    onChange={(e) => updateField('education', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📍 期望地点</label>
                  <Input
                    value={analyzedProfile.location}
                    onChange={(e) => updateField('location', e.target.value)}
                  />
                </div>
                <Button onClick={saveProfile} className="w-full">
                  💾 保存更改
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="font-medium text-gray-700 min-w-[80px]">💼 技能:</span>
                  <div className="flex flex-wrap gap-2">
                    {analyzedProfile.skills?.map((skill, index) => (
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
                {analyzedProfile.preferredRoles && (
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-700 min-w-[80px]">🎯 职位:</span>
                    <div className="flex flex-wrap gap-2">
                      {analyzedProfile.preferredRoles.map((role, index) => (
                        <Badge key={index} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {analyzedProfile.languages && (
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-700 min-w-[80px]">🌐 语言:</span>
                    <span className="text-gray-600">{analyzedProfile.languages.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">还没有简历档案</h3>
            <p className="text-gray-500 mb-4">
              创建您的简历档案，让AI帮您匹配最合适的职位
            </p>
            <Button onClick={() => setShowSetupMode(true)}>
              ➕ 创建简历档案
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 成功弹窗 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="保存成功！"
        message={successMessage}
      />
    </div>
  )
}