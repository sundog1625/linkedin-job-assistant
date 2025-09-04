// LinkedIn Job Assistant - 职位分析器
console.log('🚀 LinkedIn Job Assistant 职位分析器已加载');

class LinkedInJobAnalyzer {
  constructor() {
    this.panel = null;
    this.isInitialized = false;
    this.lastUrl = '';
    this.userProfile = null;
    this.currentLanguage = 'zh-CN';
    
    this.loadUserProfile();
    this.loadLanguagePreference();
    this.init();
  }


  async loadUserProfile() {
    try {
      console.log('📋 正在加载用户简历信息...');
      
      // 首先尝试从本地存储获取
      const stored = await chrome.storage.local.get('userProfile');
      
      // 然后尝试从Dashboard API获取最新信息
      try {
        console.log('🌐 正在调用Dashboard API...');
        const response = await fetch('https://linkedin-job-assistant-dashboard-w7.vercel.app/api/user-profile');
        console.log('📡 API响应状态:', response.status, response.statusText);
        
        const result = await response.json();
        console.log('📋 API返回原始数据:', JSON.stringify(result, null, 2));
        
        if (result.success && result.profile) {
          console.log('✅ 从Dashboard获取用户简历:', result.profile);
          
          // 转换为扩展需要的格式
          this.userProfile = {
            skills: result.profile.skills || [],
            experience: result.profile.experience || '',
            education: result.profile.education || '',
            location: result.profile.location || '',
            preferredRoles: result.profile.preferredRoles || [],
            languages: result.profile.languages || []
          };
          
          console.log('🔄 转换后的用户资料:', JSON.stringify(this.userProfile, null, 2));
          
          // 保存到本地存储以备缓存
          await chrome.storage.local.set({ 'userProfile': this.userProfile });
          console.log('✅ 简历信息已更新到本地缓存');
          
        } else if (result.needsSetup) {
          console.log('⚠️ 需要设置简历:', result.message);
          this.userProfile = null;
          // 清除本地缓存
          await chrome.storage.local.remove('userProfile');
        } else {
          console.error('❌ API响应格式错误:', result);
          throw new Error(result.message || 'Dashboard API响应异常');
        }
        
      } catch (apiError) {
        console.error('❌ 从Dashboard获取简历失败:', apiError);
        console.log('📂 尝试使用本地缓存...');
        this.userProfile = stored.userProfile || null;
      }
      
      console.log('📋 最终用户资料:', this.userProfile ? '已加载' : '未设置');
      if (this.userProfile) {
        console.log('👤 用户技能:', this.userProfile.skills);
        console.log('📍 用户地点:', this.userProfile.location);
      }
      
    } catch (error) {
      console.error('❌ 加载用户资料失败:', error);
      this.userProfile = null;
    }
  }

  async loadLanguagePreference() {
    try {
      const stored = await chrome.storage.local.get('preferredLanguage');
      this.currentLanguage = stored.preferredLanguage || 'zh-CN';
      console.log('🌐 语言设置:', this.currentLanguage);
    } catch (error) {
      console.error('❌ 加载语言设置失败:', error);
    }
  }

  async saveLanguagePreference() {
    try {
      await chrome.storage.local.set({ 'preferredLanguage': this.currentLanguage });
      console.log('✅ 语言设置已保存:', this.currentLanguage);
    } catch (error) {
      console.error('❌ 保存语言设置失败:', error);
    }
  }

  openResumeSetup() {
    try {
      console.log('🚀 跳转到Dashboard简历设置');
      const dashboardUrl = 'https://linkedin-job-assistant-dashboard-w7.vercel.app/resume?setup=true';
      window.open(dashboardUrl, '_blank');
    } catch (error) {
      console.error('❌ 打开Dashboard失败:', error);
      alert('请点击浏览器工具栏中的扩展图标来设置简历信息');
    }
  }

