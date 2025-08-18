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

const COLUMN_CONFIG = {
  saved: { title: 'Saved', color: 'bg-gray-50 border-gray-200', icon: '💾' },
  applied: { title: 'Applied', color: 'bg-blue-50 border-blue-200', icon: '📝' },
  interviewing: { title: 'Interviewing', color: 'bg-orange-50 border-orange-200', icon: '💬' },
  offer: { title: 'Offer', color: 'bg-green-50 border-green-200', icon: '🎉' },
  rejected: { title: 'Rejected', color: 'bg-red-50 border-red-200', icon: '❌' }
}

// Job卡片组件
function JobCard({ 
  job, 
  onStatusChange, 
  onDelete,
  onGenerateResume
}: { 
  job: Job
  onStatusChange: (jobId: string, status: Job['status']) => void
  onDelete: (jobId: string) => void
  onGenerateResume: (job: Job) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', job.id)
    e.dataTransfer.setData('application/json', JSON.stringify(job))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDelete = () => {
    setShowDeleteDialog(false)
    onDelete(job.id)
  }

  return (
    <>
      <Card 
        className={`cursor-move hover:shadow-md transition-all duration-200 ${
          isDragging ? 'opacity-50 scale-95 shadow-lg rotate-2' : ''
        }`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-sm line-clamp-2 flex-1">{job.title}</h4>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteDialog(true)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{job.company}</span>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{job.location}</span>
            </div>
            
            {job.match_score && (
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  匹配度: {job.match_score.overall}%
                </Badge>
              </div>
            )}
            
            {job.applicant_count && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Users className="h-3 w-3" />
                <span>{job.applicant_count}位申请者</span>
              </div>
            )}
            
            {job.salary_range && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <DollarSign className="h-3 w-3" />
                <span className="truncate">{job.salary_range}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3 pt-2 border-t">
              <span className="text-xs text-gray-500">
                {new Date(job.created_at).toLocaleDateString()}
              </span>
              
              <div className="flex gap-1">
                {/* 生成针对性简历按钮 */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    onGenerateResume(job)
                  }}
                  title="生成针对性简历"
                >
                  <span className="text-xs">🎯</span>
                </Button>
                
                {/* 状态快速切换按钮 */}
                <select
                  value={job.status}
                  onChange={(e) => onStatusChange(job.id, e.target.value as Job['status'])}
                  className="text-xs border rounded px-1 py-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                {job.linkedin_url && (
                  <Button
                    size="sm" 
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(job.linkedin_url, '_blank')
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              确认删除职位
            </DialogTitle>
            <DialogDescription>
              您确定要删除职位 <strong>{job.title}</strong> 在 <strong>{job.company}</strong> 吗？
              <br />
              此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// 列组件
function JobColumn({ 
  column, 
  onStatusChange, 
  onDelete,
  onGenerateResume
}: { 
  column: JobColumn
  onStatusChange: (jobId: string, status: Job['status']) => void
  onDelete: (jobId: string) => void
  onGenerateResume: (job: Job) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
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
    const jobData = JSON.parse(e.dataTransfer.getData('application/json'))
    
    if (jobData.status !== column.id) {
      onStatusChange(jobId, column.id as Job['status'])
    }
  }

  return (
    <div 
      className={`rounded-lg border-2 p-4 transition-all duration-200 ${
        column.color
      } ${
        isDragOver ? 'border-blue-400 bg-blue-100 scale-105' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3 className="font-semibold mb-4 text-center">
        {column.icon} {column.title} ({column.jobs.length})
      </h3>
      
      <div className="space-y-3 min-h-64">
        {column.jobs.map((job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onGenerateResume={onGenerateResume}
          />
        ))}
        
        {/* 拖拽目标区域提示 */}
        {isDragOver && column.jobs.length === 0 && (
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-8 text-center text-blue-600">
            放置到这里
          </div>
        )}
      </div>
    </div>
  )
}

export default function JobTrackerPage() {
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

  useEffect(() => {
    loadJobs()
    
    // 检查是否从Resume Manager跳转过来
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('action') === 'generate-resume' && urlParams.get('from') === 'resume-manager') {
      setShowFromResumeManagerTip(true)
      // 5秒后自动隐藏提示
      setTimeout(() => setShowFromResumeManagerTip(false), 8000)
    }
  }, [])

  useEffect(() => {
    // 组织数据到列中
    const newColumns: JobColumn[] = Object.keys(COLUMN_CONFIG).map(status => {
      const config = COLUMN_CONFIG[status as keyof typeof COLUMN_CONFIG]
      return {
        id: status,
        title: config.title,
        jobs: jobs.filter(job => job.status === status && matchesSearch(job)),
        color: config.color,
        icon: config.icon
      }
    })
    setColumns(newColumns)
  }, [jobs, searchQuery])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/jobs')
      const result = await response.json()
      
      if (result.success) {
        setJobs(result.jobs)
      } else {
        console.error('加载职位失败:', result.error)
        toast({
          title: "加载失败",
          description: "无法加载职位数据",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('加载职位失败:', error)
      toast({
        title: "加载失败", 
        description: "网络错误，请重试",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const matchesSearch = (job: Job): boolean => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    )
  }

  const handleStatusChange = async (jobId: string, newStatus: Job['status']) => {
    const oldJob = jobs.find(job => job.id === jobId)
    if (!oldJob || oldJob.status === newStatus) return

    try {
      // 乐观更新
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, status: newStatus }
            : job
        )
      )

      // 服务器更新
      const response = await fetch('/api/jobs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobId,
          status: newStatus,
          ...(newStatus === 'applied' && oldJob.status === 'saved' ? 
            { applied_date: new Date().toISOString() } : {})
        })
      })

      const updateResult = await response.json()
      
      if (!updateResult.success) {
        // 回滚
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === jobId 
              ? { ...job, status: oldJob.status }
              : job
          )
        )
        
        toast({
          title: "更新失败",
          description: "无法更新职位状态",
          variant: "destructive"
        })
      } else {
        toast({
          title: "状态已更新",
          description: `职位已移动到${COLUMN_CONFIG[newStatus].title}`,
        })
      }
    } catch (error) {
      console.error('更新职位状态失败:', error)
      // 回滚
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, status: oldJob.status }
            : job
        )
      )
      
      toast({
        title: "更新失败",
        description: "网络错误，请重试",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (jobId: string) => {
    const jobToDelete = jobs.find(job => job.id === jobId)
    if (!jobToDelete) return

    try {
      // 乐观更新 - 先从UI中移除
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))

      // 调用删除API
      const response = await fetch(`/api/jobs?id=${jobId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!result.success) {
        // 如果删除失败，恢复职位
        setJobs(prevJobs => [...prevJobs, jobToDelete])
        toast({
          title: "删除失败",
          description: result.error || "无法删除职位",
          variant: "destructive"
        })
      } else {
        toast({
          title: "删除成功",
          description: `职位 "${jobToDelete.title}" 已成功删除`,
        })
      }
    } catch (error) {
      console.error('删除职位失败:', error)
      // 恢复职位
      setJobs(prevJobs => [...prevJobs, jobToDelete])
      toast({
        title: "删除失败",
        description: "网络错误，请重试",
        variant: "destructive"
      })
    }
  }

  const handleGenerateResume = async (job: Job) => {
    setSelectedJob(job)
    setShowResumeDialog(true)
    setIsGenerating(true)
    setGeneratedResume(null)

    try {
      // 先从localStorage获取用户档案
      const savedProfile = localStorage.getItem('userProfile')
      if (!savedProfile) {
        toast({
          title: "缺少简历档案",
          description: "请先在Resume Manager中设置您的简历档案",
          variant: "destructive"
        })
        setShowResumeDialog(false)
        return
      }

      const userProfile = JSON.parse(savedProfile)

      // 调用生成针对性简历的API
      const response = await fetch('/api/generate-targeted-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile,
          jobDescription: job.description || '',
          jobTitle: job.title,
          company: job.company
        })
      })

      if (!response.ok) {
        throw new Error('生成简历失败')
      }

      const result = await response.json()
      
      if (result.success) {
        setGeneratedResume(result.targetedResume)
        toast({
          title: "生成成功",
          description: "已为您生成针对性简历"
        })
      } else {
        throw new Error(result.error || '生成失败')
      }
    } catch (error) {
      console.error('生成简历失败:', error)
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "请重试",
        variant: "destructive"
      })
      setShowResumeDialog(false)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!generatedResume) return

    setIsGeneratingPDF(true)
    try {
      // 如果有格式化文本，直接创建简单HTML页面
      if (generatedResume.formattedText) {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume</title>
    <style>
        @page { margin: 0.5in; size: A4; }
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            font-size: 12px;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
        }
        .resume-content {
            white-space: pre-line;
            line-height: 1.5;
        }
        h1, h2, h3 { color: #2c3e50; margin-top: 20px; margin-bottom: 10px; }
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
          
          newWindow.onload = () => {
            setTimeout(() => {
              if (confirm('Resume opened in new window. Print to save as PDF?\n\nClick "OK" to print, "Cancel" to manually operate')) {
                newWindow.print()
              }
            }, 1000)
          }
        }
        
        toast({
          title: "Resume Generated Successfully",
          description: "Resume opened in new window. You can print to save as PDF"
        })
        return
      }

      // Fallback to old API method
      const response = await fetch('/api/generate-resume-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: generatedResume,
          template: selectedTemplate
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // 打开新窗口显示HTML简历，用户可以打印为PDF
        const newWindow = window.open('', '_blank')
        if (newWindow) {
          newWindow.document.write(result.htmlContent)
          newWindow.document.close()
          
          // 等待页面加载完成后提示用户打印
          newWindow.onload = () => {
            setTimeout(() => {
              if (confirm('简历已在新窗口中打开。是否立即打印保存为PDF？\n\n点击"确定"打印，点击"取消"手动操作')) {
                newWindow.print()
              }
            }, 1000)
          }
        }
        
        toast({
          title: "简历生成成功",
          description: "简历已在新窗口打开，您可以打印保存为PDF"
        })
      } else {
        throw new Error(result.error || '简历生成失败')
      }
    } catch (error) {
      console.error('简历生成失败:', error)
      toast({
        title: "简历生成失败",
        description: error instanceof Error ? error.message : "请重试",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePreviewResume = () => {
    if (!generatedResume) return
    setShowPreview(true)
  }

  const handleShowOnlineTemplates = async () => {
    if (!onlineTemplates) {
      try {
        const response = await fetch('/api/get-online-templates')
        const result = await response.json()
        if (result.success) {
          setOnlineTemplates(result)
        }
      } catch (error) {
        toast({
          title: "获取模板失败",
          description: "无法加载在线模板资源",
          variant: "destructive"
        })
      }
    }
    setShowOnlineTemplates(true)
  }

  const exportToExcel = async () => {
    try {
      // 创建CSV格式的数据
      const csvHeader = 'Title,Company,Location,Status,Match Score,Applicants,Salary,Posted Date,Applied Date,LinkedIn URL\n'
      const csvData = jobs.map(job => {
        const matchScore = job.match_score?.overall || ''
        const applicants = job.applicant_count || ''
        const salary = job.salary_range || ''
        const postedDate = job.posted_date ? new Date(job.posted_date).toLocaleDateString() : ''
        const appliedDate = job.applied_date ? new Date(job.applied_date).toLocaleDateString() : ''
        
        return `"${job.title}","${job.company}","${job.location}","${job.status}","${matchScore}","${applicants}","${salary}","${postedDate}","${appliedDate}","${job.linkedin_url || ''}"`
      }).join('\n')
      
      const csvContent = csvHeader + csvData
      
      // 下载文件
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
          // 这里可以添加CSV解析逻辑
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
        <h1 className="text-3xl font-bold">📊 Job Tracker</h1>
        <p className="text-muted-foreground mt-2">
          管理和追踪您的求职进展 - 拖拽职位卡片到不同状态列来更新状态
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(COLUMN_CONFIG).map(([status, config]) => (
          <Card key={status} className={`${config.color}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{config.title}</p>
                  <p className="text-2xl font-bold">{jobCounts[status] || 0}</p>
                </div>
                <span className="text-2xl">{config.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜索职位、公司或地点..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={importFromExcel} variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            导入 Excel
          </Button>
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出 Excel
          </Button>
        </div>
      </div>

      {/* 从Resume Manager跳转的提示 */}
      {showFromResumeManagerTip && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-blue-900">生成针对性简历</h3>
                <p className="text-blue-700 text-sm">
                  点击任何职位卡片上的 🎯 按钮，为该职位生成针对性简历和求职信
                </p>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowFromResumeManagerTip(false)}
                className="ml-auto"
              >
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Board */}
      <div className="grid grid-cols-5 gap-4 min-h-96">
        {columns.map((column) => (
          <JobColumn
            key={column.id}
            column={column}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onGenerateResume={handleGenerateResume}
          />
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">还没有添加职位</h3>
          <p className="text-gray-600 mb-4">
            在LinkedIn页面使用扩展程序添加职位，或者使用Excel导入功能
          </p>
          <Button onClick={importFromExcel} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            导入职位数据
          </Button>
        </div>
      )}

      {/* 针对性简历生成对话框 */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🎯 针对性简历生成
              {selectedJob && (
                <Badge variant="outline">
                  {selectedJob.title} @ {selectedJob.company}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              基于您的简历档案和目标职位，AI生成的针对性简历内容
            </DialogDescription>
          </DialogHeader>

          {isGenerating ? (
            <div className="flex flex-col items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">AI正在分析职位需求，生成针对性简历...</p>
            </div>
          ) : generatedResume ? (
            <div className="space-y-6">
              {/* 模板选择和操作按钮 */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">选择模板:</label>
                  <Select value={selectedTemplate} onValueChange={(value: any) => setSelectedTemplate(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">现代风格</SelectItem>
                      <SelectItem value="classic">经典风格</SelectItem>
                      <SelectItem value="creative">创意风格</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePreviewResume}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    预览简历
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleGeneratePDF}
                    disabled={isGeneratingPDF}
                    className="flex items-center gap-2"
                  >
                    {isGeneratingPDF ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <FileDown className="h-4 w-4" />
                    )}
                    {isGeneratingPDF ? '生成中...' : '生成PDF'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShowOnlineTemplates}
                    className="flex items-center gap-2"
                  >
                    🌐 在线模板
                  </Button>
                </div>
              </div>

              {/* 格式化简历内容 */}
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  📝 Targeted Resume
                </h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {generatedResume.formattedText || generatedResume.summary || 'No content generated'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 简化的技能显示 - 仅在有用户档案数据时显示 */}
              {generatedResume.skills?.technical?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    💼 Original Skills Reference
                  </h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {generatedResume.skills.technical.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 现在只显示格式化的简历文本，其他详细信息已包含在内 */}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Generation failed, please try again</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 简历预览Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              👁️ Resume Preview
              {selectedJob && (
                <Badge variant="outline">
                  {selectedJob.title} @ {selectedJob.company}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Preview your targeted resume
            </DialogDescription>
          </DialogHeader>

          {generatedResume && generatedResume.formattedText && (
            <div className="print:p-0">
              <div className="max-w-4xl mx-auto bg-white p-8 font-sans">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {generatedResume.formattedText}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="print:hidden">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(false)}
            >
              Close Preview
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Generate PDF
                </>
              )}
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="flex items-center gap-2"
            >
              🖨️ Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 在线模板推荐Dialog */}
      <Dialog open={showOnlineTemplates} onOpenChange={setShowOnlineTemplates}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🌐 Free Online Resume Templates
            </DialogTitle>
            <DialogDescription>
              High-quality free resume templates. You can use our generated content with these professional templates
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Usage Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <p><strong>1.</strong> Choose a template suitable for your industry</p>
                    <p><strong>2.</strong> Visit the template website or GitHub</p>
                    <p><strong>3.</strong> Copy our generated resume content</p>
                  </div>
                  <div>
                    <p><strong>4.</strong> Fill in content according to template format</p>
                    <p><strong>5.</strong> Generate professional PDF resume</p>
                    <p><strong>💡</strong> GitHub style recommended for tech positions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
                <Button 
                  onClick={() => {
                    // 复制到剪贴板
                    const resumeText = `
职业总结：
${generatedResume.summary}

核心技能：
${generatedResume.skills?.join(', ')}

工作经验：
${generatedResume.experience}

核心优势：
${generatedResume.keyStrengths?.map((s: string) => `• ${s}`).join('\n')}

求职信：
${generatedResume.coverLetter}
                    `.trim()
                    
                    navigator.clipboard.writeText(resumeText)
                    toast({
                      title: "已复制到剪贴板",
                      description: "简历内容已复制，您可以粘贴到文档中"
                    })
                  }}
                  variant="outline"
                >
                  📋 复制到剪贴板
                </Button>
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
Name: ${generatedResume.personalInfo?.name || ''}
Title: ${generatedResume.personalInfo?.title || ''}
Location: ${generatedResume.personalInfo?.location || ''}
Email: ${generatedResume.personalInfo?.email || ''}
Phone: ${generatedResume.personalInfo?.phone || ''}
LinkedIn: ${generatedResume.personalInfo?.linkedin || ''}

PROFESSIONAL SUMMARY:
${generatedResume.summary}

TECHNICAL SKILLS: ${generatedResume.skills?.technical?.join(', ')}
SOFT SKILLS: ${generatedResume.skills?.soft?.join(', ')}
LANGUAGES: ${generatedResume.skills?.languages?.join(', ')}

PROFESSIONAL EXPERIENCE:
${generatedResume.experience?.map((exp: any) => 
  `${exp.title} @ ${exp.company} (${exp.duration})
${exp.achievements?.map((ach: string) => `• ${ach}`).join('\n')}
Technologies: ${exp.technologies?.join(', ')}`
).join('\n\n')}

KEY PROJECTS:
${generatedResume.projects?.map((proj: any) => 
  `${proj.name}
${proj.description}
Tech Stack: ${proj.technologies?.join(', ')}
${proj.achievements?.map((ach: string) => `• ${ach}`).join('\n')}`
).join('\n\n')}

EDUCATION:
${generatedResume.education?.map((edu: any) => 
  `${edu.degree} - ${edu.school} (${edu.year})`
).join('\n')}

CERTIFICATIONS: ${generatedResume.certifications?.join(', ')}

COVER LETTER:
${generatedResume.coverLetter}
                  `.trim()
                  
                  navigator.clipboard.writeText(resumeText)
                  toast({
                    title: "Content Copied",
                    description: "Resume content has been copied to clipboard. You can paste it into your chosen template"
                  })
                }
              }}
            >
              📋 Copy Resume Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}