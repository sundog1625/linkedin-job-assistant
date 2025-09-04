// Enhanced Background Script for Universal LinkedIn Profile Quality Analyzer
// Handles comprehensive AI-driven content quality analysis

class EnhancedAIAnalysisService {
  constructor() {
    // AI分析API端点配置
    this.apiUrl = 'http://localhost:3000/api/analyze-linkedin-profile';
    this.prodApiUrl = 'https://linkedin-analyzer-api.vercel.app/api/analyze-linkedin-profile';
    
    // Claude API配置（如果需要直接调用）
    this.claudeApiUrl = 'https://api.anthropic.com/v1/messages';
    
    this.maxRetries = 2;
    this.timeoutMs = 15000;
  }

  async analyzeProfileWithAI(profileData, analysisType = 'quality_analysis') {
    console.log('🎯 Starting Enhanced AI Quality Analysis:', analysisType);
    console.log('Profile data summary:', {
      url: profileData.profileUrl,
      owner: profileData.profileOwner?.name,
      hasPhoto: profileData.photo?.present,
      hasHeadline: profileData.headline?.present,
      hasAbout: profileData.about?.present,
      experienceCount: profileData.experience?.totalCount || 0,
      skillsCount: profileData.skills?.totalCount || 0
    });
    
    // 尝试多个API端点
    const apiEndpoints = [this.apiUrl, this.prodApiUrl];
    
    for (const endpoint of apiEndpoints) {
      try {
        console.log(`📡 Trying enhanced API endpoint: ${endpoint}`);
        const result = await this.callEnhancedAPI(endpoint, profileData, analysisType);
        if (result) {
          console.log('✅ Enhanced AI analysis successful');
          return this.processAIResponse(result, profileData);
        }
      } catch (error) {
        console.log(`⚠️ API endpoint ${endpoint} failed:`, error.message);
        continue;
      }
    }
    
    // 如果所有API都失败，使用内置智能分析
    console.log('🔄 Using fallback intelligent analysis');
    return this.performIntelligentFallback(profileData);
  }

