// Popup Script for LinkedIn Profile Analyzer with Language Support
class PopupLanguageManager {
  constructor() {
    this.currentLanguage = this.getStoredLanguage() || 'zh';
    this.translations = this.initTranslations();
    this.init();
  }

  // 获取存储的语言设置
  getStoredLanguage() {
    try {
      return localStorage.getItem('linkedin-analyzer-popup-language') || 'zh';
    } catch (e) {
      return 'zh';
    }
  }

  // 保存语言设置
  saveLanguage(lang) {
    try {
      localStorage.setItem('linkedin-analyzer-popup-language', lang);
      this.currentLanguage = lang;
      // 同时通知content script语言变更
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'languageChanged',
            language: lang
          }).catch(() => {}); // 忽略错误，content script可能未加载
        }
      });
    } catch (e) {
      console.warn('无法保存语言设置');
    }
  }

  // 初始化翻译文本
  initTranslations() {
    return {
      zh: {
        title: 'LinkedIn Profile Analyzer',
        subtitle: '实时分析LinkedIn个人主页',
        languageSwitch: '🌐 EN',
        statusChecking: '检测中...',
        statusActive: '✅ 正在LinkedIn页面上分析',
        statusInactive: '⚠️ 请访问LinkedIn个人主页使用',
        statusComplete: '✅ 分析完成',
        feature1: '实时分析profile完整度',
        feature2: '专业评分和改进建议', 
        feature3: '直接在页面上显示结果',
        feature4: '支持实时刷新分析',
        aiTitle: 'AI分析功能',
        aiStatusChecking: '⏳ 检测AI服务状态中...',
        aiStatusWorking: '✅ AI分析服务正常',
        aiStatusFailed: '❌ AI分析服务不可用',
        currentUsing: '当前使用',
        allEndpointsFailed: '所有API端点连接失败',
        instructions: '前往 <a href="https://linkedin.com/in/" class="link" target="_blank">LinkedIn个人主页</a> 查看实时分析结果'
      },
      en: {
        title: 'LinkedIn Profile Analyzer',
        subtitle: 'Real-time LinkedIn Profile Analysis',
        languageSwitch: '🌐 中',
        statusChecking: 'Checking...',
        statusActive: '✅ Analyzing LinkedIn page',
        statusInactive: '⚠️ Please visit LinkedIn profile to use',
        statusComplete: '✅ Analysis completed',
        feature1: 'Real-time profile completeness analysis',
        feature2: 'Professional scoring & improvement suggestions',
        feature3: 'Display results directly on page',
        feature4: 'Support real-time refresh analysis',
        aiTitle: 'AI Analysis Service',
        aiStatusChecking: '⏳ Checking AI service status...',
        aiStatusWorking: '✅ AI analysis service is working',
        aiStatusFailed: '❌ AI analysis service unavailable',
        currentUsing: 'Currently using',
        allEndpointsFailed: 'All API endpoints failed',
        instructions: 'Visit <a href="https://linkedin.com/in/" class="link" target="_blank">LinkedIn profile page</a> to view real-time analysis results'
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
    console.log(`🌐 Language switched to: ${newLang}`);
  }

  // 更新所有界面文本
  updateAllTexts() {
    // 更新标题和副标题
    document.getElementById('title').textContent = this.t('title');
    document.getElementById('subtitle').textContent = this.t('subtitle');
    
    // 更新语言切换按钮
    document.getElementById('languageBtn').textContent = this.t('languageSwitch');
    
    // 更新功能特性
    document.getElementById('feature1').textContent = this.t('feature1');
    document.getElementById('feature2').textContent = this.t('feature2');
    document.getElementById('feature3').textContent = this.t('feature3');
    document.getElementById('feature4').textContent = this.t('feature4');
    
    // 更新AI标题
    document.getElementById('aiTitle').textContent = this.t('aiTitle');
    
    // 更新说明文字
    document.getElementById('instructions').innerHTML = this.t('instructions');
    
    // 重新检查状态以更新状态文本
    this.updateStatus();
  }

  // 更新状态显示
  updateStatus() {
    const statusTextEl = document.getElementById('statusText');
    const currentText = statusTextEl.textContent;
    
    if (currentText.includes('检测中') || currentText.includes('Checking')) {
      statusTextEl.textContent = this.t('statusChecking');
    } else if (currentText.includes('正在LinkedIn页面') || currentText.includes('Analyzing LinkedIn')) {
      statusTextEl.textContent = this.t('statusActive');
    } else if (currentText.includes('请访问LinkedIn') || currentText.includes('Please visit LinkedIn')) {
      statusTextEl.textContent = this.t('statusInactive');
    } else if (currentText.includes('分析完成') || currentText.includes('Analysis completed')) {
      // 保持分数部分，只更新文本部分
      const scoreMatch = currentText.match(/\d+\/100/);
      const score = scoreMatch ? scoreMatch[0] : '';
      statusTextEl.textContent = `${this.t('statusComplete')} ${score ? `(${score}分)` : ''}`.trim();
    }
  }

  // 初始化
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      // 设置语言切换按钮事件
      const langBtn = document.getElementById('languageBtn');
      if (langBtn) {
        langBtn.addEventListener('click', () => this.toggleLanguage());
      }
      
      // 初始化文本
      this.updateAllTexts();
      
      // 原有的功能逻辑
      this.initOriginalLogic();
    });
  }

  // 初始化原有逻辑
  initOriginalLogic() {
    const statusEl = document.getElementById('status');
    const statusTextEl = document.getElementById('statusText');
    
    // 检查当前tab是否在LinkedIn页面
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const currentTab = tabs[0];
      
      if (currentTab && currentTab.url && currentTab.url.includes('linkedin.com/in/')) {
        // 在LinkedIn profile页面
        statusEl.className = 'status active';
        statusTextEl.textContent = this.t('statusActive');
        
        // 注入content script（如果还没有注入）
        chrome.tabs.sendMessage(currentTab.id, {action: 'ping'}, (response) => {
          if (chrome.runtime.lastError) {
            // Content script尚未注入，手动注入
            chrome.scripting.executeScript({
              target: { tabId: currentTab.id },
              files: ['content.js']
            });
          }
        });
        
      } else {
        // 不在LinkedIn页面
        statusEl.className = 'status inactive';
        statusTextEl.textContent = this.t('statusInactive');
      }
    });
    
    // AI状态检查
    this.checkAIServiceStatus();
    
    // 监听来自content script的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'analysisComplete') {
        statusEl.className = 'status active';
        const score = request.score || 0;
        statusTextEl.textContent = `${this.t('statusComplete')} (${score}/100${this.currentLanguage === 'zh' ? '分' : ''})`;
      }
    });
  }

  // AI服务状态检查函数
  async checkAIServiceStatus() {
    const aiStatusText = document.getElementById('aiStatusText');
    const aiStatus = document.getElementById('aiStatus');
    
    // 设置初始状态
    aiStatusText.textContent = this.t('aiStatusChecking');
    
    // 测试的API端点
    const apiEndpoints = [
      {
        url: 'http://localhost:3000/api/analyze-linkedin-profile',
        name: this.currentLanguage === 'zh' ? '本地开发' : 'Local Dev'
      },
      {
        url: 'https://linkedin-analyzer-api.vercel.app/api/analyze-linkedin-profile',
        name: this.currentLanguage === 'zh' ? '生产环境' : 'Production'
      }
    ];
    
    let serviceWorking = false;
    let workingEndpoint = null;
    let endpointName = '';
    
    // 设置超时时间为3秒
    const timeout = 3000;
    
    for (const endpoint of apiEndpoints) {
      try {
        // 使用Promise.race实现超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await Promise.race([
          fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              profileText: 'LinkedIn Profile Analysis Test',
              profileUrl: 'https://linkedin.com/in/test-connection',
              analysisMode: 'connection_test',
              source: 'extension_status_check'
            }),
            signal: controller.signal
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]);
        
        clearTimeout(timeoutId);
        
        // 检查响应状态
        if (response.ok || response.status === 400 || response.status === 422) { 
          // 这些状态码都表示服务可用
          serviceWorking = true;
          workingEndpoint = endpoint.url;
          endpointName = endpoint.name;
          console.log(`✅ API服务正常: ${endpoint.name}`);
          break;
        } else {
          console.log(`⚠️ API端点 ${endpoint.name} 状态码: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ API端点 ${endpoint.name} 连接失败:`, error.message);
        continue;
      }
    }
    
    // 更新AI状态显示
    if (serviceWorking) {
      aiStatus.style.background = '#f0fdf4';
      aiStatus.style.borderColor = '#bbf7d0';
      aiStatusText.innerHTML = `${this.t('aiStatusWorking')}<br><small style="color: #15803d;">${this.t('currentUsing')}: ${endpointName}</small>`;
    } else {
      aiStatus.style.background = '#fef2f2';
      aiStatus.style.borderColor = '#fecaca';
      aiStatusText.innerHTML = `${this.t('aiStatusFailed')}<br><small style="color: #991b1b;">${this.t('allEndpointsFailed')}</small>`;
    }
  }
}

// 初始化语言管理器
new PopupLanguageManager();