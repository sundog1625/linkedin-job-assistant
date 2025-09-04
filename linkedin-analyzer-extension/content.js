// Universal LinkedIn Profile Quality Analyzer - Content Script
console.log('🎯 Universal LinkedIn Profile Quality Analyzer loaded');

class UniversalLinkedInAnalyzer {
  constructor() {
    this.profileData = {};
    this.contentAnalysis = {};
    this.isAnalyzing = false;
    this.userProfile = null;
    this.grammarErrors = [];
    this.qualityScores = {};
    this.activeIndicators = []; // 管理活跃的高亮指示器
    this.currentLanguage = this.getStoredLanguage() || 'zh'; // 默认中文
    this.translations = this.initTranslations();
    this.init();
  }

  // 获取存储的语言设置
  getStoredLanguage() {
    try {
      return localStorage.getItem('ai-linkedin-analyzer-language') || 'zh';
    } catch (e) {
      return 'zh';
    }
  }

  // 保存语言设置
  saveLanguage(lang) {
    try {
      localStorage.setItem('ai-linkedin-analyzer-language', lang);
      this.currentLanguage = lang;
    } catch (e) {
      console.warn('无法保存语言设置');
    }
  }

  // 初始化翻译文本
  initTranslations() {
    return {
      zh: {
        title: 'AI LinkedIn 档案分析器',
        analyze: '开始分析',
        analyzing: '分析中...',
        photo: '头像',
        banner: '背景图',
        headline: '标题',
        about: '关于',
        experience: '经验',
        skills: '技能',
        education: '教育',
        modify: '🔍 修改',
        cancel: '✨ 取消',
        score: '评分',
        issues: '问题',
        suggestions: '建议',
        present: '已存在',
        missing: '缺失',
        poor: '较差',
        good: '良好',
        excellent: '优秀',
        languageSwitch: '🌐 EN',
        debugMode: '调试模式 (Shift+点击)',
        photoHint: '📷 点击此处上传专业头像',
        aboutHint: '👤 点击此处添加个人简介',
        experienceHint: '💼 点击此处添加工作经验',
        skillsHint: '🛠️ 建议添加更多专业技能',
        educationHint: '🎓 点击此处添加教育背景'
      },
      en: {
        title: 'AI LinkedIn Profile Analyzer',
        analyze: 'Start Analysis',
        analyzing: 'Analyzing...',
        photo: 'Photo',
        banner: 'Banner',
        headline: 'Headline',
        about: 'About',
        experience: 'Experience',
        skills: 'Skills',
        education: 'Education',
        modify: '🔍 Edit',
        cancel: '✨ Cancel',
        score: 'Score',
        issues: 'Issues',
        suggestions: 'Suggestions',
        present: 'Present',
        missing: 'Missing',
        poor: 'Poor',
        good: 'Good',
        excellent: 'Excellent',
        languageSwitch: '🌐 中',
        debugMode: 'Debug Mode (Shift+Click)',
        photoHint: '📷 Click here to upload professional photo',
        aboutHint: '👤 Click here to add personal summary',
        experienceHint: '💼 Click here to add work experience',
        skillsHint: '🛠️ Suggest adding more professional skills',
        educationHint: '🎓 Click here to add education background'
      }
    };
  }

  // 获取翻译文本
  t(key) {
    return this.translations[this.currentLanguage][key] || key;
  }

  // 切换语言
  toggleLanguage() {
    const newLang = this.currentLanguage === 'zh' ? 'en' : 'zh';
    this.saveLanguage(newLang);
    this.updateAllTexts();
    console.log(`🌐 语言切换为: ${newLang}`);
  }

  // 更新所有界面文本
  updateAllTexts() {
    const widget = document.querySelector('.ai-linkedin-analyzer-widget');
    if (!widget) return;

    // 更新标题
    const titleElement = widget.querySelector('.ai-analyzer-title span');
    if (titleElement) {
      titleElement.textContent = this.t('title');
    }

    // 更新分析按钮
    const analyzeBtn = widget.querySelector('.ai-analyze-btn');
    if (analyzeBtn) {
      const isAnalyzing = analyzeBtn.classList.contains('analyzing');
      analyzeBtn.textContent = isAnalyzing ? this.t('analyzing') : this.t('analyze');
    }

    // 更新语言切换按钮
    const langBtn = widget.querySelector('.ai-language-btn');
    if (langBtn) {
      langBtn.textContent = this.t('languageSwitch');
    }

    // 更新所有section标题和修改按钮
    this.updateSectionTexts();
  }

  // 更新section文本
  updateSectionTexts() {
    const widget = document.querySelector('.ai-linkedin-analyzer-widget');
    if (!widget) return;

    // 更新修改按钮
    widget.querySelectorAll('.ai-highlight-btn').forEach(btn => {
      const isActive = btn.textContent.includes('✨');
      btn.textContent = isActive ? this.t('cancel') : this.t('modify');
    });
  }

