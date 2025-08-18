// LinkedIn Job Assistant - 安全最小化版本
console.log('🚀 LinkedIn Job Assistant 安全版本已加载');

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
  hasResume?: boolean;
  message?: string;
}

interface UserProfile {
  skills: string[];
  experience: string;
  education: string;
  location: string;
  preferredRoles: string[];
  languages: string[];
}

class SafeLinkedInAssistant {
  private panel: HTMLElement | null = null;
  private isInitialized = false;
  private lastUrl = '';
  private userProfile: UserProfile | null = null;
  private currentLanguage: string = 'zh-CN';

  constructor() {
    this.loadUserProfile();
    this.loadLanguagePreference();
    this.init();
  }

  private async loadUserProfile() {
    try {
      const stored = await chrome.storage.local.get('userProfile');
      this.userProfile = stored.userProfile || null;
      console.log('📋 用户资料加载状态:', this.userProfile ? '已加载' : '未设置');
    } catch (error) {
      console.error('❌ 加载用户资料失败:', error);
    }
  }

  private async loadLanguagePreference() {
    try {
      const stored = await chrome.storage.local.get('preferredLanguage');
      this.currentLanguage = stored.preferredLanguage || 'zh-CN';
      console.log('🌐 语言设置:', this.currentLanguage);
    } catch (error) {
      console.error('❌ 加载语言设置失败:', error);
    }
  }

  private async saveLanguagePreference() {
    try {
      await chrome.storage.local.set({ 'preferredLanguage': this.currentLanguage });
      console.log('✅ 语言设置已保存:', this.currentLanguage);
    } catch (error) {
      console.error('❌ 保存语言设置失败:', error);
    }
  }

  private openResumeSetup() {
    try {
      console.log('🚀 跳转到Dashboard简历设置');
      // 直接打开Dashboard的简历页面
      const dashboardUrl = 'https://linkedin-job-assistant-dashboard-w7.vercel.app/resume?setup=true';
      window.open(dashboardUrl, '_blank');
    } catch (error) {
      console.error('❌ 打开Dashboard失败:', error);
      // fallback: 提示用户手动打开扩展
      alert('请点击浏览器工具栏中的扩展图标来设置简历信息');
    }
  }

