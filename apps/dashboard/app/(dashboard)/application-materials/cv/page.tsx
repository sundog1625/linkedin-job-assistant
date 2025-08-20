'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  AlertCircle
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
}

export default function CVPage() {
  const { t } = useI18n()
  const [cvList, setCvList] = useState<CV[]>([
    {
      id: '1',
      name: 'Master Resume - Software Engineer',
      version: '2.3',
      lastModified: '2024-01-15',
      size: '245 KB',
      type: 'master',
      score: 85,
      suggestions: [
        'Add more quantifiable achievements',
        'Update skills section with latest technologies'
      ]
    },
    {
      id: '2',
      name: 'Frontend Developer - Tech Corp',
      version: '1.0',
      lastModified: '2024-01-18',
      size: '198 KB',
      type: 'targeted',
      targetJob: 'Frontend Developer at Tech Corp',
      score: 92
    }
  ])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const newCV: CV = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        version: '1.0',
        lastModified: new Date().toISOString().split('T')[0],
        size: `${Math.round(file.size / 1024)} KB`,
        type: 'master'
      }
      setCvList([...cvList, newCV])
      toast({
        title: 'CV uploaded successfully',
        description: `${file.name} has been added to your CV library`
      })
    }
  }

  const analyzeCV = (cvId: string) => {
    toast({
      title: 'Analyzing CV...',
      description: 'AI analysis will be ready in a moment'
    })
    // In production, this would call an API
  }

  const deleteCV = (cvId: string) => {
    setCvList(cvList.filter(cv => cv.id !== cvId))
    toast({
      title: 'CV deleted',
      description: 'The CV has been removed from your library'
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">CV/Resume Management</h1>
        <p className="text-muted-foreground mt-2">
          Store, manage, and optimize your CV/Resume documents
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CV/Resume</CardTitle>
          <CardDescription>
            Upload your CV in PDF, DOC, or DOCX format for analysis and optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-4">
              Drag and drop your CV here, or click to browse
            </p>
            <label htmlFor="cv-upload">
              <Input
                id="cv-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button as="span" className="cursor-pointer">
                <Plus className="mr-2" size={16} />
                Select File
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* CV Library */}
      <Card>
        <CardHeader>
          <CardTitle>Your CV Library</CardTitle>
          <CardDescription>
            Manage your CV versions and targeted resumes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cvList.map((cv) => (
              <div key={cv.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="text-gray-400 mt-1" size={20} />
                    <div>
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
                        <span className="text-xs text-gray-500">ATS Score</span>
                      </div>
                    )}
                    <Button size="sm" variant="outline" onClick={() => analyzeCV(cv.id)}>
                      <Eye className="mr-1" size={14} />
                      Analyze
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="mr-1" size={14} />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="mr-1" size={14} />
                      Download
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
                
                {cv.suggestions && cv.suggestions.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <h5 className="font-medium text-sm text-yellow-900 mb-1">
                      Improvement Suggestions:
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
            ))}
            
            {cvList.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No CVs uploaded yet. Upload your first CV to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <FileText className="mr-2" size={16} />
              Create New CV from Template
            </Button>
            <Button variant="outline" className="justify-start">
              <Upload className="mr-2" size={16} />
              Import from LinkedIn
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="mr-2" size={16} />
              Export All CVs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}