  async callEnhancedAPI(endpoint, profileData, analysisType) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileData: profileData,
          analysisType: analysisType,
          requestId: this.generateRequestId(),
          analysisPrompt: this.createEnhancedAnalysisPrompt(profileData),
          source: 'universal_analyzer_v2'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  createEnhancedAnalysisPrompt(profileData) {
    return `
你是一位资深的LinkedIn个人品牌顾问和内容质量专家。请对以下LinkedIn档案进行全面的质量分析，提供深度的改进建议。

## 档案信息
用户: ${profileData.profileOwner?.name || 'Anonymous'}
档案URL: ${profileData.profileUrl}
分析时间: ${profileData.analyzedAt}

## 各部分详细内容分析

### 1. 头像分析
- 状态: ${profileData.photo?.present ? '已设置' : '未设置'}
${profileData.photo?.present ? `- 质量评级: ${profileData.photo.quality}
- 当前问题: ${profileData.photo.issues?.join(', ') || '无明显问题'}` : ''}

### 2. 职业标题分析  
${profileData.headline?.present ? `- 内容: "${profileData.headline.content}"
- 长度: ${profileData.headline.length}字符
- 当前质量: ${profileData.headline.quality}
- 发现的问题: ${profileData.headline.issues?.join(', ') || '无'}` : '- 状态: 未设置职业标题'}

### 3. 关于部分分析
${profileData.about?.present ? `- 内容长度: ${profileData.about.length}字符 (${profileData.about.wordCount}词)
- 质量评级: ${profileData.about.quality}
- 段落结构: ${profileData.about.structure?.paragraphs || 1}段
- 包含的关键要素: ${profileData.about.keyTopics?.join(', ') || '未识别'}
- 可读性: ${profileData.about.readability}
- 发现的问题: ${profileData.about.issues?.join(', ') || '无'}
- 内容预览: "${profileData.about.content?.substring(0, 200)}..."` : '- 状态: 未添加关于部分'}

### 4. 工作经验分析
- 经验条目数: ${profileData.experience?.totalCount || 0}
- 质量评级: ${profileData.experience?.quality || '未知'}
${profileData.experience?.entries?.length > 0 ? `- 经验详情:
${profileData.experience.entries.map((exp, i) => `  ${i+1}. ${exp.title || '职位'} at ${exp.company || '公司'} ${exp.currentRole ? '(当前)' : ''}`).join('\n')}` : ''}
- 发现的问题: ${profileData.experience?.issues?.join(', ') || '无经验记录'}

### 5. 技能分析
- 可见技能数: ${profileData.skills?.visibleCount || 0}
- 总技能数: ${profileData.skills?.totalCount || 0}
- 质量评级: ${profileData.skills?.quality || '未知'}
${profileData.skills?.skills?.length > 0 ? `- 技能列表: ${profileData.skills.skills.join(', ')}` : ''}
- 技能分类分布: ${profileData.skills?.categories ? Object.entries(profileData.skills.categories).map(([cat, count]) => `${cat}: ${count}`).join(', ') : '未分析'}

### 6. 教育背景分析
- 教育条目数: ${profileData.education?.totalCount || 0}
- 最高学历: ${profileData.education?.highestDegree || '未知'}
- 质量评级: ${profileData.education?.quality || '未知'}

## 请提供以下分析结果

1. **整体质量评分** (0-100分)
2. **各部分详细评分和具体改进建议**
3. **内容质量深度分析** (而非简单的存在性检查)
4. **语法和表达改进建议**
5. **关键词优化建议**
6. **行业最佳实践对比**
7. **优先改进项目清单**

请以JSON格式返回结果，包含：

{
  "overallQualityScore": 75,
  "detailedAnalysis": {
    "photo": {
      "qualityScore": 85,
      "contentQuality": "good|average|poor|excellent",
      "specificIssues": ["具体问题1", "具体问题2"],
      "improvementSuggestions": ["具体建议1", "具体建议2"],
      "bestPractices": ["最佳实践建议"]
    },
    "headline": {
      "qualityScore": 70,
      "contentQuality": "good",
      "keywordOptimization": "需要改进",
      "specificIssues": ["缺少行业关键词", "表达不够具体"],
      "improvementSuggestions": ["添加具体技能关键词", "使用更有影响力的动词"],
      "suggestedRewrite": "建议的重写版本",
      "keywordSuggestions": ["关键词1", "关键词2"]
    },
    "about": {
      "qualityScore": 65,
      "contentQuality": "average", 
      "structureAnalysis": "段落结构合理但缺少关键要素",
      "specificIssues": ["缺少具体成就", "表达过于泛泛而谈"],
      "improvementSuggestions": ["添加具体数据和成就", "重组段落逻辑"],
      "suggestedStructure": "建议的内容结构",
      "grammarIssues": ["语法问题1", "语法问题2"],
      "toneImprovement": "语调改进建议"
    },
    "experience": {
      "qualityScore": 60,
      "contentQuality": "average",
      "completenessAnalysis": "缺少详细职责描述",
      "specificIssues": ["职位描述过于简单", "缺少量化成就"],
      "improvementSuggestions": ["为每个职位添加3-5个具体职责", "使用STAR方法描述成就"],
      "careerProgressionAnalysis": "职业发展轨迹分析"
    },
    "skills": {
      "qualityScore": 80,
      "contentQuality": "good",
      "diversityAnalysis": "技能类别分布合理",
      "specificIssues": ["缺少热门技术技能"],
      "improvementSuggestions": ["添加当前流行的技术栈", "平衡硬技能和软技能"],
      "recommendedSkills": ["推荐技能1", "推荐技能2"],
      "industryAlignment": "与行业需求的匹配度分析"
    }
  },
  "priorityImprovements": [
    {
      "section": "headline", 
      "priority": "high",
      "issue": "缺少关键词优化",
      "action": "重写标题包含核心技能",
      "estimatedImpact": "显著提升搜索可见性"
    }
  ],
  "grammarAndLanguage": {
    "errors": ["语法错误列表"],
    "styleImprovement": ["文体改进建议"],
    "clarityIssues": ["表达清晰度问题"]
  },
  "industryBenchmark": {
    "comparedToIndustry": "高于/低于/符合行业平均水平",
    "strongPoints": ["优势点"],
    "improvementAreas": ["需要改进的领域"]
  }
}

请确保所有建议都是具体的、可执行的，并且基于实际的内容质量分析，而不是简单的存在性检查。`;
  }

