'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Upload, ExternalLink, Users, MapPin, Building2, DollarSign, Trash2, AlertCircle, FileDown, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { ResumeTemplate, type ResumeData } from '@/components/ResumeTemplates'
import { useI18n, interpolateString } from '@/lib/i18n/context'

export const dynamic = 'force-dynamic'

interface Job {
  id: string
  title: string
  company: string
  location: string
  linkedin_url?: string
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected'
  match_score?: {
    overall: number
    skills: number
    experience: number
    location: number
    company: number
  }
  applicant_count?: number
  posted_date?: string
  applied_date?: string
  salary_range?: string
  description?: string
  created_at: string
}

interface JobColumn {
  id: string
  title: string
  jobs: Job[]
  color: string
  icon: string
}

// Column configuration will be generated based on translations
const getColumnConfig = (t: any) => ({
  saved: { title: t.jobs.columns.saved, color: 'bg-gray-50 border-gray-200', icon: '💾' },
  applied: { title: t.jobs.columns.applied, color: 'bg-blue-50 border-blue-200', icon: '📝' },
  interviewing: { title: t.jobs.columns.interviewing, color: 'bg-orange-50 border-orange-200', icon: '💬' },
  offer: { title: t.jobs.columns.offer, color: 'bg-green-50 border-green-200', icon: '🎉' },
  rejected: { title: t.jobs.columns.rejected, color: 'bg-red-50 border-red-200', icon: '❌' }
})

