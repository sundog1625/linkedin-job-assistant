// Background service worker for LinkedIn Job Assistant
console.log('🚀 LinkedIn Job Assistant 后台脚本开始加载...');

import { initializeSupabase } from '../utils/supabase';
import { MessageType, Message } from '../utils/types';
import { API_KEYS, API_CONFIG } from '../config/api-keys';

console.log('📦 所有模块导入完成');

// Initialize Supabase connection
const supabase = initializeSupabase();
console.log('🗄️ Supabase连接已初始化');

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  console.log('🎯 后台脚本收到消息:', message);
  handleMessage(message, sender, sendResponse);
  return true; // Keep the message channel open for async response
});

console.log('👂 消息监听器已设置完成');

async function handleMessage(
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) {
  console.log('🔄 开始处理消息:', message.type);
  try {
    switch (message.type) {
      case MessageType.SAVE_JOB:
        await saveJobToDatabase(message.data);
        sendResponse({ success: true });
        break;

      case MessageType.GET_JOBS:
        const jobs = await getJobsFromDatabase();
        sendResponse({ success: true, data: jobs });
        break;

      case MessageType.UPDATE_JOB:
        await updateJobInDatabase(message.data);
        sendResponse({ success: true });
        break;

      case MessageType.ANALYZE_JOB:
        const analysis = await analyzeJobMatch(message.data);
        sendResponse({ success: true, data: analysis });
        break;

      case MessageType.GET_USER_PROFILE:
        const profile = await getUserProfile();
        sendResponse({ success: true, data: profile });
        break;

      case MessageType.UPDATE_USER_PROFILE:
        await updateUserProfile(message.data);
        sendResponse({ success: true });
        break;

      case MessageType.GENERATE_AI_SUMMARY:
        console.log('🤖 开始处理AI总结请求...');
        const summary = await generateAISummary(message.data);
        
        // 将结果注入到页面DOM中，绕过回调限制
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (result) => {
                console.log('📝 将AI总结结果写入DOM:', result);
                const resultElement = document.createElement('div');
                resultElement.setAttribute('data-lja-result', 'ai-summary');
                resultElement.textContent = result.success ? result.summary : result.error;
                if (!result.success) {
                  resultElement.setAttribute('data-error', 'true');
                }
                resultElement.style.display = 'none';
                document.body.appendChild(resultElement);
              },
              args: [summary]
            });
          }
        });
        
        sendResponse({ success: true });
        break;

      case MessageType.TRANSLATE_TEXT:
        const translation = await translateText(message.data?.text || '', message.data?.targetLang || 'en');
        sendResponse(translation);
        break;

      case 'PROCESS_STORAGE_REQUEST' as any:
        console.log('📨 处理storage请求:', message.requestId);
        if (message.requestId) {
          processStorageRequest(message.requestId);
        }
        sendResponse({ success: true });
        break;

      case 'TEST_MESSAGE':
        console.log('🧪 收到测试消息:', message.data);
        sendResponse({ success: true, message: 'Test successful', data: message.data, timestamp: new Date().toLocaleString() });
        break;

      default:
        console.log('❓ 未知消息类型:', message.type);
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Background script error:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
}

async function saveJobToDatabase(jobData: any) {
  const { data, error } = await supabase
    .from('jobs')
    .insert([{
      ...jobData,
      user_id: await getCurrentUserId(),
      created_at: new Date().toISOString(),
      status: 'saved'
    }]);

  if (error) throw error;
  return data;
}

async function getJobsFromDatabase() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', await getCurrentUserId())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function updateJobInDatabase(jobData: any) {
  const { data, error } = await supabase
    .from('jobs')
    .update(jobData)
    .eq('id', jobData.id)
    .eq('user_id', await getCurrentUserId());

  if (error) throw error;
  return data;
}

