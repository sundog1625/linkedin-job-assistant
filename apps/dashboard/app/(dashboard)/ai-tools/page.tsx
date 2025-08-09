'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Mail, 
  MessageSquare, 
  FileText, 
  Share2, 
  Copy,
  Download,
  Sparkles,
  Target,
  Users,
  Briefcase
} from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface AITool {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ size?: number }>
  category: string
  inputPlaceholder: string
  outputExample: string
}

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState('email')
  const [inputs, setInputs] = useState<{ [key: string]: string }>({})
  const [outputs, setOutputs] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})

  const aiTools: AITool[] = [
    {
      id: 'follow-up-email',
      name: 'Follow-up Email',
      description: 'Generate professional follow-up emails after job applications or interviews',
      icon: Mail,
      category: 'email',
      inputPlaceholder: 'Company: Google\nPosition: Software Engineer\nInterview Date: Jan 15, 2024\nInterviewer: Jane Smith',
      outputExample: 'Subject: Thank you for the Software Engineer interview\n\nDear Jane,\n\nThank you for taking the time to interview me for the Software Engineer position at Google on January 15th...'
    },
    {
      id: 'thank-you-email',
      name: 'Thank You Email',
      description: 'Create thoughtful thank you emails post-interview',
      icon: Mail,
      category: 'email',
      inputPlaceholder: 'Company: Meta\nPosition: Frontend Developer\nKey discussion points: React, performance optimization\nNext steps: Technical challenge',
      outputExample: 'Subject: Thank you for our conversation about the Frontend Developer role\n\nHi [Name],\n\nI wanted to express my gratitude for our engaging conversation about the Frontend Developer position at Meta...'
    },
    {
      id: 'networking-email',
      name: 'Networking Email',
      description: 'Craft effective networking emails to connect with industry professionals',
      icon: Users,
      category: 'email',
      inputPlaceholder: 'Recipient: Senior Developer at Amazon\nConnection: Alumni from UC Berkeley\nPurpose: Career advice and industry insights',
      outputExample: 'Subject: UC Berkeley alum seeking career insights\n\nHi [Name],\n\nI hope this message finds you well. I came across your profile and noticed we\'re both UC Berkeley alumni...'
    },
    {
      id: 'elevator-pitch',
      name: 'Elevator Pitch',
      description: 'Create a compelling 30-60 second elevator pitch',
      icon: MessageSquare,
      category: 'pitch',
      inputPlaceholder: 'Your background: 5 years software engineering\nSpecialties: Full-stack development, React, Node.js\nCareer goals: Senior engineering role at tech company',
      outputExample: 'Hi, I\'m a software engineer with 5 years of experience building scalable web applications. I specialize in full-stack development with React and Node.js...'
    },
    {
      id: 'linkedin-post',
      name: 'LinkedIn Post',
      description: 'Generate engaging LinkedIn posts to build your professional brand',
      icon: Share2,
      category: 'social',
      inputPlaceholder: 'Topic: Completed a challenging project\nDetails: Built a microservices architecture that improved performance by 40%\nTone: Professional but approachable',
      outputExample: '🚀 Just wrapped up an exciting project that I\'m proud to share!\n\nOur team successfully migrated our monolithic application to a microservices architecture...'
    },
    {
      id: 'brand-statement',
      name: 'Personal Brand Statement',
      description: 'Develop a personal brand statement for your LinkedIn summary',
      icon: Target,
      category: 'branding',
      inputPlaceholder: 'Role: Software Engineer\nExperience: 7 years\nSpecialties: Cloud architecture, DevOps, team leadership\nValue proposition: Help companies scale efficiently',
      outputExample: 'I\'m a seasoned software engineer who transforms complex technical challenges into scalable solutions...'
    }
  ]

  const generateContent = async (toolId: string) => {
    setLoading({ ...loading, [toolId]: true })
    
    // Simulate AI generation
    setTimeout(() => {
      const tool = aiTools.find(t => t.id === toolId)
      if (tool) {
        setOutputs({ ...outputs, [toolId]: tool.outputExample })
      }
      setLoading({ ...loading, [toolId]: false })
    }, 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadContent = (content: string, filename: string) => {
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const categories = [
    { id: 'email', label: 'Email Templates', icon: Mail },
    { id: 'pitch', label: 'Pitches & Presentations', icon: MessageSquare },
    { id: 'social', label: 'Social Content', icon: Share2 },
    { id: 'branding', label: 'Personal Branding', icon: Target }
  ]

  const filteredTools = aiTools.filter(tool => tool.category === activeTab)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Zap className="text-yellow-500" />
            <span>AI Tools</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate professional content with AI to enhance your job search and networking
          </p>
        </div>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Sparkles size={14} className="mr-1" />
          Powered by AI
        </Badge>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center space-x-2"
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredTools.map((tool) => {
                const Icon = tool.icon
                const isLoading = loading[tool.id]
                const output = outputs[tool.id]
                
                return (
                  <Card key={tool.id} className="h-fit">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Icon size={20} className="text-primary" />
                        <span>{tool.name}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Input */}
                      <div>
                        <label className="text-sm font-medium">Input Details</label>
                        <Textarea
                          placeholder={tool.inputPlaceholder}
                          value={inputs[tool.id] || ''}
                          onChange={(e) => setInputs({ ...inputs, [tool.id]: e.target.value })}
                          className="mt-2"
                          rows={4}
                        />
                      </div>

                      {/* Generate Button */}
                      <Button
                        onClick={() => generateContent(tool.id)}
                        disabled={isLoading || !inputs[tool.id]?.trim()}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} className="mr-2" />
                            Generate Content
                          </>
                        )}
                      </Button>

                      {/* Output */}
                      {output && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Generated Content</label>
                          <div className="relative">
                            <Textarea
                              value={output}
                              onChange={(e) => setOutputs({ ...outputs, [tool.id]: e.target.value })}
                              className="min-h-[150px]"
                              rows={6}
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(output)}
                              className="flex-1"
                            >
                              <Copy size={14} className="mr-1" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadContent(output, `${tool.id}.txt`)}
                              className="flex-1"
                            >
                              <Download size={14} className="mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Usage Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
            <Sparkles size={18} className="text-blue-600" />
            <span>Tips for Best Results</span>
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-blue-800">
                Be specific with company names, positions, and personal details
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-blue-800">
                Always review and personalize the generated content
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-blue-800">
                Include relevant context and background information
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-blue-800">
                Adjust the tone and style to match your personality
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}