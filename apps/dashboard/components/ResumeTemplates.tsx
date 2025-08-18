'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ResumeData {
  personalInfo: {
    name: string
    title: string
    email?: string
    phone?: string
    location: string
    linkedin?: string
    website?: string
  }
  summary: string
  skills: {
    technical: string[]
    soft: string[]
    languages: string[]
  }
  experience: Array<{
    title: string
    company: string
    duration: string
    achievements: string[]
    technologies: string[]
  }>
  projects: Array<{
    name: string
    description: string
    technologies: string[]
    achievements: string[]
  }>
  education: Array<{
    degree: string
    school: string
    year: string
    gpa?: string
  }>
  certifications: string[]
  keyStrengths: string[]
  coverLetter: string
}

interface ResumeTemplateProps {
  resumeData: ResumeData
  template?: 'modern' | 'classic' | 'creative'
}

const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  // 确保数据安全性，防止undefined错误
  const safeData = {
    personalInfo: {
      name: data?.personalInfo?.name || 'Your Name',
      title: data?.personalInfo?.title || 'Professional Title',
      email: data?.personalInfo?.email || '',
      phone: data?.personalInfo?.phone || '',
      location: data?.personalInfo?.location || '',
      linkedin: data?.personalInfo?.linkedin || '',
      website: data?.personalInfo?.website || ''
    },
    summary: data?.summary || 'Professional summary will be displayed here.',
    skills: {
      technical: Array.isArray(data?.skills?.technical) ? data.skills.technical : [],
      soft: Array.isArray(data?.skills?.soft) ? data.skills.soft : [],
      languages: Array.isArray(data?.skills?.languages) ? data.skills.languages : []
    },
    experience: Array.isArray(data?.experience) ? data.experience : [],
    projects: Array.isArray(data?.projects) ? data.projects : [],
    education: Array.isArray(data?.education) ? data.education : [],
    certifications: Array.isArray(data?.certifications) ? data.certifications : [],
    keyStrengths: Array.isArray(data?.keyStrengths) ? data.keyStrengths : [],
    coverLetter: data?.coverLetter || ''
  }

  return (
  <div className="max-w-4xl mx-auto bg-white p-8 font-sans" id="resume-template">
    {/* Header */}
    <div className="border-b-4 border-blue-600 pb-6 mb-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">{safeData.personalInfo.name}</h1>
      <h2 className="text-xl text-blue-600 mb-4">{safeData.personalInfo.title}</h2>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        {safeData.personalInfo.email && <span>Email: {safeData.personalInfo.email}</span>}
        {safeData.personalInfo.phone && <span>Phone: {safeData.personalInfo.phone}</span>}
        {safeData.personalInfo.location && <span>Location: {safeData.personalInfo.location}</span>}
        {safeData.personalInfo.linkedin && <span>LinkedIn: {safeData.personalInfo.linkedin}</span>}
      </div>
    </div>

    {/* Professional Summary */}
    <section className="mb-6">
      <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase tracking-wider">Professional Summary</h3>
      <p className="text-gray-700 leading-relaxed">{safeData.summary}</p>
    </section>

    {/* Core Skills */}
    <section className="mb-6">
      <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase tracking-wider">Core Skills</h3>
      <div className="space-y-3">
        {safeData.skills.technical.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Technical Skills</h4>
            <div className="flex flex-wrap gap-2">
              {safeData.skills.technical.map((skill, index) => (
                <Badge key={index} variant="default" className="bg-blue-100 text-blue-800">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {safeData.skills.soft.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Soft Skills</h4>
            <div className="flex flex-wrap gap-2">
              {safeData.skills.soft.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {safeData.skills.languages.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Languages</h4>
            <p className="text-gray-700">{safeData.skills.languages.join(', ')}</p>
          </div>
        )}
      </div>
    </section>

    {/* Professional Experience */}
    {safeData.experience.length > 0 && (
      <section className="mb-6">
        <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase tracking-wider">Professional Experience</h3>
        <div className="space-y-4">
          {safeData.experience.map((exp, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-800">{exp.title}</h4>
                  <p className="text-blue-600 font-medium">{exp.company}</p>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{exp.duration}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {exp.achievements.map((achievement, achIndex) => (
                  <li key={achIndex}>{achievement}</li>
                ))}
              </ul>
              {exp.technologies.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-600">Technologies: </span>
                  <span className="text-sm text-gray-600">{exp.technologies.join(', ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Key Projects */}
    {safeData.projects.length > 0 && (
      <section className="mb-6">
        <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase tracking-wider">Key Projects</h3>
        <div className="space-y-4">
          {safeData.projects.map((project, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">{project.name}</h4>
              <p className="text-gray-700 mb-2">{project.description}</p>
              {project.achievements.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-gray-700 mb-2">
                  {project.achievements.map((achievement, achIndex) => (
                    <li key={achIndex}>{achievement}</li>
                  ))}
                </ul>
              )}
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Education */}
    {safeData.education.length > 0 && (
      <section className="mb-6">
        <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase tracking-wider">Education</h3>
        <div className="space-y-2">
          {safeData.education.map((edu, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-gray-800">{edu.degree}</h4>
                <p className="text-gray-600">{edu.school}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>{edu.year}</p>
                {edu.gpa && <p>GPA: {edu.gpa}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Certifications */}
    {safeData.certifications.length > 0 && (
      <section className="mb-6">
        <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase tracking-wider">Certifications</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {safeData.certifications.map((cert, index) => (
            <li key={index}>{cert}</li>
          ))}
        </ul>
      </section>
    )}
  </div>
  )
}

const ClassicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="max-w-4xl mx-auto bg-white p-8 font-serif" id="resume-template">
    {/* Header */}
    <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{data.personalInfo.name}</h1>
      <h2 className="text-lg text-gray-600 mb-4">{data.personalInfo.title}</h2>
      <div className="text-sm text-gray-600">
        {[data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location]
          .filter(Boolean)
          .join(' | ')}
      </div>
    </div>

    {/* Summary */}
    <section className="mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">SUMMARY</h3>
      <p className="text-gray-700 leading-relaxed text-justify">{data.summary}</p>
    </section>

    {/* Experience */}
    {data.experience.length > 0 && (
      <section className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">EXPERIENCE</h3>
        <div className="space-y-4">
          {safeData.experience.map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-bold text-gray-800">{exp.title} - {exp.company}</h4>
                <span className="text-sm text-gray-600">{exp.duration}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                {exp.achievements.map((achievement, achIndex) => (
                  <li key={achIndex}>{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Skills */}
    <section className="mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">SKILLS</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Technical</h4>
          <p className="text-gray-700 text-sm">{data.skills.technical.join(', ')}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Languages</h4>
          <p className="text-gray-700 text-sm">{data.skills.languages.join(', ')}</p>
        </div>
      </div>
    </section>

    {/* Education */}
    {safeData.education.length > 0 && (
      <section className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">EDUCATION</h3>
        {data.education.map((edu, index) => (
          <div key={index} className="flex justify-between items-baseline">
            <div>
              <h4 className="font-semibold text-gray-800">{edu.degree}</h4>
              <p className="text-gray-600">{edu.school}</p>
            </div>
            <span className="text-sm text-gray-600">{edu.year}</span>
          </div>
        ))}
      </section>
    )}
  </div>
)

const CreativeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="max-w-4xl mx-auto bg-white p-8 font-sans" id="resume-template">
    <div className="grid grid-cols-3 gap-6">
      {/* Left Sidebar */}
      <div className="col-span-1 bg-purple-900 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">{data.personalInfo.name}</h1>
        <h2 className="text-purple-200 mb-6">{data.personalInfo.title}</h2>
        
        {/* Contact */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 text-purple-200">CONTACT</h3>
          <div className="space-y-2 text-sm">
            {data.personalInfo.email && <p>Email: {data.personalInfo.email}</p>}
            {data.personalInfo.phone && <p>Phone: {data.personalInfo.phone}</p>}
            {data.personalInfo.location && <p>Location: {data.personalInfo.location}</p>}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 text-purple-200">SKILLS</h3>
          <div className="space-y-4">
            {data.skills.technical.length > 0 && (
              <div>
                <h4 className="font-semibold text-purple-200 text-sm mb-2">TECHNICAL</h4>
                <div className="space-y-1">
                  {data.skills.technical.slice(0, 8).map((skill, index) => (
                    <div key={index} className="text-xs">{skill}</div>
                  ))}
                </div>
              </div>
            )}
            {data.skills.languages.length > 0 && (
              <div>
                <h4 className="font-semibold text-purple-200 text-sm mb-2">LANGUAGES</h4>
                <div className="space-y-1">
                  {data.skills.languages.map((lang, index) => (
                    <div key={index} className="text-xs">{lang}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Education */}
        {safeData.education.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3 text-purple-200">EDUCATION</h3>
            {safeData.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <h4 className="font-semibold text-sm">{edu.degree}</h4>
                <p className="text-xs text-purple-200">{edu.school}</p>
                <p className="text-xs text-purple-300">{edu.year}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="col-span-2">
        {/* Summary */}
        <section className="mb-6">
          <h3 className="text-xl font-bold text-purple-900 mb-3">PROFESSIONAL SUMMARY</h3>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </section>

        {/* Experience */}
        {data.experience.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xl font-bold text-purple-900 mb-3">EXPERIENCE</h3>
            <div className="space-y-4">
              {safeData.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-800">{exp.title}</h4>
                      <p className="text-purple-600 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-500 bg-purple-100 px-2 py-1 rounded">{exp.duration}</span>
                  </div>
                  <ul className="list-none space-y-1 text-gray-700">
                    {exp.achievements.map((achievement, achIndex) => (
                      <li key={achIndex} className="flex items-start">
                        <span className="text-purple-500 mr-2">▸</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {safeData.projects.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-purple-900 mb-3">KEY PROJECTS</h3>
            <div className="space-y-3">
              {safeData.projects.map((project, index) => (
                <div key={index} className="border-l-4 border-purple-300 pl-4">
                  <h4 className="font-bold text-gray-800 mb-1">{project.name}</h4>
                  <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  </div>
)

const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ resumeData, template = 'modern' }) => {
  const templates = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
    creative: CreativeTemplate
  }

  const TemplateComponent = templates[template]

  return <TemplateComponent data={resumeData} />
}

export { ResumeTemplate, type ResumeData }