  processAIResponse(apiResponse, profileData) {
    try {
      // 解析API返回的分析结果
      const analysis = apiResponse.analysis || apiResponse;
      
      return {
        totalScore: analysis.overallQualityScore || this.calculateFallbackScore(profileData),
        qualityScores: this.extractQualityScores(analysis, profileData),
        detailedAnalysis: analysis.detailedAnalysis || {},
        priorityImprovements: analysis.priorityImprovements || this.generatePriorityImprovements(profileData),
        grammarAndLanguage: analysis.grammarAndLanguage || {},
        industryBenchmark: analysis.industryBenchmark || {},
        aiAnalysisComplete: true,
        analysisTimestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to process AI response:', error);
      return this.performIntelligentFallback(profileData);
    }
  }

  extractQualityScores(analysis, profileData) {
    const scores = {};
    
    if (analysis.detailedAnalysis) {
      Object.keys(analysis.detailedAnalysis).forEach(section => {
        scores[section] = analysis.detailedAnalysis[section].qualityScore || 50;
      });
    }
    
    // 确保所有部分都有评分
    ['photo', 'headline', 'about', 'experience', 'skills', 'education'].forEach(section => {
      if (!scores[section]) {
        scores[section] = profileData[section]?.professionalScore || 50;
      }
    });
    
    return scores;
  }

  generatePriorityImprovements(profileData) {
    const improvements = [];
    
    // 基于内容质量生成优先改进项
    if (!profileData.photo?.present) {
      improvements.push({
        section: 'photo',
        priority: 'high',
        issue: '缺少专业头像',
        action: '上传高质量的专业照片',
        estimatedImpact: '提升档案可信度和点击率'
      });
    }
    
    if (!profileData.about?.present || (profileData.about?.wordCount || 0) < 50) {
      improvements.push({
        section: 'about',
        priority: 'high', 
        issue: '关于部分内容不足',
        action: '撰写详细的个人简介',
        estimatedImpact: '显著提升档案完整性和吸引力'
      });
    }
    
    if ((profileData.headline?.professionalScore || 0) < 70) {
      improvements.push({
        section: 'headline',
        priority: 'medium',
        issue: '职业标题缺少关键词',
        action: '优化标题包含核心技能',
        estimatedImpact: '提升搜索可见性'
      });
    }
    
    if ((profileData.skills?.totalCount || 0) < 10) {
      improvements.push({
        section: 'skills',
        priority: 'medium',
        issue: '技能数量不足',
        action: '添加更多相关技能',
        estimatedImpact: '增强专业匹配度'
      });
    }
    
    return improvements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async performIntelligentFallback(profileData) {
    console.log('🧠 Performing intelligent fallback analysis');
    
    const fallbackAnalysis = {
      totalScore: this.calculateFallbackScore(profileData),
      qualityScores: this.calculateSectionScores(profileData),
      priorityImprovements: this.generatePriorityImprovements(profileData),
      grammarAndLanguage: this.performBasicGrammarCheck(profileData),
      fallbackMode: true,
      analysisTimestamp: new Date().toISOString()
    };
    
    return fallbackAnalysis;
  }

  calculateFallbackScore(profileData) {
    let totalScore = 0;
    let sectionCount = 0;
    
    const sections = ['photo', 'headline', 'about', 'experience', 'skills', 'education'];
    
    sections.forEach(section => {
      if (profileData[section]) {
        totalScore += profileData[section].professionalScore || 0;
        sectionCount++;
      }
    });
    
    return sectionCount > 0 ? Math.round(totalScore / sectionCount) : 50;
  }

  calculateSectionScores(profileData) {
    const scores = {};
    
    ['photo', 'headline', 'about', 'experience', 'skills', 'education'].forEach(section => {
      scores[section] = profileData[section]?.professionalScore || 0;
    });
    
    return scores;
  }

  performBasicGrammarCheck(profileData) {
    const textContent = [
      profileData.headline?.content || '',
      profileData.about?.content || ''
    ].join(' ');
    
    const errors = [];
    const improvements = [];
    
    // 基础语法检查
    if (textContent.match(/\bi\s/g)) {
      errors.push('小写的"i"应该大写');
      improvements.push('将所有的"i"改为"I"');
    }
    
    if (textContent.match(/\.\s*[a-z]/g)) {
      errors.push('句首字母应该大写');
      improvements.push('确保每句话开头字母大写');
    }
    
    if (textContent.match(/\s{2,}/g)) {
      errors.push('发现多余的空格');
      improvements.push('删除多余的空格');
    }
    
    return {
      errors,
      styleImprovement: improvements,
      clarityIssues: textContent.length < 50 ? ['内容太短，需要扩展'] : []
    };
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 创建增强的AI分析服务实例
const enhancedAIService = new EnhancedAIAnalysisService();

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeWithAI') {
    console.log('📨 Received enhanced AI analysis request');
    console.log('Analysis type:', request.analysisType || 'quality_analysis');
    console.log('Include grammar check:', request.includeGrammarCheck || false);
    
    enhancedAIService.analyzeProfileWithAI(
      request.profileData, 
      request.analysisType || 'quality_analysis'
    )
      .then(result => {
        console.log('✅ Enhanced AI analysis completed successfully');
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        console.error('❌ Enhanced AI analysis failed:', error);
        
        // 即使失败也提供有用的fallback分析
        enhancedAIService.performIntelligentFallback(request.profileData)
          .then(fallbackResult => {
            sendResponse({ 
              success: false, 
              error: error.message,
              data: fallbackResult
            });
          })
          .catch(fallbackError => {
            sendResponse({ 
              success: false, 
              error: error.message,
              data: {
                totalScore: 50,
                priorityImprovements: ['AI分析服务暂时不可用，请稍后重试'],
                fallbackMode: true
              }
            });
          });
      });
    
    return true; // 保持消息通道开放
  }
});

console.log('🎯 Enhanced LinkedIn Profile Quality Analyzer Background Service loaded');