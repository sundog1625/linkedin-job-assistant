// LinkedIn Job Assistant - 稳定版内容脚本
import { API_KEYS, API_CONFIG, checkAPIKeys } from '../config/api-keys';
import { MessageType } from '../utils/types';

console.log('🚀 LinkedIn Job Assistant 已加载');
checkAPIKeys();

interface JobData {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  postedTime?: string;
  skills?: string[];
  requirements?: string[];
}

interface MatchScore {
  overall: number;
  skills: number;
  experience: number;
  location: number;
  company: number;
}

class LinkedInAssistant {
  private panel: HTMLElement | null = null;
  private isVisible = false;
  private currentJobId: string = '';
  private currentLanguage: string = 'zh';

  constructor() {
    this.init();
    this.loadSettings();
  }

  private async loadSettings() {
    try {
      const result = await chrome.storage.local.get('settings');
      if (result.settings?.language) {
        this.currentLanguage = result.settings.language;
      }
    } catch (error) {
      console.log('加载设置失败:', error);
    }
  }

  private init() {
    // 监听URL和DOM变化
    this.observeChanges();
    
    // 如果是工作页面，初始化面板
    if (this.isJobPage()) {
      this.createPanel();
    }
  }

  private observeChanges() {
    let lastUrl = location.href;
    let lastJobId = this.extractJobId();
    
    // 多种方式监听变化
    // 1. URL变化监听
    const checkChanges = () => {
      const currentUrl = location.href;
      const currentJobId = this.extractJobId();
      
      if (currentUrl !== lastUrl || currentJobId !== lastJobId) {
        console.log('检测到页面变化:', { 
          oldUrl: lastUrl, 
          newUrl: currentUrl,
          oldJobId: lastJobId,
          newJobId: currentJobId 
        });
        
        lastUrl = currentUrl;
        lastJobId = currentJobId;
        this.handleUrlChange(currentJobId);
      }
    };

    // 2. MutationObserver监听DOM变化
    const observer = new MutationObserver(() => {
      checkChanges();
    });
    
    observer.observe(document, { 
      subtree: true, 
      childList: true,
      attributes: true,
      attributeFilter: ['href', 'data-job-id', 'aria-selected']
    });

    // 3. 定时检查（备用）
    setInterval(checkChanges, 1000);

    // 4. 监听点击事件
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // 检查是否点击了工作链接
      if (target.closest('[data-job-id]') || 
          target.closest('a[href*="/jobs/view/"]') ||
          target.closest('.job-card-container') ||
          target.closest('.jobs-search-results-list__list-item')) {
        
        console.log('检测到工作点击:', target);
        setTimeout(() => {
          checkChanges();
        }, 500);
        setTimeout(() => {
          checkChanges();
        }, 1500);
      }
    }, true);

    // 5. 监听popstate事件（浏览器前进后退）
    window.addEventListener('popstate', () => {
      setTimeout(checkChanges, 300);
    });

    // 6. 监听hashchange事件
    window.addEventListener('hashchange', () => {
      setTimeout(checkChanges, 300);
    });
  }

  private extractJobId(): string {
    // 多种方式提取Job ID
    const url = window.location.href;
    
    // 方式1: URL中的job ID
    let match = url.match(/jobs\/view\/(\d+)/);
    if (match) return match[1];
    
    // 方式2: URL参数中的currentJobId
    match = url.match(/currentJobId=(\d+)/);
    if (match) return match[1];
    
    // 方式3: 从页面元素中获取
    const jobElement = document.querySelector('[data-job-id]');
    if (jobElement) {
      const jobId = jobElement.getAttribute('data-job-id');
      if (jobId) return jobId;
    }
    
    // 方式4: 从选中的工作卡片获取
    const selectedJob = document.querySelector('.jobs-search-results-list__list-item[aria-selected="true"]');
    if (selectedJob) {
      const link = selectedJob.querySelector('a[href*="/jobs/view/"]');
      if (link) {
        const href = link.getAttribute('href') || '';
        const match = href.match(/jobs\/view\/(\d+)/);
        if (match) return match[1];
      }
    }
    
    return '';
  }

  private handleUrlChange(newJobId: string) {
    console.log('处理URL变化:', { 
      isJobPage: this.isJobPage(), 
      newJobId, 
      currentJobId: this.currentJobId 
    });
    
    if (this.isJobPage() && newJobId && newJobId !== this.currentJobId) {
      console.log('切换到新工作:', newJobId);
      this.currentJobId = newJobId;
      this.removePanel();
      
      // 多次尝试创建面板，确保页面内容加载完成
      setTimeout(() => {
        console.log('第1次尝试创建面板');
        this.createPanel();
      }, 800);
      
      setTimeout(() => {
        console.log('第2次尝试创建面板');
        if (!this.panel || !this.panel.isConnected) {
          this.createPanel();
        }
      }, 2000);
      
      setTimeout(() => {
        console.log('第3次尝试创建面板');
        if (!this.panel || !this.panel.isConnected) {
          this.createPanel();
        }
      }, 3500);
      
    } else if (!this.isJobPage()) {
      console.log('离开工作页面，移除面板');
      this.removePanel();
    }
  }

  private isJobPage(): boolean {
    return window.location.pathname.includes('/jobs/') || 
           window.location.search.includes('currentJobId=');
  }

  private createPanel() {
    // 如果面板已存在，不重复创建
    if (this.panel) return;

    this.panel = document.createElement('div');
    this.panel.id = 'linkedin-job-assistant';
    this.panel.innerHTML = `
      <div style="
        position: fixed;
        top: 80px;
        right: 20px;
        width: 320px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        border: 1px solid #e0e0e0;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: block;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%);
          color: white;
          padding: 16px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="font-size: 18px;">💼</div>
            <span style="font-weight: 600; font-size: 14px;">工作分析助手</span>
          </div>
          <button id="lja-close" style="
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
          ">×</button>
        </div>

        <!-- Content -->
        <div style="padding: 16px;">
          <div id="lja-content">
            <div style="text-align: center; padding: 20px; color: #666;">
              <div style="font-size: 24px; margin-bottom: 8px;">🔍</div>
              <div style="font-size: 14px;">正在分析工作信息...</div>
            </div>
          </div>

          <!-- Actions -->
          <div style="
            display: flex;
            gap: 8px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #f0f0f0;
          ">
            <button id="lja-save" style="
              flex: 1;
              background: #0077b5;
              color: white;
              border: none;
              padding: 10px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
            ">保存工作</button>
            <button id="lja-dashboard" style="
              flex: 1;
              background: white;
              color: #0077b5;
              border: 1px solid #0077b5;
              padding: 10px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
            ">打开仪表板</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.panel);
    this.setupEventListeners();
    
    // 延迟提取工作信息
    setTimeout(() => this.extractJobInfo(), 1500);
  }

  private setupEventListeners() {
    if (!this.panel) return;

    // 关闭按钮
    const closeBtn = this.panel.querySelector('#lja-close');
    closeBtn?.addEventListener('click', () => this.togglePanel());

    // 保存工作按钮
    const saveBtn = this.panel.querySelector('#lja-save');
    saveBtn?.addEventListener('click', () => this.saveJob());

    // 仪表板按钮
    const dashboardBtn = this.panel.querySelector('#lja-dashboard');
    dashboardBtn?.addEventListener('click', () => this.openDashboard());
  }

  private async extractJobInfo() {
    try {
      console.log('开始提取工作数据...');
      
      // 等待页面内容加载
      let attempts = 0;
      let jobData = null;
      
      while (attempts < 5) {
        jobData = this.getJobData();
        if (!jobData.title || jobData.title === '未找到工作标题') {
          console.log(`第${attempts + 1}次尝试提取数据失败，等待页面加载...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        } else {
          break;
        }
      }
      
      if (!jobData || !jobData.title || jobData.title === '未找到工作标题') {
        console.log('无法提取工作数据，显示错误信息');
        this.displayError();
        return;
      }

      console.log('成功提取工作数据:', jobData);
      this.displayJobInfo(jobData);
      
    } catch (error) {
      console.error('提取工作数据时出错:', error);
      this.displayError();
    }
  }

  private getJobData(): JobData {
    console.log('开始提取工作数据...');
    
    // 更全面的选择器列表
    const titleSelectors = [
      'h1.job-details-jobs-unified-top-card__job-title',
      'h1.jobs-unified-top-card__job-title', 
      'h1.t-24',
      'h1[data-test-id="job-title"]',
      '.jobs-unified-top-card__job-title a',
      '.job-details-jobs-unified-top-card__job-title',
      'h1',
      '[data-job-title]'
    ];

    const companySelectors = [
      '.job-details-jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name',
      '.job-details-jobs-unified-top-card__company-name',
      '[data-test-id="job-details-company-name"]',
      '[data-test-id="company-name"]'
    ];

    const locationSelectors = [
      '.job-details-jobs-unified-top-card__primary-description',
      '.jobs-unified-top-card__subtitle-primary-grouping .jobs-unified-top-card__bullet',
      '[data-test-id="job-details-location"]',
      '.jobs-unified-top-card__primary-description'
    ];

    const descriptionSelectors = [
      '.jobs-description__content .jobs-description-content__text',
      '.jobs-description__content',
      '[data-test-id="job-details-description"]',
      '.jobs-description-content__text',
      '.jobs-box__content .jobs-description-content__text'
    ];

    // 提取工作标题
    let title = '未找到工作标题';
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        title = element.textContent.trim();
        console.log('找到标题:', title, '使用选择器:', selector);
        break;
      }
    }

    // 提取公司名称  
    let company = '未找到公司信息';
    for (const selector of companySelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        company = element.textContent.trim();
        console.log('找到公司:', company, '使用选择器:', selector);
        break;
      }
    }

    // 提取位置信息
    let location = '未找到位置信息';
    for (const selector of locationSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        const text = element.textContent.trim();
        // 过滤掉一些非位置信息
        if (!text.includes('employees') && !text.includes('followers') && text.length < 100) {
          location = text;
          console.log('找到位置:', location, '使用选择器:', selector);
          break;
        }
      }
    }

    // 提取工作描述
    let description = '无法获取工作描述';
    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        const fullText = element.textContent.trim();
        if (fullText.length > 50) { // 确保是有效的描述
          description = fullText;
          console.log('找到描述:', description.substring(0, 100) + '...', '使用选择器:', selector);
          break;
        }
      }
    }

    const jobData = {
      title,
      company,
      location,
      description,
      url: window.location.href
    };

    console.log('提取的工作数据:', jobData);
    return jobData;
  }

  private generateJobSummary(jobData: JobData): string {
    const description = jobData.description.toLowerCase();
    const title = jobData.title.toLowerCase();
    
    // 提取关键信息
    const requirements = this.extractRequirements(description);
    const benefits = this.extractBenefits(description);
    const responsibilities = this.extractResponsibilities(description);
    
    // 生成智能总结
    let summary = '';
    
    // 职位概述
    if (title.includes('senior') || title.includes('lead')) {
      summary += '🎯 高级职位，需要丰富经验和领导能力。';
    } else if (title.includes('junior') || title.includes('entry')) {
      summary += '🌱 入门级职位，适合新人或转行者。';
    } else {
      summary += '💼 中级职位，需要相关工作经验。';
    }
    
    // 技能要求总结
    if (requirements.length > 0) {
      summary += ` 主要技能要求：${requirements.slice(0, 3).join('、')}`;
      if (requirements.length > 3) {
        summary += `等${requirements.length}项技能`;
      }
      summary += '。';
    }
    
    // 工作类型
    if (description.includes('remote') || description.includes('远程')) {
      summary += ' 💻 支持远程工作。';
    }
    if (description.includes('full-time') || description.includes('全职')) {
      summary += ' ⏰ 全职岗位。';
    }
    
    // 福利亮点
    if (benefits.length > 0) {
      summary += ` 🎁 福利包括：${benefits.slice(0, 2).join('、')}等。`;
    }
    
    return summary || '📋 该职位正在寻找具有相关技能和经验的候选人。';
  }

  private extractRequirements(description: string): string[] {
    const requirements: string[] = [];
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker',
      'kubernetes', 'git', 'agile', 'scrum', 'typescript', 'html', 'css',
      'angular', 'vue', 'mongodb', 'postgresql', 'redis', 'elasticsearch',
      'machine learning', 'ai', 'data science', 'tensorflow', 'pytorch'
    ];
    
    commonSkills.forEach(skill => {
      if (description.includes(skill)) {
        requirements.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });
    
    return requirements;
  }

  private extractBenefits(description: string): string[] {
    const benefits: string[] = [];
    const commonBenefits = [
      'health insurance', '健康保险', 'vacation', '假期', 'bonus', '奖金',
      'stock options', '股票期权', 'flexible hours', '弹性工作时间',
      'professional development', '职业发展', 'training', '培训'
    ];
    
    commonBenefits.forEach(benefit => {
      if (description.includes(benefit)) {
        benefits.push(benefit);
      }
    });
    
    return benefits;
  }

  private extractResponsibilities(description: string): string[] {
    const responsibilities: string[] = [];
    const keywords = ['develop', 'design', 'implement', 'manage', 'lead', 'collaborate'];
    
    keywords.forEach(keyword => {
      if (description.includes(keyword)) {
        responsibilities.push(keyword);
      }
    });
    
    return responsibilities;
  }

  private calculateMatchScore(jobData: JobData): MatchScore {
    // 简化的匹配算法
    const title = jobData.title.toLowerCase();
    const description = jobData.description.toLowerCase();
    
    // 技能匹配 - 检查常见技能
    const userSkills = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker'];
    const foundSkills = userSkills.filter(skill => 
      title.includes(skill) || description.includes(skill)
    );
    const skillsScore = Math.min((foundSkills.length / userSkills.length) * 100, 95);
    
    // 经验匹配 - 检查级别
    let experienceScore = 75;
    if (title.includes('senior') || title.includes('lead')) experienceScore = 85;
    if (title.includes('junior') || title.includes('entry')) experienceScore = 95;
    if (title.includes('principal') || title.includes('director')) experienceScore = 60;
    
    // 位置匹配
    const location = jobData.location.toLowerCase();
    let locationScore = 70;
    if (location.includes('remote') || location.includes('远程')) locationScore = 100;
    if (location.includes('beijing') || location.includes('shanghai')) locationScore = 85;
    
    // 公司匹配
    const company = jobData.company.toLowerCase();
    let companyScore = 75;
    const techCompanies = ['google', 'microsoft', 'amazon', 'facebook', 'apple', 'netflix'];
    if (techCompanies.some(c => company.includes(c))) companyScore = 90;
    
    const overall = Math.round((skillsScore * 0.4 + experienceScore * 0.3 + locationScore * 0.2 + companyScore * 0.1));
    
    return {
      overall: Math.min(overall, 95),
      skills: Math.round(skillsScore),
      experience: Math.round(experienceScore),
      location: Math.round(locationScore),
      company: Math.round(companyScore)
    };
  }

  private displayJobInfo(jobData: JobData) {
    const content = this.panel?.querySelector('#lja-content');
    if (!content) return;

    const matchScore = this.calculateMatchScore(jobData);
    
    console.log('显示工作信息，等待用户点击生成总结');

    content.innerHTML = `
      <div style="font-size: 13px; line-height: 1.5;">
        <!-- 匹配度详细信息 -->
        <div style="margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="
              background: ${matchScore.overall >= 85 ? '#10b981' : matchScore.overall >= 70 ? '#f59e0b' : '#ef4444'};
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
            ">总匹配度 ${matchScore.overall}%</div>
            <button id="lja-match-details" style="
              background: none;
              border: 1px solid #d1d5db;
              color: #6b7280;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              cursor: pointer;
            ">详情</button>
          </div>
          
          <div id="lja-match-breakdown" style="display: none; background: #f9fafb; padding: 8px; border-radius: 4px; font-size: 11px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <span>技能匹配: <strong>${matchScore.skills}%</strong></span>
              <span>经验匹配: <strong>${matchScore.experience}%</strong></span>
              <span>位置匹配: <strong>${matchScore.location}%</strong></span>
              <span>公司匹配: <strong>${matchScore.company}%</strong></span>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 8px;">
          <strong style="color: #374151;">工作:</strong> 
          <span style="color: #6b7280;">${jobData.title}</span>
        </div>
        
        <div style="margin-bottom: 8px;">
          <strong style="color: #374151;">公司:</strong> 
          <span style="color: #6b7280;">${jobData.company}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">地点:</strong> 
          <span style="color: #6b7280;">${jobData.location}</span>
        </div>

        <!-- AI智能总结区域 -->
        <div id="lja-summary-container" style="
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 16px;
          border-radius: 8px;
          font-size: 12px;
          color: #475569;
          border-left: 4px solid #3b82f6;
          position: relative;
          text-align: center;
        ">
          <!-- 初始状态：显示生成按钮 -->
          <div id="lja-generate-prompt" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          ">
            <div style="
              font-size: 32px;
              opacity: 0.7;
            ">🤖</div>
            <div style="
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 4px;
            ">AI智能分析</div>
            <div style="
              color: #64748b;
              font-size: 11px;
              margin-bottom: 8px;
            ">点击按钮让AI为您分析这个职位</div>
            <button id="lja-generate-summary" style="
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 8px;
              font-size: 12px;
              cursor: pointer;
              font-weight: 600;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
              transition: all 0.2s;
            " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0px)'">
              🚀 生成AI总结
            </button>
          </div>
          
          <!-- 加载状态 -->
          <div id="lja-loading" style="display: none;">
            <div style="
              display: flex;
              align-items: center;
              gap: 12px;
              justify-content: center;
              margin-bottom: 12px;
            ">
              <div style="
                width: 20px;
                height: 20px;
                border: 3px solid #e2e8f0;
                border-top: 3px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              "></div>
              <span style="color: #3b82f6; font-weight: 600;">AI正在分析职位信息...</span>
            </div>
            <div style="
              color: #64748b;
              font-size: 10px;
            ">分析职位要求、技能匹配度、工作环境等</div>
          </div>
          
          <!-- 总结结果 -->
          <div id="lja-summary-result" style="display: none;">
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 12px;
              justify-content: center;
              font-weight: 600;
              color: #1e293b;
            ">
              <span style="font-size: 16px;">🤖</span>
              <span>AI智能分析结果</span>
            </div>
            
            <div id="lja-summary-content" style="
              text-align: left;
              line-height: 1.6;
              background: white;
              padding: 12px;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
              margin-bottom: 12px;
            "></div>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
              <button id="lja-toggle-desc" style="
                background: #6366f1;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 10px;
                cursor: pointer;
                font-weight: 500;
              ">查看原文</button>
              
              <button id="lja-translate-desc" style="
                background: #f59e0b;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 10px;
                cursor: pointer;
                font-weight: 500;
              ">翻译</button>

              <button id="lja-regenerate-summary" style="
                background: #10b981;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 10px;
                cursor: pointer;
                font-weight: 500;
              ">重新分析</button>
            </div>
          </div>
          
          <!-- 原文显示区域 -->
          <div id="lja-full-description" style="display: none; margin-top: 12px;">
            <div style="
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 8px;
              padding-bottom: 6px;
              border-bottom: 1px solid #e2e8f0;
            ">📄 完整职位描述</div>
            <div style="
              max-height: 200px;
              overflow-y: auto;
              padding: 8px;
              background: white;
              border-radius: 4px;
              border: 1px solid #e2e8f0;
              font-size: 11px;
              line-height: 1.5;
              text-align: left;
            ">
              ${jobData.description.replace(/"/g, '&quot;')}
            </div>
          </div>
          
          <!-- 翻译结果区域 -->
          <div id="lja-translation" style="
            display: none;
            margin-top: 12px;
            padding: 10px;
            background: #fff7ed;
            border-radius: 6px;
            border-left: 3px solid #f59e0b;
            font-size: 11px;
            text-align: left;
          "></div>
          
          <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </div>
      </div>
    `;

    this.setupDescriptionHandlers(jobData);
  }

  private setupDescriptionHandlers(jobData: JobData) {
    // 匹配度详情按钮
    const matchDetailsBtn = this.panel?.querySelector('#lja-match-details');
    const matchBreakdown = this.panel?.querySelector('#lja-match-breakdown');
    matchDetailsBtn?.addEventListener('click', () => {
      if (matchBreakdown) {
        const isVisible = (matchBreakdown as HTMLElement).style.display !== 'none';
        (matchBreakdown as HTMLElement).style.display = isVisible ? 'none' : 'block';
        (matchDetailsBtn as HTMLButtonElement).textContent = isVisible ? '详情' : '收起';
      }
    });

    // 生成AI总结按钮
    const generateBtn = this.panel?.querySelector('#lja-generate-summary');
    generateBtn?.addEventListener('click', () => {
      this.generateAISummary(jobData);
    });

    // 重新生成总结按钮
    const regenerateBtn = this.panel?.querySelector('#lja-regenerate-summary');
    regenerateBtn?.addEventListener('click', () => {
      this.generateAISummary(jobData, true);
    });

    // 切换原文显示按钮
    const toggleBtn = this.panel?.querySelector('#lja-toggle-desc');
    const fullDescription = this.panel?.querySelector('#lja-full-description');
    toggleBtn?.addEventListener('click', () => {
      if (fullDescription) {
        const isVisible = (fullDescription as HTMLElement).style.display !== 'none';
        (fullDescription as HTMLElement).style.display = isVisible ? 'none' : 'block';
        (toggleBtn as HTMLButtonElement).textContent = isVisible ? '查看原文' : '隐藏原文';
      }
    });

    // 翻译按钮
    const translateBtn = this.panel?.querySelector('#lja-translate-desc');
    const translationDiv = this.panel?.querySelector('#lja-translation');
    translateBtn?.addEventListener('click', () => {
      this.translateWithGoogle(jobData, translationDiv as HTMLElement);
    });
  }

  private generateAdvancedSummary(jobData: JobData): string {
    const description = jobData.description.toLowerCase();
    const title = jobData.title.toLowerCase();
    
    // 更详细的分析
    const requirements = this.extractRequirements(description);
    const benefits = this.extractBenefits(description);
    const experience = this.extractExperienceLevel(description);
    const workType = this.extractWorkType(description);
    
    let summary = '';
    
    // 经验级别判断
    if (experience.includes('senior') || experience.includes('lead')) {
      summary += '👨‍💼 高级/团队负责人职位，需要5+年经验和团队管理能力。';
    } else if (experience.includes('junior') || experience.includes('entry') || experience.includes('0-2')) {
      summary += '🌟 初级职位，0-2年经验，适合应届生或职场新人。';
    } else if (experience.includes('mid') || experience.includes('3-5')) {
      summary += '💪 中级职位，需要3-5年相关工作经验。';
    } else {
      summary += '💼 标准职位，需要相关技术背景和工作经验。';
    }
    
    // 核心技能要求
    if (requirements.length > 0) {
      const keySkills = requirements.slice(0, 4);
      summary += ` 核心技能：${keySkills.join('、')}`;
      if (requirements.length > 4) {
        summary += `等${requirements.length}项技术`;
      }
      summary += '。';
    }
    
    // 工作模式
    summary += ` ${workType}`;
    
    // 薪资和福利
    if (benefits.length > 0) {
      summary += ` 福利：${benefits.slice(0, 3).join('、')}。`;
    }
    
    // 公司评估
    if (jobData.company.toLowerCase().includes('startup')) {
      summary += ' 🚀 创业公司环境，成长机会多但需适应快节奏。';
    } else if (['google', 'microsoft', 'amazon', 'apple', 'meta'].some(big => jobData.company.toLowerCase().includes(big))) {
      summary += ' 🏢 大厂职位，福利优厚但竞争激烈。';
    }
    
    return summary;
  }

  private extractExperienceLevel(description: string): string[] {
    const levels: string[] = [];
    const experienceKeywords = [
      'senior', 'lead', 'junior', 'entry', 'mid-level', 'principal',
      '0-2 years', '3-5 years', '5+ years', 'experienced'
    ];
    
    experienceKeywords.forEach(keyword => {
      if (description.includes(keyword)) {
        levels.push(keyword);
      }
    });
    
    return levels;
  }

  private extractWorkType(description: string): string {
    if (description.includes('remote') || description.includes('远程')) {
      if (description.includes('hybrid') || description.includes('混合')) {
        return '🏠 混合办公模式（部分远程）。';
      }
      return '🌍 100%远程工作。';
    } else if (description.includes('on-site') || description.includes('office')) {
      return '🏢 需要现场办公。';
    } else if (description.includes('flexible') || description.includes('弹性')) {
      return '⏰ 弹性工作时间。';
    }
    return '💼 标准工作模式。';
  }

  private async generateAISummary(jobData: JobData, regenerate = false) {
    console.log('开始生成AI总结...');
    
    // 显示加载状态
    const generatePrompt = this.panel?.querySelector('#lja-generate-prompt');
    const loading = this.panel?.querySelector('#lja-loading');
    const summaryResult = this.panel?.querySelector('#lja-summary-result');
    const summaryContent = this.panel?.querySelector('#lja-summary-content');
    
    if (generatePrompt) (generatePrompt as HTMLElement).style.display = 'none';
    if (summaryResult) (summaryResult as HTMLElement).style.display = 'none';
    if (loading) (loading as HTMLElement).style.display = 'block';

    try {
      // 通过后台脚本调用API（避免CORS问题）
      const response = await chrome.runtime.sendMessage({
        type: MessageType.GENERATE_AI_SUMMARY,
        data: jobData
      });
      
      console.log('收到后台脚本响应:', response);
      
      // 显示结果
      if (loading) (loading as HTMLElement).style.display = 'none';
      if (summaryResult) (summaryResult as HTMLElement).style.display = 'block';
      
      if (response.success && summaryContent) {
        (summaryContent as HTMLElement).innerHTML = response.summary;
        console.log('AI总结生成成功');
      } else if (summaryContent) {
        // 显示备用总结
        (summaryContent as HTMLElement).innerHTML = response.summary || `
          <div style="color: #ef4444; text-align: center;">
            <div style="font-size: 20px; margin-bottom: 8px;">⚠️</div>
            <div>AI分析暂时不可用</div>
            <div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">
              ${response.error || '请稍后重试'}
            </div>
          </div>
        `;
      }
      
    } catch (error) {
      console.error('AI总结生成失败:', error);
      
      // 显示错误状态
      if (loading) (loading as HTMLElement).style.display = 'none';
      if (summaryResult) (summaryResult as HTMLElement).style.display = 'block';
      if (summaryContent) {
        (summaryContent as HTMLElement).innerHTML = `
          <div style="color: #ef4444; text-align: center;">
            <div style="font-size: 20px; margin-bottom: 8px;">⚠️</div>
            <div>AI分析失败</div>
            <div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">
              请检查扩展是否正常运行
            </div>
          </div>
        `;
      }
    }
  }

  private buildAIPrompt(jobData: JobData): string {
    return `请分析以下LinkedIn职位信息，生成一个简洁、有见地的中文总结（150字以内）：

职位标题: ${jobData.title}
公司: ${jobData.company}  
地点: ${jobData.location}
职位描述: ${jobData.description}

请从以下角度分析：
1. 职位级别和经验要求
2. 核心技能和技术栈
3. 工作模式（远程/现场）
4. 发展前景和亮点
5. 适合人群建议

请用友好、专业的语调，包含适当的emoji，让求职者快速了解这个职位的核心信息。`;
  }

  private async callAIAPI(prompt: string): Promise<string> {
    // 优先使用Claude API（因为已配置）
    try {
      console.log('正在调用Claude API...');
      const response = await fetch(`${API_CONFIG.CLAUDE.BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEYS.CLAUDE,
          'anthropic-version': API_CONFIG.CLAUDE.VERSION
        },
        body: JSON.stringify({
          model: API_CONFIG.CLAUDE.MODEL,
          max_tokens: API_CONFIG.CLAUDE.MAX_TOKENS,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API错误响应:', errorText);
        throw new Error(`Claude API调用失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('Claude API调用成功');
      return data.content[0].text.trim();
      
    } catch (claudeError) {
      console.error('Claude API调用失败:', claudeError);
      
      // 备用方案：使用OpenAI API（如果配置了）
      if (API_KEYS.OPENAI !== 'sk-your-openai-api-key-here') {
        try {
          console.log('尝试调用OpenAI API...');
          const response = await fetch(`${API_CONFIG.OPENAI.BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${API_KEYS.OPENAI}`
            },
            body: JSON.stringify({
              model: API_CONFIG.OPENAI.MODEL,
              messages: [
                {
                  role: 'system',
                  content: '你是一位专业的职业顾问和招聘专家，擅长分析LinkedIn职位信息并提供有价值的见解。'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              max_tokens: API_CONFIG.OPENAI.MAX_TOKENS,
              temperature: API_CONFIG.OPENAI.TEMPERATURE
            })
          });

          if (!response.ok) {
            throw new Error(`OpenAI API调用失败: ${response.status}`);
          }

          const data = await response.json();
          console.log('OpenAI API调用成功');
          return data.choices[0].message.content.trim();
          
        } catch (openaiError) {
          console.error('OpenAI API也调用失败:', openaiError);
        }
      }
      
      // 最后备用方案：使用本地生成
      console.log('使用本地AI总结作为备用方案...');
      // 从prompt中提取职位信息并生成本地总结
      const fallbackSummary = `
        📋 职位分析（本地生成）
        
        该职位需要相关技术背景和工作经验。建议仔细阅读职位描述，了解具体要求。
        
        💡 提示：由于API调用失败，这是本地生成的基础分析。建议稍后重试以获得更详细的AI分析。
      `.trim();
      return fallbackSummary;
    }
  }

  private async translateWithGoogle(jobData: JobData, translationDiv: HTMLElement) {
    if (!translationDiv) return;

    const targetLang = this.currentLanguage === 'zh' ? 'en' : 'zh';
    const targetLangName = targetLang === 'en' ? 'English' : '中文';
    
    translationDiv.style.display = 'block';
    translationDiv.innerHTML = `
      <div style="color: #9ca3af; display: flex; align-items: center; gap: 8px;">
        <div style="
          width: 16px;
          height: 16px;
          border: 2px solid #f59e0b;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        正在使用Google翻译为${targetLangName}...
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;

    try {
      // 获取当前显示的总结内容
      const summaryContent = this.panel?.querySelector('#lja-summary-content');
      const textToTranslate = summaryContent?.textContent || jobData.description.substring(0, 500);
      
      // 调用Google翻译API
      const translatedText = await this.callGoogleTranslateAPI(textToTranslate, targetLang);
      
      translationDiv.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 600;
          color: #f59e0b;
        ">
          <span>🌐</span>
          <span>Google翻译 (${targetLangName})</span>
        </div>
        <div style="line-height: 1.6;">
          ${translatedText}
        </div>
        <div style="margin-top: 8px; font-size: 10px; color: #9ca3af;">
          * 由Google Translate API提供翻译服务
        </div>
      `;
      
    } catch (error) {
      console.error('翻译失败:', error);
      
      translationDiv.innerHTML = `
        <div style="color: #ef4444; text-align: center;">
          <div style="font-size: 16px; margin-bottom: 4px;">⚠️</div>
          <div>翻译失败</div>
          <div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">
            请检查网络连接或稍后重试
          </div>
        </div>
      `;
    }
  }

  private async callGoogleTranslateAPI(text: string, targetLang: string): Promise<string> {
    try {
      // 使用Google Cloud Translation API
      const response = await fetch(`${API_CONFIG.GOOGLE_TRANSLATE.BASE_URL}?key=${API_KEYS.GOOGLE_TRANSLATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          source: targetLang === 'en' ? 'zh' : 'en',
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Google翻译API调用失败: ${response.status}`);
      }

      const data = await response.json();
      return data.data.translations[0].translatedText;
      
    } catch (error) {
      console.error('Google翻译API调用失败:', error);
      
      // 备用方案：使用简单的翻译映射
      return this.translateText(text);
    }
  }

  private translateSummary(jobData: JobData, translationDiv: HTMLElement) {
    if (!translationDiv) return;

    const targetLang = this.currentLanguage === 'zh' ? 'English' : '中文';
    
    translationDiv.style.display = 'block';
    translationDiv.innerHTML = `
      <div style="color: #9ca3af; display: flex; align-items: center; gap: 8px;">
        <div style="
          width: 16px;
          height: 16px;
          border: 2px solid #f59e0b;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        正在翻译为${targetLang}...
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;

    // 模拟AI翻译
    setTimeout(() => {
      const summary = this.generateJobSummary(jobData);
      const translatedSummary = this.translateText(summary);
      
      translationDiv.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 600;
          color: #f59e0b;
        ">
          <span>🌐</span>
          <span>${targetLang}翻译</span>
        </div>
        <div style="line-height: 1.6;">
          ${translatedSummary}
        </div>
        <div style="margin-top: 8px; font-size: 10px; color: #9ca3af;">
          * 基于AI智能翻译，如需准确翻译请使用仪表板专业翻译功能
        </div>
      `;
    }, 2000);
  }

  private translateText(text: string): string {
    // 简化的翻译映射
    const translations: any = {
      '高级职位': 'Senior position',
      '中级职位': 'Mid-level position', 
      '初级职位': 'Entry-level position',
      '需要丰富经验': 'requires extensive experience',
      '核心技能': 'Core skills',
      '远程工作': 'remote work',
      '全职岗位': 'full-time position',
      '福利包括': 'benefits include'
    };

    let translated = text;
    Object.keys(translations).forEach(zh => {
      translated = translated.replace(new RegExp(zh, 'g'), translations[zh]);
    });

    return translated;
  }

  private async translateDescription(text: string, translationDiv: HTMLElement) {
    if (!translationDiv) return;

    const targetLang = this.currentLanguage === 'zh' ? '中文' : 'English';
    
    translationDiv.style.display = 'block';
    translationDiv.innerHTML = `<div style="color: #9ca3af;">正在翻译为${targetLang}...</div>`;

    // 简化的翻译 - 实际应用中可以调用翻译API
    setTimeout(() => {
      const translations: any = {
        'requirements': '要求',
        'experience': '经验',
        'skills': '技能',
        'responsibilities': '职责',
        'qualifications': '资格',
        'benefits': '福利',
        'salary': '薪资',
        'remote': '远程',
        'full-time': '全职',
        'part-time': '兼职'
      };

      let translatedText = text;
      Object.keys(translations).forEach(en => {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translatedText = translatedText.replace(regex, translations[en]);
      });

      translationDiv.innerHTML = `
        <strong style="color: #f59e0b;">翻译结果 (${targetLang}):</strong><br>
        ${translatedText}
        <div style="margin-top: 4px; font-size: 10px; color: #9ca3af;">
          * 这是简化翻译，完整翻译请使用仪表板功能
        </div>
      `;
    }, 1000);
  }

  private displayError() {
    const content = this.panel?.querySelector('#lja-content');
    if (!content) return;

    content.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #ef4444;">
        <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
        <div style="font-size: 14px;">无法分析此页面</div>
        <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">
          请确保在LinkedIn工作详情页面
        </div>
      </div>
    `;
  }

  private saveJob() {
    const jobData = this.getJobData();
    
    // 显示保存成功消息
    const saveBtn = this.panel?.querySelector('#lja-save') as HTMLButtonElement;
    if (saveBtn) {
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '已保存 ✓';
      saveBtn.style.background = '#10b981';
      
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '#0077b5';
      }, 2000);
    }

    // 发送到后台保存
    chrome.runtime.sendMessage({
      type: 'SAVE_JOB',
      data: jobData
    }).catch(console.error);
  }

  private openDashboard() {
    window.open('https://linkedin-job-assistant-dashboard-w7.vercel.app/', '_blank');
  }

  private togglePanel() {
    if (!this.panel) return;
    
    this.isVisible = !this.isVisible;
    this.panel.style.display = this.isVisible ? 'block' : 'none';
  }

  private removePanel() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
      this.isVisible = false;
    }
  }
}

// 等待页面加载后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => new LinkedInAssistant(), 1000);
  });
} else {
  setTimeout(() => new LinkedInAssistant(), 1000);
}