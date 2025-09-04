// Chinese translations
export const zh = {
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    close: '关闭',
    copy: '复制',
    download: '下载',
    upload: '上传',
    search: '搜索',
    filter: '筛选',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    confirm: '确认',
    retry: '重试'
  },
  navigation: {
    dashboard: '仪表板',
    jobs: '职位追踪',
    resume: '简历生成器',
    profile: '个人设置',
    aiTools: 'AI工具',
    applicationMaterials: '申请材料',
    cv: '简历',
    coverLetters: '求职信',
    linkedinProfile: 'LinkedIn主页'
  },
  dashboard: {
    title: 'AI驱动的LinkedIn求职助手',
    subtitle: '通过智能简历优化和职位追踪简化您的求职过程',
    welcome: '欢迎使用您的LinkedIn求职助手仪表板',
    stats: {
      jobsTracked: '跟踪的职位',
      applications: '申请数量',
      interviews: '面试次数',
      offers: '获得Offer'
    },
    recentActivity: '最近活动',
    noActivity: '暂无最近活动。从浏览LinkedIn职位开始吧！',
    features: {
      jobTracking: {
        title: '智能职位追踪',
        description: '通过直观的拖放界面跟踪不同阶段的职位申请'
      },
      resumeBuilder: {
        title: 'AI简历生成器',
        description: '使用AI分析为特定职位生成优化的针对性简历'
      },
      profileSettings: {
        title: '档案管理',
        description: '管理您的专业档案和偏好，获得个性化的职位匹配'
      },
      aiTools: {
        title: 'AI驱动工具',
        description: '访问高级AI工具进行简历分析、职位匹配和职业洞察'
      }
    }
  },
  jobs: {
    title: '求职追踪器',
    subtitle: '管理和追踪您的求职进展 - 拖拽职位卡片到不同状态列来更新状态',
    columns: {
      saved: '已保存',
      applied: '已申请',
      interviewing: '面试中',
      offer: '获得Offer',
      rejected: '被拒绝'
    },
    actions: {
      generateResume: '生成针对性简历',
      viewOriginal: '查看原职位',
      deleteJob: '删除职位',
      exportCsv: '导出CSV',
      importExcel: '导入Excel'
    },
    search: '搜索职位或公司...',
    noJobs: {
      title: '暂无职位',
      description: '使用Chrome扩展在LinkedIn上浏览职位时，保存的职位会显示在这里',
      action: '安装Chrome扩展'
    },
    dragTip: {
      title: '生成针对性简历',
      description: '在下方任意职位卡片上点击 🎯 按钮，即可为该职位生成定制化的简历内容。'
    },
    statusUpdated: '状态已更新',
    statusChangedTo: '职位状态已更改为: {status}',
    updateFailed: '更新失败',
    exportSuccess: '导出成功',
    exportDescription: '职位数据已导出为CSV文件',
    exportFailed: '导出失败',
    exportError: '无法导出数据，请重试',
    deleteSuccess: '删除成功',
    deleteDescription: '职位已从列表中移除',
    deleteFailed: '删除失败',
    dragHover: '释放以移动到此状态',
    applicants: '申请人',
    matchScore: '匹配度: {score}%'
  },
  resume: {
    title: 'AI简历生成器',
    subtitle: '使用AI驱动的优化功能创建专业简历',
    generateTargeted: '生成针对性简历',
    jumpToJobs: '跳转到职位页面',
    tipTitle: '使用方法',
    tipDescription: '在这里设置您的档案，然后访问职位页面为特定职位生成针对性简历。',
    
    // Setup mode
    setupTitle: '智能简历设置',
    setupDescription: '上传简历内容，AI自动提取关键信息',
    uploadTitle: '上传您的简历',
    uploadDescription: '支持文本格式或复制粘贴简历内容，AI将自动分析并提取关键信息',
    contentLabel: '简历内容',
    contentPlaceholder: '请粘贴您的简历内容，或直接输入个人信息：\n\n• 基本信息（姓名、联系方式）\n• 工作经验和成就\n• 技能和专长\n• 教育背景\n• 项目经验\n• 语言能力等',
    languageLabel: '分析语言:',
    aiAnalyze: 'AI分析简历',
    aiAnalyzing: 'AI正在分析...',
    manualFill: '手动填写',
    
    // Analysis results
    analysisTitle: 'AI分析结果',
    analysisDescription: '请检查并确认AI提取的信息是否准确',
    
    // Form fields
    form: {
      skills: '核心技能',
      skillsPlaceholder: '如: React, JavaScript, Python',
      experience: '工作经验',
      experiencePlaceholder: '描述您的工作经验',
      education: '教育背景',
      educationPlaceholder: '如: 计算机科学本科, 北京大学',
      location: '期望地点',
      locationPlaceholder: '如: 北京, 上海, 远程工作',
      preferredRoles: '期望职位',
      rolesPlaceholder: '如: 前端工程师, 全栈开发',
      languages: '语言能力',
      languagesPlaceholder: '如: 中文（母语）, 英语（流利）'
    },
    
    // Actions
    finishEdit: '完成编辑',
    saveProfile: '保存档案',
    edit: '编辑',
    reAnalyze: '重新分析',
    generateTargetedResume: '生成针对性简历',
    createProfile: '创建简历档案',
    
    // Messages
    profileLoaded: '档案已加载',
    profileLoadedFromDb: '已成功加载您的简历档案',
    profileLoadedFromLocal: '已从本地存储加载您的简历档案',
    resumeInsufficient: '简历内容不足',
    resumeInsufficientDesc: '请输入更完整的简历内容（至少50个字符）',
    analysisComplete: '分析完成',
    analysisCompleteDesc: 'AI已成功分析您的简历内容',
    analysisFailed: '分析失败',
    analysisFailedDesc: '分析失败，请重试',
    analysisTryAgain: '请重试',
    savedToLocal: '保存到本地',
    savedToLocalDesc: '已保存到本地存储，云端保存失败',
    
    // Normal page
    managerTitle: 'Resume Manager',
    managerSubtitle: '管理您的简历档案和求职信息',
    yourProfile: '您的简历档案',
    profileDescription: '您的简历信息已保存，LinkedIn Job Assistant将使用这些信息进行职位匹配',
    completeEdit: '完成',
    noProfile: '还没有简历档案',
    noProfileDesc: '创建您的简历档案，让AI帮您匹配最合适的职位',
    
    saved: '档案保存成功',
    savedDescription: '您的信息已成功更新',
    saveFailed: '保存失败'
  },
  targetedResume: {
    title: '针对性简历',
    subtitle: 'AI生成的个性化简历内容',
    generating: '正在生成针对性简历内容...',
    generatingSubtitle: '这可能需要10-20秒时间',
    failed: '生成失败，请重试',
    actions: {
      copyToClipboard: '复制到剪贴板',
      preview: '简历预览',
      generatePdf: '生成PDF',
      onlineTemplates: '在线模板'
    },
    copied: '已复制到剪贴板',
    copiedDescription: '简历内容已复制，您可以粘贴到任何地方使用',
    pdfSuccess: 'PDF生成成功',
    pdfDescription: '简历已在新窗口中打开，您可以保存为PDF',
    pdfFailed: 'PDF生成失败',
    pdfError: '请重试或使用打印功能',
    templateLabel: 'PDF模板:',
    templates: {
      modern: '现代风格',
      classic: '经典风格',
      creative: '创意风格'
    },
    preview: {
      title: '简历预览 - {template}',
      description: '预览您的针对性简历，可直接打印或保存为PDF',
      print: '打印'
    }
  },
  onlineTemplates: {
    title: '免费在线简历模板推荐',
    description: '精选优质的免费简历模板，您可以使用我们生成的内容填入这些专业模板',
    guide: {
      title: '使用指南',
      step1: '1. 选择适合您行业的模板',
      step2: '2. 访问模板网站或GitHub',
      step3: '3. 复制我们生成的简历内容',
      step4: '4. 按模板格式填入内容',
      step5: '5. 生成专业PDF简历',
      tip: '💡 技术岗位推荐GitHub风格'
    },
    categories: {
      tech: '💻 技术类模板',
      online: '🛠️ 在线制作工具',
      academic: '🎓 学术/专业模板'
    },
    actions: {
      visit: '访问',
      preview: '预览',
      useNow: '立即使用',
      getTemplate: '获取模板',
      copyContent: '复制简历内容'
    },
    features: {
      opensource: '开源',
      free: '免费',
      responsive: '响应式',
      github: 'GitHub',
      latex: 'LaTeX',
      modern: '现代',
      professional: '专业',
      ats: 'ATS友好'
    },
    contentCopied: '内容已复制',
    contentCopiedDescription: '简历内容已复制到剪贴板，您可以粘贴到选择的模板中'
  },
  profile: {
    title: '个人设置',
    subtitle: '管理您的专业信息以获得个性化的职位推荐',
    form: {
      basicInfo: '基本信息',
      name: '全名',
      email: '邮箱',
      phone: '电话',
      location: '地点',
      linkedin: 'LinkedIn档案',
      website: '个人网站',
      professionalInfo: '专业信息',
      skills: '技能',
      experience: '经验水平',
      education: '教育背景',
      preferredRoles: '首选职位',
      languages: '语言',
      preferences: '职位偏好',
      preferredLocations: '首选地点',
      remoteWork: '远程工作偏好',
      salaryExpectation: '薪资期望'
    },
    experienceLevels: {
      entry: '入门级 (0-2年)',
      mid: '中级 (3-5年)',
      senior: '高级 (6-10年)',
      expert: '专家级 (10年以上)'
    },
    remoteOptions: {
      onsite: '仅现场工作',
      remote: '仅远程工作',
      hybrid: '混合工作',
      any: '任意'
    },
    saved: '档案保存成功',
    saveFailed: '档案保存失败'
  },
  aiTools: {
    title: 'AI驱动的职业工具',
    subtitle: '使用高级AI工具提升您的求职成功率',
    resumeAnalysis: {
      title: '简历分析',
      description: '获得AI驱动的洞察来提升简历的有效性',
      action: '分析简历'
    },
    jobMatching: {
      title: '职位匹配',
      description: '找到最符合您技能和经验的职位',
      action: '寻找匹配'
    },
    interviewPrep: {
      title: '面试准备',
      description: '与AI练习面试并获得个性化反馈',
      action: '开始练习'
    },
    salaryInsights: {
      title: '薪资洞察',
      description: '获取您职位和地区的市场薪资数据',
      action: '查看薪资'
    }
  },
  language: {
    title: '语言',
    select: '选择语言'
  },
  applicationMaterials: {
    title: '申请材料',
    subtitle: '在一个地方管理所有的求职申请材料',
    cv: {
      title: '简历管理',
      subtitle: '存储、管理和优化您的简历文档',
      upload: '上传简历',
      uploadDesc: '上传PDF、DOC或DOCX格式的简历进行分析和优化',
      library: '您的简历库',
      libraryDesc: '管理您的简历版本和针对性简历',
      atsScore: 'ATS评分',
      analyze: '分析',
      edit: '编辑',
      download: '下载',
      delete: '删除',
      suggestions: '改进建议',
      quickActions: '快速操作',
      createFromTemplate: '从模板创建新简历',
      importLinkedIn: '从LinkedIn导入',
      exportAll: '导出所有简历',
      noCV: '还没有上传简历。上传您的第一份简历开始使用。'
    },
    coverLetters: {
      title: '求职信',
      subtitle: '为您的职位申请生成针对性求职信',
      selectJob: '选择目标职位',
      selectJobDesc: '从您的职位追踪器中选择一个职位来生成针对性求职信',
      additionalReq: '额外要求（可选）',
      generate: '生成求职信',
      generating: '生成中...',
      generated: '生成的求职信',
      generatedDesc: 'AI为您选择的职位量身定制的求职信',
      copyClipboard: '复制到剪贴板',
      saveTemplate: '保存为模板',
      saved: '已保存的求职信',
      savedDesc: '您之前生成的求职信',
      view: '查看',
      created: '创建时间'
    },
    linkedinProfile: {
      title: 'LinkedIn主页分析器',
      subtitle: '优化您的LinkedIn主页以吸引更多机会',
      analyzeProfile: '分析您的主页',
      analyzeDesc: '输入您的LinkedIn主页URL或上传主页数据',
      analyzing: '分析中...',
      uploadData: '上传主页数据',
      profileScore: '主页评分',
      scoreDesc: '您的LinkedIn主页优化得分',
      excellent: '优秀！您的主页已经很好地优化了。',
      good: '进展良好！一些改进将使您的主页更加突出。',
      needsWork: '您的主页需要关注。按照下面的建议进行改进。',
      currentStatus: '当前状态：',
      suggestions: '建议：',
      aiRecommendation: 'AI建议：',
      applyAI: '应用AI建议',
      optimized: '已优化',
      canImprove: '可改进',
      needsAttention: '需要关注',
      points: '分',
      profileUrl: 'LinkedIn主页URL',
      profileUrlPlaceholder: 'https://linkedin.com/in/your-profile',
      orPasteData: '或粘贴您的主页完整内容（推荐）',
      pasteDataPlaceholder: '请复制粘贴您完整的LinkedIn主页内容，包括：标题、关于、工作经验、技能、教育背景等。这样可以获得更准确的分析结果。',
      analyzeBtn: '分析主页',
      tryDemo: '试用演示分析',
      accuracyNote: '💡 提示：粘贴完整主页内容比仅提供URL能获得更准确的分析结果',
      analysisMode: '分析模式',
      fastMode: '⚡ 快速分析（3秒）',
      fastModeDesc: '基于AI智能分析，快速获得估算结果',
      deepMode: '🔍 深度分析（15秒）',
      deepModeDesc: '浏览器自动化抓取真实数据，更准确但较慢',
      topPriorities: '🎯 重点改进项：',
      detailedAnalysis: '详细分析',
      aiImprovement: 'AI改进建议',
      improvementSuggestions: 'AI改进建议',
      specificImprovements: '🎯 具体改进方案',
      recommendedContent: '📝 推荐内容',
      keywordSuggestions: '🔑 关键词建议',
      whyImportant: '💡 为什么重要',
      generating: '生成中...',
      copySuggestion: '📋 复制建议',
      copiedToClipboard: '已复制到剪贴板',
      copiedDescription: '改进建议已复制，你可以直接应用到LinkedIn'
    }
  }
}