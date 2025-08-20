// English translations
export const en = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    close: 'Close',
    copy: 'Copy',
    download: 'Download',
    upload: 'Upload',
    search: 'Search',
    filter: 'Filter',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    confirm: 'Confirm',
    retry: 'Retry'
  },
  navigation: {
    dashboard: 'Dashboard',
    jobs: 'Job Tracker',
    resume: 'Resume Builder',
    profile: 'Profile Settings',
    aiTools: 'AI Tools',
    applicationMaterials: 'Application Materials',
    cv: 'CV',
    coverLetters: 'Cover Letters',
    linkedinProfile: 'LinkedIn Profile'
  },
  dashboard: {
    title: 'AI-Powered LinkedIn Job Assistant',
    subtitle: 'Streamline your job search with intelligent resume optimization and job tracking',
    welcome: 'Welcome to your LinkedIn Job Assistant dashboard',
    stats: {
      jobsTracked: 'Jobs Tracked',
      applications: 'Applications',
      interviews: 'Interviews',
      offers: 'Offers'
    },
    recentActivity: 'Recent Activity',
    noActivity: 'No recent activity. Start by browsing LinkedIn jobs!',
    features: {
      jobTracking: {
        title: 'Smart Job Tracking',
        description: 'Track job applications across different stages with intuitive drag-and-drop interface'
      },
      resumeBuilder: {
        title: 'AI Resume Builder',
        description: 'Generate targeted resumes optimized for specific job positions using AI analysis'
      },
      profileSettings: {
        title: 'Profile Management',
        description: 'Manage your professional profile and preferences for personalized job matching'
      },
      aiTools: {
        title: 'AI-Powered Tools',
        description: 'Access advanced AI tools for resume analysis, job matching, and career insights'
      }
    }
  },
  jobs: {
    title: 'Job Tracker',
    subtitle: 'Manage and track your job applications - drag job cards to different status columns to update status',
    columns: {
      saved: 'Saved',
      applied: 'Applied',
      interviewing: 'Interviewing',
      offer: 'Got Offer',
      rejected: 'Rejected'
    },
    actions: {
      generateResume: 'Generate Targeted Resume',
      viewOriginal: 'View Original Job',
      deleteJob: 'Delete Job',
      exportCsv: 'Export CSV',
      importExcel: 'Import Excel'
    },
    search: 'Search jobs or companies...',
    noJobs: {
      title: 'No Jobs Yet',
      description: 'Jobs saved using the Chrome extension while browsing LinkedIn will appear here',
      action: 'Install Chrome Extension'
    },
    dragTip: {
      title: 'Generate Targeted Resume',
      description: 'Click the 🎯 button on any job card below to generate a customized resume for that position.'
    },
    statusUpdated: 'Status Updated',
    statusChangedTo: 'Job status changed to: {status}',
    updateFailed: 'Update failed',
    exportSuccess: 'Export successful',
    exportDescription: 'Job data exported as CSV file',
    exportFailed: 'Export failed',
    exportError: 'Unable to export data, please try again',
    deleteSuccess: 'Delete successful',
    deleteDescription: 'Job removed from list',
    deleteFailed: 'Delete failed',
    dragHover: 'Release to move to this status',
    applicants: 'applicants',
    matchScore: 'Match: {score}%'
  },
  resume: {
    title: 'AI Resume Builder',
    subtitle: 'Create professional resumes with AI-powered optimization',
    generateTargeted: 'Generate Targeted Resume',
    jumpToJobs: 'Jump to Jobs Page',
    tipTitle: 'How to Use',
    tipDescription: 'Set up your profile here, then visit the Jobs page to generate targeted resumes for specific positions.',
    
    // Setup mode
    setupTitle: 'Smart Resume Setup',
    setupDescription: 'Upload resume content, AI automatically extracts key information',
    uploadTitle: 'Upload Your Resume',
    uploadDescription: 'Support text format or copy-paste resume content, AI will automatically analyze and extract key information',
    contentLabel: 'Resume Content',
    contentPlaceholder: 'Please paste your resume content, or directly input personal information:\n\n• Basic info (name, contact)\n• Work experience and achievements\n• Skills and expertise\n• Education background\n• Project experience\n• Language abilities, etc.',
    languageLabel: 'Analysis Language:',
    aiAnalyze: 'AI Analyze Resume',
    aiAnalyzing: 'AI is analyzing...',
    manualFill: 'Manual Fill',
    
    // Analysis results
    analysisTitle: 'AI Analysis Results',
    analysisDescription: 'Please check and confirm if the AI extracted information is accurate',
    
    // Form fields
    form: {
      skills: 'Core Skills',
      skillsPlaceholder: 'e.g: React, JavaScript, Python',
      experience: 'Work Experience',
      experiencePlaceholder: 'Describe your work experience',
      education: 'Education',
      educationPlaceholder: 'e.g: Computer Science Bachelor, Peking University',
      location: 'Expected Location',
      locationPlaceholder: 'e.g: Beijing, Shanghai, Remote Work',
      preferredRoles: 'Preferred Positions',
      rolesPlaceholder: 'e.g: Frontend Engineer, Full Stack Developer',
      languages: 'Language Skills',
      languagesPlaceholder: 'e.g: Chinese (Native), English (Fluent)'
    },
    
    // Actions
    finishEdit: 'Finish Edit',
    saveProfile: 'Save Profile',
    edit: 'Edit',
    reAnalyze: 'Re-analyze',
    generateTargetedResume: 'Generate Targeted Resume',
    createProfile: 'Create Resume Profile',
    
    // Messages
    profileLoaded: 'Profile Loaded',
    profileLoadedFromDb: 'Successfully loaded your resume profile',
    profileLoadedFromLocal: 'Loaded your resume profile from local storage',
    resumeInsufficient: 'Insufficient resume content',
    resumeInsufficientDesc: 'Please enter more complete resume content (at least 50 characters)',
    analysisComplete: 'Analysis Complete',
    analysisCompleteDesc: 'AI has successfully analyzed your resume content',
    analysisFailed: 'Analysis Failed',
    analysisFailedDesc: 'Analysis failed, please retry',
    analysisTryAgain: 'Please try again',
    savedToLocal: 'Saved to Local',
    savedToLocalDesc: 'Saved to local storage, cloud save failed',
    
    // Normal page
    managerTitle: 'Resume Manager',
    managerSubtitle: 'Manage your resume profile and job information',
    yourProfile: 'Your Resume Profile',
    profileDescription: 'Your resume information has been saved, LinkedIn Job Assistant will use this information for job matching',
    completeEdit: 'Complete',
    noProfile: 'No Resume Profile Yet',
    noProfileDesc: 'Create your resume profile and let AI help you match the most suitable positions',
    
    saved: 'Profile saved successfully',
    savedDescription: 'Your information has been updated successfully',
    saveFailed: 'Save failed'
  },
  targetedResume: {
    title: 'Targeted Resume',
    subtitle: 'AI-generated personalized resume content',
    generating: 'Generating targeted resume content...',
    generatingSubtitle: 'This may take 10-20 seconds',
    failed: 'Generation failed, please try again',
    actions: {
      copyToClipboard: 'Copy to Clipboard',
      preview: 'Resume Preview',
      generatePdf: 'Generate PDF',
      onlineTemplates: 'Online Templates'
    },
    copied: 'Copied to clipboard',
    copiedDescription: 'Resume content copied, you can paste it anywhere',
    pdfSuccess: 'PDF generated successfully',
    pdfDescription: 'Resume opened in new window, you can save as PDF',
    pdfFailed: 'PDF generation failed',
    pdfError: 'Please try again or use print function',
    templateLabel: 'PDF Template:',
    templates: {
      modern: 'Modern Style',
      classic: 'Classic Style',
      creative: 'Creative Style'
    },
    preview: {
      title: 'Resume Preview - {template}',
      description: 'Preview your targeted resume, can be printed or saved as PDF directly',
      print: 'Print'
    }
  },
  onlineTemplates: {
    title: 'Free Online Resume Templates',
    description: 'Selected high-quality free resume templates, you can use our generated content to fill these professional templates',
    guide: {
      title: 'Usage Guide',
      step1: '1. Choose a template suitable for your industry',
      step2: '2. Visit the template website or GitHub',
      step3: '3. Copy our generated resume content',
      step4: '4. Fill content according to template format',
      step5: '5. Generate professional PDF resume',
      tip: '💡 Tech positions recommended GitHub style'
    },
    categories: {
      tech: '💻 Technical Templates',
      online: '🛠️ Online Creation Tools',
      academic: '🎓 Academic/Professional Templates'
    },
    actions: {
      visit: 'Visit',
      preview: 'Preview',
      useNow: 'Use Now',
      getTemplate: 'Get Template',
      copyContent: 'Copy Resume Content'
    },
    features: {
      opensource: 'Open Source',
      free: 'Free',
      responsive: 'Responsive',
      github: 'GitHub',
      latex: 'LaTeX',
      modern: 'Modern',
      professional: 'Professional',
      ats: 'ATS Friendly'
    },
    contentCopied: 'Content copied',
    contentCopiedDescription: 'Resume content copied to clipboard, you can paste it into your selected template'
  },
  profile: {
    title: 'Profile Settings',
    subtitle: 'Manage your professional information for personalized job recommendations',
    form: {
      basicInfo: 'Basic Information',
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      linkedin: 'LinkedIn Profile',
      website: 'Personal Website',
      professionalInfo: 'Professional Information',
      skills: 'Skills',
      experience: 'Experience Level',
      education: 'Education',
      preferredRoles: 'Preferred Job Roles',
      languages: 'Languages',
      preferences: 'Job Preferences',
      preferredLocations: 'Preferred Locations',
      remoteWork: 'Remote Work Preference',
      salaryExpectation: 'Salary Expectation'
    },
    experienceLevels: {
      entry: 'Entry Level (0-2 years)',
      mid: 'Mid Level (3-5 years)',
      senior: 'Senior Level (6-10 years)',
      expert: 'Expert Level (10+ years)'
    },
    remoteOptions: {
      onsite: 'On-site Only',
      remote: 'Remote Only',
      hybrid: 'Hybrid',
      any: 'Any'
    },
    saved: 'Profile saved successfully',
    saveFailed: 'Failed to save profile'
  },
  aiTools: {
    title: 'AI-Powered Career Tools',
    subtitle: 'Advanced AI tools to boost your job search success',
    resumeAnalysis: {
      title: 'Resume Analysis',
      description: 'Get AI-powered insights to improve your resume\'s effectiveness',
      action: 'Analyze Resume'
    },
    jobMatching: {
      title: 'Job Matching',
      description: 'Find jobs that best match your skills and experience',
      action: 'Find Matches'
    },
    interviewPrep: {
      title: 'Interview Preparation',
      description: 'Practice interviews with AI and get personalized feedback',
      action: 'Start Practice'
    },
    salaryInsights: {
      title: 'Salary Insights',
      description: 'Get market salary data for your role and location',
      action: 'Check Salary'
    }
  },
  language: {
    title: 'Language',
    select: 'Select Language'
  },
  applicationMaterials: {
    title: 'Application Materials',
    subtitle: 'Manage all your job application materials in one place',
    cv: {
      title: 'CV/Resume Management',
      subtitle: 'Store, manage, and optimize your CV/Resume documents',
      upload: 'Upload CV/Resume',
      uploadDesc: 'Upload your CV in PDF, DOC, or DOCX format for analysis and optimization',
      library: 'Your CV Library',
      libraryDesc: 'Manage your CV versions and targeted resumes',
      atsScore: 'ATS Score',
      analyze: 'Analyze',
      edit: 'Edit',
      download: 'Download',
      delete: 'Delete',
      suggestions: 'Improvement Suggestions',
      quickActions: 'Quick Actions',
      createFromTemplate: 'Create New CV from Template',
      importLinkedIn: 'Import from LinkedIn',
      exportAll: 'Export All CVs',
      noCV: 'No CVs uploaded yet. Upload your first CV to get started.'
    },
    coverLetters: {
      title: 'Cover Letters',
      subtitle: 'Generate targeted cover letters for your job applications',
      selectJob: 'Select Target Job',
      selectJobDesc: 'Choose a job from your tracker to generate a targeted cover letter',
      additionalReq: 'Additional Requirements (Optional)',
      generate: 'Generate Cover Letter',
      generating: 'Generating...',
      generated: 'Generated Cover Letter',
      generatedDesc: 'AI-generated cover letter tailored for your selected position',
      copyClipboard: 'Copy to Clipboard',
      saveTemplate: 'Save as Template',
      saved: 'Saved Cover Letters',
      savedDesc: 'Your previously generated cover letters',
      view: 'View',
      created: 'Created'
    },
    linkedinProfile: {
      title: 'LinkedIn Profile Analyzer',
      subtitle: 'Optimize your LinkedIn profile to attract more opportunities',
      analyzeProfile: 'Analyze Your Profile',
      analyzeDesc: 'Enter your LinkedIn profile URL or upload your profile data',
      analyzing: 'Analyzing...',
      uploadData: 'Upload Profile Data',
      profileScore: 'Profile Score',
      scoreDesc: 'Your LinkedIn profile optimization score',
      excellent: 'Excellent! Your profile is well-optimized.',
      good: 'Good progress! A few improvements will make your profile stand out.',
      needsWork: 'Your profile needs attention. Follow the suggestions below to improve.',
      currentStatus: 'Current Status:',
      suggestions: 'Suggestions:',
      aiRecommendation: 'AI Recommendation:',
      applyAI: 'Apply AI Suggestions',
      optimized: 'Optimized',
      canImprove: 'Can Improve',
      needsAttention: 'Needs Attention',
      points: 'points'
    }
  }
}