  init() {
    // 监听popup语言切换消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'languageChanged') {
        this.saveLanguage(request.language);
        this.updateAllTexts();
        console.log(`🌐 Content script received language change: ${request.language}`);
      } else if (request.action === 'ping') {
        sendResponse({status: 'ok'});
      }
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startUniversalAnalysis());
    } else {
      this.startUniversalAnalysis();
    }
  }

  startUniversalAnalysis() {
    console.log('🎯 Starting Universal LinkedIn Profile Quality Analysis...');
    
    setTimeout(() => {
      this.extractProfileContent();
      this.performAIQualityAnalysis();
      this.createIntelligentWidget();
    }, 3000);
  }

  extractProfileContent() {
    console.log('🔍 Extracting comprehensive profile content for quality analysis...');
    
    const profileData = {
      profileUrl: window.location.href,
      profileOwner: this.extractProfileOwnerInfo(),
      
      photo: this.extractPhotoAnalysis(),
      banner: this.extractBannerAnalysis(),
      headline: this.extractHeadlineContent(),
      about: this.extractAboutContent(),
      experience: this.extractExperienceContent(),
      skills: this.extractSkillsContent(),
      education: this.extractEducationContent(),
      
      customUrl: this.analyzeCustomUrl(),
      contactInfo: this.extractContactInfo(),
      certifications: this.extractCertifications(),
      recommendations: this.extractRecommendations(),
      activities: this.extractActivityData(),
      
      analyzedAt: new Date().toISOString()
    };

    // 应用回退检测机制提高准确性
    const fallbackData = this.universalFallbackDetection();
    this.profileData = this.mergeDetectionResults(profileData, fallbackData);
    this.detectGrammarErrors();
    
    console.log('✅ Content extraction completed with fallback enhancement:', this.profileData);
  }

  extractProfileOwnerInfo() {
    const nameSelectors = [
      'h1.text-heading-xlarge',
      '.pv-text-details__left-panel h1',
      '.pv-top-card--headline h1',
      'h1[data-generated-suggestion-target]'
    ];
    
    let name = '';
    for (const selector of nameSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        name = element.textContent.trim();
        break;
      }
    }
    
    return {
      name: name || 'Unknown Profile',
      isViewerOwnProfile: this.checkIfViewerProfile(),
      connectionDegree: this.extractConnectionDegree()
    };
  }

  checkIfViewerProfile() {
    const viewerSelfIndicators = [
      '.pv-top-card-v2-ctas .pvs-profile-actions__edit',
      'button[aria-label*="Edit"]',
      '.pv-dashboard-section',
      '.pv-top-card-v2-ctas button[data-control-name*="edit"]'
    ];
    
    return viewerSelfIndicators.some(selector => document.querySelector(selector));
  }

  extractConnectionDegree() {
    const connectionText = document.querySelector('.dist-value')?.textContent;
    if (connectionText?.includes('1st')) return '1st';
    if (connectionText?.includes('2nd')) return '2nd';
    if (connectionText?.includes('3rd')) return '3rd';
    return 'unknown';
  }

  extractPhotoAnalysis() {
    // 基于真实LinkedIn页面结构的头像选择器
    const photoSelectors = [
      'img[alt*="profile picture"]', // 通用alt属性
      'button img[src*="profile"]', // 按钮内的头像图片
      'img[src*="profile-displayphoto"]', // LinkedIn头像特有src
      '.pv-top-card-profile-picture__image', // 经典选择器
      'img[data-delayed-url*="profile"]', // 延迟加载头像
      '.profile-photo-edit__preview img', // 编辑状态头像
      '[data-test="profile-image"] img' // 测试标识头像
    ];
    
    let photoElement = null;
    for (const selector of photoSelectors) {
      photoElement = document.querySelector(selector);
      if (photoElement && photoElement.src && 
          !photoElement.src.includes('anonymous') && 
          !photoElement.src.includes('generic-person') &&
          photoElement.src.includes('profile')) {
        console.log('✅ 找到头像:', selector, photoElement.src);
        break;
      }
    }
    
    // 通用选择器，查找所有可能的头像
    if (!photoElement) {
      const allImages = document.querySelectorAll('img');
      for (const img of allImages) {
        if (img.src && img.src.includes('profile') && 
            !img.src.includes('ghost') && !img.src.includes('generic')) {
          photoElement = img;
          console.log('✅ 通过通用选择器找到头像:', img.src);
          break;
        }
      }
    }
    
    if (!photoElement) {
      return {
        present: false,
        quality: 'missing',
        professionalScore: 0,
        issues: ['未设置头像'],
        recommendations: ['添加专业头像以提高信任度']
      };
    }
    
    // 分析照片质量指标
    const qualityFactors = this.analyzePhotoQuality(photoElement);
    
    return {
      present: true,
      src: photoElement.src,
      quality: qualityFactors.overallQuality,
      professionalScore: qualityFactors.professionalScore,
      issues: qualityFactors.issues,
      recommendations: qualityFactors.recommendations
    };
  }

  analyzePhotoQuality(photoElement) {
    let professionalScore = 85; // 基础分数
    const issues = [];
    const recommendations = [];
    
    // 检查图片大小和清晰度（通过naturalWidth/Height）
    if (photoElement.naturalWidth && photoElement.naturalWidth < 400) {
      professionalScore -= 15;
      issues.push('头像分辨率较低');
      recommendations.push('上传更高分辨率的头像（建议至少400x400像素）');
    }
    
    // 检查是否是LinkedIn默认头像
    if (photoElement.src.includes('profile-displayphoto-shrink') && 
        photoElement.src.includes('generic')) {
      professionalScore -= 40;
      issues.push('使用默认头像');
      recommendations.push('上传个人专业照片');
    }
    
    let quality = 'excellent';
    if (professionalScore < 60) quality = 'poor';
    else if (professionalScore < 75) quality = 'average';
    else if (professionalScore < 85) quality = 'good';
    
    return {
      overallQuality: quality,
      professionalScore,
      issues,
      recommendations
    };
  }

  extractBannerAnalysis() {
    const bannerSelectors = [
      '.profile-background-image img',
      '.pv-top-card__background-image img',
      'img[data-ghost-classes*="background"]'
    ];
    
    let bannerElement = null;
    for (const selector of bannerSelectors) {
      bannerElement = document.querySelector(selector);
      if (bannerElement && bannerElement.src && 
          !bannerElement.src.includes('default') && 
          !bannerElement.src.includes('ghost')) {
        break;
      }
    }
    
    return {
      present: !!bannerElement,
      type: bannerElement ? 'custom' : 'default',
      quality: bannerElement ? 'custom' : 'default',
      recommendations: bannerElement ? 
        ['已有自定义背景，很好！'] : 
        ['添加自定义背景图以个性化档案', '选择与职业相关的专业背景']
    };
  }

  extractHeadlineContent() {
    // 基于真实LinkedIn页面结构的标题选择器
    const headlineSelectors = [
      '.text-body-medium.break-words', // 主要标题选择器
      '.pv-text-details__left-panel .text-body-medium',
      'div.text-body-medium:not(.visually-hidden)', // 排除隐藏元素
      '.pv-top-card--headline .text-body-medium',
      '[data-generated-suggestion-target] + div .text-body-medium', // 名字后面的标题
      'section[data-section="topcard"] .text-body-medium' // topcard区域的标题
    ];
    
    let headlineText = '';
    let headlineElement = null;
    
    for (const selector of headlineSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent?.trim() && 
          element.textContent.trim().length > 5 &&
          !element.closest('[aria-hidden="true"]')) { // 排除隐藏元素
        headlineText = element.textContent.trim();
        headlineElement = element;
        console.log('✅ 找到标题:', selector, headlineText);
        break;
      }
    }
    
    // 如果没找到，尝试查找所有text-body-medium元素
    if (!headlineText) {
      const allMediumTexts = document.querySelectorAll('.text-body-medium');
      for (const textEl of allMediumTexts) {
        const text = textEl.textContent?.trim();
        if (text && text.length > 10 && text.length < 200 && 
            !text.includes('•') && !text.includes('connection') &&
            !textEl.closest('[aria-hidden="true"]')) {
          headlineText = text;
          headlineElement = textEl;
          console.log('✅ 通过通用查找找到标题:', text);
          break;
        }
      }
    }
    
    if (!headlineText) {
      return {
        present: false,
        content: '',
        length: 0,
        quality: 'missing',
        issues: ['未设置职业标题'],
        recommendations: ['添加描述性的职业标题，包含关键技能和职位']
      };
    }
    
    return this.analyzeHeadlineQuality(headlineText);
  }

  analyzeHeadlineQuality(headline) {
    const analysis = {
      present: true,
      content: headline,
      length: headline.length,
      quality: 'average',
      professionalScore: 50,
      issues: [],
      recommendations: [],
      keywordDensity: {},
      sentiment: 'neutral'
    };
    
    // 长度分析
    if (headline.length < 30) {
      analysis.issues.push('职业标题过短');
      analysis.recommendations.push('扩展职业标题，包含更多关键信息');
      analysis.professionalScore -= 15;
    } else if (headline.length > 120) {
      analysis.issues.push('职业标题过长');
      analysis.recommendations.push('精简职业标题，突出核心信息');
      analysis.professionalScore -= 10;
    } else {
      analysis.professionalScore += 10;
    }
    
    // 关键词分析
    const professionalKeywords = ['engineer', 'manager', 'developer', 'analyst', 'director', 'consultant', 'specialist'];
    const skillKeywords = ['python', 'javascript', 'react', 'aws', 'sql', 'machine learning', 'ai', 'blockchain'];
    
    let keywordCount = 0;
    const lowerHeadline = headline.toLowerCase();
    
    professionalKeywords.forEach(keyword => {
      if (lowerHeadline.includes(keyword)) keywordCount++;
    });
    
    skillKeywords.forEach(keyword => {
      if (lowerHeadline.includes(keyword)) keywordCount++;
    });
    
    if (keywordCount === 0) {
      analysis.issues.push('缺少职业关键词');
      analysis.recommendations.push('添加相关职业和技能关键词');
      analysis.professionalScore -= 20;
    } else if (keywordCount >= 3) {
      analysis.professionalScore += 15;
    }
    
    // 特殊符号和格式分析
    if (headline.includes('|') || headline.includes('•') || headline.includes('→')) {
      analysis.professionalScore += 5;
    }
    
    // 情感和语调分析
    const actionWords = ['helping', 'building', 'creating', 'leading', 'transforming'];
    if (actionWords.some(word => lowerHeadline.includes(word))) {
      analysis.sentiment = 'positive';
      analysis.professionalScore += 10;
    }
    
    // 质量评级
    if (analysis.professionalScore >= 85) analysis.quality = 'excellent';
    else if (analysis.professionalScore >= 70) analysis.quality = 'good';
    else if (analysis.professionalScore >= 50) analysis.quality = 'average';
    else analysis.quality = 'poor';
    
    return analysis;
  }

  extractAboutContent() {
    let aboutSection = null;
    let aboutContent = '';
    
    // 查找About标题
    const aboutHeaders = document.querySelectorAll('h2, h3, div');
    for (const header of aboutHeaders) {
      if (header.textContent?.includes('About') || header.textContent?.includes('关于')) {
        aboutSection = header.closest('section') || header.parentElement;
        console.log('✅ 找到About部分:', header.textContent);
        break;
      }
    }
    
    if (aboutSection) {
      // 在About section中查找内容文本 - 优先查找完整内容
      const contentSelectors = [
        '.visually-hidden', // LinkedIn隐藏的完整文本（优先）
        'span[aria-hidden="true"]', // 完整显示的文本
        '.pv-shared-text-with-see-more span[aria-hidden="true"]',
        '.inline-show-more-text__text span[aria-hidden="true"]',
        '.pv-shared-text-with-see-more .full-width',
        '.break-words span:not(.visually-hidden)',
        'div[data-generated-suggestion-target] span'
      ];
      
      // 尝试多个选择器，选择最长的内容
      let bestContent = '';
      for (const selector of contentSelectors) {
        const elements = aboutSection.querySelectorAll(selector);
        for (const contentEl of elements) {
          const text = contentEl.textContent?.trim();
          if (text && text.length > 10 && text.length > bestContent.length &&
              !text.includes('Show more') && !text.includes('Show less') &&
              !text.includes('Edit') && !text.includes('Message')) {
            bestContent = text;
            console.log('✅ 找到更长的About内容:', selector, text.length, '字符');
          }
        }
      }
      
      if (bestContent) {
        aboutContent = bestContent;
        console.log('✅ 最终选择About内容:', aboutContent.length, '字符:', aboutContent.substring(0, 100) + '...');
      }
    }
    
    // 如果没找到About section，直接搜索可能的About内容
    if (!aboutContent) {
      const allSpans = document.querySelectorAll('span[aria-hidden="true"], .visually-hidden');
      let bestContent = '';
      
      for (const span of allSpans) {
        const text = span.textContent?.trim();
        if (text && text.length > 30 && text.length > bestContent.length &&
            (text.includes('student') || text.includes('university') || text.includes('experience') ||
             text.includes('Currently') || text.includes('bachelor') || text.includes('engineering'))) {
          bestContent = text;
          console.log('✅ 通用搜索找到更长About内容:', text.length, '字符');
        }
      }
      
      if (bestContent) {
        aboutContent = bestContent;
        console.log('✅ 通过通用搜索找到About内容:', aboutContent.substring(0, 100) + '...');
      }
    }
    
    if (!aboutContent) {
      return {
        present: false,
        content: '',
        length: 0,
        quality: 'missing',
        issues: ['未添加关于部分'],
        recommendations: ['添加详细的个人简介，突出专业背景和价值主张']
      };
    }
    
    console.log('✅ About内容提取完成:', aboutContent.length, '字符');
    console.log('📄 About完整内容:', aboutContent);
    return this.analyzeAboutQuality(aboutContent);
  }
  
  analyzeAboutQuality(content) {
    const analysis = {
      present: true,
      content: content,
      length: content.length,
      quality: 'average',
      professionalScore: 50,
      issues: [],
      recommendations: [],
      wordCount: content.split(/\s+/).length,
      paragraphs: content.split(/\n\s*\n/).length
    };
    
    // 长度分析
    if (content.length < 100) {
      analysis.issues.push('关于部分过短');
      analysis.recommendations.push('扩展个人简介，添加更多专业背景信息');
      analysis.professionalScore -= 20;
    } else if (content.length > 2000) {
      analysis.issues.push('关于部分过长');
      analysis.recommendations.push('精简个人简介，突出核心价值主张');
      analysis.professionalScore -= 10;
    } else if (content.length > 300) {
      analysis.professionalScore += 15;
    }
    
    // 专业关键词分析
    const professionalTerms = ['experience', 'skills', 'expertise', 'professional', 'career', 'industry', 'knowledge', 'university', 'degree', 'engineering'];
    let termCount = 0;
    const lowerContent = content.toLowerCase();
    
    professionalTerms.forEach(term => {
      if (lowerContent.includes(term)) termCount++;
    });
    
    if (termCount >= 3) {
      analysis.professionalScore += 10;
    } else if (termCount === 0) {
      analysis.issues.push('缺少专业术语');
      analysis.recommendations.push('添加更多专业相关词汇');
      analysis.professionalScore -= 15;
    }
    
    // 结构分析
    if (analysis.paragraphs >= 2) {
      analysis.professionalScore += 5;
    }
    
    // 质量评级
    if (analysis.professionalScore >= 85) analysis.quality = 'excellent';
    else if (analysis.professionalScore >= 70) analysis.quality = 'good';
    else if (analysis.professionalScore >= 50) analysis.quality = 'average';
    else analysis.quality = 'poor';
    
    return analysis;
  }
  
  extractExperienceContent() {
    let experienceEntries = [];
    
    // 方法1：通过LinkedIn特定的选择器查找经验
    const linkedinSelectors = [
      'a[data-control-name="background_details_company"]', // LinkedIn标准公司链接
      'section[data-section="experienceSection"] h3',     // 经验区域的标题
      '.pv-entity__summary-info h3',                      // 实体摘要中的标题
      'div[data-view-name="profile-card"] h3'             // 档案卡片中的标题
    ];
    
    for (const selector of linkedinSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const title = el.textContent?.trim();
        if (title && title.length > 2 && title.length < 200 && 
            !title.includes('·') && !title.includes('@')) {
          
          // 查找相关的公司信息
          let company = '';
          const parent = el.closest('li, [role="listitem"], div[data-entity-urn], .pv-entity');
          if (parent) {
            const companySelectors = [
              'h4', 
              '.pv-entity__secondary-title', 
              'a[data-control-name="background_details_company"]',
              '.pv-entity__secondary-title span'
            ];
            
            for (const companySelector of companySelectors) {
              const companyEl = parent.querySelector(companySelector);
              if (companyEl && companyEl !== el) {
                company = companyEl.textContent?.trim() || '';
                if (company && !company.includes('·') && company.length < 100) {
                  break;
                }
              }
            }
          }
          
          experienceEntries.push({
            title: title,
            company: company,
            description: '',
            duration: '',
            source: 'linkedin-selectors',
            rawText: title
          });
        }
      }
    }
    
    // 方法2：通用Experience section查找
    if (experienceEntries.length === 0) {
      let experienceSection = null;
      
      // 查找Experience标题
      const headings = document.querySelectorAll('h1, h2, h3, h4, [role="heading"], .pv-accomplishments-block h3');
      for (const heading of headings) {
        const headingText = heading.textContent?.toLowerCase().trim();
        if (headingText?.includes('experience') || headingText?.includes('经验') || headingText?.includes('工作经历')) {
          experienceSection = heading.closest('section') || heading.parentElement?.parentElement;
          console.log('✅ 找到Experience section通过标题:', headingText);
          break;
        }
      }
      
      if (experienceSection) {
        // 在Experience section中查找经验条目
        const jobContainers = experienceSection.querySelectorAll('li, [role="listitem"], div[data-entity-urn], .pv-entity, .pv-position-entity');
        const processedTitles = new Set();
        
        for (const container of jobContainers) {
          // 查找职位标题 - 通常是标题标签或链接
          const titleCandidates = container.querySelectorAll('h3, h4, strong, a, .font-weight-bold, [role="button"]');
          
          for (const titleEl of titleCandidates) {
            const title = titleEl.textContent?.trim();
            
            if (title && title.length > 3 && title.length < 150 && 
                !processedTitles.has(title) &&
                !title.includes('·') && !title.includes('@') && 
                !title.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}|Full-time|Part-time|months|years)\b/i)) {
              
              // 检查是否像职位标题
              const isLikelyJobTitle = title.match(/\b(Engineer|Manager|Developer|Analyst|Designer|Director|Coordinator|Assistant|Intern|Specialist|Lead|Officer|Executive|Consultant|Architect|Administrator|Supervisor|Technician)\b/i) ||
                                      title.match(/\b(Software|Frontend|Backend|Full Stack|Data|Product|Project|Marketing|Sales|HR|Finance|Operations)\b/i) ||
                                      (title.split(' ').length <= 8 && title.length > 5);
              
              if (isLikelyJobTitle) {
                // 使用增强的公司名称提取算法
                const company = this.extractCompanyNameFromContainer(container, title);
                
                experienceEntries.push({
                  title: title,
                  company: company,
                  description: '',
                  duration: '',
                  source: 'generic-parsing',
                  rawText: title
                });
                processedTitles.add(title);
                console.log('✅ 找到工作经验:', title, company ? `@ ${company}` : '');
              }
            }
          }
        }
      }
    }
    
    // 方法3：智能备用检测 - 扫描整个页面
    if (experienceEntries.length === 0) {
      console.log('🔄 使用备用检测方法...');
      const allInteractiveElements = document.querySelectorAll('a[href*="company"], button, h1, h2, h3, h4, h5, strong');
      const processedTitles = new Set();
      
      for (const el of allInteractiveElements) {
        const text = el.textContent?.trim();
        
        if (text && text.length > 5 && text.length < 150 &&
            !processedTitles.has(text) &&
            (text.match(/\b(Engineer|Manager|Developer|Analyst|Designer|Director|Coordinator|Assistant|Intern|Specialist|Lead|Officer|Executive|Consultant|Architect|Administrator|Supervisor|Technician)\b/i) ||
             text.match(/\b(Software|Frontend|Backend|Full Stack|Data|Product|Project|Marketing|Sales|HR|Finance|Operations)\b/i)) &&
            !text.includes('·') && !text.includes('@') &&
            !text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\b/i)) {
          
          experienceEntries.push({
            title: text,
            company: '',
            description: '',
            duration: '',
            source: 'fallback-detection',
            rawText: text
          });
          processedTitles.add(text);
          console.log('✅ 备用检测找到:', text);
        }
      }
    }
    
    // 去重和清理
    const uniqueExperiences = [];
    const seenTitles = new Set();
    
    for (const exp of experienceEntries) {
      const normalizedTitle = exp.title.toLowerCase().trim();
      if (!seenTitles.has(normalizedTitle) && exp.title.length > 3) {
        seenTitles.add(normalizedTitle);
        uniqueExperiences.push(exp);
      }
    }
    
    if (uniqueExperiences.length === 0) {
      return {
        present: false,
        entries: [],
        totalCount: 0,
        quality: 'missing',
        issues: ['未添加工作经验'],
        recommendations: ['添加详细的工作经验，包含职责和成就']
      };
    }
    
    console.log('✅ Experience内容提取完成:', uniqueExperiences.length, '项经验');
    return this.analyzeExperienceQuality(uniqueExperiences);
  }
  
  findCompanyFromContext(element) {
    // 在元素周围查找公司名称
    const parent = element.parentElement;
    if (!parent) return '';
    
    const siblings = Array.from(parent.children);
    const elementIndex = siblings.indexOf(element);
    
    // 查看下一个兄弟元素
    if (elementIndex + 1 < siblings.length) {
      const nextText = siblings[elementIndex + 1].textContent?.trim();
      if (nextText && nextText.includes('·')) {
        return nextText.split('·')[0].trim();
      }
    }
    
    return '';
  }
  
  findCompanyFromExperienceLink(link) {
    // 在经验链接中查找公司信息
    const allGeneric = link.querySelectorAll('generic');
    for (const generic of allGeneric) {
      const text = generic.textContent?.trim();
      if (text && text.includes('·') && text.includes('Full-time')) {
        return text.split('·')[0].trim();
      }
    }
    return '';
  }

  // 增强的通用公司名称提取算法
  extractCompanyNameFromContainer(container, jobTitle = '') {
    const potentialCompanies = [];
    
    // 策略1：查找包含公司关键词的文本
    const companyKeywords = /\b(Inc|Corp|Corporation|Ltd|Limited|Company|LLC|Group|Holdings|Technologies|Tech|Solutions|Systems|Services|Enterprises|International|Global|Consulting|Partners|Associates)\b/i;
    const textElements = container.querySelectorAll('*');
    
    for (const el of textElements) {
      const text = el.textContent?.trim();
      if (text && text !== jobTitle && text.length > 2 && text.length < 100 &&
          companyKeywords.test(text) &&
          !text.includes('·') && !text.includes('@') &&
          !text.match(/\b(Full-time|Part-time|months|years|\d{4})\b/i)) {
        potentialCompanies.push({
          text: text,
          confidence: 0.9,
          source: 'company-keywords'
        });
      }
    }
    
    // 策略2：查找LinkedIn特定的公司链接
    const companyLinks = container.querySelectorAll('a[href*="company"], a[data-control-name*="company"]');
    for (const link of companyLinks) {
      const text = link.textContent?.trim();
      if (text && text !== jobTitle && text.length > 2 && text.length < 100) {
        potentialCompanies.push({
          text: text,
          confidence: 0.95,
          source: 'company-links'
        });
      }
    }
    
    // 策略3：查找h4标签（通常是公司名称）
    const h4Elements = container.querySelectorAll('h4');
    for (const h4 of h4Elements) {
      const text = h4.textContent?.trim();
      if (text && text !== jobTitle && text.length > 2 && text.length < 100 &&
          !text.includes('·') && !text.match(/\b(Full-time|Part-time|\d{4})\b/i)) {
        potentialCompanies.push({
          text: text,
          confidence: 0.8,
          source: 'h4-tags'
        });
      }
    }
    
    // 策略4：查找首字母大写的简单名称（可能是公司名）
    const simpleNamePattern = /^[A-Z][a-zA-Z\s&.-]{2,50}$/;
    for (const el of textElements) {
      const text = el.textContent?.trim();
      if (text && text !== jobTitle && simpleNamePattern.test(text) &&
          !text.includes('·') && !text.includes('@') &&
          !text.match(/\b(Full-time|Part-time|months|years|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\b/i) &&
          text.split(' ').length <= 4) {
        potentialCompanies.push({
          text: text,
          confidence: 0.6,
          source: 'pattern-match'
        });
      }
    }
    
    // 策略5：查找.pv-entity__secondary-title类（LinkedIn特有）
    const secondaryTitles = container.querySelectorAll('.pv-entity__secondary-title');
    for (const title of secondaryTitles) {
      const text = title.textContent?.trim();
      if (text && text !== jobTitle && text.length > 2 && text.length < 100) {
        potentialCompanies.push({
          text: text,
          confidence: 0.85,
          source: 'secondary-title'
        });
      }
    }
    
    // 按置信度排序并返回最佳匹配
    potentialCompanies.sort((a, b) => b.confidence - a.confidence);
    
    if (potentialCompanies.length > 0) {
      console.log(`🏢 找到公司名称候选: ${potentialCompanies[0].text} (置信度: ${potentialCompanies[0].confidence}, 来源: ${potentialCompanies[0].source})`);
      return potentialCompanies[0].text;
    }
    
    return '';
  }

  // 通用回退检测机制
  universalFallbackDetection() {
    console.log('🔄 启动通用回退检测机制...');
    const fallbackData = {
      experience: [],
      education: [],
      skills: [],
      aboutKeywords: [],
      professionalIndicators: []
    };
    
    // 扫描整个页面的所有文本内容
    const allTextElements = document.querySelectorAll('*');
    const processedTexts = new Set();
    
    for (const el of allTextElements) {
      const text = el.textContent?.trim();
      if (!text || text.length < 3 || text.length > 200 || processedTexts.has(text)) continue;
      
      processedTexts.add(text);
      
      // 检测职位关键词
      if (text.match(/\b(Engineer|Manager|Developer|Analyst|Designer|Director|Coordinator|Assistant|Intern|Specialist|Lead|Officer|Executive|Consultant|Architect|Administrator|Supervisor|Technician)\b/i)) {
        fallbackData.experience.push({
          title: text,
          confidence: 0.7,
          source: 'keyword-detection'
        });
      }
      
      // 检测教育机构
      if (text.match(/\b(University|College|School|Institute|Academy|Technical)\b/i) && 
          !text.match(/\b(Bachelor|Master|PhD|BASc|BSc|MSc|MBA|MA|BS|MS)\b/i)) {
        fallbackData.education.push({
          school: text,
          confidence: 0.6,
          source: 'keyword-detection'
        });
      }
      
      // 检测技能关键词
      if (text.match(/\b(JavaScript|Python|Java|React|Angular|Vue|Node|SQL|HTML|CSS|TypeScript|PHP|C\+\+|C#|Swift|Kotlin|Go|Rust|Ruby|Scala|R|MATLAB|Docker|Kubernetes|AWS|Azure|GCP|MongoDB|PostgreSQL|MySQL|Redis|GraphQL|REST|API|Git|Linux|Windows|macOS|Agile|Scrum|DevOps|CI\/CD|Machine Learning|Data Science|AI|Blockchain|Cybersecurity|UI\/UX|Figma|Adobe|Photoshop|Illustrator|Project Management|Leadership|Communication|Teamwork|Problem Solving|Critical Thinking)\b/i)) {
        fallbackData.skills.push({
          skill: text,
          confidence: 0.8,
          source: 'keyword-detection'
        });
      }
      
      // 检测关于部分的关键词
      if (text.match(/\b(passionate|experienced|skilled|expert|professional|dedicated|innovative|creative|results-driven|team-player|leader|problem-solver)\b/i)) {
        fallbackData.aboutKeywords.push(text);
      }
      
      // 检测专业指标
      if (text.match(/\b(years of experience|worked at|studied at|graduated from|certified in|specialized in|expertise in)\b/i)) {
        fallbackData.professionalIndicators.push(text);
      }
    }
    
    console.log('📊 回退检测结果:', {
      experience: fallbackData.experience.length,
      education: fallbackData.education.length,
      skills: fallbackData.skills.length,
      aboutKeywords: fallbackData.aboutKeywords.length,
      professionalIndicators: fallbackData.professionalIndicators.length
    });
    
    return fallbackData;
  }

  // 智能内容合并机制
  mergeDetectionResults(primaryData, fallbackData) {
    const mergedData = { ...primaryData };
    
    // 如果主要检测失败，使用回退数据
    if (!mergedData.experience?.present || mergedData.experience?.totalCount === 0) {
      if (fallbackData.experience.length > 0) {
        const topExperiences = fallbackData.experience
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 3); // 只取置信度最高的3个
        
        mergedData.experience = {
          present: true,
          entries: topExperiences.map(exp => ({
            title: exp.title,
            company: '',
            description: '',
            duration: '',
            source: exp.source,
            confidence: exp.confidence
          })),
          totalCount: topExperiences.length,
          quality: 'basic',
          issues: ['基于关键词检测的基础信息'],
          recommendations: ['完善工作经验详细信息']
        };
      }
    }
    
    if (!mergedData.education?.present || mergedData.education?.totalCount === 0) {
      if (fallbackData.education.length > 0) {
        const topEducation = fallbackData.education
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 2); // 只取置信度最高的2个
        
        mergedData.education = {
          present: true,
          entries: topEducation.map(edu => ({
            school: edu.school,
            degree: '',
            field: '',
            duration: '',
            source: edu.source,
            confidence: edu.confidence
          })),
          totalCount: topEducation.length,
          quality: 'basic',
          issues: ['基于关键词检测的基础信息'],
          recommendations: ['完善教育背景详细信息']
        };
      }
    }
    
    // 增强技能数据
    if (fallbackData.skills.length > 0 && (!mergedData.skills?.totalCount || mergedData.skills.totalCount < 5)) {
      const uniqueSkills = new Set();
      const existingSkills = mergedData.skills?.skills || [];
      
      // 添加现有技能
      existingSkills.forEach(skill => uniqueSkills.add(skill.toLowerCase()));
      
      // 添加回退技能
      const additionalSkills = fallbackData.skills
        .filter(skill => !uniqueSkills.has(skill.skill.toLowerCase()))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10);
      
      if (additionalSkills.length > 0) {
        mergedData.skills = {
          ...mergedData.skills,
          totalCount: (mergedData.skills?.totalCount || 0) + additionalSkills.length,
          skills: [...existingSkills, ...additionalSkills.map(s => s.skill)],
          present: true
        };
      }
    }
    
    return mergedData;
  }

  analyzeAboutQuality(aboutText) {
    const analysis = {
      present: true,
      content: aboutText,
      length: aboutText.length,
      wordCount: aboutText.split(' ').length,
      quality: 'average',
      professionalScore: 50,
      issues: [],
      recommendations: [],
      structure: {},
      keyTopics: [],
      readability: 'average'
    };
    
    // 长度分析
    if (analysis.wordCount < 50) {
      analysis.issues.push('关于部分过短');
      analysis.recommendations.push('扩展个人简介至少100-200词');
      analysis.professionalScore -= 20;
    } else if (analysis.wordCount > 300) {
      analysis.issues.push('关于部分过长');
      analysis.recommendations.push('精简内容，突出核心价值');
      analysis.professionalScore -= 10;
    } else {
      analysis.professionalScore += 15;
    }
    
    // 结构分析
    const paragraphs = aboutText.split('\n').filter(p => p.trim().length > 0);
    analysis.structure.paragraphs = paragraphs.length;
    
    if (paragraphs.length === 1 && analysis.wordCount > 100) {
      analysis.issues.push('缺少段落结构');
      analysis.recommendations.push('分段组织内容，提高可读性');
      analysis.professionalScore -= 10;
    }
    
    // 关键要素检查
    const professionalElements = {
      experience: /experience|worked|work|career|professional/i,
      skills: /skill|expertise|proficient|expert/i,
      passion: /passion|love|enjoy|excited/i,
      achievements: /achieve|accomplish|success|award|recognition/i,
      goals: /goal|aim|future|vision|aspir/i,
      contact: /contact|reach|connect|email/i
    };
    
    let elementCount = 0;
    for (const [element, pattern] of Object.entries(professionalElements)) {
      if (pattern.test(aboutText)) {
        elementCount++;
        analysis.keyTopics.push(element);
      }
    }
    
    if (elementCount >= 4) {
      analysis.professionalScore += 20;
    } else if (elementCount < 2) {
      analysis.issues.push('缺少关键职业要素');
      analysis.recommendations.push('包含经验、技能、成就等关键信息');
      analysis.professionalScore -= 15;
    }
    
    // 可读性评估（简化版）
    const avgWordsPerSentence = analysis.wordCount / (aboutText.split(/[.!?]+/).length - 1);
    if (avgWordsPerSentence > 25) {
      analysis.readability = 'complex';
      analysis.recommendations.push('使用更短的句子提高可读性');
    } else if (avgWordsPerSentence < 10) {
      analysis.readability = 'simple';
    }
    
    // 质量评级
    if (analysis.professionalScore >= 85) analysis.quality = 'excellent';
    else if (analysis.professionalScore >= 70) analysis.quality = 'good';
    else if (analysis.professionalScore >= 50) analysis.quality = 'average';
    else analysis.quality = 'poor';
    
    return analysis;
  }

  extractSingleExperienceEntry(item) {
    const entry = {
      title: '',
      company: '',
      duration: '',
      description: '',
      currentRole: false,
      rawText: ''
    };
    
    // 查找职位标题
    const titleSelectors = [
      'a[data-control-name="background_details_company"]',
      '.pv-entity__summary-info h3',
      'h3[data-field="title"]',
      'div[data-field="title"] span',
      'span[aria-hidden="true"]'
    ];
    
    for (const selector of titleSelectors) {
      const titleEl = item.querySelector(selector);
      if (titleEl && titleEl.textContent?.trim() && titleEl.textContent.trim().length > 5) {
        entry.title = titleEl.textContent.trim();
        entry.rawText = entry.title;
        break;
      }
    }
    
    // 如果没找到，尝试从文本内容中提取
    if (!entry.title) {
      const allSpans = item.querySelectorAll('span, div');
      for (const span of allSpans) {
        const text = span.textContent?.trim();
        if (text && (text.includes('Engineer') || text.includes('Manager') || text.includes('Intern') || text.includes('Developer')) &&
            text.length < 100 && text.split(' ').length < 10) {
          entry.title = text;
          entry.rawText = text;
          break;
        }
      }
    }
    
    // 查找公司名称
    const companySelectors = [
      'a[data-control-name="background_details_company"] + div span',
      '.pv-entity__secondary-title',
      'div[data-field="company"] span',
      'span[data-field="company"]'
    ];
    
    for (const selector of companySelectors) {
      const companyEl = item.querySelector(selector);
      if (companyEl && companyEl.textContent?.trim()) {
        entry.company = companyEl.textContent.trim();
        break;
      }
    }
    
    // 从原始文本中解析公司（如果包含·分隔符）
    if (!entry.company && entry.rawText.includes('·')) {
      const parts = entry.rawText.split('·');
      if (parts.length > 1) {
        entry.company = parts[1].trim();
      }
    }
    
    return entry.title ? entry : null;
  }

  analyzeExperienceQuality(experiences) {
    const analysis = {
      present: experiences.length > 0,
      entries: experiences,
      totalCount: experiences.length,
      quality: 'average',
      professionalScore: 50,
      issues: [],
      recommendations: [],
      avgTenure: 0,
      careerProgression: 'stable'
    };
    
    if (experiences.length === 0) {
      analysis.quality = 'missing';
      analysis.professionalScore = 0;
      analysis.issues.push('无工作经验记录');
      analysis.recommendations.push('添加相关工作经验');
      return analysis;
    }
    
    // 数量分析
    if (experiences.length >= 3) {
      analysis.professionalScore += 20;
    } else if (experiences.length === 1) {
      analysis.issues.push('工作经验较少');
      analysis.recommendations.push('添加更多相关工作经验');
      analysis.professionalScore -= 10;
    }
    
    // 内容质量分析
    let detailedEntries = 0;
    experiences.forEach(exp => {
      if (exp.title && exp.company) {
        detailedEntries++;
      }
      if (exp.description && exp.description.length > 50) {
        analysis.professionalScore += 5;
      }
    });
    
    const detailRatio = detailedEntries / experiences.length;
    if (detailRatio >= 0.8) {
      analysis.professionalScore += 15;
    } else {
      analysis.issues.push('部分工作经验缺少详细信息');
      analysis.recommendations.push('为每个职位添加详细的职责描述');
    }
    
    // 职业发展轨迹分析
    const currentRoles = experiences.filter(exp => exp.currentRole);
    if (currentRoles.length > 1) {
      analysis.issues.push('多个当前职位');
      analysis.recommendations.push('确认当前职位信息的准确性');
    }
    
    // 质量评级
    if (analysis.professionalScore >= 85) analysis.quality = 'excellent';
    else if (analysis.professionalScore >= 70) analysis.quality = 'good';
    else if (analysis.professionalScore >= 50) analysis.quality = 'average';
    else analysis.quality = 'poor';
    
    return analysis;
  }

  extractSkillsContent() {
    let skillsData = {
      present: false,
      totalCount: 0,
      skills: [],
      quality: 'missing',
      issues: ['未添加技能'],
      recommendations: ['添加相关专业技能']
    };
    
    // 查找"Show all X skills"链接以确定技能总数 - 这是最准确的方法
    const showAllLinks = document.querySelectorAll('a, button, link');
    for (const link of showAllLinks) {
      const linkText = link.textContent?.trim();
      if (linkText && linkText.includes('Show all') && linkText.includes('skill')) {
        const match = linkText.match(/(\d+)\s*skill/);
        if (match) {
          skillsData.totalCount = parseInt(match[1]);
          skillsData.present = true;
          console.log('✅ 找到技能总数:', skillsData.totalCount);
          break;
        }
      }
    }
    
    // 如果没找到"Show all"链接，查找Skills部分
    if (!skillsData.present) {
      const skillsHeaders = document.querySelectorAll('h2, h3, div, span');
      for (const header of skillsHeaders) {
        if (header.textContent?.includes('Skills') || header.textContent?.includes('技能')) {
          const skillsSection = header.closest('section') || header.parentElement;
          if (skillsSection) {
            // 在Skills section中查找技能条目
            const skillItems = skillsSection.querySelectorAll('li, a[href*="search/results"], a[href*="keywords"]');
            const skills = new Set();
            
            skillItems.forEach(item => {
              const skillText = item.textContent?.trim();
              if (skillText && skillText.length > 1 && skillText.length < 50 && 
                  !skillText.includes('Skills') && !skillText.includes('Show all')) {
                skills.add(skillText);
              }
            });
            
            skillsData.skills = Array.from(skills);
            skillsData.totalCount = skillsData.skills.length;
            skillsData.present = skillsData.totalCount > 0;
            console.log('✅ 从Skills section找到技能:', skillsData.totalCount, '个');
            break;
          }
        }
      }
    }
    
    // 如果还是没找到，尝试通用搜索
    if (!skillsData.present) {
      const allLinks = document.querySelectorAll('a');
      const skills = new Set();
      
      for (const link of allLinks) {
        const href = link.href || '';
        if (href.includes('search/results') && href.includes('keywords')) {
          const skillText = link.textContent?.trim();
          if (skillText && skillText.length > 1 && skillText.length < 30 &&
              !skillText.includes('Skills') && !skillText.includes('Show') &&
              !skillText.includes('View') && !skillText.includes('Connect')) {
            skills.add(skillText);
          }
        }
      }
      
      if (skills.size > 0) {
        skillsData.skills = Array.from(skills);
        skillsData.totalCount = skillsData.skills.length;
        skillsData.present = true;
        console.log('✅ 通过通用搜索找到技能:', skillsData.totalCount, '个');
      }
    }
    
    // 如果找到了技能，分析质量
    if (skillsData.totalCount > 0) {
      skillsData.issues = [];
      skillsData.recommendations = [];
      
      if (skillsData.totalCount >= 10) {
        skillsData.quality = 'excellent';
        skillsData.professionalScore = 90;
      } else if (skillsData.totalCount >= 5) {
        skillsData.quality = 'good';
        skillsData.professionalScore = 75;
      } else {
        skillsData.quality = 'average';
        skillsData.professionalScore = 60;
        skillsData.recommendations.push('添加更多相关技能（建议至少5-10个）');
      }
    }
    
    console.log('✅ Skills内容提取完成:', skillsData.totalCount, '个技能');
    return skillsData;
  }

  extractEducationContent() {
    let educationEntries = [];
    
    // 方法1：通过LinkedIn特定的选择器查找教育
    const linkedinEducationSelectors = [
      'a[data-control-name="background_details_school"]',     // LinkedIn标准学校链接
      'section[data-section="educationSection"] h3',         // 教育区域的标题
      '.pv-entity__school-name',                             // 学校名称
      'div[data-view-name="profile-card"] h3'                // 档案卡片中的标题
    ];
    
    for (const selector of linkedinEducationSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const schoolName = el.textContent?.trim();
        if (schoolName && schoolName.length > 3 && schoolName.length < 200 && 
            (schoolName.includes('University') || schoolName.includes('College') || 
             schoolName.includes('School') || schoolName.includes('Institute') || 
             schoolName.includes('Academy') || schoolName.includes('Technical') ||
             schoolName.match(/\b(高中|大学|学院|技术学院|职业学校)\b/)) &&
            !schoolName.includes('·') && !schoolName.includes('@')) {
          
          // 查找相关的学位信息
          let degree = '';
          let field = '';
          const parent = el.closest('li, [role="listitem"], div[data-entity-urn], .pv-entity');
          if (parent) {
            const degreeSelectors = [
              'h4', 
              '.pv-entity__degree-name', 
              '.pv-entity__secondary-title',
              'span:not(.visually-hidden)'
            ];
            
            for (const degreeSelector of degreeSelectors) {
              const degreeEl = parent.querySelector(degreeSelector);
              if (degreeEl && degreeEl !== el) {
                const degreeText = degreeEl.textContent?.trim();
                if (degreeText && degreeText.match(/\b(Bachelor|Master|PhD|Doctorate|Associate|BASc|BSc|MSc|MBA|MA|BS|MS)\b/i)) {
                  degree = degreeText;
                  break;
                }
              }
            }
          }
          
          educationEntries.push({
            school: schoolName,
            degree: degree,
            field: field,
            duration: '',
            source: 'linkedin-selectors',
            rawText: schoolName
          });
        }
      }
    }
    
    // 方法2：通用Education section查找
    if (educationEntries.length === 0) {
      let educationSection = null;
      
      // 查找Education标题
      const headings = document.querySelectorAll('h1, h2, h3, h4, [role="heading"]');
      for (const heading of headings) {
        const headingText = heading.textContent?.toLowerCase().trim();
        if (headingText?.includes('education') || headingText?.includes('学历') || 
            headingText?.includes('教育') || headingText?.includes('education background')) {
          educationSection = heading.closest('section') || heading.parentElement?.parentElement;
          console.log('✅ 找到Education section通过标题:', headingText);
          break;
        }
      }
      
      if (educationSection) {
        // 在Education section中查找教育条目
        const educationContainers = educationSection.querySelectorAll('li, [role="listitem"], div[data-entity-urn], .pv-entity, .pv-education-entity');
        const processedSchools = new Set();
        
        for (const container of educationContainers) {
          // 查找学校名称 - 通常是标题标签或链接
          const schoolCandidates = container.querySelectorAll('h3, h4, strong, a, .font-weight-bold');
          
          for (const schoolEl of schoolCandidates) {
            const schoolName = schoolEl.textContent?.trim();
            
            if (schoolName && schoolName.length > 3 && schoolName.length < 200 && 
                !processedSchools.has(schoolName) &&
                (schoolName.includes('University') || schoolName.includes('College') || 
                 schoolName.includes('School') || schoolName.includes('Institute') || 
                 schoolName.includes('Academy') || schoolName.includes('Technical') ||
                 schoolName.match(/\b(高中|大学|学院|技术学院|职业学校)\b/)) &&
                !schoolName.includes('·') && !schoolName.includes('@') && 
                !schoolName.match(/\b(Bachelor|Master|PhD|BASc|BSc|MSc|MBA|MA|BS|MS)\b/i)) {
              
              // 查找学位信息
              let degree = '';
              let field = '';
              const degreeCandidates = container.querySelectorAll('h4, .pv-entity__degree-name, span:not(.visually-hidden)');
              
              for (const degreeEl of degreeCandidates) {
                const degreeText = degreeEl.textContent?.trim();
                if (degreeText && degreeText !== schoolName && 
                    degreeText.match(/\b(Bachelor|Master|PhD|Doctorate|Associate|BASc|BSc|MSc|MBA|MA|BS|MS)\b/i)) {
                  degree = degreeText;
                  
                  // 尝试提取专业字段
                  const fieldMatch = degreeText.match(/\bin\s+([A-Z][a-zA-Z\s]+)/);
                  if (fieldMatch) {
                    field = fieldMatch[1].trim();
                  }
                  break;
                }
              }
              
              educationEntries.push({
                school: schoolName,
                degree: degree,
                field: field,
                duration: '',
                source: 'generic-parsing',
                rawText: schoolName
              });
              processedSchools.add(schoolName);
              console.log('✅ 找到教育经历:', schoolName, degree ? `- ${degree}` : '');
            }
          }
        }
      }
    }
    
    // 方法3：智能备用检测 - 扫描整个页面查找教育机构
    if (educationEntries.length === 0) {
      console.log('🔄 使用教育背景备用检测方法...');
      const allElements = document.querySelectorAll('a, h1, h2, h3, h4, h5, strong');
      const processedSchools = new Set();
      
      for (const el of allElements) {
        const text = el.textContent?.trim();
        
        if (text && text.length > 10 && text.length < 150 &&
            !processedSchools.has(text) &&
            (text.includes('University') || text.includes('College') || text.includes('School') || 
             text.includes('Institute') || text.includes('Academy') || text.includes('Technical') ||
             text.match(/\b(高中|大学|学院|技术学院|职业学校)\b/)) &&
            !text.includes('·') && !text.includes('@') &&
            !text.match(/\b(Bachelor|Master|PhD|BASc|BSc|MSc|MBA|MA|BS|MS)\b/i)) {
          
          educationEntries.push({
            school: text,
            degree: '',
            field: '',
            duration: '',
            source: 'fallback-detection',
            rawText: text
          });
          processedSchools.add(text);
          console.log('✅ 备用检测找到教育机构:', text);
        }
      }
    }
    
    // 去重和清理
    const uniqueEducation = [];
    const seenSchools = new Set();
    
    for (const edu of educationEntries) {
      const normalizedSchool = edu.school.toLowerCase().trim();
      if (!seenSchools.has(normalizedSchool) && edu.school.length > 3) {
        seenSchools.add(normalizedSchool);
        uniqueEducation.push(edu);
      }
    }
    
    if (uniqueEducation.length === 0) {
      return {
        present: false,
        entries: [],
        totalCount: 0,
        quality: 'missing',
        issues: ['未添加教育背景'],
        recommendations: ['添加教育背景信息']
      };
    }
    
    console.log('✅ Education内容提取完成:', uniqueEducation.length, '项教育经历');
    return this.analyzeEducationQuality(uniqueEducation);
  }
  
  extractSingleEducationEntry(item) {
    const entry = {
      school: '',
      degree: '',
      field: '',
      duration: '',
      rawText: ''
    };
    
    // 查找学校名称
    const schoolSelectors = [
      'a[data-control-name="background_details_school"]',
      '.pv-entity__school-name',
      'h3[data-field="school"]',
      'div[data-field="school"] span'
    ];
    
    for (const selector of schoolSelectors) {
      const schoolEl = item.querySelector(selector);
      if (schoolEl && schoolEl.textContent?.trim()) {
        entry.school = schoolEl.textContent.trim();
        entry.rawText = entry.school;
        break;
      }
    }
    
    // 如果没找到，尝试从文本内容中提取
    if (!entry.school) {
      const allSpans = item.querySelectorAll('span, div');
      for (const span of allSpans) {
        const text = span.textContent?.trim();
        if (text && (text.includes('University') || text.includes('College') || text.includes('Institute')) &&
            text.length < 150) {
          entry.school = text;
          entry.rawText = text;
          break;
        }
      }
    }
    
    // 查找学位信息
    const degreeSelectors = [
      '.pv-entity__degree-name',
      'div[data-field="degree"] span',
      'span[data-field="degree"]'
    ];
    
    for (const selector of degreeSelectors) {
      const degreeEl = item.querySelector(selector);
      if (degreeEl && degreeEl.textContent?.trim()) {
        entry.degree = degreeEl.textContent.trim();
        break;
      }
    }
    
    return entry.school ? entry : null;
  }
  
  findDegreeFromContext(element) {
    // 在元素周围查找学位信息
    const parent = element.parentElement;
    if (!parent) return '';
    
    const text = parent.textContent || '';
    const degreePatterns = ['Bachelor', 'Master', 'PhD', 'Doctorate', 'Associate', 'Certificate'];
    
    for (const pattern of degreePatterns) {
      if (text.includes(pattern)) {
        return pattern;
      }
    }
    
    return '';
  }
  
  findDegreeFromEducationLink(link) {
    // 在教育链接中查找学位信息
    const allGeneric = link.querySelectorAll('generic');
    for (const generic of allGeneric) {
      const text = generic.textContent?.trim();
      if (text && (text.includes('Bachelor') || text.includes('Master') || text.includes('BASc') || text.includes('PhD'))) {
        return text;
      }
    }
    return '';
  }
  
  analyzeEducationQuality(entries) {
    const analysis = {
      present: entries.length > 0,
      entries: entries,
      totalCount: entries.length,
      quality: 'average',
      professionalScore: 50,
      issues: [],
      recommendations: []
    };
    
    if (entries.length === 0) {
      analysis.quality = 'missing';
      analysis.professionalScore = 0;
      analysis.issues.push('无教育背景记录');
      analysis.recommendations.push('添加教育背景信息');
      return analysis;
    }
    
    // 教育数量分析
    if (entries.length >= 2) {
      analysis.professionalScore += 10;
    }
    
    // 内容质量分析
    let hasDegreInfo = 0;
    
    entries.forEach(entry => {
      if (entry.degree) hasDegreInfo++;
    });
    
    if (hasDegreInfo === entries.length) {
      analysis.professionalScore += 15;
    } else {
      analysis.issues.push('部分教育经历缺少学位信息');
      analysis.recommendations.push('为教育经历添加具体学位信息');
      analysis.professionalScore -= 5;
    }
    
    // 质量评级
    if (analysis.professionalScore >= 85) analysis.quality = 'excellent';
    else if (analysis.professionalScore >= 70) analysis.quality = 'good';
    else if (analysis.professionalScore >= 50) analysis.quality = 'average';
    else analysis.quality = 'poor';
    
    return analysis;
  }


  analyzeCustomUrl() {
    const currentUrl = window.location.href;
    const urlPath = currentUrl.split('/in/')[1]?.split('/')[0] || '';
    const username = urlPath.replace(/[?#].*$/, '');
    
    const isDefault = (
      username.match(/[0-9]{8,}/) || 
      username.match(/[0-9a-f]{8,}/) || 
      username.length < 5 || 
      username.length > 50
    );
    
    return !isDefault;
  }

  extractContactInfo() {
    return {
      present: false,
      methods: [],
      recommendations: ['考虑添加联系信息（如果适当的话）']
    };
  }

  extractCertifications() {
    return {
      present: false,
      count: 0,
      recommendations: ['添加相关专业认证']
    };
  }

  extractRecommendations() {
    return {
      present: false,
      count: 0,
      recommendations: ['请求同事或客户提供推荐']
    };
  }

  extractActivityData() {
    return {
      postsCount: 0,
      engagementLevel: 'low',
      recommendations: ['定期分享专业内容']
    };
  }

  detectGrammarErrors() {
    const textContent = [
      this.profileData.headline?.content || '',
      this.profileData.about?.content || ''
    ].join(' ');
    
    // 简单的语法检查
    this.grammarErrors = [];
    
    // 检查常见错误
    const commonErrors = [
      { pattern: /\bi\s/gi, replacement: 'I', error: '大写I' },
      { pattern: /\.\s*[a-z]/g, error: '句首应大写' },
      { pattern: /\s{2,}/g, error: '多余空格' }
    ];
    
    commonErrors.forEach(errorType => {
      const matches = textContent.match(errorType.pattern);
      if (matches) {
        this.grammarErrors.push({
          type: errorType.error,
          count: matches.length,
          suggestions: errorType.replacement || '修正格式'
        });
      }
    });
  }

  async performAIQualityAnalysis() {
    console.log('🤖 Triggering comprehensive AI quality analysis...');
    this.isAnalyzing = true;
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeWithAI',
        profileData: this.profileData,
        analysisType: 'quality_analysis',
        includeGrammarCheck: true
      });
      
      if (response.success) {
        console.log('✅ AI quality analysis completed');
        this.contentAnalysis = response.data;
        this.qualityScores = response.data.qualityScores || {};
      } else {
        console.error('❌ AI analysis failed:', response.error);
        this.contentAnalysis = {
          error: response.error,
          basicAnalysis: this.generateBasicAnalysis()
        };
      }
    } catch (error) {
      console.error('❌ Failed to get AI analysis:', error);
      this.contentAnalysis = {
        error: error.message,
        basicAnalysis: this.generateBasicAnalysis()
      };
    }
    
    this.isAnalyzing = false;
  }

  generateBasicAnalysis() {
    const basicScores = {};
    
    ['photo', 'banner', 'headline', 'about', 'experience', 'skills', 'education'].forEach(section => {
      if (this.profileData[section]) {
        basicScores[section] = this.profileData[section].professionalScore || 50;
      }
    });
    
    const totalScore = Object.values(basicScores).reduce((sum, score) => sum + score, 0) / Object.keys(basicScores).length;
    
    return {
      totalScore: Math.round(totalScore),
      sectionScores: basicScores,
      topPriorities: this.generateTopPriorities()
    };
  }

  generateTopPriorities() {
    const priorities = [];
    
    if (!this.profileData.photo?.present) {
      priorities.push('添加专业头像');
    }
    if (!this.profileData.about?.present) {
      priorities.push('完善关于部分');
    }
    if (this.profileData.experience?.totalCount < 2) {
      priorities.push('添加更多工作经验');
    }
    
    return priorities.slice(0, 3);
  }

  createIntelligentWidget() {
    const existingWidget = document.getElementById('ai-linkedin-analyzer-widget');
    if (existingWidget) {
      existingWidget.remove();
    }

    const widget = document.createElement('div');
    widget.id = 'ai-linkedin-analyzer-widget';
    widget.className = 'ai-linkedin-analyzer-widget';
    
    const analysisData = this.contentAnalysis.basicAnalysis || this.contentAnalysis;
    const totalScore = analysisData.totalScore || 65;
    
    // 获取关键统计信息
    const aboutData = this.profileData.about || {};
    const skillsData = this.profileData.skills || {};
    const experienceData = this.profileData.experience || {};
    const headlineData = this.profileData.headline || {};
    
    const aboutWordCount = aboutData.content ? aboutData.content.length : 0;
    const skillsCount = skillsData.totalCount || 0;
    const experienceCount = experienceData.totalCount || 0;
    const headlineLength = headlineData.content ? headlineData.content.length : 0;
    
    widget.innerHTML = `
      <div class="ai-analyzer-header">
        <div class="ai-analyzer-title">
          <span class="ai-analyzer-icon">🎯</span>
          <span>${this.t('title')}</span>
        </div>
        <div class="ai-analyzer-controls">
          <button class="ai-language-btn" title="${this.t('debugMode')}">${this.t('languageSwitch')}</button>
          <div class="ai-analyzer-score">
            <span class="ai-score-number">${totalScore}</span>
            <span class="ai-score-text">/100</span>
          </div>
        </div>
      </div>
      
      <div class="ai-quick-stats">
        <div class="ai-quick-stat-item">
          <span class="ai-stat-icon">📝</span>
          <span class="ai-stat-label">${this.t('about')}</span>
          <span class="ai-stat-value">${aboutWordCount}${this.currentLanguage === 'zh' ? '字符' : ' chars'}</span>
        </div>
        <div class="ai-quick-stat-item">
          <span class="ai-stat-icon">🛠️</span>
          <span class="ai-stat-label">${this.t('skills')}</span>
          <span class="ai-stat-value">${skillsCount}${this.currentLanguage === 'zh' ? '个' : ''}</span>
        </div>
        <div class="ai-quick-stat-item">
          <span class="ai-stat-icon">💼</span>
          <span class="ai-stat-label">${this.t('experience')}</span>
          <span class="ai-stat-value">${experienceCount}${this.currentLanguage === 'zh' ? '项' : ''}</span>
        </div>
        <div class="ai-quick-stat-item">
          <span class="ai-stat-icon">📄</span>
          <span class="ai-stat-label">${this.t('headline')}</span>
          <span class="ai-stat-value">${headlineLength}${this.currentLanguage === 'zh' ? '字符' : ' chars'}</span>
        </div>
      </div>
      
      <div class="ai-analyzer-body" id="ai-analyzer-body">
        <div class="ai-score-circle">
          <svg width="80" height="80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="#e5e7eb" stroke-width="6"/>
            <circle cx="40" cy="40" r="35" fill="none" stroke="#10b981" stroke-width="6" 
                    stroke-dasharray="${2 * Math.PI * 35}" 
                    stroke-dashoffset="${2 * Math.PI * 35 * (1 - totalScore / 100)}"
                    transform="rotate(-90 40 40)"/>
          </svg>
          <div class="ai-score-text-center">${totalScore}</div>
        </div>
        
        <div class="ai-quality-sections">
          ${this.renderQualitySections()}
        </div>
        
        ${this.grammarErrors.length > 0 ? `
          <div class="grammar-errors">
            <div class="grammar-title">📝 语法建议:</div>
            <ul class="grammar-list">
              ${this.grammarErrors.map(error => `
                <li>${error.type}: ${error.count}处 - ${error.suggestions}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${analysisData.topPriorities ? `
          <div class="ai-top-priorities">
            <div class="ai-priorities-title">🚀 优先改进:</div>
            <ul class="ai-priorities-list">
              ${analysisData.topPriorities.map(priority => `
                <li>${priority}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div class="ai-analyzer-actions">
          <button class="ai-refresh-btn" onclick="window.aiLinkedInAnalyzer.refresh()">
            🔄 重新分析
          </button>
        </div>
      </div>
      
      <div class="ai-analyzer-toggle" onclick="window.aiLinkedInAnalyzer.toggle()">
        <span id="ai-toggle-text">收起</span>
      </div>
    `;

    document.body.appendChild(widget);
    window.aiLinkedInAnalyzer = this;
    
    // 添加高亮修改按钮事件监听器
    this.setupHighlightEventListeners();
    
    console.log('✅ AI-powered analysis widget created');
  }

  // 设置高亮修改按钮事件监听器
  setupHighlightEventListeners() {
    // 设置语言切换按钮事件
    const langBtn = document.querySelector('.ai-language-btn');
    if (langBtn) {
      langBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleLanguage();
      });
    }

    document.querySelectorAll('.ai-highlight-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const sectionKey = btn.getAttribute('data-section');
        const isActive = btn.classList.contains('active');
        
        // 检查是否按住了Shift键 - 调试模式
        const debugMode = e.shiftKey;
        
        if (isActive && !debugMode) {
          // 如果按钮已激活，点击取消高亮
          console.log(`✨ 取消高亮指示 ${sectionKey} 模块`);
          this.clearAllHighlights();
        } else {
          // 否则进行高亮指示
          console.log(`🔍 高亮指示 ${sectionKey} 模块需要修改的地方${debugMode ? ' (调试模式)' : ''}`);
          
          // 清除之前的高亮
          this.clearAllHighlights();
          
          if (debugMode) {
            // 调试模式：显示所有相关元素
            this.debugHighlightSection(sectionKey);
          } else {
            // 普通模式：只高亮最佳匹配元素
            this.highlightSectionToEdit(sectionKey);
          }
          
          // 更新按钮状态
          this.updateHighlightButtons(sectionKey);
        }
      });
    });
  }

  // 调试模式：高亮所有相关元素
  debugHighlightSection(sectionKey) {
    console.log(`🔧 调试模式：显示 ${sectionKey} 模块的所有候选元素`);
    
    // 获取该模块的所有选择器
    let selectors = [];
    let searchKeywords = [];
    
    switch (sectionKey) {
      case 'photo':
        selectors = ['button[aria-label*="photo"]', 'img[alt*="profile picture"]', 'button img[src*="profile"]', '.profile-photo'];
        searchKeywords = ['profile', 'photo', 'avatar', 'picture'];
        break;
      case 'banner':
        selectors = ['button[aria-label*="background"]', '.profile-background-image', '.cover-photo'];
        searchKeywords = ['background', 'cover', 'banner'];
        break;
      case 'headline':
        selectors = ['[data-test-id*="headline"]', '.text-body-medium.break-words', '.headline'];
        searchKeywords = ['headline', 'title'];
        break;
      case 'about':
        selectors = ['[data-test-id*="about"]', '.pv-about-section', '.summary-section'];
        searchKeywords = ['about', 'summary'];
        break;
      case 'experience':
        selectors = ['[data-test-id*="experience"]', '#experience', '.experience-section'];
        searchKeywords = ['experience', 'work'];
        break;
      case 'skills':
        selectors = ['[data-test-id*="skill"]', '#skills', '.skills-section'];
        searchKeywords = ['skill', 'skills'];
        break;
      case 'education':
        selectors = ['[data-test-id*="education"]', '#education', '.education-section'];
        searchKeywords = ['education', 'school'];
        break;
    }
    
    let foundElements = [];
    
    // 方法1：通过选择器查找
    selectors.forEach((selector, index) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          foundElements.push({
            element: element,
            source: `选择器${index + 1}: ${selector}`,
            score: 50 + index * 5,
            text: element.textContent?.substring(0, 50) || '[无文本]'
          });
        }
      });
    });
    
    // 方法2：通过关键词智能搜索
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
      const elementText = element.textContent?.toLowerCase() || '';
      const elementId = element.id?.toLowerCase() || '';
      const elementClass = element.className?.toLowerCase() || '';
      const elementAria = element.getAttribute('aria-label')?.toLowerCase() || '';
      
      const allAttributes = [elementText, elementId, elementClass, elementAria].join(' ');
      
      for (const keyword of searchKeywords) {
        if (allAttributes.includes(keyword.toLowerCase())) {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && rect.width * rect.height > 100) {
            // 检查是否已经在列表中
            const alreadyExists = foundElements.some(item => item.element === element);
            if (!alreadyExists) {
              foundElements.push({
                element: element,
                source: `关键词搜索: ${keyword}`,
                score: this.calculateElementImportance(element, keyword),
                text: elementText.substring(0, 50) || '[无文本]'
              });
            }
          }
          break;
        }
      }
    }
    
    // 按得分排序
    foundElements.sort((a, b) => b.score - a.score);
    
    console.log(`🎯 调试模式找到 ${foundElements.length} 个相关元素:`, foundElements);
    
    // 高亮所有找到的元素，用不同颜色表示优先级
    foundElements.forEach((item, index) => {
      this.addDebugHighlight(item.element, `${item.source}\n评分: ${item.score}\n文本: ${item.text}`, index);
    });
    
    // 显示调试信息
    this.showDebugInfo(sectionKey, foundElements);
  }

  // 添加调试高亮效果
  addDebugHighlight(element, message, priority) {
    // 根据优先级使用不同颜色
    const colors = [
      '#ef4444', // 红色 - 最高优先级
      '#f97316', // 橙色
      '#eab308', // 黄色
      '#22c55e', // 绿色
      '#3b82f6', // 蓝色
      '#8b5cf6', // 紫色
      '#6b7280'  // 灰色 - 最低优先级
    ];
    
    const color = colors[Math.min(priority, colors.length - 1)];
    
    // 添加高亮样式
    element.style.outline = `3px solid ${color}`;
    element.style.outlineOffset = '2px';
    element.style.position = 'relative';
    element.style.zIndex = '9999';
    
    // 添加调试标签
    const debugLabel = document.createElement('div');
    debugLabel.className = 'ai-debug-label';
    debugLabel.style.cssText = `
      position: absolute;
      top: -25px;
      left: 0;
      background: ${color};
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      z-index: 10000;
      white-space: nowrap;
    `;
    debugLabel.textContent = `#${priority + 1}`;
    
    element.style.position = 'relative';
    element.appendChild(debugLabel);
    
    // 点击显示详细信息
    element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      alert(`元素 #${priority + 1} 调试信息:\n\n${message}`);
    }, { once: true });
  }

  // 显示调试信息面板
  showDebugInfo(sectionKey, foundElements) {
    const debugPanel = document.createElement('div');
    debugPanel.className = 'ai-debug-panel';
    debugPanel.style.cssText = `
      position: fixed;
      top: 100px;
      left: 20px;
      width: 400px;
      max-height: 500px;
      background: #1f2937;
      color: white;
      border-radius: 12px;
      padding: 16px;
      z-index: 10002;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;';
    
    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0; color: #10b981;';
    title.textContent = `🔧 ${sectionKey} 调试信息`;
    
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'background: #ef4444; border: none; color: white; border-radius: 6px; padding: 4px 8px; cursor: pointer;';
    closeBtn.textContent = '关闭';
    closeBtn.addEventListener('click', () => debugPanel.remove());
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    const content = document.createElement('div');
    content.style.cssText = 'font-size: 12px; line-height: 1.4;';
    content.innerHTML = `
      <p>找到 ${foundElements.length} 个相关元素，按优先级排序：</p>
      ${foundElements.slice(0, 10).map((item, index) => `
        <div style="margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 6px;">
          <div style="color: #10b981; font-weight: bold;">#${index + 1} (评分: ${item.score})</div>
          <div style="color: #fbbf24;">${item.source}</div>
          <div style="color: #d1d5db; margin-top: 4px;">文本: ${item.text}</div>
        </div>
      `).join('')}
      ${foundElements.length > 10 ? `<div style="text-align: center; color: #9ca3af; margin-top: 8px;">... 还有 ${foundElements.length - 10} 个元素</div>` : ''}
    `;
    
    debugPanel.appendChild(header);
    debugPanel.appendChild(content);
    
    document.body.appendChild(debugPanel);
    
    // 10秒后自动移除
    setTimeout(() => {
      if (debugPanel.parentElement) {
        debugPanel.remove();
      }
    }, 10000);
  }

  // 清除所有高亮
  clearAllHighlights() {
    // 移除模块背景高亮
    this.removeHighlightEffects();
    
    // 移除普通高亮样式
    document.querySelectorAll('.ai-highlighted-element').forEach(el => {
      el.classList.remove('ai-highlighted-element');
    });
    
    // 清除调试模式的样式
    document.querySelectorAll('*').forEach(el => {
      if (el.style.outline && el.style.outline.includes('solid')) {
        el.style.outline = '';
        el.style.outlineOffset = '';
        if (el.style.position === 'relative' && !el.getAttribute('data-original-position')) {
          el.style.position = '';
        }
        if (el.style.zIndex === '9999') {
          el.style.zIndex = '';
        }
      }
    });
    
    // 移除调试标签
    document.querySelectorAll('.ai-debug-label').forEach(label => {
      label.remove();
    });
    
    // 移除调试面板
    document.querySelectorAll('.ai-debug-panel').forEach(panel => {
      panel.remove();
    });
    
    // 移除高亮指示器（使用管理数组）
    if (this.activeIndicators) {
      this.activeIndicators.forEach(indicator => {
        if (indicator.parentElement) {
          indicator.remove();
        }
      });
      this.activeIndicators = [];
    }
    
    // 备用清理：移除任何遗漏的指示器
    document.querySelectorAll('.ai-highlight-indicator').forEach(indicator => {
      indicator.remove();
    });
    
    // 重置按钮状态
    document.querySelectorAll('.ai-highlight-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.textContent = this.t('modify');
    });
    
    console.log('🧹 清除所有高亮效果、指示器、调试信息和聚光灯效果');
  }

  // 高亮指定模块需要修改的地方
  highlightSectionToEdit(sectionKey) {
    const sectionData = this.profileData[sectionKey];
    if (!sectionData) {
      console.warn(`没有找到 ${sectionKey} 模块的数据`);
      return;
    }

    switch (sectionKey) {
      case 'photo':
        this.highlightPhotoSection(sectionData);
        break;
      case 'banner':
        this.highlightBannerSection(sectionData);
        break;
      case 'headline':
        this.highlightHeadlineSection(sectionData);
        break;
      case 'about':
        this.highlightAboutSection(sectionData);
        break;
      case 'experience':
        this.highlightExperienceSection(sectionData);
        break;
      case 'skills':
        this.highlightSkillsSection(sectionData);
        break;
      case 'education':
        this.highlightEducationSection(sectionData);
        break;
      default:
        console.warn(`未知的模块类型: ${sectionKey}`);
    }

    // 滚动到第一个高亮元素
    setTimeout(() => {
      const firstHighlight = document.querySelector('.ai-highlighted-element');
      if (firstHighlight) {
        firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  // 高亮头像部分
  highlightPhotoSection(data) {
    if (!data.present) {
      // 如果没有头像，高亮头像区域或添加头像的按钮
      const photoSelectors = [
        // LinkedIn 2024 头像容器 - 优先选择更大的容器
        '.pv-top-card__photo',
        '.pv-top-card-profile-picture__container', 
        '.profile-photo-edit',
        '.pv-member-profile-sidebar__image',
        // LinkedIn 头像按钮和编辑区域
        'button[aria-label*="photo"]',
        'button[aria-label*="profile picture"]', 
        '.pv-member-profile-sidebar__image-edit-button',
        // 图片元素备用
        'img[data-ghost-classes*="profile"]',
        'img[alt*="profile picture"]', 
        'img[src*="profile-displayphoto"]',
        '.pv-top-card-profile-picture',
        // 通用备用选择器
        '.profile-photo',
        '[data-test-id*="profile-photo"]'
      ];
      
      this.highlightElementsBySelectors(photoSelectors, this.t('photoHint'));
    } else if (data.quality === 'poor' || data.issues?.length > 0) {
      // 如果头像质量差，高亮头像本身
      const photoSelectors = [
        'button[aria-label*="photo"]',
        'img[alt*="profile picture"]',
        'button img[src*="profile"]',
        'img[src*="profile-displayphoto"]',
        '.profile-photo img',
        '[data-test-id*="profile-photo"] img'
      ];
      
      this.highlightElementsBySelectors(photoSelectors, '📷 建议更换为更专业的头像');
    }
  }

  // 高亮背景图部分  
  highlightBannerSection(data) {
    if (!data.present) {
      const bannerSelectors = [
        // LinkedIn 2024 背景图选择器
        'button[aria-label*="background"]',
        'button[aria-label*="cover"]', 
        '[data-test-id*="background"]',
        '.profile-background-image',
        '.pv-top-card__photo',
        '.background-image',
        '.cover-photo',
        '[data-test-id="background-image"]',
        // 编辑按钮
        'button[data-control-name*="background"]',
        '.background-image-edit-button'
      ];
      
      this.highlightElementsBySelectors(bannerSelectors, this.t('photoHint').replace('📷', '🎨').replace('上传专业头像', '添加专业背景图'));
    }
  }

  // 高亮标题部分
  highlightHeadlineSection(data) {
    const headlineSelectors = [
      // LinkedIn 2024 标题选择器
      '[data-test-id*="headline"]',
      'button[aria-label*="headline"]',
      '[data-generated-suggestion-target="headline"]',
      // 常见的标题显示区域
      '.text-body-medium.break-words',
      'div.text-body-medium:not(.visually-hidden)',
      '.pv-text-details__left-panel .text-body-medium',
      'section[data-section="topcard"] .text-body-medium',
      // 编辑按钮
      'button[data-control-name*="headline"]',
      '.pv-text-details__left-panel button',
      // 通用选择器
      '.headline',
      '.profile-headline'
    ];
    
    const message = data.issues?.length > 0 ? 
      `📝 ${data.issues[0]}` : '📝 点击编辑职业标题';
    
    this.highlightElementsBySelectors(headlineSelectors, message);
  }

  // 高亮关于部分
  highlightAboutSection(data) {
    const aboutSelectors = [
      // LinkedIn 2024 关于部分容器 - 优先选择section级别
      'section[data-section="summary"]',
      'section[data-test-id*="about"]',
      '.pv-about-section',
      '#about', 
      // 关于内容区域
      '.pv-shared-text-with-see-more',
      '.pv-about__summary-text',
      '[data-test-id="about-section"]',
      // 编辑相关元素  
      'button[aria-label*="about"]',
      'button[data-control-name*="summary"]',
      'button[data-control-name*="about"]',
      '.inline-show-more-text',
      // 通用选择器
      '.about-section',
      '.summary-section'
    ];
    
    const message = !data.present ? 
      this.t('aboutHint') : 
      data.issues?.length > 0 ? 
        `👤 ${data.issues[0]}` : '👤 点击编辑个人简介';
    
    this.highlightElementsBySelectors(aboutSelectors, message);
  }

  // 高亮工作经验部分
  highlightExperienceSection(data) {
    const experienceSelectors = [
      // LinkedIn 2024 经验部分容器 - 优先选择section级别
      'section[data-section="experience"]',
      'section[data-test-id*="experience"]',
      '.pv-experience-section',
      '#experience',
      '.pv-profile-section__section-info--experience',
      // 经验内容和列表区域
      '.experience-section', 
      '.pv-profile-section.experience',
      '[data-test-id="experience-section"]',
      // 编辑和添加按钮备用
      'button[aria-label*="experience"]',
      'button[data-control-name*="experience"]',
      'button[aria-label*="Add experience"]',
      // 通用选择器
      '.work-experience',
      'section:has(h2:contains("Experience"))'
    ];
    
    const message = !data.present || data.totalCount === 0 ? 
      this.t('experienceHint') : 
      data.issues?.length > 0 ? 
        `💼 ${data.issues[0]}` : '💼 点击编辑工作经验';
    
    this.highlightElementsBySelectors(experienceSelectors, message);
  }

  // 高亮技能部分
  highlightSkillsSection(data) {
    const skillsSelectors = [
      // LinkedIn 2024 技能部分容器 - 优先选择section级别
      'section[data-section="skills"]',
      'section[data-test-id*="skill"]', 
      '.pv-skill-categories-section',
      '#skills',
      '.pv-accomplishments-block.skills',
      // 技能内容区域
      '[data-test-id="skills-section"]',
      '.skills-section',
      // 编辑和添加按钮备用
      'button[aria-label*="skill"]',
      'button[data-control-name*="skill"]',
      'button[aria-label*="Add skill"]',
      // 内容区域
      '.skills-section',
      '.pv-profile-section.skills',
      // 显示所有技能的链接
      'a[href*="skills"]',
      'button:contains("Show all")',
      // 通用选择器
      '.accomplishments-skills'
    ];
    
    const message = !data.present || data.totalCount === 0 ? 
      this.t('skillsHint').replace('建议添加更多', '点击此处添加') : 
      data.totalCount < 5 ? 
        this.t('skillsHint') : this.t('skillsHint').replace('建议添加更多', '点击编辑') + '列表';
    
    this.highlightElementsBySelectors(skillsSelectors, message);
  }

  // 高亮教育背景部分
  highlightEducationSection(data) {
    const educationSelectors = [
      // LinkedIn 2024 教育部分容器 - 优先选择section级别
      'section[data-section="education"]',
      'section[data-test-id*="education"]',
      '.pv-education-section', 
      '#education',
      '.pv-profile-section.education',
      // 教育内容区域
      '[data-test-id="education-section"]',
      '.education-section',
      // 编辑和添加按钮备用
      'button[aria-label*="education"]',
      'button[data-control-name*="education"]',
      'button[aria-label*="Add education"]',
      // 内容区域
      '.education-section',
      '.pv-profile-section__section-info--education',
      // 通用选择器
      '.accomplishments-education',
      'section:has(h2:contains("Education"))'
    ];
    
    const message = !data.present || data.totalCount === 0 ? 
      this.t('educationHint') : 
      data.issues?.length > 0 ? 
        `🎓 ${data.issues[0]}` : '🎓 点击编辑教育背景';
    
    this.highlightElementsBySelectors(educationSelectors, message);
  }

  // 通用高亮元素方法
  highlightElementsBySelectors(selectors, message) {
    let highlighted = false;
    
    // 调试：记录每个选择器的匹配情况
    console.log(`🔍 尝试匹配选择器:`, selectors);
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`   ${selector}: 找到 ${elements.length} 个元素`);
      
      if (elements.length > 0) {
        elements.forEach((element, index) => {
          console.log(`     元素 ${index + 1}:`, element.textContent?.substring(0, 50) + '...');
          this.addHighlightToElement(element, message);
        });
        highlighted = true;
        break; // 找到第一个匹配的选择器就停止
      }
    }
    
    if (!highlighted) {
      console.warn(`❌ 未找到匹配的元素，选择器: ${selectors.join(', ')}`);
      // 使用智能搜索作为后备
      this.intelligentElementSearch(message);
    }
  }

  // 智能元素搜索 - 当选择器失效时的后备方案
  intelligentElementSearch(message) {
    console.log('🔍 启动智能元素搜索...');
    
    // 基于消息内容推断要寻找的内容类型
    let searchKeywords = [];
    let searchContext = '';
    
    if (message.includes('头像') || message.includes('📷')) {
      searchKeywords = ['profile', 'photo', 'avatar', 'picture'];
      searchContext = '头像';
    } else if (message.includes('背景') || message.includes('🎨')) {
      searchKeywords = ['background', 'cover', 'banner'];
      searchContext = '背景图';
    } else if (message.includes('标题') || message.includes('📝')) {
      searchKeywords = ['headline', 'title'];
      searchContext = '职业标题';
    } else if (message.includes('关于') || message.includes('👤')) {
      searchKeywords = ['about', 'summary'];
      searchContext = '关于部分';
    } else if (message.includes('经验') || message.includes('💼')) {
      searchKeywords = ['experience', 'work'];
      searchContext = '工作经验';
    } else if (message.includes('技能') || message.includes('🛠️')) {
      searchKeywords = ['skill', 'skills'];
      searchContext = '技能部分';
    } else if (message.includes('教育') || message.includes('🎓')) {
      searchKeywords = ['education', 'school'];
      searchContext = '教育背景';
    }
    
    // 搜索包含关键词的元素
    const allElements = document.querySelectorAll('*');
    const candidateElements = [];
    
    for (const element of allElements) {
      // 检查元素的各种属性
      const elementText = element.textContent?.toLowerCase() || '';
      const elementId = element.id?.toLowerCase() || '';
      const elementClass = element.className?.toLowerCase() || '';
      const elementAria = element.getAttribute('aria-label')?.toLowerCase() || '';
      const elementTitle = element.title?.toLowerCase() || '';
      
      // 检查是否包含搜索关键词
      const allAttributes = [elementText, elementId, elementClass, elementAria, elementTitle].join(' ');
      
      for (const keyword of searchKeywords) {
        if (allAttributes.includes(keyword.toLowerCase())) {
          // 计算元素的可见性和重要性得分
          const rect = element.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;
          const area = rect.width * rect.height;
          
          if (isVisible && area > 100) { // 只考虑可见且有一定大小的元素
            candidateElements.push({
              element: element,
              keyword: keyword,
              score: this.calculateElementImportance(element, keyword),
              rect: rect,
              text: elementText.substring(0, 100)
            });
          }
          break;
        }
      }
    }
    
    // 按得分排序，选择最佳候选元素
    candidateElements.sort((a, b) => b.score - a.score);
    
    console.log(`🎯 智能搜索 "${searchContext}" 找到 ${candidateElements.length} 个候选元素:`, 
                candidateElements.slice(0, 3));
    
    if (candidateElements.length > 0) {
      // 高亮得分最高的元素
      this.addHighlightToElement(candidateElements[0].element, message);
      console.log(`✅ 智能搜索成功高亮 "${searchContext}" 元素`);
    } else {
      // 最后的备用方案
      this.showGenericEditHint(`${message}\n\n💡 提示：无法自动定位到具体元素，请手动查找对应的编辑区域。`);
    }
  }

  // 计算元素重要性得分
  calculateElementImportance(element, keyword) {
    let score = 0;
    
    // 基础得分
    score += 10;
    
    // 标签类型得分
    const tagName = element.tagName.toLowerCase();
    if (['button', 'a', 'input'].includes(tagName)) score += 20; // 可交互元素
    if (['h1', 'h2', 'h3', 'h4'].includes(tagName)) score += 15; // 标题元素
    if (['section', 'div'].includes(tagName)) score += 5;       // 容器元素
    
    // 位置得分（页面上方的元素得分更高）
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const positionScore = Math.max(0, 20 - (rect.top / viewportHeight) * 20);
    score += positionScore;
    
    // 大小得分
    const area = rect.width * rect.height;
    if (area > 10000) score += 10;
    else if (area > 1000) score += 5;
    
    // 关键词匹配得分
    const text = element.textContent?.toLowerCase() || '';
    const id = element.id?.toLowerCase() || '';
    const className = element.className?.toLowerCase() || '';
    
    if (id.includes(keyword)) score += 25;
    if (className.includes(keyword)) score += 15;
    if (text.includes(keyword)) score += 10;
    
    // 编辑相关属性得分
    if (element.getAttribute('contenteditable')) score += 30;
    if (element.getAttribute('role') === 'button') score += 20;
    if (element.getAttribute('data-control-name')) score += 15;
    
    return score;
  }

  // 为元素添加高亮效果
  addHighlightToElement(element, message) {
    // 找到真正的模块容器
    const moduleContainer = this.findModuleContainer(element);
    const targetElement = moduleContainer || element;
    
    // 滚动到元素
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 直接高亮模块背景
    this.highlightModuleBackground(targetElement);
    
    // 添加高亮样式类
    targetElement.classList.add('ai-highlighted-element');
    
    // 创建高亮指示器
    const indicator = document.createElement('div');
    indicator.className = 'ai-highlight-indicator';
    
    // 创建指示器内容
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-highlight-message';
    messageDiv.textContent = message;
    
    const arrowDiv = document.createElement('div');
    arrowDiv.className = 'ai-highlight-arrow';
    arrowDiv.textContent = '👆';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ai-highlight-close';
    closeBtn.textContent = '✕';
    closeBtn.type = 'button';
    
    // 添加关闭按钮事件监听器
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      indicator.remove();
      // 从管理数组中移除
      const index = this.activeIndicators.indexOf(indicator);
      if (index > -1) {
        this.activeIndicators.splice(index, 1);
      }
      console.log('🗑️ 用户手动关闭高亮指示器');
    });
    
    // 组装指示器
    indicator.appendChild(messageDiv);
    indicator.appendChild(arrowDiv);
    indicator.appendChild(closeBtn);
    
    // 定位指示器
    const rect = element.getBoundingClientRect();
    
    indicator.style.position = 'fixed';
    indicator.style.top = (rect.top - 60) + 'px';
    indicator.style.left = rect.left + 'px';
    indicator.style.zIndex = '20000'; // 提高层级，确保在聚光灯之上
    
    // 边界检测和调整
    const indicatorRect = {
      width: 280, // 预估宽度
      height: 80   // 预估高度
    };
    
    // 防止指示器超出视窗右边界
    if (rect.left + indicatorRect.width > window.innerWidth) {
      indicator.style.left = (window.innerWidth - indicatorRect.width - 20) + 'px';
    }
    
    // 防止指示器超出视窗上边界
    if (rect.top - 60 < 0) {
      indicator.style.top = (rect.bottom + 10) + 'px';
      // 箭头指向上方
      arrowDiv.textContent = '👆';
      arrowDiv.style.transform = 'rotate(180deg)';
    }
    
    document.body.appendChild(indicator);
    
    // 添加指示器到管理数组，便于统一清理
    this.activeIndicators.push(indicator);
    
    // 可选：点击指示器外部区域关闭（延迟添加，避免立即触发）
    setTimeout(() => {
      const clickOutsideHandler = (e) => {
        if (!indicator.contains(e.target) && !e.target.classList.contains('ai-highlight-btn')) {
          indicator.remove();
          document.removeEventListener('click', clickOutsideHandler);
          // 从管理数组中移除
          const index = this.activeIndicators.indexOf(indicator);
          if (index > -1) {
            this.activeIndicators.splice(index, 1);
          }
          console.log('👆 点击外部关闭高亮指示器');
        }
      };
      
      document.addEventListener('click', clickOutsideHandler);
    }, 100); // 延迟100ms避免立即触发
  }


  // 找到模块容器 - 向上查找真正的模块section
  findModuleContainer(element) {
    let current = element;
    let candidates = [];
    
    // 向上遍历DOM树，寻找LinkedIn的section容器
    while (current && current.tagName !== 'BODY') {
      // 检查是否是LinkedIn的主要section
      const isValidContainer = 
        current.tagName === 'SECTION' || 
        current.classList.contains('pv-profile-section') ||
        current.classList.contains('pv-about-section') ||
        current.classList.contains('pv-experience-section') ||
        current.classList.contains('pv-education-section') ||
        current.classList.contains('pv-skill-categories-section') ||
        current.classList.contains('artdeco-card') ||
        current.classList.contains('ember-view') ||
        current.classList.contains('pvs-list__container') ||
        current.classList.contains('scaffold-layout__main');
      
      if (isValidContainer) {
        // 确保容器有一定的尺寸，不是隐藏元素
        const rect = current.getBoundingClientRect();
        if (rect.width > 100 && rect.height > 50) {
          candidates.push({
            element: current,
            score: this.calculateContainerScore(current, rect),
            rect: rect
          });
        }
      }
      current = current.parentElement;
    }
    
    // 选择得分最高的容器
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      const bestContainer = candidates[0].element;
      console.log('✅ 找到最佳模块容器:', bestContainer, '得分:', candidates[0].score);
      return bestContainer;
    }
    
    console.log('⚠️ 未找到合适的模块容器，使用原元素');
    return null;
  }
  
  // 计算容器适合度得分
  calculateContainerScore(element, rect) {
    let score = 0;
    
    // 大小得分 - 适中的大小最好
    const area = rect.width * rect.height;
    if (area > 50000 && area < 500000) {
      score += 30;
    } else if (area > 20000) {
      score += 20;
    }
    
    // 标签类型得分
    if (element.tagName === 'SECTION') score += 25;
    else if (element.tagName === 'DIV') score += 15;
    
    // 类名匹配度得分
    const classList = Array.from(element.classList);
    if (classList.some(cls => cls.includes('section'))) score += 20;
    if (classList.some(cls => cls.includes('card'))) score += 15;
    if (classList.some(cls => cls.includes('profile'))) score += 10;
    if (classList.some(cls => cls.includes('pv-'))) score += 15;
    
    // 位置得分 - 避免选择整个页面级别的容器
    if (rect.width < window.innerWidth * 0.9) score += 20;
    if (rect.height < window.innerHeight * 0.9) score += 15;
    
    // 内容丰富度得分
    const textContent = element.textContent?.length || 0;
    if (textContent > 100 && textContent < 2000) score += 10;
    
    return score;
  }
  
  // 高亮模块背景
  highlightModuleBackground(element) {
    console.log('🎨 直接高亮模块背景:', element);
    
    // 移除旧的高亮效果
    this.removeHighlightEffects();
    
    // 保存原始样式
    const originalStyle = {
      backgroundColor: element.style.backgroundColor,
      boxShadow: element.style.boxShadow,
      border: element.style.border,
      transform: element.style.transform,
      zIndex: element.style.zIndex
    };
    
    // 应用高亮样式
    element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    element.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5), 0 4px 20px rgba(59, 130, 246, 0.2)';
    element.style.border = '2px solid #3b82f6';
    element.style.transform = 'scale(1.02)';
    element.style.zIndex = '1000';
    element.style.transition = 'all 0.3s ease';
    
    // 保存引用和原始样式用于清理
    this.highlightedElement = element;
    this.originalStyle = originalStyle;
    
    // 3秒后自动淡化高亮
    setTimeout(() => {
      if (element && element.style.backgroundColor) {
        element.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
        element.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.3), 0 2px 10px rgba(59, 130, 246, 0.1)';
        element.style.transform = 'scale(1.01)';
      }
    }, 3000);
  }
  
  // 移除高亮效果
  removeHighlightEffects() {
    if (this.highlightedElement && this.originalStyle) {
      const element = this.highlightedElement;
      const original = this.originalStyle;
      
      // 恢复原始样式
      element.style.backgroundColor = original.backgroundColor || '';
      element.style.boxShadow = original.boxShadow || '';
      element.style.border = original.border || '';
      element.style.transform = original.transform || '';
      element.style.zIndex = original.zIndex || '';
      
      this.highlightedElement = null;
      this.originalStyle = null;
    }
  }


  // 显示通用编辑提示
  showGenericEditHint(message) {
    const hint = document.createElement('div');
    hint.className = 'ai-generic-hint';
    
    const content = document.createElement('div');
    content.className = 'ai-generic-hint-content';
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    const button = document.createElement('button');
    button.textContent = '知道了';
    button.type = 'button';
    
    // 添加按钮事件监听器
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      hint.remove();
      console.log('💡 用户关闭通用提示');
    });
    
    content.appendChild(messageSpan);
    content.appendChild(button);
    hint.appendChild(content);
    
    hint.style.position = 'fixed';
    hint.style.top = '50%';
    hint.style.left = '50%';
    hint.style.transform = 'translate(-50%, -50%)';
    hint.style.zIndex = '10001';
    
    document.body.appendChild(hint);
    
    // 3秒后自动消失
    setTimeout(() => {
      if (hint.parentElement) {
        hint.remove();
      }
    }, 3000);
  }

  // 更新高亮按钮状态
  updateHighlightButtons(activeSection) {
    document.querySelectorAll('.ai-highlight-btn').forEach(btn => {
      const section = btn.getAttribute('data-section');
      if (section === activeSection) {
        btn.classList.add('active');
        btn.textContent = this.t('cancel');
      } else {
        btn.classList.remove('active');
        btn.textContent = this.t('modify');
      }
    });
  }

  renderQualitySections() {
    const sections = [
      { name: this.t('photo'), key: 'photo', icon: '📷' },
      { name: this.t('banner'), key: 'banner', icon: '🎨' },
      { name: this.t('headline'), key: 'headline', icon: '📝' },
      { name: this.t('about'), key: 'about', icon: '👤' },
      { name: this.t('experience'), key: 'experience', icon: '💼' },
      { name: this.t('skills'), key: 'skills', icon: '🛠️' },
      { name: this.t('education'), key: 'education', icon: '🎓' }
    ];
    
    return sections.map(section => {
      const data = this.profileData[section.key];
      if (!data) return '';
      
      const score = data.professionalScore || 0;
      const quality = data.quality || 'unknown';
      const statusClass = quality === 'excellent' ? 'excellent' : 
                         quality === 'good' ? 'good' : 
                         quality === 'average' ? 'average' : 'poor';
      
      // 生成实时统计信息显示
      let statsDisplay = '';
      
      // 为关于部分添加字数显示
      if (section.key === 'about') {
        const characterCount = data.content ? data.content.length : 0;
        const wordCount = data.wordCount || 0; // 使用已计算的词数
        statsDisplay = `
          <div class="ai-section-stats">
            <span class="ai-stat-item">📊 ${characterCount} 字符</span>
            <span class="ai-stat-item">📝 ${wordCount} 词</span>
          </div>
        `;
      }
      
      // 为标题部分添加字符数显示
      if (section.key === 'headline') {
        const headlineLength = data.content ? data.content.length : 0;
        statsDisplay = `
          <div class="ai-section-stats">
            <span class="ai-stat-item">📊 ${headlineLength} 字符</span>
          </div>
        `;
      }
      
      // 为技能部分添加技能数量显示
      if (section.key === 'skills') {
        const skillCount = data.totalCount || 0;
        const visibleCount = data.skills ? data.skills.length : 0;
        statsDisplay = `
          <div class="ai-section-stats">
            <span class="ai-stat-item">🎯 总共 ${skillCount} 个技能</span>
            ${visibleCount > 0 ? `<span class="ai-stat-item">👁️ 可见 ${visibleCount} 个</span>` : ''}
          </div>
        `;
      }
      
      // 为工作经验添加数量显示
      if (section.key === 'experience') {
        const expCount = data.totalCount || 0;
        statsDisplay = `
          <div class="ai-section-stats">
            <span class="ai-stat-item">💼 ${expCount} 项经验</span>
          </div>
        `;
      }
      
      // 为教育背景添加数量显示
      if (section.key === 'education') {
        const eduCount = data.totalCount || 0;
        statsDisplay = `
          <div class="ai-section-stats">
            <span class="ai-stat-item">🎓 ${eduCount} 项教育经历</span>
          </div>
        `;
      }
      
      return `
        <div class="ai-quality-section ${statusClass}" data-section="${section.key}">
          <div class="ai-section-header">
            <span class="ai-section-icon">${section.icon}</span>
            <span class="ai-section-name">${section.name}</span>
            <span class="ai-section-score">${Math.round(score)}/100</span>
            <button class="ai-highlight-btn" data-section="${section.key}" title="${this.t('debugMode')}">
              ${this.t('modify')}
            </button>
          </div>
          ${statsDisplay}
          <div class="ai-section-issues">
            ${data.issues?.map(issue => `<span class="ai-issue">• ${issue}</span>`).join('') || ''}
          </div>
          <div class="ai-section-recommendations">
            ${data.recommendations?.map(rec => `<span class="ai-recommendation">💡 ${rec}</span>`).join('') || ''}
          </div>
        </div>
      `;
    }).join('');
  }

  toggle() {
    const body = document.getElementById('ai-analyzer-body');
    const toggleText = document.getElementById('ai-toggle-text');
    
    if (body.style.display === 'none') {
      body.style.display = 'block';
      toggleText.textContent = '收起';
    } else {
      body.style.display = 'none';
      toggleText.textContent = '展开';
    }
  }

  refresh() {
    console.log('🔄 Refreshing AI analysis...');
    this.extractProfileContent();
    this.performAIQualityAnalysis();
    this.createIntelligentWidget();
  }
}

// 初始化通用LinkedIn分析器
if (window.location.href.includes('/in/')) {
  new UniversalLinkedInAnalyzer();
}