  private async addJobToTracker() {
    try {
      console.log('📝 添加职位到Job Tracker...');
      
      // 获取当前职位信息
      const jobData = this.extractJobData();
      if (!jobData) {
        console.error('❌ 无法获取职位信息');
        alert('无法获取当前职位信息，请刷新页面重试');
        return;
      }

      // 获取申请人数（尝试抓取）
      const applicantCount = this.extractApplicantCount();
      
      // 计算匹配度
      const matchScore = await this.calculateMatchScore(jobData);
      
      // 构建完整的职位数据
      const fullJobData = {
        ...jobData,
        applicant_count: applicantCount,
        match_score: matchScore,
        status: 'saved', // 默认状态为已保存
        posted_date: this.extractPostedDate(),
        saved_at: new Date().toISOString()
      };

      console.log('📋 职位数据准备完成:', fullJobData);

      // 调用API保存到数据库
      const response = await fetch('https://linkedin-job-assistant-dashboard-w7.vercel.app/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullJobData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 职位已成功添加到Job Tracker');
        
        // 显示美观的成功提示（不再使用confirm）
        this.showSuccessMessage('职位已成功添加到你的Job Tracker！');
      } else {
        throw new Error(result.error || '保存失败');
      }

    } catch (error) {
      console.error('❌ 添加职位失败:', error);
      alert('添加职位失败，请重试');
    }
  }

  private extractApplicantCount(): number | null {
    try {
      // 尝试多种选择器来获取申请人数
      const selectors = [
        '[data-test-id="applicant-count"]',
        '.jobs-unified-top-card__subtitle-secondary-grouping .tvm__text',
        '.jobs-unified-top-card__subtitle-secondary-grouping span'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          const text = element.textContent;
          const match = text.match(/(\d+)\s*(?:applicant|application)/i);
          if (match) {
            return parseInt(match[1]);
          }
        }
      }

      // 尝试从页面文本中提取
      const pageText = document.body.textContent || '';
      const applicantMatch = pageText.match(/(\d+)\s*(?:applicant|application)/i);
      if (applicantMatch) {
        return parseInt(applicantMatch[1]);
      }

      return null;
    } catch (error) {
      console.warn('⚠️ 无法获取申请人数:', error);
      return null;
    }
  }

  private extractPostedDate(): string | null {
    try {
      // 尝试获取发布时间
      const selectors = [
        '[data-test-id="posted-time"]',
        '.jobs-unified-top-card__subtitle-secondary-grouping time',
        '.jobs-unified-top-card__posted-date',
        'time[datetime]'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          const datetime = element.getAttribute('datetime');
          if (datetime) return datetime;
          
          const text = element.textContent;
          if (text) {
            // 解析相对时间，如"2 days ago"
            if (text.includes('day')) {
              const days = parseInt(text.match(/(\d+)/)?.[1] || '0');
              const date = new Date();
              date.setDate(date.getDate() - days);
              return date.toISOString();
            }
            if (text.includes('hour')) {
              const hours = parseInt(text.match(/(\d+)/)?.[1] || '0');
              const date = new Date();
              date.setHours(date.getHours() - hours);
              return date.toISOString();
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('⚠️ 无法获取发布时间:', error);
      return null;
    }
  }

  private showSuccessMessage(message: string) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-out;
    `;

    // 创建成功卡片
    const card = document.createElement('div');
    card.style.cssText = `
      background: linear-gradient(135deg, #ffffff, #f0fdf4);
      border-radius: 20px;
      padding: 40px;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.4);
      animation: bounceIn 0.5s ease-out;
      text-align: center;
      position: relative;
      border: 2px solid rgba(16, 185, 129, 0.2);
    `;

    card.innerHTML = `
      <div style="
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 1s ease-out infinite;
      ">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      
      <h2 style="
        margin: 0 0 12px 0;
        font-size: 24px;
        font-weight: 700;
        color: #064e3b;
        font-family: -apple-system, BlinkMacSystemFont, 'Segui UI', Roboto, sans-serif;
      ">职位添加成功！</h2>
      
      <p style="
        margin: 0 0 24px 0;
        font-size: 16px;
        color: #6b7280;
        line-height: 1.5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segui UI', Roboto, sans-serif;
      ">${message}</p>
      
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="view-tracker" style="
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          font-family: -apple-system, BlinkMacSystemFont, 'Segui UI', Roboto, sans-serif;
        " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 20px rgba(16, 185, 129, 0.4)'" 
           onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(16, 185, 129, 0.3)'">
          📊 查看Job Tracker
        </button>
        
        <button id="continue-browsing" style="
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
          border: 1px solid rgba(107, 114, 128, 0.2);
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: -apple-system, BlinkMacSystemFont, 'Segui UI', Roboto, sans-serif;
        " onmouseover="this.style.background='rgba(107, 114, 128, 0.2)'" 
           onmouseout="this.style.background='rgba(107, 114, 128, 0.1)'">
          继续浏览
        </button>
      </div>
      
      <div style="
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(16, 185, 129, 0.1);
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #9ca3af;
          font-size: 13px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segui UI', Roboto, sans-serif;
        ">
          <span>💡 提示：你可以在Dashboard中管理所有保存的职位</span>
        </div>
      </div>
    `;

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
        50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
      }
    `;
    document.head.appendChild(style);

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // 绑定按钮事件
    const viewTrackerBtn = card.querySelector('#view-tracker') as HTMLButtonElement;
    const continueBrowsingBtn = card.querySelector('#continue-browsing') as HTMLButtonElement;

    viewTrackerBtn?.addEventListener('click', () => {
      window.open('https://linkedin-job-assistant-dashboard-w7.vercel.app/jobs', '_blank');
      overlay.remove();
      style.remove();
    });

    continueBrowsingBtn?.addEventListener('click', () => {
      overlay.remove();
      style.remove();
    });

    // 点击遮罩层也可以关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        style.remove();
      }
    });

    // 5秒后自动关闭
    setTimeout(() => {
      overlay.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        overlay.remove();
        style.remove();
      }, 300);
    }, 5000);
  }

  private init() {
    console.log('🔍 初始化安全版本助手...');
    
    // 简单的URL检查，不使用复杂的观察器
    this.checkCurrentPage();
    
    // 只使用popstate事件监听URL变化，不使用MutationObserver
    window.addEventListener('popstate', () => {
      setTimeout(() => this.checkCurrentPage(), 1000);
    });
    
    // 定时检查URL变化（频率很低，避免性能问题）
    setInterval(() => {
      this.checkCurrentPage();
    }, 5000); // 每5秒检查一次，频率很低
  }

  private checkCurrentPage() {
    const currentUrl = window.location.href;
    
    // 如果URL没有变化，直接返回
    if (currentUrl === this.lastUrl) {
      return;
    }
    
    this.lastUrl = currentUrl;
    console.log('🔍 检查当前页面:', currentUrl);
    
    if (this.isJobPage()) {
      if (!this.panel) {
        console.log('✅ 检测到职位页面，创建面板');
        this.createSafePanel();
      }
    } else {
      if (this.panel) {
        console.log('❌ 不是职位页面，移除面板');
        this.removePanel();
      }
    }
  }

  private isJobPage(): boolean {
    const url = window.location.href;
    return url.includes('/jobs/view/') || 
           url.includes('/jobs/collections/') || 
           url.includes('currentJobId=');
  }

  private async createSafePanel() {
    try {
      console.log('🔄 开始创建安全面板...');
      
      // 检查页面宽度
      if (window.innerWidth < 1200) {
        console.log('⚠️ 页面宽度不足，跳过面板创建');
        return;
      }

      // 预先提取职位数据
      const jobData = this.extractBasicJobData();
      const matchScore = jobData ? await this.calculateMatchScore(jobData) : null;

      // 创建面板
      this.panel = document.createElement('div');
      this.panel.id = 'linkedin-job-assistant-safe';
      
      // 设置安全的样式，确保不会影响页面
      this.panel.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        width: 420px;
        max-height: calc(100vh - 140px);
        z-index: 99999 !important;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
        border: 1px solid rgba(102, 126, 234, 0.1);
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(102, 126, 234, 0.1);
        padding: 24px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segui UI', Roboto, sans-serif;
        font-size: 14px;
        overflow-y: auto;
        backdrop-filter: blur(10px);
      `;

      // 创建丰富的面板内容
      this.panel.innerHTML = this.createPanelHTML(jobData, matchScore);

      // 绑定事件
      this.bindSafeEvents();

      // 添加到页面
      document.body.appendChild(this.panel);
      console.log('✅ 安全面板创建成功');
      
      // 调试信息 - 确认Add Job按钮存在
      setTimeout(() => {
        const addJobBtn = document.querySelector('#add-job-btn');
        console.log('🔍 Add Job按钮查找结果:', addJobBtn);
        if (addJobBtn) {
          console.log('✅ Add Job按钮已找到!');
          console.log('📍 按钮位置:', addJobBtn.getBoundingClientRect());
        } else {
          console.error('❌ Add Job按钮未找到!');
        }
      }, 1000);

    } catch (error) {
      console.error('❌ 创建面板失败:', error);
    }
  }

  private createPanelHTML(jobData: JobData | null, matchScore: MatchScore | null): string {
    const title = jobData?.title || 'LinkedIn 职位';
    const company = jobData?.company || '未知公司';
    const location = jobData?.location || '未知地点';

    return `
      <div style="border-top: 4px solid linear-gradient(135deg, #667eea, #764ba2); padding-top: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
          <h3 style="margin: 0; font-size: 20px; font-weight: 700; background: linear-gradient(135deg, #667eea, #764ba2); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            🎯 职位匹配分析
          </h3>
          <div style="display: flex; gap: 12px; align-items: center;">
            <select id="language-selector" style="
              background: rgba(102, 126, 234, 0.1);
              border: 1px solid rgba(102, 126, 234, 0.2);
              border-radius: 6px;
              padding: 6px 8px;
              font-size: 12px;
              color: #667eea;
              cursor: pointer;
            ">
              <option value="zh-CN">中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
              <option value="ko-KR">한국어</option>
            </select>
            <button id="add-job-btn" style="
              background: linear-gradient(135deg, #ff4444, #cc2222) !important;
              border: 2px solid #ff0000 !important;
              cursor: pointer;
              padding: 10px 16px;
              border-radius: 10px;
              color: white !important;
              font-size: 14px !important;
              font-weight: 700 !important;
              margin-right: 8px;
              box-shadow: 0 4px 15px rgba(255, 68, 68, 0.5) !important;
              z-index: 99999 !important;
              position: relative !important;
            " title="添加到Job Tracker">🔥 ADD JOB 🔥</button>
            <button id="refresh-btn" style="
              background: rgba(102, 126, 234, 0.1);
              border: none;
              cursor: pointer;
              padding: 8px;
              border-radius: 8px;
              color: #667eea;
              font-size: 14px;
            " title="刷新分析">🔄</button>
            <button id="close-panel" style="
              background: rgba(102, 126, 234, 0.1);
              border: none;
              cursor: pointer;
              padding: 8px;
              border-radius: 8px;
              color: #667eea;
              font-size: 14px;
            " title="关闭">✕</button>
          </div>
        </div>

        ${matchScore ? this.createMatchScoreHTML(matchScore) : ''}

        <div style="margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 6px;">
          <div style="margin-bottom: 8px; font-size: 14px; color: #333;">
            <strong style="color: #1a1a1a;">职位:</strong> ${title}
          </div>
          <div style="margin-bottom: 8px; font-size: 14px; color: #333;">
            <strong style="color: #1a1a1a;">公司:</strong> ${company}
          </div>
          <div style="margin-bottom: 0; font-size: 14px; color: #333;">
            <strong style="color: #1a1a1a;">地点:</strong> ${location}
          </div>
        </div>

        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(0, 0, 0, 0.08);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h4 style="margin: 0; font-size: 18px; font-weight: 700; color: #1a202c;">📝 AI 职位总结</h4>
            <button id="generate-summary" style="
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
              color: #667eea;
              border: 1px solid rgba(102, 126, 234, 0.2);
              border-radius: 8px;
              padding: 10px 18px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
            ">生成总结</button>
          </div>

          <div id="summary-prompt" style="
            text-align: center;
            padding: 24px;
            color: #6b7280;
            font-style: italic;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
            border-radius: 12px;
            border: 1px dashed rgba(102, 126, 234, 0.2);
          ">
            点击"生成总结"获取AI职位分析
          </div>

          <div id="summary-loading" style="
            display: none;
            text-align: center;
            padding: 24px;
            color: #667eea;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
            border-radius: 12px;
          ">
            <div style="display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(102, 126, 234, 0.2); border-top: 3px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 12px;"></div>
            AI正在分析职位信息...
          </div>

          <div id="summary-result" style="display: none;">
            <div id="summary-content" style="
              background: linear-gradient(135deg, #f8fafc, #f1f5f9);
              padding: 20px;
              border-radius: 12px;
              border-left: 4px solid #667eea;
              line-height: 1.7;
              font-size: 14px;
              color: #374151;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
              position: relative;
            "></div>
          </div>
        </div>

        <div style="display: flex; justify-content: center; padding-top: 20px; border-top: 1px solid rgba(0, 0, 0, 0.08); margin-top: 24px;">
          <button id="open-popup" style="
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 16px 24px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
          ">
            📱 打开完整助手
          </button>
        </div>
      </div>

      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  private createMatchScoreHTML(matchScore: MatchScore): string {
    // 检查是否有简历
    if (!matchScore.hasResume) {
      return `
        <div style="margin-bottom: 24px;">
          <div style="
            text-align: center;
            padding: 32px;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.1));
            border: 2px dashed rgba(239, 68, 68, 0.3);
            border-radius: 16px;
            color: #dc2626;
          ">
            <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
            <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">需要简历信息</h3>
            <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.5;">
              ${matchScore.message || '请先设置您的简历信息以获得准确的匹配度分析'}
            </p>
            <button id="setup-resume" style="
              background: linear-gradient(135deg, #dc2626, #b91c1c);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
            ">设置简历信息</button>
          </div>
        </div>
      `;
    }

    const getScoreColor = (score: number) => {
      if (score >= 80) return '#16a34a';
      if (score >= 60) return '#ca8a04';
      return '#dc2626';
    };

    const getScoreBg = (score: number) => {
      if (score >= 80) return 'linear-gradient(135deg, #dcfce7, #bbf7d0)';
      if (score >= 60) return 'linear-gradient(135deg, #fef3c7, #fde68a)';
      return 'linear-gradient(135deg, #fee2e2, #fecaca)';
    };

    return `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px;">
          <div style="
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
            background: ${getScoreBg(matchScore.overall)};
          ">
            <span style="font-size: 28px; font-weight: 800; color: ${getScoreColor(matchScore.overall)};">
              ${matchScore.overall}%
            </span>
          </div>
          <span style="font-size: 14px; color: #4a5568; font-weight: 600;">总体匹配度</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.9));
            border-radius: 12px;
            border: 1px solid rgba(102, 126, 234, 0.1);
          ">
            <span style="color: #667eea; font-size: 18px;">🛠️</span>
            <div style="display: flex; flex-direction: column; flex: 1;">
              <span style="font-size: 12px; color: #6b7280; font-weight: 500; text-transform: uppercase;">技能匹配</span>
              <span style="font-size: 18px; font-weight: 700; margin-top: 4px; color: ${getScoreColor(matchScore.skills)};">
                ${matchScore.skills}%
              </span>
            </div>
          </div>

          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.9));
            border-radius: 12px;
            border: 1px solid rgba(102, 126, 234, 0.1);
          ">
            <span style="color: #667eea; font-size: 18px;">📈</span>
            <div style="display: flex; flex-direction: column; flex: 1;">
              <span style="font-size: 12px; color: #6b7280; font-weight: 500; text-transform: uppercase;">经验匹配</span>
              <span style="font-size: 18px; font-weight: 700; margin-top: 4px; color: ${getScoreColor(matchScore.experience)};">
                ${matchScore.experience}%
              </span>
            </div>
          </div>

          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.9));
            border-radius: 12px;
            border: 1px solid rgba(102, 126, 234, 0.1);
          ">
            <span style="color: #667eea; font-size: 18px;">📍</span>
            <div style="display: flex; flex-direction: column; flex: 1;">
              <span style="font-size: 12px; color: #6b7280; font-weight: 500; text-transform: uppercase;">地点匹配</span>
              <span style="font-size: 18px; font-weight: 700; margin-top: 4px; color: ${getScoreColor(matchScore.location)};">
                ${matchScore.location}%
              </span>
            </div>
          </div>

          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.9));
            border-radius: 12px;
            border: 1px solid rgba(102, 126, 234, 0.1);
          ">
            <span style="color: #667eea; font-size: 18px;">🏢</span>
            <div style="display: flex; flex-direction: column; flex: 1;">
              <span style="font-size: 12px; color: #6b7280; font-weight: 500; text-transform: uppercase;">公司匹配</span>
              <span style="font-size: 18px; font-weight: 700; margin-top: 4px; color: ${getScoreColor(matchScore.company)};">
                ${matchScore.company}%
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private bindSafeEvents() {
    if (!this.panel) return;

    // 语言选择器
    const languageSelector = this.panel.querySelector('#language-selector') as HTMLSelectElement;
    if (languageSelector) {
      languageSelector.value = this.currentLanguage;
      languageSelector.addEventListener('change', (e) => {
        this.currentLanguage = (e.target as HTMLSelectElement).value;
        this.saveLanguagePreference();
        console.log('🌐 语言已切换为:', this.currentLanguage);
      });
    }

    // 设置简历按钮
    const setupResumeBtn = this.panel.querySelector('#setup-resume');
    if (setupResumeBtn) {
      setupResumeBtn.addEventListener('click', () => {
        this.openResumeSetup();
      });
    }

    // 关闭按钮
    const closeBtn = this.panel.querySelector('#close-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.removePanel();
      });
    }

    // Add Job 按钮 - 最重要的功能！
    const addJobBtn = this.panel.querySelector('#add-job-btn');
    if (addJobBtn) {
      addJobBtn.addEventListener('click', () => {
        this.addJobToTracker();
      });
    }

    // 刷新按钮
    const refreshBtn = this.panel.querySelector('#refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.removePanel();
        setTimeout(() => this.createSafePanel(), 500);
      });
    }
  }

  private async calculateMatchScore(jobData: JobData): Promise<MatchScore> {
    try {
      console.log('🔄 开始计算真实匹配度...');
      
      // 检查是否有用户简历
      if (!this.userProfile) {
        console.log('⚠️ 未找到用户简历，返回提示');
        return {
          overall: 0,
          skills: 0,
          experience: 0,
          location: 0,
          company: 0,
          hasResume: false,
          message: '请先设置您的简历信息以获得准确的匹配度分析'
        };
      }

      console.log('📊 基于简历计算匹配度:', this.userProfile);

      // 技能匹配度计算
      const skillsScore = this.calculateSkillsMatch(jobData, this.userProfile);
      
      // 经验匹配度计算  
      const experienceScore = this.calculateExperienceMatch(jobData, this.userProfile);
      
      // 地点匹配度计算
      const locationScore = this.calculateLocationMatch(jobData, this.userProfile);
      
      // 公司匹配度计算
      const companyScore = this.calculateCompanyMatch(jobData, this.userProfile);
      
      // 总体匹配度（加权平均）
      const overall = Math.round(
        (skillsScore * 0.4 + experienceScore * 0.3 + locationScore * 0.2 + companyScore * 0.1)
      );

      const result = {
        overall,
        skills: skillsScore,
        experience: experienceScore,
        location: locationScore,
        company: companyScore,
        hasResume: true
      };

      console.log('✅ 匹配度计算完成:', result);
      return result;

    } catch (error) {
      console.error('❌ 计算匹配度失败:', error);
      return {
        overall: 0,
        skills: 0,
        experience: 0,
        location: 0,
        company: 0,
        hasResume: false,
        message: '匹配度计算出错，请重试'
      };
    }
  }

  private calculateSkillsMatch(jobData: JobData, profile: UserProfile): number {
    try {
      const jobText = (jobData.title + ' ' + jobData.description).toLowerCase();
      const userSkills = profile.skills.map(s => s.toLowerCase());
      
      if (userSkills.length === 0) return 50;
      
      let matchedSkills = 0;
      for (const skill of userSkills) {
        if (jobText.includes(skill)) {
          matchedSkills++;
        }
      }
      
      const score = Math.min(95, Math.round((matchedSkills / userSkills.length) * 100));
      console.log(`🛠️ 技能匹配: ${matchedSkills}/${userSkills.length} = ${score}%`);
      return score;
    } catch {
      return 60;
    }
  }

  private calculateExperienceMatch(jobData: JobData, profile: UserProfile): number {
    try {
      const jobText = jobData.description.toLowerCase();
      const userExp = profile.experience.toLowerCase();
      
      // 简单的经验匹配逻辑
      const experienceKeywords = ['年', 'year', '经验', 'experience', '工作', 'work'];
      let hasExpRequirement = false;
      
      for (const keyword of experienceKeywords) {
        if (jobText.includes(keyword)) {
          hasExpRequirement = true;
          break;
        }
      }
      
      if (!hasExpRequirement) return 80; // 无明确经验要求
      
      // 基于用户经验描述长度和关键词匹配
      const expScore = Math.min(95, 50 + (userExp.length / 20));
      console.log(`📈 经验匹配: ${Math.round(expScore)}%`);
      return Math.round(expScore);
    } catch {
      return 70;
    }
  }

  private calculateLocationMatch(jobData: JobData, profile: UserProfile): number {
    try {
      const jobLocation = jobData.location.toLowerCase();
      const userLocation = profile.location.toLowerCase();
      
      if (!userLocation || !jobLocation) return 60;
      
      // 检查地点匹配
      if (jobLocation.includes('remote') || jobLocation.includes('远程')) return 95;
      if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) return 90;
      
      // 部分匹配逻辑
      const jobTokens = jobLocation.split(/[,\s]+/);
      const userTokens = userLocation.split(/[,\s]+/);
      
      let matches = 0;
      for (const jobToken of jobTokens) {
        for (const userToken of userTokens) {
          if (jobToken.includes(userToken) || userToken.includes(jobToken)) {
            matches++;
            break;
          }
        }
      }
      
      const score = Math.min(85, 30 + (matches * 20));
      console.log(`📍 地点匹配: ${score}%`);
      return score;
    } catch {
      return 60;
    }
  }

  private calculateCompanyMatch(jobData: JobData, profile: UserProfile): number {
    try {
      // 基于公司类型、规模等因素的简单评分
      const company = jobData.company.toLowerCase();
      
      // 知名公司加分
      const bigTech = ['google', 'microsoft', 'amazon', 'apple', 'meta', 'netflix', 'tesla'];
      const localTech = ['字节', 'bytedance', '腾讯', 'tencent', '阿里', 'alibaba', '百度', 'baidu'];
      
      let score = 70; // 基础分
      
      for (const tech of [...bigTech, ...localTech]) {
        if (company.includes(tech)) {
          score = 85;
          break;
        }
      }
      
      console.log(`🏢 公司匹配: ${score}%`);
      return score;
    } catch {
      return 70;
    }
  }

  private extractBasicJobData(): JobData | null {
    try {
      console.log('🔍 开始提取职位数据...');
      
      // 更全面的标题选择器
      const titleSelectors = [
        '.job-details-jobs-unified-top-card__job-title h1',
        '.job-details-jobs-unified-top-card__job-title',
        '.jobs-details-top-card__job-title h1',
        '.jobs-details-top-card__job-title',
        '.jobs-unified-top-card__job-title h1',
        '.jobs-unified-top-card__job-title',
        'h1[data-automation-id="jobTitle"]',
        '.t-24.t-bold.inline'
      ];

      // 更全面的公司名称选择器
      const companySelectors = [
        '.job-details-jobs-unified-top-card__company-name a',
        '.job-details-jobs-unified-top-card__company-name',
        '.jobs-details-top-card__company-url',
        '.jobs-unified-top-card__company-name a',
        '.jobs-unified-top-card__company-name',
        '[data-automation-id="companyName"]'
      ];

      // 更全面的地点选择器
      const locationSelectors = [
        '.job-details-jobs-unified-top-card__bullet',
        '.jobs-details-top-card__bullet',
        '.jobs-unified-top-card__bullet',
        '[data-automation-id="jobLocation"]',
        '.jobs-unified-top-card__subtitle-primary-grouping .t-black--light'
      ];

      // 描述选择器
      const descriptionSelectors = [
        '.jobs-description-content__text',
        '.jobs-box__html-content',
        '.jobs-description__content',
        '[data-automation-id="jobDescription"]',
        '.jobs-description'
      ];

      const title = this.getTextFromSelectors(titleSelectors) || 'LinkedIn 职位';
      const company = this.getTextFromSelectors(companySelectors) || '未知公司';
      const location = this.getTextFromSelectors(locationSelectors) || '未知地点';
      const description = this.getTextFromSelectors(descriptionSelectors) || '暂无描述';

      console.log('✅ 职位数据提取完成:', { title, company, location });

      return {
        title,
        company,
        location,
        description: description.substring(0, 1000), // 限制描述长度
        url: window.location.href
      };
    } catch (error) {
      console.error('❌ 提取职位数据失败:', error);
      return null;
    }
  }

  // 这个方法是 addJobToTracker 中调用的
  private extractJobData(): JobData | null {
    return this.extractBasicJobData();
  }

  private getTextFromSelectors(selectors: string[]): string | null {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          return element.textContent.trim();
        }
      } catch (error) {
        // 忽略选择器错误，继续尝试下一个
        continue;
      }
    }
    return null;
  }

  private removePanel() {
    if (this.panel) {
      console.log('🗑️ 移除安全面板');
      this.panel.remove();
      this.panel = null;
    }
  }
}

// 启动安全版本助手
setTimeout(() => {
  new SafeLinkedInAssistant();
}, 1000); // 延迟1秒启动，确保页面加载完成