async function analyzeJobMatch(jobData: any) {
  // Calculate match scores based on user profile and job requirements
  const userProfile = await getUserProfile();
  
  const matchScore = {
    skills: calculateSkillsMatch(userProfile.skills, jobData.required_skills),
    experience: calculateExperienceMatch(userProfile.experience, jobData.experience_required),
    education: calculateEducationMatch(userProfile.education, jobData.education_required),
    location: calculateLocationMatch(userProfile.location, jobData.location),
    overall: 0
  };

  // Calculate overall score (weighted average)
  matchScore.overall = Math.round(
    (matchScore.skills * 0.4) +
    (matchScore.experience * 0.3) +
    (matchScore.education * 0.2) +
    (matchScore.location * 0.1)
  );

  return matchScore;
}

function calculateSkillsMatch(userSkills: string[], requiredSkills: string[]): number {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  
  const matchedSkills = requiredSkills.filter(skill =>
    userSkills.some(userSkill =>
      userSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );

  return Math.round((matchedSkills.length / requiredSkills.length) * 100);
}

function calculateExperienceMatch(userExperience: number, requiredExperience: string): number {
  const match = requiredExperience?.match(/(\d+)/);
  if (!match) return 100;
  
  const required = parseInt(match[1]);
  if (userExperience >= required) return 100;
  if (userExperience >= required - 1) return 80;
  if (userExperience >= required - 2) return 60;
  return 40;
}

function calculateEducationMatch(userEducation: string, requiredEducation: string): number {
  if (!requiredEducation) return 100;
  
  const educationLevels = {
    'high school': 1,
    'associate': 2,
    'bachelor': 3,
    'master': 4,
    'phd': 5,
    'doctorate': 5
  };

  const userLevel = Object.entries(educationLevels).find(([key]) =>
    userEducation?.toLowerCase().includes(key)
  )?.[1] || 0;

  const requiredLevel = Object.entries(educationLevels).find(([key]) =>
    requiredEducation.toLowerCase().includes(key)
  )?.[1] || 0;

  if (userLevel >= requiredLevel) return 100;
  if (userLevel === requiredLevel - 1) return 75;
  return 50;
}

function calculateLocationMatch(userLocation: string, jobLocation: string): number {
  if (!jobLocation || jobLocation.toLowerCase().includes('remote')) return 100;
  if (!userLocation) return 50;
  
  // Simple location matching - can be enhanced with geocoding
  if (userLocation.toLowerCase() === jobLocation.toLowerCase()) return 100;
  
  // Check if same city/state
  const userParts = userLocation.toLowerCase().split(',').map(s => s.trim());
  const jobParts = jobLocation.toLowerCase().split(',').map(s => s.trim());
  
  if (userParts.some(part => jobParts.includes(part))) return 75;
  return 25;
}

async function getUserProfile() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', await getCurrentUserId())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || {};
}

async function updateUserProfile(profileData: any) {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      ...profileData,
      user_id: userId,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
  return data;
}

async function getCurrentUserId(): Promise<string> {
  // Get current user from Supabase auth
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // If no user, get or create anonymous user
    const storedUserId = await chrome.storage.local.get('userId');
    if (storedUserId.userId) {
      return storedUserId.userId;
    }
    
    // Create anonymous user
    const anonymousId = `anonymous_${Date.now()}`;
    await chrome.storage.local.set({ userId: anonymousId });
    return anonymousId;
  }
  
  return user.id;
}

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkedIn Job Assistant installed');
  
  // Set default storage values
  chrome.storage.local.set({
    settings: {
      autoAnalyze: true,
      showMatchScore: true,
      language: 'en'
    }
  });
});

