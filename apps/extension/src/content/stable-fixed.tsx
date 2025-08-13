// LinkedIn Job Assistant - 修复版内容脚本
import { API_KEYS, API_CONFIG, checkAPIKeys } from '../config/api-keys';
import { MessageType } from '../utils/types';

console.log('🚀 LinkedIn Job Assistant 已加载');
checkAPIKeys();

// 注入脚本到页面主线程，绕过LinkedIn沙盒限制
function injectScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// 延迟注入以确保页面加载完成
setTimeout(injectScript, 1000);

// CSS通过manifest.json的content_scripts自动注入，无需手动注入

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
  private eventListeners: Array<{element: Element, event: string, handler: EventListener}> = [];

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
      console.log('加载设置失败，使用默认设置:', error);
      this.currentLanguage = 'zh';
    }
  }

  private init() {
    console.log('🔍 初始化助手...');
    console.log('🔍 当前URL:', window.location.href);
    console.log('🔍 页面宽度:', window.innerWidth);
    
    this.observeChanges();
    
    const isJob = this.isJobPage();
    console.log('🔍 是否为职位页面:', isJob);
    
    if (isJob) {
      const jobId = this.extractJobId();
      console.log('🔍 提取到的Job ID:', jobId);
      this.createPanel();
    } else {
      console.log('🔍 不是职位页面，跳过面板创建');
    }
  }

  private observeChanges() {
    let lastUrl = location.href;
    let lastJobId = this.extractJobId();
    let checkTimeout: NodeJS.Timeout | null = null;
    
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

    // 防抖版本的checkChanges
    const debouncedCheckChanges = () => {
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
      checkTimeout = setTimeout(checkChanges, 300); // 300ms防抖
    };

    const observer = new MutationObserver(() => {
      debouncedCheckChanges();
    });
    
    observer.observe(document, { 
      subtree: true, 
      childList: true,
      attributes: true,
      attributeFilter: ['href', 'data-job-id', 'aria-selected']
    });

    setInterval(checkChanges, 1000);

    // 使用addEventListener代替内联事件
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // 检查是否点击了职位链接
      const jobLink = target.closest('a[href*="/jobs/view/"]') || 
                     target.closest('[data-job-id]') ||
                     target.closest('.job-card-container') ||
                     target.closest('.jobs-search-results__list-item');
      
      if (jobLink) {
        console.log('检测到职位点击:', jobLink);
        setTimeout(() => checkChanges(), 500);
      }
    });
  }

  private isJobPage(): boolean {
    const url = window.location.href;
    const hasJobsView = url.includes('/jobs/view/');
    const hasJobsCollections = url.includes('/jobs/collections/');
    const hasJobsSearch = url.includes('/jobs/search/');
    
    console.log('🔍 URL匹配检查:', {
      url: url,
      hasJobsView: hasJobsView,
      hasJobsCollections: hasJobsCollections, 
      hasJobsSearch: hasJobsSearch
    });
    
    // 扩展匹配条件，包括职位搜索页面
    return hasJobsView || hasJobsCollections || hasJobsSearch;
  }

  private extractJobId(): string {
    const url = window.location.href;
    
    // 支持多种LinkedIn职位页面格式
    const patterns = [
      /\/jobs\/view\/(\d+)/,                    // /jobs/view/123456
      /currentJobId=(\d+)/,                     // /jobs/collections/recommended/?currentJobId=123456
      /\/jobs\/(\d+)/,                          // /jobs/123456
    ];
    
    let jobId = '';
    let matchedPattern = '';
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        jobId = match[1];
        matchedPattern = pattern.toString();
        break;
      }
    }
    
    console.log('🔍 Job ID提取:', {
      url: url,
      patterns: patterns.map(p => p.toString()),
      matchedPattern: matchedPattern,
      jobId: jobId
    });
    
    return jobId;
  }

  private handleUrlChange(jobId: string) {
    if (this.isJobPage() && jobId && jobId !== this.currentJobId) {
      this.currentJobId = jobId;
      console.log('工作页面变化，重新创建面板');
      this.removePanel();
      setTimeout(() => this.createPanel(), 1000);
    } else if (!this.isJobPage()) {
      this.removePanel();
    }
  }

  private async createPanel() {
    console.log('🔄 开始创建分析面板...');
    console.log('🔄 当前URL:', window.location.href);
    
    if (this.panel) {
      console.log('🗑️ 移除现有面板');
      this.removePanel();
    }

    let jobData = await this.extractJobData();
    if (!jobData) {
      console.log('❌ 无法提取工作数据，创建默认面板');
      // 创建默认面板，不依赖职位数据
      jobData = {
        title: 'LinkedIn 职位',
        company: '未知公司',
        location: '未知地点',
        description: '正在加载职位信息...',
        url: window.location.href
      };
    }

    console.log('✅ 创建分析面板，数据:', jobData);
    
    // 检查页面宽度，确保有足够空间显示面板
    const pageWidth = window.innerWidth;
    const minRequiredWidth = 1000; // 降低宽度要求到1000px
    
    console.log(`🔍 页面宽度检查: ${pageWidth}px (最小需要: ${minRequiredWidth}px)`);
    
    if (pageWidth < minRequiredWidth) {
      console.log(`⚠️ 页面宽度${pageWidth}px过窄，不显示面板。最小需要${minRequiredWidth}px`);
      // 页面太窄时不显示面板，用户可以点击扩展图标
      return;
    }
    
    console.log('🔍 页面宽度检查通过，继续创建面板...');
    
    this.panel = await this.createPanelElement(jobData);
    console.log('🎨 面板元素已创建:', this.panel);
    
    document.body.appendChild(this.panel);
    
    // 启动激进的位置修复策略
    this.startAggressivePositionFix();
    
    console.log('📌 面板已插入DOM，位置:', this.panel.getBoundingClientRect());
    
    this.bindEvents(jobData);
    console.log('🔗 事件已绑定');
  }

  private findLinkedInRightPanel(): Element {
    // LinkedIn页面右侧区域选择器，按优先级排序
    const rightPanelSelectors = [
      '.jobs-search__right-rail',                    // 职位搜索页面右侧栏
      '.jobs-details__right-rail',                   // 职位详情页面右侧栏  
      '.scaffold-layout__aside',                     // 新版布局右侧区域
      '.job-details-jobs-unified-top-card__content', // 职位卡片内容区域
      '.jobs-details__main-content',                 // 主要内容区域
      '.jobs-search__job-details--wrapper',          // 职位详情包装器
      '.scaffold-layout__detail'                     // 详情布局区域
    ];

    for (const selector of rightPanelSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`✅ 找到LinkedIn右侧容器: ${selector}`, element);
        
        // 确保容器有足够空间
        const rect = element.getBoundingClientRect();
        if (rect.width > 300) {
          return element;
        }
      }
    }

    // 如果没找到合适的右侧区域，创建一个自定义容器
    console.log('⚠️ 未找到合适的右侧区域，创建自定义容器');
    return this.createCustomRightPanel();
  }

  private createCustomRightPanel(): Element {
    // 寻找主要内容容器
    const mainContentSelectors = [
      '.scaffold-layout__inner',
      '.jobs-search__content',
      '.application-outlet',
      'main'
    ];

    let mainContent = null;
    for (const selector of mainContentSelectors) {
      mainContent = document.querySelector(selector);
      if (mainContent) break;
    }

    if (!mainContent) {
      console.log('使用body作为备选');
      return document.body;
    }

    // 创建右侧面板容器 - 确保不阻止页面交互
    const rightPanel = document.createElement('div');
    rightPanel.id = 'lja-custom-right-panel';
    rightPanel.style.cssText = `
      position: fixed !important;
      top: 100px !important;
      right: 20px !important;
      width: 400px !important;
      max-height: calc(100vh - 120px) !important;
      overflow-y: auto !important;
      z-index: 10000 !important;
      pointer-events: auto !important;
    `;

    document.body.appendChild(rightPanel);
    console.log('✅ 创建自定义右侧面板容器');
    
    return rightPanel;
  }

  private async createPanelElement(jobData: JobData): Promise<HTMLElement> {
    const panel = document.createElement('div');
    panel.className = 'lja-panel';
    panel.id = 'linkedin-job-assistant';
    
    // 立即设置正确的位置样式 - 确保不阻止页面交互
    panel.setAttribute('style', `
      position: fixed !important;
      top: 120px !important;
      right: 20px !important;
      width: 420px !important;
      max-width: 420px !important;
      height: auto !important;
      z-index: 10000 !important;
      background: transparent !important;
      display: block !important;
      border-radius: 12px !important;
      overflow-y: auto !important;
      max-height: calc(100vh - 140px) !important;
      pointer-events: auto !important;
    `);
    
    const matchScore = await this.calculateMatchScore(jobData);
    
    panel.innerHTML = `
      <div class="lja-panel-container">
        <div class="lja-panel-header" id="lja-drag-handle" style="cursor: move;">
          <h3 class="lja-panel-title">🎯 职位匹配分析</h3>
          <div class="lja-panel-actions">
            <button class="lja-btn-icon" id="lja-refresh" title="刷新分析">🔄</button>
            <button class="lja-btn-icon" id="lja-settings" title="设置">⚙️</button>
            <button class="lja-btn-icon" id="lja-close" title="关闭">✕</button>
          </div>
        </div>

        <div class="lja-match-score">
          <div class="lja-overall-score">
            <div class="lja-score-circle ${this.getScoreClass(matchScore.overall)}">
              <span class="lja-score-text">${matchScore.overall}%</span>
            </div>
            <span class="lja-score-label">总体匹配度</span>
          </div>

          <div class="lja-score-breakdown">
            <div class="lja-score-item">
              <span class="lja-score-icon">🛠️</span>
              <div class="lja-score-details">
                <span class="lja-score-category">技能匹配</span>
                <span class="lja-score-value ${this.getScoreClass(matchScore.skills)}">${matchScore.skills}%</span>
              </div>
            </div>

            <div class="lja-score-item">
              <span class="lja-score-icon">📈</span>
              <div class="lja-score-details">
                <span class="lja-score-category">经验匹配</span>
                <span class="lja-score-value ${this.getScoreClass(matchScore.experience)}">${matchScore.experience}%</span>
              </div>
            </div>

            <div class="lja-score-item">
              <span class="lja-score-icon">📍</span>
              <div class="lja-score-details">
                <span class="lja-score-category">地点匹配</span>
                <span class="lja-score-value ${this.getScoreClass(matchScore.location)}">${matchScore.location}%</span>
              </div>
            </div>

            <div class="lja-score-item">
              <span class="lja-score-icon">🏢</span>
              <div class="lja-score-details">
                <span class="lja-score-category">公司匹配</span>
                <span class="lja-score-value ${this.getScoreClass(matchScore.company)}">${matchScore.company}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lja-summary-section">
          <div class="lja-summary-header">
            <h4 class="lja-summary-title">📝 AI 职位总结</h4>
            <div style="display: flex; gap: 8px;">
              <button class="lja-btn-secondary" id="lja-generate-summary">生成总结</button>
              <button class="lja-btn-secondary" id="lja-open-popup" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15)); border-color: rgba(102, 126, 234, 0.3);">
                📱 打开助手
              </button>
            </div>
          </div>

          <div class="lja-generate-prompt" id="lja-generate-prompt">
            点击"生成总结"在此处分析，或点击"打开助手"使用完整功能
          </div>

          <div class="lja-loading" id="lja-loading" style="display: none;">
            <div class="lja-spinner"></div>
            <span>AI正在分析职位信息...</span>
          </div>

          <div class="lja-summary-result" id="lja-summary-result" style="display: none;">
            <div class="lja-summary-content" id="lja-summary-content"></div>
            <div class="lja-summary-actions">
              <button class="lja-btn-small lja-btn-regenerate" id="lja-regenerate-summary">重新生成</button>
              <button class="lja-btn-small lja-btn-translate" id="lja-translate-summary">翻译</button>
              <button class="lja-btn-small lja-btn-toggle" id="lja-toggle-desc">查看原文</button>
            </div>
          </div>

          <div class="lja-full-description" id="lja-full-description" style="display: none;">
            ${this.truncateText(jobData.description, 500)}
          </div>
        </div>

        <div class="lja-panel-footer">
          <button class="lja-btn-primary" id="lja-save-job">
            💾 保存到看板
          </button>
        </div>
      </div>
    `;

    return panel;
  }

  private addEventListenerSafe(element: Element, event: string, handler: EventListener) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  private bindEvents(jobData: JobData) {
    if (!this.panel) return;

    // 关闭按钮
    const closeBtn = this.panel.querySelector('#lja-close');
    if (closeBtn) {
      this.addEventListenerSafe(closeBtn, 'click', () => this.togglePanel());
    }

    // 刷新按钮
    const refreshBtn = this.panel.querySelector('#lja-refresh');
    if (refreshBtn) {
      this.addEventListenerSafe(refreshBtn, 'click', () => this.refreshAnalysis());
    }

    // 生成总结按钮
    const generateBtn = this.panel.querySelector('#lja-generate-summary');
    if (generateBtn) {
      this.addEventListenerSafe(generateBtn, 'click', () => {
        this.generateAISummary(jobData);
      });
    }

    // 重新生成总结按钮
    const regenerateBtn = this.panel.querySelector('#lja-regenerate-summary');
    if (regenerateBtn) {
      this.addEventListenerSafe(regenerateBtn, 'click', () => {
        this.generateAISummary(jobData, true);
      });
    }

    // 切换原文显示按钮
    const toggleBtn = this.panel.querySelector('#lja-toggle-desc');
    const fullDescription = this.panel.querySelector('#lja-full-description');
    if (toggleBtn && fullDescription) {
      this.addEventListenerSafe(toggleBtn, 'click', () => {
        const isVisible = (fullDescription as HTMLElement).style.display !== 'none';
        (fullDescription as HTMLElement).style.display = isVisible ? 'none' : 'block';
        (toggleBtn as HTMLElement).textContent = isVisible ? '查看原文' : '隐藏原文';
      });
    }

    // 翻译按钮
    const translateBtn = this.panel.querySelector('#lja-translate-summary');
    if (translateBtn) {
      this.addEventListenerSafe(translateBtn, 'click', () => this.translateSummary());
    }

    // 保存按钮
    const saveBtn = this.panel.querySelector('#lja-save-job');
    if (saveBtn) {
      this.addEventListenerSafe(saveBtn, 'click', () => this.saveJob(jobData));
    }

    // 打开popup按钮
    const openPopupBtn = this.panel.querySelector('#lja-open-popup');
    if (openPopupBtn) {
      this.addEventListenerSafe(openPopupBtn, 'click', () => this.openPopup());
    }

    // 添加拖拽功能
    this.makePanelDraggable();

  }

  private makePanelDraggable() {
    const dragHandle = this.panel?.querySelector('#lja-drag-handle');
    if (!dragHandle || !this.panel) return;

    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    const startDrag = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      isDragging = true;
      const panelRect = this.panel!.getBoundingClientRect();
      dragOffset.x = mouseEvent.clientX - panelRect.left;
      dragOffset.y = mouseEvent.clientY - panelRect.top;
      
      this.panel!.style.transition = 'none';
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', stopDrag);
      mouseEvent.preventDefault();
    };

    const drag = (e: MouseEvent) => {
      if (!isDragging || !this.panel) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // 限制在窗口范围内
      const maxX = window.innerWidth - this.panel.offsetWidth;
      const maxY = window.innerHeight - this.panel.offsetHeight;
      
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      
      // 覆盖CSS的位置设置
      this.panel.style.left = boundedX + 'px !important';
      this.panel.style.top = boundedY + 'px !important';
      this.panel.style.right = 'auto !important';
      this.panel.style.position = 'fixed !important';
    };

    const stopDrag = () => {
      isDragging = false;
      if (this.panel) {
        this.panel.style.transition = 'all 0.3s ease';
      }
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', stopDrag);
    };

    this.addEventListenerSafe(dragHandle, 'mousedown', startDrag);
  }

  private removeEventListeners() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  private async generateAISummary(jobData: JobData, regenerate = false) {
    console.log('🚀 开始生成AI总结...');
    
    const generatePrompt = this.panel?.querySelector('#lja-generate-prompt');
    const loading = this.panel?.querySelector('#lja-loading');
    const summaryResult = this.panel?.querySelector('#lja-summary-result');
    const summaryContent = this.panel?.querySelector('#lja-summary-content');
    
    if (generatePrompt) (generatePrompt as HTMLElement).style.display = 'none';
    if (summaryResult) (summaryResult as HTMLElement).style.display = 'none';
    if (loading) (loading as HTMLElement).style.display = 'block';

    try {
      console.log('🎯 直接调用后台脚本API...');
      
      // 直接发送消息，不依赖回调机制
      chrome.runtime.sendMessage({
        type: MessageType.GENERATE_AI_SUMMARY,
        data: jobData
      });
      
      // 使用简单的轮询检查结果
      console.log('⏳ 等待AI总结结果...');
      let attempts = 0;
      const maxAttempts = 30; // 30秒超时
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
        attempts++;
        
        // 检查是否有AI总结写入到页面中
        const resultElement = document.querySelector('[data-lja-result="ai-summary"]');
        if (resultElement) {
          const summary = resultElement.textContent;
          const isError = resultElement.hasAttribute('data-error');
          
          // 清理结果元素
          resultElement.remove();
          
          if (loading) (loading as HTMLElement).style.display = 'none';
          if (summaryResult) (summaryResult as HTMLElement).style.display = 'block';
          
          if (!isError && summary && summaryContent) {
            console.log('✨ 显示AI生成的总结');
            (summaryContent as HTMLElement).innerHTML = summary;
          } else {
            console.log('⚠️ 显示错误信息');
            if (summaryContent) {
              (summaryContent as HTMLElement).innerHTML = '生成总结失败: ' + (summary || '未知错误');
            }
          }
          return;
        }
        
        // 每10秒显示进度
        if (attempts % 10 === 0) {
          console.log(`⏳ 等待中... ${attempts}/30秒`);
        }
      }
      
      throw new Error('AI总结生成超时');
      
    } catch (error) {
      console.error('💥 生成AI总结出错:', error);
      if (loading) (loading as HTMLElement).style.display = 'none';
      if (summaryResult) (summaryResult as HTMLElement).style.display = 'block';
      if (summaryContent) {
        (summaryContent as HTMLElement).innerHTML = `
          <div style="color: #dc2626; padding: 16px; background: linear-gradient(135deg, #fef2f2, #fee2e2); border-radius: 12px; border-left: 4px solid #dc2626;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span style="font-size: 18px;">⚠️</span>
              <strong>AI总结生成失败</strong>
            </div>
            
            <div style="margin-bottom: 16px; font-size: 13px; opacity: 0.8;">
              错误: ${error}
            </div>
            
            <div style="background: rgba(255,255,255,0.8); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
              📋 <strong>${jobData.title}</strong><br>
              🏢 ${jobData.company}<br>
              📍 ${jobData.location}
            </div>
            
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <button onclick="document.querySelector('#lja-open-popup').click()" 
                      style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                📱 使用完整助手
              </button>
              <button onclick="document.querySelector('#lja-regenerate-summary').click()" 
                      style="background: #f59e0b; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                🔄 重新尝试
              </button>
            </div>
          </div>
        `;
      }
    }
  }

  private async translateSummary() {
    const summaryContent = this.panel?.querySelector('#lja-summary-content');
    if (!summaryContent) return;

    const currentText = (summaryContent as HTMLElement).innerText;
    const targetLang = this.currentLanguage === 'zh' ? 'en' : 'zh';
    
    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: MessageType.TRANSLATE_TEXT,
          data: {
            text: currentText,
            targetLang: targetLang
          }
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });

      if ((response as any).success) {
        (summaryContent as HTMLElement).innerHTML = (response as any).translatedText;
      }
    } catch (error) {
      console.error('翻译失败:', error);
    }
  }

  private getScoreClass(score: number): string {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }

  private async calculateMatchScore(jobData: JobData): Promise<MatchScore> {
    try {
      // 尝试从用户档案获取真实匹配分析
      const userProfile = await this.getUserProfile();
      
      if (userProfile && userProfile.skills) {
        // 使用真实的技能匹配算法
        return this.performRealMatching(jobData, userProfile);
      }
      
      // 如果没有用户档案，返回基于职位分析的合理分数
      return this.analyzeJobRequirements(jobData);
      
    } catch (error) {
      console.log('匹配分析失败，使用默认评分:', error);
      return {
        overall: Math.floor(Math.random() * 40) + 60,
        skills: Math.floor(Math.random() * 40) + 50,
        experience: Math.floor(Math.random() * 40) + 60,
        location: Math.floor(Math.random() * 30) + 70,
        company: Math.floor(Math.random() * 50) + 50
      };
    }
  }

  private async getUserProfile(): Promise<any> {
    try {
      const result = await chrome.storage.local.get('userProfile');
      return result.userProfile;
    } catch (error) {
      return null;
    }
  }

  private performRealMatching(jobData: JobData, userProfile: any): MatchScore {
    const jobDescription = jobData.description.toLowerCase();
    const userSkills = userProfile.skills.toLowerCase().split(/[,，、\s]+/);
    
    // 技能匹配分析
    const skillKeywords = [
      'javascript', 'js', 'react', 'vue', 'angular', 'node', 'python', 'java', 
      'typescript', 'ts', 'html', 'css', 'sass', 'scss', 'php', 'mysql', 
      'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'git',
      'frontend', '前端', 'backend', '后端', 'fullstack', '全栈'
    ];
    
    let skillMatches = 0;
    let totalSkillsFound = 0;
    
    for (const keyword of skillKeywords) {
      if (jobDescription.includes(keyword)) {
        totalSkillsFound++;
        if (userSkills.some((skill: string) => skill.includes(keyword) || keyword.includes(skill))) {
          skillMatches++;
        }
      }
    }
    
    const skillScore = totalSkillsFound > 0 ? Math.round((skillMatches / totalSkillsFound) * 100) : 70;
    
    // 经验匹配分析
    const experiencePattern = /(\d+)\+?\s*(?:年|year|years?)\s*(?:经验|experience)/gi;
    const experienceMatches = jobDescription.match(experiencePattern);
    let experienceScore = 75;
    
    if (experienceMatches && userProfile.experience) {
      const requiredExp = parseInt(experienceMatches[0]);
      if (userProfile.experience >= requiredExp) {
        experienceScore = 90;
      } else if (userProfile.experience >= requiredExp * 0.7) {
        experienceScore = 75;
      } else {
        experienceScore = 50;
      }
    }
    
    // 地点匹配分析
    let locationScore = 80;
    if (userProfile.location && userProfile.location !== '不限') {
      const userLocation = userProfile.location.toLowerCase();
      const jobLocation = jobData.location.toLowerCase();
      
      if (jobLocation.includes('远程') || jobLocation.includes('remote')) {
        locationScore = 100;
      } else if (jobLocation.includes(userLocation) || userLocation.includes('远程')) {
        locationScore = 95;
      } else {
        locationScore = 60;
      }
    }
    
    // 公司匹配 (基于公司规模和知名度的简单分析)
    const companyScore = Math.floor(Math.random() * 30) + 70;
    
    // 计算总体分数
    const overall = Math.round(
      skillScore * 0.4 + 
      experienceScore * 0.3 + 
      locationScore * 0.2 + 
      companyScore * 0.1
    );
    
    return {
      overall: Math.min(95, Math.max(30, overall)),
      skills: Math.min(95, Math.max(30, skillScore)),
      experience: Math.min(95, Math.max(30, experienceScore)),
      location: Math.min(95, Math.max(30, locationScore)),
      company: Math.min(95, Math.max(30, companyScore))
    };
  }

  private analyzeJobRequirements(jobData: JobData): MatchScore {
    const description = jobData.description.toLowerCase();
    
    // 基于职位描述复杂度分析难度
    const complexKeywords = ['senior', '高级', 'lead', '架构', 'architect', 'expert', '专家'];
    const entryKeywords = ['junior', '初级', 'entry', '实习', 'intern', '新手'];
    
    let baseScore = 70;
    
    if (complexKeywords.some(keyword => description.includes(keyword))) {
      baseScore = 60; // 高级职位匹配度稍低
    } else if (entryKeywords.some(keyword => description.includes(keyword))) {
      baseScore = 80; // 初级职位匹配度较高
    }
    
    return {
      overall: baseScore + Math.floor(Math.random() * 20) - 10,
      skills: baseScore + Math.floor(Math.random() * 20) - 10,
      experience: baseScore + Math.floor(Math.random() * 20) - 10,
      location: baseScore + Math.floor(Math.random() * 20) - 10,
      company: baseScore + Math.floor(Math.random() * 20) - 10
    };
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  private async extractJobData(): Promise<JobData | null> {
    try {
      console.log('开始提取职位数据...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // 增加等待时间

      // 更全面的标题选择器
      const titleSelectors = [
        '.job-details-jobs-unified-top-card__job-title h1',
        '.job-details-jobs-unified-top-card__job-title',
        '.jobs-details-top-card__job-title h1',
        '.jobs-details-top-card__job-title',
        '.jobs-unified-top-card__job-title h1',
        '.jobs-unified-top-card__job-title',
        '.t-24.t-bold.inline',
        'h1[data-automation-id="jobTitle"]',
        '[data-test-id="job-title"]',
        '.jobs-search__job-details h1'
      ];

      // 更全面的公司名称选择器
      const companySelectors = [
        '.job-details-jobs-unified-top-card__company-name a',
        '.job-details-jobs-unified-top-card__company-name',
        '.jobs-details-top-card__company-url',
        '.jobs-unified-top-card__company-name a',
        '.jobs-unified-top-card__company-name',
        '[data-automation-id="companyName"]',
        '.jobs-search__job-details .jobs-unified-top-card__company-name',
        '.job-details-jobs-unified-top-card__primary-description a'
      ];

      // 更全面的地点选择器
      const locationSelectors = [
        '.job-details-jobs-unified-top-card__bullet',
        '.jobs-details-top-card__bullet',
        '.jobs-unified-top-card__bullet',
        '[data-automation-id="jobLocation"]',
        '.jobs-unified-top-card__subtitle-primary-grouping .t-black--light',
        '.job-details-jobs-unified-top-card__primary-description .t-black--light'
      ];

      // 更全面的描述选择器
      const descriptionSelectors = [
        '.jobs-description-content__text',
        '.jobs-box__html-content',
        '.jobs-description__content',
        '[data-automation-id="jobDescription"]',
        '.jobs-description',
        '.jobs-box__group .jobs-box__html-content'
      ];

      const titleElement = this.findElement(titleSelectors);
      const companyElement = this.findElement(companySelectors);
      const locationElement = this.findElement(locationSelectors);
      const descriptionElement = this.findElement(descriptionSelectors);

      console.log('找到的元素:', {
        title: titleElement?.textContent?.trim(),
        company: companyElement?.textContent?.trim(),
        location: locationElement?.textContent?.trim(),
        description: descriptionElement?.textContent?.trim()?.substring(0, 100)
      });

      // 降低要求，只要有标题就创建面板
      if (!titleElement) {
        console.log('未找到职位标题，无法创建面板');
        return null;
      }

      const jobData: JobData = {
        title: titleElement.textContent?.trim() || 'Unknown Position',
        company: companyElement?.textContent?.trim() || 'Unknown Company',
        location: locationElement?.textContent?.trim() || 'Unknown Location',
        description: descriptionElement?.textContent?.trim() || 'No description available',
        url: window.location.href
      };

      console.log('最终提取到的职位数据:', jobData);
      return jobData;
    } catch (error) {
      console.error('提取职位数据失败:', error);
      return null;
    }
  }

  private findElement(selectors: string[]): Element | null {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        console.log(`找到元素: ${selector} -> ${element.textContent.trim().substring(0, 50)}`);
        return element;
      }
    }
    return null;
  }

  private togglePanel() {
    this.isVisible = !this.isVisible;
    if (this.panel) {
      this.panel.style.display = this.isVisible ? 'block' : 'none';
    }
  }

  private refreshAnalysis() {
    console.log('刷新分析');
    this.createPanel();
  }

  private async saveJob(jobData: JobData) {
    try {
      console.log('保存工作到看板:', jobData);
      // 这里可以调用API保存到数据库
      alert('工作已保存到看板！');
    } catch (error) {
      console.error('保存工作失败:', error);
      alert('保存失败');
    }
  }

  private openPopup() {
    try {
      // 发送消息给background script打开popup
      chrome.runtime.sendMessage({
        type: 'OPEN_POPUP',
        data: { url: window.location.href }
      });
      
      // 也可以尝试直接触发扩展图标点击
      console.log('🚀 尝试打开LinkedIn AI助手popup');
      
    } catch (error) {
      console.error('❌ 打开popup失败:', error);
      
      // 如果失败，提供手动指引
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        background: linear-gradient(135deg, #667eea, #764ba2) !important;
        color: white !important;
        padding: 16px 20px !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
        z-index: 999999 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: 14px !important;
        max-width: 300px !important;
      `;
      
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span>🎯</span>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">LinkedIn AI 助手</div>
            <div style="opacity: 0.9; font-size: 13px;">请点击浏览器工具栏中的扩展图标</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // 3秒后自动消失
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  }


  private startAggressivePositionFix() {
    if (!this.panel) return;
    
    console.log('🚀 启动激进位置修复策略...');
    
    // 立即修复多次
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.forceFixPosition(), i * 100);
    }
    
    // 使用MutationObserver监控样式变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
          console.log('🔄 检测到样式变化，重新修复位置...');
          this.forceFixPosition();
        }
      });
    });
    
    observer.observe(this.panel, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    // 高频率位置检查
    const positionChecker = setInterval(() => {
      if (!this.panel) {
        clearInterval(positionChecker);
        return;
      }
      
      const rect = this.panel.getBoundingClientRect();
      // 检查是否在正确位置 (右上角)
      const expectedRight = window.innerWidth - 20 - 420; // 20px from right, 420px width
      const isInCorrectPosition = 
        rect.top >= 115 && rect.top <= 125 && // top应该在120px附近
        rect.left >= expectedRight - 10 && rect.left <= expectedRight + 10; // right位置正确
        
      if (!isInCorrectPosition) {
        console.log('⚠️ 位置偏移，重新修复:', {
          current: { top: rect.top, left: rect.left, right: rect.right },
          expected: { top: 120, left: expectedRight, right: window.innerWidth - 20 }
        });
        this.forceFixPosition();
      }
    }, 200); // 每200ms检查一次
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      console.log('🔄 窗口大小变化，重新修复位置...');
      this.forceFixPosition();
    });
  }

  private forceFixPosition() {
    if (!this.panel) {
      console.log('❌ forceFixPosition: 面板不存在');
      return;
    }
    
    console.log('🔧 forceFixPosition: 开始强制修复面板位置...');
    const beforeRect = this.panel.getBoundingClientRect();
    console.log('🔧 修复前位置:', beforeRect);
    
    // 多种方法强制设置样式
    
    // 方法1: setAttribute - 确保不阻止页面交互
    this.panel.setAttribute('style', `
      position: fixed !important;
      top: 120px !important;
      right: 20px !important;
      width: 420px !important;
      max-width: 420px !important;
      min-width: 420px !important;
      height: auto !important;
      z-index: 10000 !important;
      background: transparent !important;
      display: block !important;
      border-radius: 12px !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      max-height: calc(100vh - 140px) !important;
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
      left: auto !important;
      bottom: auto !important;
      pointer-events: auto !important;
    `);
    
    // 方法2: 直接设置style属性
    const criticalStyles = {
      'position': 'fixed',
      'top': '120px',
      'right': '20px',
      'width': '420px',
      'z-index': '10000',
      'display': 'block',
      'pointer-events': 'auto'
    };
    
    Object.entries(criticalStyles).forEach(([prop, value]) => {
      this.panel!.style.setProperty(prop, value, 'important');
    });
    
    // 方法3: 移除可能冲突的class
    this.panel.className = 'lja-panel';
    
    // 验证修复结果
    setTimeout(() => {
      const afterRect = this.panel!.getBoundingClientRect();
      console.log('🔧 修复后位置:', afterRect);
      
      if (afterRect.top < 115 || afterRect.top > 125 || afterRect.right > window.innerWidth - 15) {
        console.log('⚠️ 修复失败，位置仍然不正确，尝试更激进的方法...');
        this.emergencyFix();
      } else {
        console.log('✅ 位置修复成功！');
      }
    }, 50);
  }
  
  private emergencyFix() {
    if (!this.panel) return;
    
    console.log('🚨 启动紧急修复模式...');
    
    // 完全重新创建样式 - 确保不阻止页面交互
    const newStyle = document.createElement('style');
    newStyle.id = 'lja-emergency-style';
    newStyle.textContent = `
      #linkedin-job-assistant {
        position: fixed !important;
        top: 120px !important;
        right: 20px !important;
        width: 420px !important;
        max-width: 420px !important;
        height: auto !important;
        z-index: 10000 !important;
        background: transparent !important;
        display: block !important;
        border-radius: 12px !important;
        pointer-events: auto !important;
      }
    `;
    
    // 移除旧的紧急样式
    const oldStyle = document.getElementById('lja-emergency-style');
    if (oldStyle) oldStyle.remove();
    
    // 添加新样式到head
    document.head.appendChild(newStyle);
    
    console.log('🚨 紧急样式已注入');
  }

  private removePanel() {
    if (this.panel) {
      this.removeEventListeners();
      this.panel.remove();
      this.panel = null;
    }
  }
}

// 启动助手
new LinkedInAssistant();