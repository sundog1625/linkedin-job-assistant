import { NextRequest, NextResponse } from 'next/server'

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
    const { resumeData, template = 'modern' } = await request.json()

    if (!resumeData) {
      return NextResponse.json({
        success: false,
        error: '缺少简历数据'
      }, { status: 400, headers: corsHeaders })
    }

    console.log('收到简历数据')

    // 生成HTML版本的简历，用于PDF转换
    const generateHTML = (data: any, templateType: string) => {
      // 确保数据完整性
      const safeData = {
        personalInfo: {
          name: data.personalInfo?.name || 'Your Name',
          title: data.personalInfo?.title || 'Professional Title',
          email: data.personalInfo?.email || '',
          phone: data.personalInfo?.phone || '',
          location: data.personalInfo?.location || '',
          linkedin: data.personalInfo?.linkedin || '',
          website: data.personalInfo?.website || ''
        },
        summary: data.summary || 'Professional summary will be displayed here.',
        skills: {
          technical: Array.isArray(data.skills?.technical) ? data.skills.technical : [],
          soft: Array.isArray(data.skills?.soft) ? data.skills.soft : [],
          languages: Array.isArray(data.skills?.languages) ? data.skills.languages : []
        },
        experience: Array.isArray(data.experience) ? data.experience : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        education: Array.isArray(data.education) ? data.education : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
        keyStrengths: Array.isArray(data.keyStrengths) ? data.keyStrengths : [],
        coverLetter: data.coverLetter || ''
      }

      const styles = {
        modern: {
          primary: '#2980b9',
          secondary: '#34495e',
          accent: '#e74c3c',
          bg: '#ffffff'
        },
        classic: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          accent: '#2980b9',
          bg: '#ffffff'
        },
        creative: {
          primary: '#9b59b6',
          secondary: '#3498db',
          accent: '#e67e22',
          bg: '#ffffff'
        }
      }

      const currentStyle = styles[templateType as keyof typeof styles] || styles.modern

      return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${safeData.personalInfo.name}</title>
    <style>
        @page {
            margin: 0.5in;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: "Arial", "Helvetica", "PingFang SC", "Microsoft YaHei", sans-serif;
            line-height: 1.6;
            color: #333;
            background: ${currentStyle.bg};
            font-size: 12px;
        }
        
        .container {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid ${currentStyle.primary};
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        
        .name {
            font-size: 28px;
            font-weight: bold;
            color: ${currentStyle.primary};
            margin-bottom: 8px;
        }
        
        .title {
            font-size: 16px;
            color: ${currentStyle.secondary};
            margin-bottom: 12px;
        }
        
        .contact {
            font-size: 11px;
            color: #666;
        }
        
        .section {
            margin-bottom: 20px;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: ${currentStyle.primary};
            border-bottom: 1px solid ${currentStyle.primary};
            padding-bottom: 4px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .summary {
            text-align: justify;
            line-height: 1.5;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .skill-category {
            margin-bottom: 10px;
        }
        
        .skill-category h4 {
            font-weight: bold;
            color: ${currentStyle.secondary};
            margin-bottom: 4px;
            font-size: 12px;
        }
        
        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }
        
        .skill-tag {
            background: ${currentStyle.primary};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            display: inline-block;
        }
        
        .experience-item {
            margin-bottom: 15px;
            border-left: 3px solid ${currentStyle.accent};
            padding-left: 15px;
        }
        
        .job-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        
        .job-title {
            font-weight: bold;
            font-size: 13px;
            color: ${currentStyle.primary};
        }
        
        .company {
            color: ${currentStyle.secondary};
            font-size: 12px;
        }
        
        .duration {
            font-size: 11px;
            color: #666;
            background: #f8f9fa;
            padding: 2px 8px;
            border-radius: 4px;
        }
        
        .achievements {
            list-style-type: none;
            margin: 8px 0;
        }
        
        .achievements li {
            position: relative;
            padding-left: 15px;
            margin-bottom: 4px;
        }
        
        .achievements li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: ${currentStyle.accent};
            font-weight: bold;
        }
        
        .technologies {
            font-size: 10px;
            color: #666;
            margin-top: 6px;
        }
        
        .project-item {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 10px;
        }
        
        .project-name {
            font-weight: bold;
            color: ${currentStyle.primary};
            margin-bottom: 6px;
        }
        
        .education-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .degree {
            font-weight: bold;
        }
        
        .school {
            color: ${currentStyle.secondary};
        }
        
        .year {
            font-size: 11px;
            color: #666;
        }
        
        .certifications ul {
            list-style-type: none;
        }
        
        .certifications li {
            position: relative;
            padding-left: 15px;
            margin-bottom: 4px;
        }
        
        .certifications li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: ${currentStyle.primary};
            font-weight: bold;
        }
        
        @media print {
            body { font-size: 11px; }
            .container { padding: 10px; }
            .section { margin-bottom: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 class="name">${safeData.personalInfo.name}</h1>
            <h2 class="title">${safeData.personalInfo.title}</h2>
            <div class="contact">
                ${[
                  safeData.personalInfo.email && `Email: ${safeData.personalInfo.email}`,
                  safeData.personalInfo.phone && `Phone: ${safeData.personalInfo.phone}`,
                  safeData.personalInfo.location && `Location: ${safeData.personalInfo.location}`,
                  safeData.personalInfo.linkedin && `LinkedIn: ${safeData.personalInfo.linkedin}`
                ].filter(Boolean).join(' | ')}
            </div>
        </div>

        <!-- Professional Summary -->
        <div class="section">
            <h3 class="section-title">Professional Summary</h3>
            <div class="summary">${safeData.summary}</div>
        </div>

        <!-- Skills -->
        <div class="section">
            <h3 class="section-title">Core Skills</h3>
            <div class="skills-grid">
                ${safeData.skills.technical.length > 0 ? `
                <div class="skill-category">
                    <h4>Technical Skills</h4>
                    <div class="skill-tags">
                        ${safeData.skills.technical.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${safeData.skills.soft.length > 0 ? `
                <div class="skill-category">
                    <h4>Soft Skills</h4>
                    <div class="skill-tags">
                        ${safeData.skills.soft.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${safeData.skills.languages.length > 0 ? `
                <div class="skill-category">
                    <h4>Languages</h4>
                    <div>${safeData.skills.languages.join(', ')}</div>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- Experience -->
        ${safeData.experience.length > 0 ? `
        <div class="section">
            <h3 class="section-title">Professional Experience</h3>
            ${safeData.experience.map(exp => `
            <div class="experience-item">
                <div class="job-header">
                    <div>
                        <div class="job-title">${exp.title || 'Position Title'}</div>
                        <div class="company">${exp.company || 'Company Name'}</div>
                    </div>
                    <div class="duration">${exp.duration || 'Duration'}</div>
                </div>
                ${Array.isArray(exp.achievements) && exp.achievements.length > 0 ? `
                <ul class="achievements">
                    ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                </ul>
                ` : ''}
                ${Array.isArray(exp.technologies) && exp.technologies.length > 0 ? `
                <div class="technologies">Technologies: ${exp.technologies.join(', ')}</div>
                ` : ''}
            </div>
            `).join('')}
        </div>
        ` : ''}

        <!-- Projects -->
        ${safeData.projects.length > 0 ? `
        <div class="section">
            <h3 class="section-title">Key Projects</h3>
            ${safeData.projects.map(project => `
            <div class="project-item">
                <div class="project-name">${project.name || 'Project Name'}</div>
                <div>${project.description || 'Project description'}</div>
                ${Array.isArray(project.achievements) && project.achievements.length > 0 ? `
                <ul class="achievements">
                    ${project.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                </ul>
                ` : ''}
                ${Array.isArray(project.technologies) && project.technologies.length > 0 ? `
                <div class="technologies">Tech Stack: ${project.technologies.join(', ')}</div>
                ` : ''}
            </div>
            `).join('')}
        </div>
        ` : ''}

        <!-- Education -->
        ${safeData.education.length > 0 ? `
        <div class="section">
            <h3 class="section-title">Education</h3>
            ${safeData.education.map(edu => `
            <div class="education-item">
                <div>
                    <div class="degree">${edu.degree || 'Degree'}</div>
                    <div class="school">${edu.school || 'School'}</div>
                </div>
                <div class="year">${edu.year || 'Year'}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
            </div>
            `).join('')}
        </div>
        ` : ''}

        <!-- Certifications -->
        ${safeData.certifications.length > 0 ? `
        <div class="section certifications">
            <h3 class="section-title">Certifications</h3>
            <ul>
                ${safeData.certifications.map(cert => `<li>${cert}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>
</body>
</html>
      `
    }

    const htmlContent = generateHTML(resumeData, template)
    
    return NextResponse.json({
      success: true,
      htmlContent: htmlContent,
      filename: `resume_${resumeData.personalInfo?.name || 'targeted'}_${Date.now()}.html`
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('PDF生成失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'PDF生成失败，请重试'
    }, { status: 500, headers: corsHeaders })
  }
}