// AI总结生成函数
async function generateAISummary(jobData: any): Promise<any> {
  console.log('🤖 后台脚本：开始生成AI总结...', jobData);
  
  try {
    const prompt = `请分析以下LinkedIn职位信息，生成一个简洁、有见地的中文总结（150字以内）：

职位标题: ${jobData.title}
公司: ${jobData.company}  
地点: ${jobData.location}
职位描述: ${jobData.description?.substring(0, 500)}

请从以下角度分析：
1. 职位级别和经验要求
2. 核心技能和技术栈
3. 工作模式（远程/现场）
4. 发展前景和亮点
5. 适合人群建议

请用友好、专业的语调，包含适当的emoji，让求职者快速了解这个职位的核心信息。`;

    console.log('📤 准备调用Claude API...');
    console.log('🔑 API Key前缀:', API_KEYS.CLAUDE.substring(0, 20) + '...');
    console.log('🌐 API URL:', `${API_CONFIG.CLAUDE.BASE_URL}/messages`);

    // 设置超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    try {
      const response = await fetch(`${API_CONFIG.CLAUDE.BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': API_KEYS.CLAUDE,
          'anthropic-version': '2023-06-01'
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
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log('📥 收到API响应，状态:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Claude API错误响应:', errorText);
        throw new Error(`Claude API调用失败: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Claude API成功返回数据:', data);
      
      return { 
        success: true, 
        summary: data.content[0].text.trim() 
      };
      
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('⏰ API调用超时');
        throw new Error('API调用超时');
      }
      throw fetchError;
    }
    
  } catch (error: any) {
    console.error('💥 AI总结生成失败:', error);
    
    // 返回备用总结
    return { 
      success: false, 
      summary: `📋 职位分析（本地生成）
      
🎯 **职位**: ${jobData.title}
🏢 **公司**: ${jobData.company}
📍 **地点**: ${jobData.location}

⚠️ AI分析暂时不可用，请查看原始职位描述了解详细要求。

建议仔细阅读职位描述，关注技能要求和工作经验需求。`,
      error: error.message 
    };
  }
}

// 翻译函数
async function translateText(text: string, targetLang: string): Promise<any> {
  try {
    // 使用简单的本地翻译
    const translations: any = {
      '职位': 'Position',
      '公司': 'Company',
      '地点': 'Location',
      '要求': 'Requirements',
      '技能': 'Skills',
      '经验': 'Experience'
    };

    let translatedText = text;
    if (targetLang === 'en') {
      Object.keys(translations).forEach(zh => {
        translatedText = translatedText.replace(new RegExp(zh, 'g'), translations[zh]);
      });
    }

    return { 
      success: true, 
      translatedText 
    };
    
  } catch (error: any) {
    console.error('翻译失败:', error);
    return { 
      success: false, 
      translatedText: text,
      error: error.message 
    };
  }
}

// 处理storage请求
async function processStorageRequest(requestId: string) {
  try {
    console.log('🔄 开始处理storage请求:', requestId);
    
    // 获取请求数据
    const result = await chrome.storage.local.get(requestId);
    const requestData = result[requestId];
    
    if (!requestData) {
      console.error('❌ 请求数据不存在:', requestId);
      return;
    }
    
    console.log('📋 处理请求:', requestData);
    
    if (requestData.type === 'GENERATE_AI_SUMMARY') {
      // 生成AI总结
      const summaryResult = await generateAISummary(requestData.data);
      
      // 更新storage结果
      await chrome.storage.local.set({
        [requestId]: {
          ...requestData,
          status: 'completed',
          success: summaryResult.success,
          summary: summaryResult.summary,
          error: summaryResult.error,
          completedAt: Date.now()
        }
      });
      
      console.log('✅ AI总结处理完成');
    }
  } catch (error) {
    console.error('💥 处理storage请求失败:', error);
    
    // 设置错误状态
    try {
      await chrome.storage.local.set({
        [requestId]: {
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
          completedAt: Date.now()
        }
      });
    } catch (storageError) {
      console.error('无法写入错误状态到storage:', storageError);
    }
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('🖱️ 扩展图标被点击:', tab.url);
  if (tab.url?.includes('linkedin.com')) {
    chrome.tabs.sendMessage(tab.id!, {
      type: MessageType.TOGGLE_PANEL
    });
  }
});

console.log('✅ LinkedIn Job Assistant 后台脚本完全加载完成');