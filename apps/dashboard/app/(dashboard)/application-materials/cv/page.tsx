'use client'

import { useState, useRef } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Edit,
  Eye,
  Plus,
  CheckCircle,
  AlertCircle,
  Save,
  X,
  Sparkles,
  BarChart3,
  Target,
  TrendingUp
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CV {
  id: string
  name: string
  version: string
  lastModified: string
  size: string
  type: 'master' | 'targeted'
  targetJob?: string
  score?: number
  suggestions?: string[]
  content?: string
  analysis?: any
}

interface CVAnalysis {
  score: number
  atsCompatibility: number
  strengths: string[]
  improvements: string[]
  keywordMatch: string[]
  missingKeywords: string[]
  detailedAnalysis: {
    format: { score: number; feedback: string }
    content: { score: number; feedback: string }
    keywords: { score: number; feedback: string }
    achievements: { score: number; feedback: string }
    skills: { score: number; feedback: string }
  }
  suggestions: string[]
}

export default function CVPage() {
  const { t } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cvList, setCvList] = useState<CV[]>([
    {
      id: '1',
      name: 'Master Resume - Software Engineer',
      version: '2.3',
      lastModified: '2024-01-15',
      size: '245 KB',
      type: 'master',
      score: 85,
      content: `John Doe
Software Engineer
Email: john.doe@email.com | Phone: (555) 123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of expertise in full-stack development. Led development of scalable applications serving 100K+ users. Improved system performance by 40% through optimization techniques.

EXPERIENCE
Senior Software Engineer | Tech Corp | 2022-Present
• Developed and maintained React applications with 99.9% uptime
• Led team of 5 developers, delivering projects 20% ahead of schedule
• Implemented microservices architecture, reducing load times by 50%

Software Engineer | StartupXYZ | 2020-2022  
• Built REST APIs serving 10,000+ daily requests
• Optimized database queries, improving response time by 30%
• Collaborated with cross-functional teams on product launches

SKILLS
React, Node.js, TypeScript, AWS, Docker, PostgreSQL, Git, Agile, Leadership

EDUCATION
B.S. Computer Science | University of Technology | 2020`,
      suggestions: [
        'Add more quantifiable achievements',
        'Update skills section with latest technologies'
      ]
    }
  ])

  const [editingCv, setEditingCv] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editName, setEditName] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<{[key: string]: CVAnalysis}>({})
  const [manualCvName, setManualCvName] = useState('')
  const [manualCvContent, setManualCvContent] = useState('')

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF, DOC, DOCX, or TXT file',
        variant: 'destructive'
      })
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB',
        variant: 'destructive'
      })
      return
    }

    try {
      let content = ''

      if (file.type === 'application/pdf') {
        // Handle PDF files by sending to server for parsing
        const formData = new FormData()
        formData.append('file', file)
        
        toast({
          title: 'Processing PDF...',
          description: 'Extracting text content from PDF file, this may take a moment'
        })

        const response = await fetch('/api/parse-file', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Failed to parse PDF')
        }

        const result = await response.json()
        if (result.success) {
          content = result.text
          toast({
            title: 'PDF processed successfully',
            description: `Extracted ${result.metadata?.textLength || 'text'} characters from ${file.name}`
          })
        } else {
          throw new Error(result.error || 'Failed to extract text from PDF')
        }
      } else if (file.type === 'text/plain') {
        // Handle text files
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => reject(new Error('Failed to read text file'))
          reader.readAsText(file)
        })
      } else {
        // For DOC/DOCX files, show a message for now
        toast({
          title: 'DOC/DOCX Support',
          description: 'For best results, please convert to PDF or copy-paste the text content',
          variant: 'default'
        })
        
        // Try to read as text (may not work well for binary formats)
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsText(file)
        })
      }

      // Create CV entry
      const newCV: CV = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        version: '1.0',
        lastModified: new Date().toISOString().split('T')[0],
        size: `${Math.round(file.size / 1024)} KB`,
        type: 'master',
        content: content.substring(0, 5000) // Limit content for demo
      }
      setCvList([...cvList, newCV])
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      toast({
        title: t.applicationMaterials.cv.upload + ' successful',
        description: `${file.name} has been added to your CV library`
      })

    } catch (error) {
      console.error('File upload error:', error)
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to process the file. Please try again.',
        variant: 'destructive'
      })
    }
  }

  // Analyze CV
  const analyzeCV = async (cvId: string) => {
    const cv = cvList.find(c => c.id === cvId)
    if (!cv || !cv.content) {
      toast({
        title: 'Cannot analyze',
        description: 'CV content is not available',
        variant: 'destructive'
      })
      return
    }

    setIsAnalyzing(cvId)
    
    try {
      const response = await fetch('/api/analyze-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvContent: cv.content
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      
      if (result.success) {
        setAnalysisResults(prev => ({
          ...prev,
          [cvId]: result.analysis
        }))

        // Update CV with analysis results
        setCvList(prevList => 
          prevList.map(c => 
            c.id === cvId 
              ? { 
                  ...c, 
                  score: result.analysis.score,
                  suggestions: result.analysis.suggestions.slice(0, 3)
                }
              : c
          )
        )

        toast({
          title: 'Analysis complete',
          description: `CV scored ${result.analysis.score}/100`
        })
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('CV analysis failed:', error)
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(null)
    }
  }

  // Start editing CV
  const startEdit = (cvId: string) => {
    const cv = cvList.find(c => c.id === cvId)
    if (cv) {
      setEditingCv(cvId)
      setEditContent(cv.content || '')
      setEditName(cv.name)
    }
  }

  // Save CV edits
  const saveEdit = () => {
    if (!editingCv) return

    setCvList(prevList => 
      prevList.map(cv => 
        cv.id === editingCv 
          ? { 
              ...cv, 
              name: editName,
              content: editContent,
              lastModified: new Date().toISOString().split('T')[0],
              version: `${parseFloat(cv.version) + 0.1}`.substring(0, 3)
            }
          : cv
      )
    )

    setEditingCv(null)
    toast({
      title: 'CV updated',
      description: 'Your CV has been saved successfully'
    })
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingCv(null)
    setEditContent('')
    setEditName('')
  }

  // Download CV
  const downloadCV = (cv: CV) => {
    if (!cv.content) {
      toast({
        title: 'No content available',
        description: 'This CV does not have downloadable content',
        variant: 'destructive'
      })
      return
    }

    const blob = new Blob([cv.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cv.name}_v${cv.version}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Download started',
      description: `${cv.name} is being downloaded`
    })
  }

  // Delete CV
  const deleteCV = (cvId: string) => {
    setCvList(cvList.filter(cv => cv.id !== cvId))
    if (analysisResults[cvId]) {
      const newResults = { ...analysisResults }
      delete newResults[cvId]
      setAnalysisResults(newResults)
    }
    toast({
      title: t.applicationMaterials.cv.delete + 'd',
      description: 'The CV has been removed from your library'
    })
  }

  // Create from template
  const createFromTemplate = () => {
    const templateCV: CV = {
      id: Date.now().toString(),
      name: 'New Resume from Template',
      version: '1.0',
      lastModified: new Date().toISOString().split('T')[0],
      size: '180 KB',
      type: 'master',
      content: `[Your Name]
[Your Title]
[Email] | [Phone] | [Location]

PROFESSIONAL SUMMARY
[Brief description of your experience and key achievements]

EXPERIENCE
[Job Title] | [Company] | [Dates]
• [Achievement with quantifiable result]
• [Another achievement with metrics]
• [Key responsibility or project outcome]

SKILLS
[List your relevant technical and soft skills]

EDUCATION
[Degree] | [University] | [Year]`
    }

    setCvList([...cvList, templateCV])
    toast({
      title: 'Template created',
      description: 'New CV template has been added to your library'
    })
  }

  // Import from LinkedIn (mock function)
  const importFromLinkedIn = () => {
    toast({
      title: 'LinkedIn import',
      description: 'LinkedIn import feature will be available soon',
      variant: 'default'
    })
  }

  // Export all CVs
  const exportAllCVs = () => {
    const exportData = {
      cvs: cvList,
      analysis: analysisResults,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cv-library-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Export complete',
      description: 'All CVs have been exported'
    })
  }

  // Create CV from manual text input
  const createFromManualInput = () => {
    if (!manualCvName.trim() || !manualCvContent.trim()) {
      toast({
        title: 'Required fields missing',
        description: 'Please enter both CV name and content',
        variant: 'destructive'
      })
      return
    }

    if (manualCvContent.trim().length < 50) {
      toast({
        title: 'Content too short',
        description: 'Please enter at least 50 characters of CV content',
        variant: 'destructive'
      })
      return
    }

    const newCV: CV = {
      id: Date.now().toString(),
      name: manualCvName.trim(),
      version: '1.0',
      lastModified: new Date().toISOString().split('T')[0],
      size: `${Math.round(manualCvContent.length / 1024)} KB`,
      type: 'master',
      content: manualCvContent.trim()
    }

    setCvList([...cvList, newCV])
    
    // Clear the form
    setManualCvName('')
    setManualCvContent('')

    toast({
      title: 'CV created successfully',
      description: `${newCV.name} has been added to your CV library`
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t.applicationMaterials.cv.title}</h1>
        <p className="text-muted-foreground mt-2">
          {t.applicationMaterials.cv.subtitle}
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.applicationMaterials.cv.upload}</CardTitle>
          <CardDescription>
            {t.applicationMaterials.cv.uploadDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-4">
              Drag and drop your CV here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supported formats: PDF, DOC, DOCX, TXT (max 10MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button>
              <Plus className="mr-2" size={16} />
              Select File
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual CV Input */}
      <Card>
        <CardHeader>
          <CardTitle>Create CV from Text</CardTitle>
          <CardDescription>
            Paste your CV content directly or type it manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">CV Name</label>
              <Input
                placeholder="e.g., My Resume - Software Engineer"
                value={manualCvName}
                onChange={(e) => setManualCvName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CV Content</label>
              <Textarea
                placeholder="Paste your CV content here...

For PDF files: Open your PDF, select all text (Ctrl+A), copy it, and paste it here.

Example format:
John Doe
Software Engineer
Email: john@example.com | Phone: (555) 123-4567

PROFESSIONAL SUMMARY
[Your summary here...]

EXPERIENCE
[Your work experience...]

SKILLS
[Your skills...]

EDUCATION
[Your education...]"
                value={manualCvContent}
                onChange={(e) => setManualCvContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="mt-2 text-sm text-gray-500">
                {manualCvContent.length} characters
              </div>
            </div>
            <Button 
              onClick={createFromManualInput}
              disabled={!manualCvName.trim() || !manualCvContent.trim() || manualCvContent.trim().length < 50}
            >
              <Plus className="mr-2" size={16} />
              Create CV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CV Library */}
      <Card>
        <CardHeader>
          <CardTitle>{t.applicationMaterials.cv.library}</CardTitle>
          <CardDescription>
            {t.applicationMaterials.cv.libraryDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cvList.map((cv) => (
              <div key={cv.id}>
                {editingCv === cv.id ? (
                  /* Edit Mode */
                  <div className="border rounded-lg p-6 bg-blue-50">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">CV Name</label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Enter CV name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Content</label>
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[300px] font-mono text-sm"
                          placeholder="Paste or edit your CV content here..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={saveEdit}>
                          <Save className="mr-2" size={16} />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={cancelEdit}>
                          <X className="mr-2" size={16} />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="text-gray-400 mt-1" size={20} />
                        <div className="flex-1">
                          <h4 className="font-medium">{cv.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>Version {cv.version}</span>
                            <span>•</span>
                            <span>{cv.size}</span>
                            <span>•</span>
                            <span>Modified: {cv.lastModified}</span>
                          </div>
                          {cv.targetJob && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                Targeted: {cv.targetJob}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {cv.score && (
                          <div className="text-right mr-4">
                            <div className="flex items-center gap-1">
                              {cv.score >= 80 ? (
                                <CheckCircle className="text-green-500" size={16} />
                              ) : (
                                <AlertCircle className="text-yellow-500" size={16} />
                              )}
                              <span className="font-medium">{cv.score}/100</span>
                            </div>
                            <span className="text-xs text-gray-500">{t.applicationMaterials.cv.atsScore}</span>
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => analyzeCV(cv.id)}
                          disabled={isAnalyzing === cv.id}
                        >
                          {isAnalyzing === cv.id ? (
                            <>
                              <Sparkles className="animate-spin mr-1" size={14} />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Eye className="mr-1" size={14} />
                              {t.applicationMaterials.cv.analyze}
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => startEdit(cv.id)}>
                          <Edit className="mr-1" size={14} />
                          {t.applicationMaterials.cv.edit}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadCV(cv)}>
                          <Download className="mr-1" size={14} />
                          {t.applicationMaterials.cv.download}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteCV(cv.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Analysis Results */}
                    {analysisResults[cv.id] && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart3 className="text-blue-500" size={16} />
                          <h5 className="font-medium">Analysis Results</h5>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Overall Score</span>
                              <span className="font-bold">{analysisResults[cv.id].score}/100</span>
                            </div>
                            <Progress value={analysisResults[cv.id].score} className="h-2" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">ATS Compatibility</span>
                              <span className="font-bold">{analysisResults[cv.id].atsCompatibility}/100</span>
                            </div>
                            <Progress value={analysisResults[cv.id].atsCompatibility} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 mt-4">
                          <div>
                            <h6 className="font-medium text-green-700 mb-2">✅ Strengths</h6>
                            <ul className="text-sm space-y-1">
                              {analysisResults[cv.id].strengths.map((strength, index) => (
                                <li key={index} className="text-green-600">• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-orange-700 mb-2">🎯 Improvements</h6>
                            <ul className="text-sm space-y-1">
                              {analysisResults[cv.id].improvements.map((improvement, index) => (
                                <li key={index} className="text-orange-600">• {improvement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {analysisResults[cv.id].missingKeywords.length > 0 && (
                          <div className="mt-4">
                            <h6 className="font-medium text-blue-700 mb-2">🔑 Missing Keywords</h6>
                            <div className="flex flex-wrap gap-2">
                              {analysisResults[cv.id].missingKeywords.map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {cv.suggestions && cv.suggestions.length > 0 && !analysisResults[cv.id] && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <h5 className="font-medium text-sm text-yellow-900 mb-1">
                          {t.applicationMaterials.cv.suggestions}:
                        </h5>
                        <ul className="space-y-1">
                          {cv.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-yellow-800 flex items-start gap-1">
                              <span>•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {cvList.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t.applicationMaterials.cv.noCV}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t.applicationMaterials.cv.quickActions}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start" onClick={createFromTemplate}>
              <FileText className="mr-2" size={16} />
              {t.applicationMaterials.cv.createFromTemplate}
            </Button>
            <Button variant="outline" className="justify-start" onClick={importFromLinkedIn}>
              <Upload className="mr-2" size={16} />
              {t.applicationMaterials.cv.importLinkedIn}
            </Button>
            <Button variant="outline" className="justify-start" onClick={exportAllCVs}>
              <Download className="mr-2" size={16} />
              {t.applicationMaterials.cv.exportAll}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}