// 简单的列组件
function JobColumn({ 
  column, 
  jobs, 
  onGenerateResume, 
  onDelete, 
  searchQuery,
  onDrop 
}: {
  column: JobColumn,
  jobs: Job[],
  onGenerateResume: (job: Job) => void,
  onDelete: (jobId: string) => void,
  searchQuery: string,
  onDrop: (jobId: string, newStatus: string) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  
  const filteredJobs = searchQuery ? 
    jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
    ) : jobs

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const jobId = e.dataTransfer.getData('text/plain')
    if (jobId) {
      onDrop(jobId, column.id)
    }
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-lg border p-4 ${column.color} min-h-[400px] transition-all duration-200 ${
        isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 scale-[1.02]' : 'hover:bg-opacity-80'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span>{column.icon}</span>
          {column.title}
        </h3>
        <Badge variant="secondary">{jobs.length}</Badge>
      </div>
      
      {isDragOver && (
        <div className="text-center text-blue-600 mb-3 font-medium">
          释放以移动到此状态
        </div>
      )}
      
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            onGenerateResume={onGenerateResume}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

// 简单的职位卡片组件
function JobCard({ job, onGenerateResume, onDelete }: { 
  job: Job, 
  onGenerateResume: (job: Job) => void,
  onDelete: (jobId: string) => void
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', job.id)
    e.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)
  }

  return (
    <Card 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white transition-all duration-200 cursor-move ${
        isDragging 
          ? 'opacity-50 scale-105 shadow-lg rotate-2 z-10' 
          : 'hover:shadow-md hover:scale-[1.02]'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
            {job.title}
          </h4>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onGenerateResume(job)
              }}
              className="h-6 w-6 p-0"
              title="生成针对性简历"
            >
              🎯
            </Button>
            {job.linkedin_url && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(job.linkedin_url, '_blank')
                }}
                className="h-6 w-6 p-0"
                title="查看原职位"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(job.id)
              }}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              title="删除职位"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            <span className="truncate">{job.company}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{job.location}</span>
          </div>
          {job.salary_range && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span className="truncate">{job.salary_range}</span>
            </div>
          )}
          {job.applicant_count && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{job.applicant_count} 申请人</span>
            </div>
          )}
          {job.match_score && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>匹配度: {job.match_score.overall}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function JobTrackerPage() {
  const { t } = useI18n()
  const COLUMN_CONFIG = getColumnConfig(t)
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [columns, setColumns] = useState<JobColumn[]>([])
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [generatedResume, setGeneratedResume] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showFromResumeManagerTip, setShowFromResumeManagerTip] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'creative'>('modern')
  const [showPreview, setShowPreview] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showOnlineTemplates, setShowOnlineTemplates] = useState(false)
  const [onlineTemplates, setOnlineTemplates] = useState<any>(null)

  // 获取用户简历档案
  const getUserProfile = async () => {
    try {
      const response = await fetch('/api/user-profile')
      if (response.ok) {
        const data = await response.json()
        return data.profile
      }
    } catch (error) {
      console.error('获取用户档案失败:', error)
    }
    return null
  }

  // 生成针对性简历
  const generateTargetedResume = async (job: Job) => {
    setSelectedJob(job)
    setShowResumeDialog(true)
    setIsGenerating(true)
    setGeneratedResume(null)

    try {
      const userProfile = await getUserProfile()
      if (!userProfile) {
        toast({
          title: t.common.error,
          description: "Please set up your resume profile first",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/generate-targeted-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          jobDescription: job.description || `${job.title} at ${job.company}`,
          jobTitle: job.title,
          company: job.company
        })
      })

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setGeneratedResume(result.targetedResume)
      } else {
        throw new Error(result.error || '生成失败')
      }
    } catch (error) {
      console.error('简历生成失败:', error)
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : '请重试',
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // PDF生成功能
  const handleGeneratePDF = async () => {
    if (!generatedResume) return
    setIsGeneratingPDF(true)
    
    try {
      // 如果有格式化文本，直接创建简单HTML页面
      if (generatedResume.formattedText) {
        const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>针对性简历</title>
    <style>
        body { 
          font-family: "Microsoft YaHei", Arial, sans-serif; 
          line-height: 1.6; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px; 
          color: #333;
        }
        .resume-content { 
          white-space: pre-line; 
          font-size: 14px; 
        }
        @media print { 
          body { font-size: 11px; padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="resume-content">${generatedResume.formattedText}</div>
</body>
</html>
        `
        
        const newWindow = window.open('', '_blank')
        if (newWindow) {
          newWindow.document.write(htmlContent)
          newWindow.document.close()
          newWindow.print()
          newWindow.close()
        }
        
        toast({
          title: "PDF生成成功",
          description: "简历已在新窗口中打开，您可以保存为PDF"
        })
        return
      }
      
      // 否则使用API生成PDF
      const response = await fetch('/api/generate-resume-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: generatedResume,
          template: selectedTemplate
        })
      })

      if (!response.ok) {
        throw new Error('PDF生成失败')
      }

      const result = await response.json()
      if (result.success && result.htmlContent) {
        const newWindow = window.open('', '_blank')
        if (newWindow) {
          newWindow.document.write(result.htmlContent)
          newWindow.document.close()
          newWindow.print()
          newWindow.close()
        }
        
        toast({
          title: "PDF生成成功",
          description: "简历已在新窗口中打开，您可以保存为PDF"
        })
      } else {
        throw new Error('PDF内容生成失败')
      }
    } catch (error) {
      console.error('PDF生成失败:', error)
      toast({
        title: "PDF生成失败", 
        description: "请重试或使用打印功能",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // 获取在线模板
  const loadOnlineTemplates = async () => {
    try {
      const response = await fetch('/api/get-online-templates')
      if (response.ok) {
        const data = await response.json()
        setOnlineTemplates(data)
      }
    } catch (error) {
      console.error('加载在线模板失败:', error)
    }
  }

  // 加载职位数据
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch('/api/jobs')
        if (response.ok) {
          const data = await response.json()
          setJobs(data.jobs || [])
        }
      } catch (error) {
        console.error('加载职位失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
    loadOnlineTemplates()
  }, [])

  // 检查是否从Resume Manager跳转过来
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('action') === 'generate-resume' && urlParams.get('from') === 'resume-manager') {
      setShowFromResumeManagerTip(true)
      setTimeout(() => setShowFromResumeManagerTip(false), 8000)
    }
  }, [])

  // 整理职位到列中
  useEffect(() => {
    const organizedColumns = Object.entries(COLUMN_CONFIG).map(([status, config]) => ({
      id: status,
      title: config.title,
      jobs: jobs.filter(job => job.status === status),
      color: config.color,
      icon: config.icon
    }))
    setColumns(organizedColumns)
  }, [jobs])

  // 删除职位
  const deleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs?id=${jobId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setJobs(jobs.filter(job => job.id !== jobId))
        toast({
          title: "删除成功",
          description: "职位已从列表中移除"
        })
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "请重试",
        variant: "destructive"
      })
    }
  }

  // 更新职位状态（乐观更新）
  const updateJobStatus = async (jobId: string, newStatus: string) => {
    // 1. 立即更新UI（乐观更新）
    const originalJobs = [...jobs]
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus as any } : job
    ))

    try {
      console.log('更新职位状态API调用:', { jobId, newStatus })
      
      const response = await fetch('/api/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: jobId,
          status: newStatus
        })
      })

      console.log('API响应状态:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('API响应数据:', result)
        
        // API成功，显示成功消息
        toast({
          title: "状态已更新",
          description: `职位状态已更改为: ${COLUMN_CONFIG[newStatus as keyof typeof COLUMN_CONFIG]?.title}`
        })
      } else {
        const errorData = await response.json()
        console.error('API错误响应:', errorData)
        
        // API失败，恢复原始状态
        setJobs(originalJobs)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('更新职位状态失败:', error)
      
      // 确保状态已恢复
      setJobs(originalJobs)
      
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "已恢复原状态",
        variant: "destructive"
      })
    }
  }

  // 简单的拖放处理
  const handleDrop = (jobId: string, newStatus: string) => {
    console.log('拖放处理:', { jobId, newStatus })

    // 如果拖拽到了不同的状态列
    if (Object.keys(COLUMN_CONFIG).includes(newStatus)) {
      const job = jobs.find(j => j.id === jobId)
      if (job && job.status !== newStatus) {
        console.log('更新职位状态:', job.title, '从', job.status, '到', newStatus)
        updateJobStatus(jobId, newStatus)
      }
    }
  }

  // 导出到CSV
  const exportToCSV = () => {
    try {
      const csvHeader = '"职位标题","公司","地点","状态","匹配度","申请人数","薪资","发布日期","申请日期","LinkedIn链接"\n'
      const csvData = jobs.map(job => {
        const matchScore = job.match_score?.overall || 0
        const applicants = job.applicant_count || 0
        const salary = job.salary_range || ''
        const postedDate = job.posted_date ? new Date(job.posted_date).toLocaleDateString() : ''
        const appliedDate = job.applied_date ? new Date(job.applied_date).toLocaleDateString() : ''
        
        return `"${job.title}","${job.company}","${job.location}","${job.status}","${matchScore}","${applicants}","${salary}","${postedDate}","${appliedDate}","${job.linkedin_url || ''}"`
      }).join('\n')
      
      const csvContent = csvHeader + csvData
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `job-tracker-${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "导出成功",
        description: "职位数据已导出为CSV文件",
      })
    } catch (error) {
      console.error('导出失败:', error)
      toast({
        title: "导出失败",
        description: "无法导出数据，请重试",
        variant: "destructive"
      })
    }
  }

  const importFromExcel = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.xlsx,.xls'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          toast({
            title: "功能开发中",
            description: "Excel/CSV导入功能即将推出",
          })
        } catch (error) {
          toast({
            title: "导入失败",
            description: "无法解析文件，请检查格式",
            variant: "destructive"
          })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const getJobCounts = () => {
    return Object.keys(COLUMN_CONFIG).reduce((acc, status) => {
      acc[status] = jobs.filter(job => job.status === status).length
      return acc
    }, {} as Record<string, number>)
  }

  const jobCounts = getJobCounts()
  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">📊 {t.jobs.title}</h1>
        <p className="text-muted-foreground mt-2">
          {t.jobs.subtitle}
        </p>
      </div>

      {/* Resume Manager Tip */}
      {showFromResumeManagerTip && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-semibold text-blue-900">{t.jobs.dragTip.title}</h3>
                <p className="text-blue-800 text-sm mt-1">
                  {t.jobs.dragTip.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(COLUMN_CONFIG).map(([status, config]) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{config.title}</p>
                  <p className="text-2xl font-bold">{jobCounts[status] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 搜索和操作栏 */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.jobs.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {t.jobs.actions.exportCsv}
        </Button>
        <Button onClick={importFromExcel} variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          {t.jobs.actions.importExcel}
        </Button>
      </div>

      {/* 职位看板 */}
      {jobs.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-xl font-semibold mb-2">暂无职位</h3>
          <p className="text-gray-500 mb-4">
            使用Chrome扩展在LinkedIn上浏览职位时，保存的职位会显示在这里
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            安装Chrome扩展
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {columns.map((column) => (
            <JobColumn
              key={column.id}
              column={column}
              jobs={column.jobs}
              onGenerateResume={generateTargetedResume}
              onDelete={deleteJob}
              searchQuery={searchQuery}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {/* 简历生成Dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🎯 针对性简历
              {selectedJob && (
                <Badge variant="outline">
                  {selectedJob.title} @ {selectedJob.company}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              基于AI分析的个性化简历内容
            </DialogDescription>
          </DialogHeader>

          {isGenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">正在生成针对性简历内容...</p>
                <p className="text-sm text-gray-500 mt-2">这可能需要10-20秒时间</p>
              </div>
            </div>
          ) : generatedResume ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  📝 针对性简历内容
                </h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {generatedResume.formattedText || generatedResume.summary || '生成内容为空'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 功能按钮区域 */}
              <div className="space-y-4">
                {/* 主要操作按钮 */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => {
                      const resumeText = generatedResume.formattedText || generatedResume.summary || ''
                      navigator.clipboard.writeText(resumeText)
                      toast({
                        title: "已复制到剪贴板",
                        description: "简历内容已复制，您可以粘贴到任何地方使用"
                      })
                    }}
                    variant="outline"
                  >
                    📋 复制到剪贴板
                  </Button>
                  <Button 
                    onClick={() => setShowPreview(true)}
                    variant="outline"
                  >
                    👁️ 简历预览
                  </Button>
                  <Button
                    onClick={handleGeneratePDF}
                    disabled={isGeneratingPDF}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4" />
                        生成PDF
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => setShowOnlineTemplates(true)}
                    variant="outline"
                  >
                    🌐 在线模板
                  </Button>
                </div>

                {/* 模板选择 */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">PDF模板:</span>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">现代风格</SelectItem>
                      <SelectItem value="classic">经典风格</SelectItem>
                      <SelectItem value="creative">创意风格</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setShowResumeDialog(false)}>
                  完成
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">生成失败，请重试</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 简历预览Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              👁️ 简历预览 - {selectedTemplate === 'modern' ? '现代风格' : selectedTemplate === 'classic' ? '经典风格' : '创意风格'}
              {selectedJob && (
                <Badge variant="outline">
                  {selectedJob.title} @ {selectedJob.company}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              预览您的针对性简历，可直接打印或保存为PDF
            </DialogDescription>
          </DialogHeader>

          {generatedResume && (
            <div className="print:p-0">
              <ResumeTemplate 
                resumeData={generatedResume} 
                template={selectedTemplate}
              />
            </div>
          )}

          <DialogFooter className="print:hidden">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(false)}
            >
              关闭预览
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  生成中...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  生成PDF
                </>
              )}
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="flex items-center gap-2"
            >
              🖨️ 打印
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 在线模板推荐Dialog */}
      <Dialog open={showOnlineTemplates} onOpenChange={setShowOnlineTemplates}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🌐 免费在线简历模板推荐
            </DialogTitle>
            <DialogDescription>
              精选优质的免费简历模板，您可以使用我们生成的内容填入这些专业模板
            </DialogDescription>
          </DialogHeader>

          {onlineTemplates && (
            <div className="space-y-6">
              {/* 使用指南 */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">使用指南</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div>
                      <p><strong>1.</strong> 选择适合您行业的模板</p>
                      <p><strong>2.</strong> 访问模板网站或GitHub</p>
                      <p><strong>3.</strong> 复制我们生成的简历内容</p>
                    </div>
                    <div>
                      <p><strong>4.</strong> 按模板格式填入内容</p>
                      <p><strong>5.</strong> 生成专业PDF简历</p>
                      <p><strong>💡</strong> 技术岗位推荐GitHub风格</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 技术类模板 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">💻 技术类模板</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {onlineTemplates.templates.tech?.map((template: any, index: number) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.features.map((feature: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => window.open(template.url, '_blank')}
                            className="flex-1"
                          >
                            访问
                          </Button>
                          {template.preview !== template.url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(template.preview, '_blank')}
                            >
                              预览
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 在线工具 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">🛠️ 在线制作工具</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {onlineTemplates.templates.online?.map((template: any, index: number) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.features.map((feature: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => window.open(template.url, '_blank')}
                          className="w-full"
                        >
                          立即使用
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 学术/专业模板 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-600">🎓 学术/专业模板</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...onlineTemplates.templates.academic, ...onlineTemplates.templates.professional]?.map((template: any, index: number) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.features.map((feature: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => window.open(template.url, '_blank')}
                          className="w-full"
                        >
                          获取模板
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOnlineTemplates(false)}>
              关闭
            </Button>
            <Button 
              onClick={() => {
                // 复制简历内容到剪贴板
                if (generatedResume) {
                  const resumeText = `
姓名: ${generatedResume.personalInfo?.name || ''}
职位: ${generatedResume.personalInfo?.title || ''}
地点: ${generatedResume.personalInfo?.location || ''}
邮箱: ${generatedResume.personalInfo?.email || ''}
电话: ${generatedResume.personalInfo?.phone || ''}
LinkedIn: ${generatedResume.personalInfo?.linkedin || ''}

职业总结:
${generatedResume.summary}

技术技能: ${generatedResume.skills?.technical?.join(', ')}
软技能: ${generatedResume.skills?.soft?.join(', ')}
语言能力: ${generatedResume.skills?.languages?.join(', ')}

工作经验:
${generatedResume.experience?.map((exp: any) => 
  `${exp.title} @ ${exp.company} (${exp.duration})
${exp.achievements?.map((ach: string) => `• ${ach}`).join('\n')}
使用技术: ${exp.technologies?.join(', ')}`
).join('\n\n')}

核心项目:
${generatedResume.projects?.map((proj: any) => 
  `${proj.name}
${proj.description}
技术栈: ${proj.technologies?.join(', ')}
${proj.achievements?.map((ach: string) => `• ${ach}`).join('\n')}`
).join('\n\n')}

教育背景:
${generatedResume.education?.map((edu: any) => 
  `${edu.degree} - ${edu.school} (${edu.year})`
).join('\n')}

相关证书: ${generatedResume.certifications?.join(', ')}

求职信:
${generatedResume.coverLetter}
                  `.trim()
                  
                  navigator.clipboard.writeText(resumeText)
                  toast({
                    title: "内容已复制",
                    description: "简历内容已复制到剪贴板，您可以粘贴到选择的模板中"
                  })
                }
              }}
            >
              📋 复制简历内容
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}