  async addJobToTracker() {
    try {
      console.log('📝 添加职位到Job Tracker...');
      
      const jobData = this.extractJobData();
      if (!jobData) {
        console.error('❌ 无法获取职位信息');
        alert('无法获取当前职位信息，请刷新页面重试');
        return;
      }

      const applicantCount = this.extractApplicantCount();
      const matchScore = await this.calculateMatchScore(jobData);
      
      const fullJobData = {
        ...jobData,
        applicant_count: applicantCount,
        match_score: matchScore,
        status: 'saved',
        posted_date: this.extractPostedDate(),
        saved_at: new Date().toISOString()
      };

      console.log('📋 职位数据准备完成:', fullJobData);

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
        this.showSuccessMessage('职位已成功添加到你的Job Tracker！');
      } else {
        throw new Error(result.error || '保存失败');
      }

    } catch (error) {
      console.error('❌ 添加职位失败:', error);
      alert('添加职位失败，请重试');
    }
  }

  extractApplicantCount() {
    try {
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

  extractPostedDate() {
    try {
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

  showSuccessMessage(message) {
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
        ">
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
        ">
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

    const viewTrackerBtn = card.querySelector('#view-tracker');
    const continueBrowsingBtn = card.querySelector('#continue-browsing');

    viewTrackerBtn?.addEventListener('click', () => {
      window.open('https://linkedin-job-assistant-dashboard-w7.vercel.app/jobs', '_blank');
      overlay.remove();
      style.remove();
    });

    continueBrowsingBtn?.addEventListener('click', () => {
      overlay.remove();
      style.remove();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        style.remove();
      }
    });

    setTimeout(() => {
      overlay.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        overlay.remove();
        style.remove();
      }, 300);
    }, 5000);
  }

  init() {
    console.log('🔍 初始化职位分析器...');
    
    this.checkCurrentPage();
    
    window.addEventListener('popstate', () => {
      setTimeout(() => this.checkCurrentPage(), 1000);
    });
    
    setInterval(() => {
      this.checkCurrentPage();
    }, 5000);
  }

  checkCurrentPage() {
    const currentUrl = window.location.href;
    
    if (currentUrl === this.lastUrl) {
      return;
    }
    
    this.lastUrl = currentUrl;
    console.log('🔍 检查当前页面:', currentUrl);
    
    if (this.isJobPage()) {
      if (!this.panel) {
        console.log('✅ 检测到职位页面，创建面板');
        this.createJobPanel();
      }
    } else {
      if (this.panel) {
        console.log('❌ 不是职位页面，移除面板');
        this.removePanel();
      }
    }
  }

  isJobPage() {
    const url = window.location.href;
    return url.includes('/jobs/view/') || 
           url.includes('/jobs/collections/') || 
           url.includes('currentJobId=');
  }

  async createJobPanel() {
    try {
      console.log('🔄 开始创建职位分析面板...');
      
      if (window.innerWidth < 1200) {
        console.log('⚠️ 页面宽度不足，跳过面板创建');
        return;
      }

      // 确保简历数据已加载
      if (!this.userProfile) {
        console.log('⏳ 简历数据未加载完成，等待加载...');
        await this.loadUserProfile();
      }

      const jobData = this.extractJobData();
      const matchScore = jobData ? await this.calculateMatchScore(jobData) : null;

      this.panel = document.createElement('div');
      this.panel.id = 'linkedin-job-analyzer-panel';
      
      this.panel.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        width: 420px;
        max-height: calc(100vh - 140px);
        z-index: 99999 !important;
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 20px;
        box-shadow: 
          0 32px 64px rgba(0, 0, 0, 0.15),
          0 16px 32px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
        padding: 28px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Helvetica, Arial, sans-serif;
        font-size: 14px;
        font-weight: 400;
        overflow-y: auto;
        backdrop-filter: blur(40px) saturate(180%);
        -webkit-backdrop-filter: blur(40px) saturate(180%);
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      `;

      this.panel.innerHTML = this.createPanelHTML(jobData, matchScore);
      this.bindEvents();
      document.body.appendChild(this.panel);
      
      console.log('✅ 职位分析面板创建成功');

    } catch (error) {
      console.error('❌ 创建面板失败:', error);
    }
  }

  createPanelHTML(jobData, matchScore) {
    const title = jobData?.title || 'LinkedIn 职位';
    const company = jobData?.company || '未知公司';
    const location = jobData?.location || '未知地点';

    return `
      <div style="position: relative;">
        <!-- Header with Apple-style design -->
        <div style="
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 24px; 
          padding-bottom: 20px; 
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(20px);
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              width: 44px;
              height: 44px;
              background: linear-gradient(135deg, #007AFF, #5856D6);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
            ">
              <span style="font-size: 20px;">🎯</span>
            </div>
            <div>
              <h3 style="
                margin: 0; 
                font-size: 22px; 
                font-weight: 700; 
                color: #1d1d1f;
                letter-spacing: -0.5px;
              ">职位匹配分析</h3>
              <p style="
                margin: 2px 0 0 0;
                font-size: 14px;
                color: #6e6e73;
                font-weight: 400;
              ">AI智能匹配评估</p>
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button id="add-job-btn" style="
              background: linear-gradient(135deg, #FF3B30, #FF6B6B);
              border: none;
              cursor: pointer;
              padding: 12px 20px;
              border-radius: 16px;
              color: white;
              font-size: 15px;
              font-weight: 600;
              font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
              box-shadow: 0 8px 24px rgba(255, 59, 48, 0.4);
              transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
              backdrop-filter: blur(10px);
            " title="添加到Job Tracker" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 32px rgba(255, 59, 48, 0.5)'" onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 8px 24px rgba(255, 59, 48, 0.4)'">
              ⚡ 保存职位
            </button>
            <button id="refresh-btn" style="
              background: rgba(255, 255, 255, 0.6);
              border: 1px solid rgba(255, 255, 255, 0.3);
              cursor: pointer;
              padding: 10px;
              border-radius: 12px;
              color: #007AFF;
              font-size: 16px;
              backdrop-filter: blur(10px);
              transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            " title="刷新分析" onmouseover="this.style.background='rgba(255, 255, 255, 0.8)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.6)'">🔄</button>
            <button id="close-panel" style="
              background: rgba(255, 255, 255, 0.6);
              border: 1px solid rgba(255, 255, 255, 0.3);
              cursor: pointer;
              padding: 10px;
              border-radius: 12px;
              color: #FF3B30;
              font-size: 16px;
              backdrop-filter: blur(10px);
              transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            " title="关闭" onmouseover="this.style.background='rgba(255, 255, 255, 0.8)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.6)'">✕</button>
          </div>
        </div>

        ${matchScore ? this.createMatchScoreHTML(matchScore) : ''}

        <!-- Job Info Card -->
        <div style="
          margin-bottom: 20px; 
          padding: 20px; 
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="
              width: 36px;
              height: 36px;
              background: linear-gradient(135deg, #34C759, #30D158);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 3px 8px rgba(52, 199, 89, 0.3);
            ">
              <span style="font-size: 16px;">💼</span>
            </div>
            <h4 style="
              margin: 0;
              font-size: 18px;
              font-weight: 600;
              color: #1d1d1f;
              letter-spacing: -0.3px;
            ">职位信息</h4>
          </div>
          <div style="space-y: 12px;">
            <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span style="color: #007AFF; font-size: 14px;">📋</span>
              <span style="font-size: 15px; color: #1d1d1f; font-weight: 500;">${title}</span>
            </div>
            <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span style="color: #FF9500; font-size: 14px;">🏢</span>
              <span style="font-size: 15px; color: #1d1d1f; font-weight: 500;">${company}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #5856D6; font-size: 14px;">📍</span>
              <span style="font-size: 15px; color: #1d1d1f; font-weight: 500;">${location}</span>
            </div>
          </div>
        </div>

        ${this.userProfile ? this.createResumeInfoHTML(this.userProfile) : ''}

        <div style="display: flex; justify-content: center; padding-top: 20px; border-top: 1px solid rgba(0, 0, 0, 0.08); margin-top: 24px;">
          <button id="open-dashboard" style="
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
            📊 打开Job Tracker
          </button>
        </div>
      </div>
    `;
  }

  createMatchScoreHTML(matchScore) {
    if (!matchScore.hasResume) {
      return `
        <div style="margin-bottom: 24px;">
          <div style="
            text-align: center;
            padding: 32px;
            background: rgba(255, 59, 48, 0.08);
            border: 1px solid rgba(255, 59, 48, 0.2);
            border-radius: 20px;
            backdrop-filter: blur(20px);
            box-shadow: 0 8px 32px rgba(255, 59, 48, 0.1);
          ">
            <div style="
              width: 64px;
              height: 64px;
              background: linear-gradient(135deg, #FF3B30, #FF6B6B);
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              box-shadow: 0 8px 24px rgba(255, 59, 48, 0.3);
            ">
              <span style="font-size: 28px;">📋</span>
            </div>
            <h3 style="
              margin: 0 0 12px 0; 
              font-size: 20px; 
              font-weight: 700; 
              color: #1d1d1f;
              letter-spacing: -0.4px;
            ">需要简历信息</h3>
            <p style="
              margin: 0 0 24px 0; 
              color: #6e6e73; 
              line-height: 1.6;
              font-size: 16px;
              font-weight: 400;
            ">
              ${matchScore.message || '请先设置您的简历信息以获得准确的匹配度分析'}
            </p>
            <button id="setup-resume" style="
              background: linear-gradient(135deg, #FF3B30, #FF6B6B);
              color: white;
              border: none;
              padding: 14px 28px;
              border-radius: 16px;
              font-weight: 600;
              font-size: 16px;
              cursor: pointer;
              font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
              box-shadow: 0 8px 24px rgba(255, 59, 48, 0.4);
              transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
              backdrop-filter: blur(10px);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 32px rgba(255, 59, 48, 0.5)'" onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 8px 24px rgba(255, 59, 48, 0.4)'">
              🚀 设置简历信息
            </button>
          </div>
        </div>
      `;
    }

    const getScoreColor = (score) => {
      if (score >= 80) return '#34C759';
      if (score >= 60) return '#FF9500';
      return '#FF3B30';
    };

    const getScoreGradient = (score) => {
      if (score >= 80) return 'linear-gradient(135deg, #34C759, #30D158)';
      if (score >= 60) return 'linear-gradient(135deg, #FF9500, #FFCC02)';
      return 'linear-gradient(135deg, #FF3B30, #FF6B6B)';
    };

    const createCircularProgress = (score, color) => {
      const circumference = 2 * Math.PI * 45; // radius = 45
      const offset = circumference - (score / 100) * circumference;
      
      return `
        <svg width="120" height="120" style="transform: rotate(-90deg);">
          <circle cx="60" cy="60" r="45" stroke="rgba(255, 255, 255, 0.2)" stroke-width="8" fill="transparent"/>
          <circle cx="60" cy="60" r="45" stroke="${color}" stroke-width="8" fill="transparent"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                  stroke-linecap="round"
                  style="transition: stroke-dashoffset 1s ease-in-out"/>
          <text x="60" y="70" text-anchor="middle" fill="${color}" font-size="24" font-weight="700" 
                font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
                style="transform: rotate(90deg); transform-origin: 60px 60px;">${score}%</text>
        </svg>
      `;
    };

    return `
      <div style="margin-bottom: 28px;">
        <!-- Overall Score -->
        <div style="
          text-align: center;
          padding: 24px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        ">
          <div style="margin-bottom: 16px;">
            ${createCircularProgress(matchScore.overall, getScoreColor(matchScore.overall))}
          </div>
          <h4 style="
            margin: 0 0 8px 0;
            font-size: 20px;
            font-weight: 700;
            color: #1d1d1f;
            letter-spacing: -0.4px;
          ">总体匹配度</h4>
          <p style="
            margin: 0;
            font-size: 15px;
            color: #6e6e73;
            font-weight: 500;
          ">基于您的简历智能分析</p>
        </div>

        <!-- Sub Scores Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="
            padding: 18px;
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 16px;
            backdrop-filter: blur(20px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0, 0, 0, 0.12)'" onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 4px 16px rgba(0, 0, 0, 0.08)'">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #007AFF, #5856D6);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 8px rgba(0, 122, 255, 0.3);
              ">
                <span style="font-size: 16px;">🛠️</span>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 13px; color: #6e6e73; font-weight: 500; margin-bottom: 4px;">技能匹配</div>
                <div style="font-size: 20px; font-weight: 700; color: ${getScoreColor(matchScore.skills)}; letter-spacing: -0.5px;">
                  ${matchScore.skills}%
                </div>
              </div>
            </div>
          </div>

          <div style="
            padding: 18px;
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 16px;
            backdrop-filter: blur(20px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0, 0, 0, 0.12)'" onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 4px 16px rgba(0, 0, 0, 0.08)'">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #34C759, #30D158);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 8px rgba(52, 199, 89, 0.3);
              ">
                <span style="font-size: 16px;">📈</span>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 13px; color: #6e6e73; font-weight: 500; margin-bottom: 4px;">经验匹配</div>
                <div style="font-size: 20px; font-weight: 700; color: ${getScoreColor(matchScore.experience)}; letter-spacing: -0.5px;">
                  ${matchScore.experience}%
                </div>
              </div>
            </div>
          </div>

          <div style="
            padding: 18px;
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 16px;
            backdrop-filter: blur(20px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0, 0, 0, 0.12)'" onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 4px 16px rgba(0, 0, 0, 0.08)'">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #5856D6, #AF52DE);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 8px rgba(88, 86, 214, 0.3);
              ">
                <span style="font-size: 16px;">📍</span>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 13px; color: #6e6e73; font-weight: 500; margin-bottom: 4px;">地点匹配</div>
                <div style="font-size: 20px; font-weight: 700; color: ${getScoreColor(matchScore.location)}; letter-spacing: -0.5px;">
                  ${matchScore.location}%
                </div>
              </div>
            </div>
          </div>

          <div style="
            padding: 18px;
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 16px;
            backdrop-filter: blur(20px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0, 0, 0, 0.12)'" onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 4px 16px rgba(0, 0, 0, 0.08)'">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #FF9500, #FFCC02);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 8px rgba(255, 149, 0, 0.3);
              ">
                <span style="font-size: 16px;">🏢</span>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 13px; color: #6e6e73; font-weight: 500; margin-bottom: 4px;">公司匹配</div>
                <div style="font-size: 20px; font-weight: 700; color: ${getScoreColor(matchScore.company)}; letter-spacing: -0.5px;">
                  ${matchScore.company}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createResumeInfoHTML(userProfile) {
    return `
      <div style="
        margin-bottom: 28px; 
        padding: 24px; 
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 20px;
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      ">
        <div style="
          display: flex; 
          align-items: center; 
          margin-bottom: 20px;
        ">
          <div style="
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #007AFF, #5856D6);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
            margin-right: 16px;
          ">
            <span style="font-size: 20px;">👤</span>
          </div>
          <h4 style="
            margin: 0; 
            font-size: 20px; 
            font-weight: 700; 
            color: #1d1d1f;
            letter-spacing: -0.4px;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          ">简历信息</h4>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
          <div style="
            padding: 16px;
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            backdrop-filter: blur(10px);
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #34C759, #30D158);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
              ">
                <span style="font-size: 14px;">📍</span>
              </div>
              <div>
                <div style="font-size: 13px; color: #6e6e73; font-weight: 500; margin-bottom: 2px;">地点</div>
                <div style="font-size: 15px; font-weight: 600; color: #1d1d1f;">${userProfile.location || '未设置'}</div>
              </div>
            </div>
          </div>
          
          <div style="
            padding: 16px;
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            backdrop-filter: blur(10px);
          ">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #007AFF, #5856D6);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
                margin-top: 2px;
              ">
                <span style="font-size: 14px;">🛠️</span>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 13px; color: #6e6e73; font-weight: 500; margin-bottom: 8px;">核心技能</div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${(userProfile.skills || []).slice(0, 6).map(skill => 
                    `<span style="
                      background: rgba(0, 122, 255, 0.1);
                      color: #007AFF;
                      padding: 6px 12px;
                      border-radius: 20px;
                      font-size: 12px;
                      font-weight: 600;
                      border: 1px solid rgba(0, 122, 255, 0.2);
                      backdrop-filter: blur(10px);
                    ">${skill}</span>`
                  ).join('')}
                  ${(userProfile.skills || []).length > 6 ? 
                    `<span style="
                      color: #8e8e93; 
                      font-size: 12px; 
                      font-weight: 500;
                      align-self: center;
                    ">+${(userProfile.skills || []).length - 6}个</span>` : 
                    ''
                  }
                </div>
              </div>
            </div>
          </div>
          
          <div style="
            padding: 16px;
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            backdrop-filter: blur(10px);
          ">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #FF9500, #FF6B35);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(255, 149, 0, 0.3);
                margin-top: 2px;
              ">
                <span style="font-size: 14px;">📋</span>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 13px; color: #6e6e73; font-weight: 500; margin-bottom: 8px;">工作经验</div>
                <p style="
                  margin: 0; 
                  font-size: 13px; 
                  color: #1d1d1f; 
                  line-height: 1.5; 
                  max-height: 60px; 
                  overflow: hidden;
                  font-weight: 400;
                ">
                  ${userProfile.experience || '未设置经验描述'}
                </p>
              </div>
            </div>
          </div>
          
          <div style="
            padding: 16px;
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            backdrop-filter: blur(10px);
          ">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #34C759, #30D158);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
                margin-top: 2px;
              ">
                <span style="font-size: 14px;">🎯</span>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 13px; color: #6e6e73; font-weight: 500; margin-bottom: 8px;">意向职位</div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${(userProfile.preferredRoles || []).map(role => 
                    `<span style="
                      background: rgba(52, 199, 89, 0.1);
                      color: #34C759;
                      padding: 6px 12px;
                      border-radius: 20px;
                      font-size: 12px;
                      font-weight: 600;
                      border: 1px solid rgba(52, 199, 89, 0.2);
                      backdrop-filter: blur(10px);
                    ">${role}</span>`
                  ).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div style="
          margin-top: 20px; 
          padding-top: 20px; 
          border-top: 1px solid rgba(255, 255, 255, 0.2); 
          text-align: center;
        ">
          <button id="edit-resume" style="
            background: rgba(0, 122, 255, 0.1);
            color: #007AFF;
            border: 1px solid rgba(0, 122, 255, 0.2);
            padding: 12px 24px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            backdrop-filter: blur(10px);
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
            letter-spacing: -0.2px;
          " onmouseover="this.style.background='rgba(0, 122, 255, 0.15)'; this.style.transform='scale(1.02)'" onmouseout="this.style.background='rgba(0, 122, 255, 0.1)'; this.style.transform='scale(1)'">✏️ 编辑简历</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    if (!this.panel) return;

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

    // Add Job 按钮
    const addJobBtn = this.panel.querySelector('#add-job-btn');
    if (addJobBtn) {
      addJobBtn.addEventListener('click', () => {
        this.addJobToTracker();
      });
    }

    // 编辑简历按钮
    const editResumeBtn = this.panel.querySelector('#edit-resume');
    if (editResumeBtn) {
      editResumeBtn.addEventListener('click', () => {
        this.openResumeSetup();
      });
    }


    // 刷新按钮 - 刷新简历信息和分析
    const refreshBtn = this.panel.querySelector('#refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        console.log('🔄 刷新分析面板...');
        refreshBtn.innerHTML = '⏳';
        refreshBtn.disabled = true;
        
        // 重新加载简历信息
        await this.loadUserProfile();
        
        refreshBtn.innerHTML = '🔄';
        refreshBtn.disabled = false;
        
        // 刷新面板显示
        this.removePanel();
        setTimeout(() => this.createJobPanel(), 300);
      });
    }

    // 打开Dashboard按钮
    const openDashboardBtn = this.panel.querySelector('#open-dashboard');
    if (openDashboardBtn) {
      openDashboardBtn.addEventListener('click', () => {
        window.open('https://linkedin-job-assistant-dashboard-w7.vercel.app/jobs', '_blank');
      });
    }
  }

  async calculateMatchScore(jobData) {
    try {
      console.log('🔄 开始计算匹配度...');
      console.log('📋 当前用户简历状态:', this.userProfile);
      
      // 检查用户简历是否存在且有效
      if (!this.userProfile) {
        console.log('⚠️ userProfile为null');
        return {
          overall: 0,
          skills: 0,
          experience: 0,
          location: 0,
          company: 0,
          hasResume: false,
          message: '未找到用户简历信息，请先设置您的简历'
        };
      }
      
      // 检查简历是否有有效数据
      const hasValidData = (
        (this.userProfile.skills && this.userProfile.skills.length > 0) ||
        (this.userProfile.experience && this.userProfile.experience.trim() !== '') ||
        (this.userProfile.location && this.userProfile.location.trim() !== '')
      );
      
      if (!hasValidData) {
        console.log('⚠️ 简历数据为空:', this.userProfile);
        return {
          overall: 0,
          skills: 0,
          experience: 0,
          location: 0,
          company: 0,
          hasResume: false,
          message: '简历信息为空，请完善您的简历信息'
        };
      }

      console.log('📊 基于简历计算匹配度:', this.userProfile);

      const skillsScore = this.calculateSkillsMatch(jobData, this.userProfile);
      const experienceScore = this.calculateExperienceMatch(jobData, this.userProfile);
      const locationScore = this.calculateLocationMatch(jobData, this.userProfile);
      const companyScore = this.calculateCompanyMatch(jobData, this.userProfile);
      
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

  calculateSkillsMatch(jobData, profile) {
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

  calculateExperienceMatch(jobData, profile) {
    try {
      const jobText = jobData.description.toLowerCase();
      const userExp = profile.experience.toLowerCase();
      
      const experienceKeywords = ['年', 'year', '经验', 'experience', '工作', 'work'];
      let hasExpRequirement = false;
      
      for (const keyword of experienceKeywords) {
        if (jobText.includes(keyword)) {
          hasExpRequirement = true;
          break;
        }
      }
      
      if (!hasExpRequirement) return 80;
      
      const expScore = Math.min(95, 50 + (userExp.length / 20));
      console.log(`📈 经验匹配: ${Math.round(expScore)}%`);
      return Math.round(expScore);
    } catch {
      return 70;
    }
  }

  calculateLocationMatch(jobData, profile) {
    try {
      const jobLocation = jobData.location.toLowerCase();
      const userLocation = profile.location.toLowerCase();
      
      if (!userLocation || !jobLocation) return 60;
      
      if (jobLocation.includes('remote') || jobLocation.includes('远程')) return 95;
      if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) return 90;
      
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

  calculateCompanyMatch(jobData, profile) {
    try {
      const company = jobData.company.toLowerCase();
      
      const bigTech = ['google', 'microsoft', 'amazon', 'apple', 'meta', 'netflix', 'tesla'];
      const localTech = ['字节', 'bytedance', '腾讯', 'tencent', '阿里', 'alibaba', '百度', 'baidu'];
      
      let score = 70;
      
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

  extractJobData() {
    try {
      console.log('🔍 开始提取职位数据...');
      
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

      const companySelectors = [
        '.job-details-jobs-unified-top-card__company-name a',
        '.job-details-jobs-unified-top-card__company-name',
        '.jobs-details-top-card__company-url',
        '.jobs-unified-top-card__company-name a',
        '.jobs-unified-top-card__company-name',
        '[data-automation-id="companyName"]'
      ];

      const locationSelectors = [
        '.job-details-jobs-unified-top-card__bullet',
        '.jobs-details-top-card__bullet',
        '.jobs-unified-top-card__bullet',
        '[data-automation-id="jobLocation"]',
        '.jobs-unified-top-card__subtitle-primary-grouping .t-black--light'
      ];

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
        description: description.substring(0, 1000),
        url: window.location.href
      };
    } catch (error) {
      console.error('❌ 提取职位数据失败:', error);
      return null;
    }
  }

  getTextFromSelectors(selectors) {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          return element.textContent.trim();
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  }

  removePanel() {
    if (this.panel) {
      console.log('🗑️ 移除职位分析面板');
      this.panel.remove();
      this.panel = null;
    }
  }
}

// 启动职位分析器
setTimeout(() => {
  new LinkedInJobAnalyzer();
}, 1000);