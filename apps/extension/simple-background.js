// 最简单的后台脚本
console.log('🚀 简单后台脚本已加载');

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 收到消息:', message);
    
    if (message.type === 'TEST_MESSAGE') {
        console.log('✅ 处理TEST_MESSAGE');
        sendResponse({ 
            success: true, 
            message: 'Hello from background!',
            timestamp: new Date().toLocaleString()
        });
        return true;
    }
    
    if (message.type === 'GENERATE_AI_SUMMARY') {
        console.log('🤖 处理AI总结请求，开始调用Claude API...');
        handleAISummary(message.data.jobData, message.data.userProfile, message.data.language, sendResponse);
        return true; // 保持异步连接
    }
    
    if (message.type === 'OPEN_RESUME_SETUP') {
        console.log('📝 处理简历设置请求');
        handleResumeSetup(message.data, sendResponse);
        return true;
    }
    
    if (message.type === 'OPEN_RESUME_DASHBOARD') {
        console.log('🚀 处理Dashboard简历设置请求');
        handleResumeDashboard(message.data, sendResponse);
        return true;
    }
    
    if (message.type === 'ANALYZE_RESUME') {
        console.log('🤖 处理简历分析请求');
        handleResumeAnalysis(message.data, sendResponse);
        return true;
    }
    
    if (message.type === 'OPEN_POPUP') {
        console.log('🚀 处理popup打开请求');
        handleOpenPopup(message.data, sendResponse);
        return true;
    }
    
    console.log('❓ 未知消息类型:', message.type);
    sendResponse({ success: false, error: 'Unknown message type' });
    return true;
});

// AI总结处理函数
async function handleAISummary(jobData, userProfile, language, sendResponse) {
    try {
        console.log('📝 准备调用Claude API，职位数据:', jobData);
        console.log('👤 用户Profile:', userProfile);
        console.log('🌐 用户语言:', language);
        
        // 根据语言设置生成提示
        const languageInstructions = getLanguageInstructions(language);
        
        let prompt = `${languageInstructions.analysisInstruction}：

职位标题: ${jobData.title}
公司: ${jobData.company}  
地点: ${jobData.location}
职位描述: ${jobData.description?.substring(0, 500)}

💡 **输出要求**:
- 使用友好、专业的${languageInstructions.languageName}表达
- 包含适当的emoji提升可读性  
- 重点突出关键信息，控制在200字以内
- 语调积极正面，给求职者信心和指导
- ${languageInstructions.outputRequirement}`;

        // 如果有用户Profile，添加个性化匹配分析
        if (userProfile && userProfile.skills) {
            prompt += `

用户个人档案:
- 核心技能: ${userProfile.skills}
- 工作经验: ${userProfile.experience}年  
- 期望工作地点: ${userProfile.location}

请进行深度匹配分析：

🎯 **匹配度评分标准** (请严格按此标准评分):
- 90-100分: 技能完全匹配，经验超出要求，地点完美
- 80-89分: 技能高度匹配，经验符合要求，地点合适
- 70-79分: 技能较匹配，经验基本符合，地点可接受
- 60-69分: 技能部分匹配，经验略有差距，地点一般
- 50-59分: 技能有一定相关性，经验有明显差距
- 40-49分: 技能相关性较低，经验不太符合
- 30-39分: 技能匹配度很低，经验差距很大
- 0-29分: 技能完全不匹配，经验严重不符

📊 **详细分析要求**:
1. **技能匹配分析** (权重40%): 
   - 逐一对比用户技能与职位要求的技术栈
   - 识别关键技能的匹配程度和缺失技能
   
2. **经验评估** (权重30%):
   - 对比用户经验年限与职位要求（初级1-3年，中级3-5年，高级5+年）
   - 考虑经验类型是否匹配
   
3. **地理位置** (权重20%):
   - 对比期望地点与职位地点
   - 考虑远程工作可能性
   
4. **发展潜力** (权重10%):
   - 评估该职位对用户职业发展的价值

🎯 **输出格式要求**:
- 提供具体的优势亮点和需要提升的技能
- 给出针对性的求职建议
- 必须在最后一行标注: MATCH_SCORE: [具体数字]`;
        }

        prompt += `

📋 **基础分析要求**:
1. **职位级别评估**: 初级/中级/高级，对应的经验要求
2. **核心技术栈**: 必备技能 vs 加分技能
3. **工作模式**: 远程/混合/现场，工作灵活度
4. **发展前景**: 晋升路径，学习机会，行业前景
5. **公司背景**: 规模，文化，发展阶段

💡 **输出要求**:
- 使用友好、专业的中文表达
- 包含适当的emoji提升可读性  
- 重点突出关键信息，控制在200字以内
- 如果有用户档案，必须包含个性化匹配分析
- 语调积极正面，给求职者信心和指导`;

        console.log('🌐 调用Claude API...');
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': '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',
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 300,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        console.log('📥 API响应状态:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Claude API错误:', errorText);
            throw new Error(`Claude API调用失败: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Claude API成功返回');
        
        const fullText = data.content[0].text.trim();
        
        // 提取匹配度分数
        let matchScore = null;
        let summary = fullText;
        
        const matchRegex = /MATCH_SCORE:\s*(\d+)/i;
        const match = fullText.match(matchRegex);
        
        if (match) {
            matchScore = parseInt(match[1]);
            // 移除匹配度分数行，保留纯净的总结
            summary = fullText.replace(/MATCH_SCORE:\s*\d+/i, '').trim();
        }
        
        console.log('🎯 提取到匹配度分数:', matchScore);
        
        sendResponse({
            success: true,
            summary: summary,
            matchScore: matchScore
        });
        
    } catch (error) {
        console.error('💥 AI总结生成失败:', error);
        
        // 返回备用总结
        sendResponse({
            success: false,
            error: error.message,
            summary: `📋 职位分析（备用总结）
            
🎯 **职位**: ${jobData.title}
🏢 **公司**: ${jobData.company}
📍 **地点**: ${jobData.location}

⚠️ AI分析暂时不可用，请查看原始职位描述了解详细要求。

建议仔细阅读职位描述，关注技能要求和工作经验需求。`
        });
    }
}

// 语言配置函数
function getLanguageInstructions(language) {
    const languages = {
        'zh-CN': {
            languageName: '中文',
            analysisInstruction: '请分析以下LinkedIn职位信息，生成一个简洁、有见地的中文总结（150字以内）',
            outputRequirement: '必须使用简体中文回复'
        },
        'en-US': {
            languageName: 'English',
            analysisInstruction: 'Please analyze the following LinkedIn job information and generate a concise, insightful English summary (within 150 words)',
            outputRequirement: 'Must respond in English'
        },
        'ja-JP': {
            languageName: '日本語',
            analysisInstruction: '以下のLinkedIn求人情報を分析し、簡潔で洞察に富んだ日本語の要約（150文字以内）を生成してください',
            outputRequirement: '日本語で返答してください'
        },
        'ko-KR': {
            languageName: '한국어',
            analysisInstruction: '다음 LinkedIn 채용 정보를 분석하여 간결하고 통찰력 있는 한국어 요약(150자 이내)을 생성해주세요',
            outputRequirement: '한국어로 답변해주세요'
        }
    };
    
    return languages[language] || languages['zh-CN'];
}

// 处理简历设置请求
function handleResumeSetup(data, sendResponse) {
    try {
        console.log('📝 尝试打开简历设置页面...');
        
        // 打开popup页面
        chrome.action.openPopup()
            .then(() => {
                console.log('✅ Popup已打开');
                sendResponse({ success: true, message: 'Popup opened successfully' });
            })
            .catch((error) => {
                console.error('❌ 无法打开popup:', error);
                // 如果无法打开popup，尝试创建新窗口
                chrome.windows.create({
                    url: chrome.runtime.getURL('smart-popup.html'),
                    type: 'popup',
                    width: 450,
                    height: 600,
                    focused: true
                }, (window) => {
                    if (window) {
                        console.log('✅ 新窗口已创建');
                        sendResponse({ success: true, message: 'New window created' });
                    } else {
                        console.error('❌ 无法创建新窗口');
                        sendResponse({ success: false, error: 'Failed to create window' });
                    }
                });
            });
    } catch (error) {
        console.error('💥 处理简历设置请求失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// 处理popup打开请求
function handleOpenPopup(data, sendResponse) {
    try {
        console.log('🚀 尝试打开完整助手...');
        
        // 直接打开popup
        chrome.action.openPopup()
            .then(() => {
                console.log('✅ 完整助手已打开');
                sendResponse({ success: true, message: 'Full assistant opened' });
            })
            .catch((error) => {
                console.error('❌ 无法打开完整助手:', error);
                sendResponse({ success: false, error: error.message });
            });
    } catch (error) {
        console.error('💥 处理popup打开请求失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// 处理Dashboard简历设置请求
function handleResumeDashboard(data, sendResponse) {
    try {
        console.log('🚀 打开Dashboard简历上传页面...');
        
        // 设置标记，让popup知道需要显示简历上传页面
        chrome.storage.local.set({ 
            'showResumeUpload': true,
            'resumeSetupMode': true 
        }).then(() => {
            // 打开popup
            chrome.action.openPopup()
                .then(() => {
                    console.log('✅ Dashboard简历页面已打开');
                    sendResponse({ success: true, message: 'Resume dashboard opened' });
                })
                .catch((error) => {
                    console.error('❌ 无法打开popup:', error);
                    sendResponse({ success: false, error: error.message });
                });
        });
    } catch (error) {
        console.error('💥 处理Dashboard简历设置失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// 处理简历分析请求
async function handleResumeAnalysis(data, sendResponse) {
    try {
        console.log('🤖 开始分析简历内容...');
        
        const resumeText = data.resumeText;
        const language = data.language || 'zh-CN';
        
        if (!resumeText || resumeText.trim().length < 50) {
            sendResponse({
                success: false,
                error: '简历内容太短，请提供完整的简历信息'
            });
            return;
        }

        // 构建AI分析提示词
        const languageInstructions = getLanguageInstructions(language);
        
        const prompt = `${languageInstructions.analysisInstruction.replace('LinkedIn职位信息', '简历内容')}，并从中提取结构化信息：

简历内容：
${resumeText}

请分析上述简历内容，提取以下信息并以JSON格式返回：

{
  "skills": ["技能1", "技能2", "技能3"],
  "experience": "工作经验的详细描述",
  "education": "教育背景信息",
  "location": "期望工作地点或当前所在地",
  "preferredRoles": ["期望职位1", "期望职位2"],
  "languages": ["语言能力1", "语言能力2"]
}

**提取要求**:
1. skills: 从简历中识别所有技术技能、工具、编程语言等
2. experience: 总结工作经验，包括年限、主要成就、项目经验
3. education: 提取学历、专业、学校等教育信息
4. location: 识别期望工作地点或现居住地
5. preferredRoles: 根据经验推断适合的职位类型
6. languages: 提取语言能力

**注意事项**:
- 只返回JSON格式，不要其他说明文字
- 如果某个字段信息不足，设为空字符串或空数组
- ${languageInstructions.outputRequirement}`;

        console.log('🌐 调用Claude API分析简历...');
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': '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',
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 500,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        console.log('📥 API响应状态:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Claude API错误:', errorText);
            throw new Error(`Claude API调用失败: ${response.status} - ${errorText}`);
        }

        const apiData = await response.json();
        console.log('✅ Claude API成功返回');
        
        const fullText = apiData.content[0].text.trim();
        
        try {
            // 尝试解析JSON响应
            let jsonMatch = fullText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('未找到JSON格式响应');
            }
            
            const parsedProfile = JSON.parse(jsonMatch[0]);
            
            // 验证和清理数据
            const cleanedProfile = {
                skills: Array.isArray(parsedProfile.skills) ? parsedProfile.skills.filter(s => s && s.trim()) : [],
                experience: parsedProfile.experience || '',
                education: parsedProfile.education || '',
                location: parsedProfile.location || '',
                preferredRoles: Array.isArray(parsedProfile.preferredRoles) ? parsedProfile.preferredRoles.filter(r => r && r.trim()) : [],
                languages: Array.isArray(parsedProfile.languages) ? parsedProfile.languages.filter(l => l && l.trim()) : ['中文']
            };
            
            console.log('🎯 简历分析完成:', cleanedProfile);
            
            sendResponse({
                success: true,
                profile: cleanedProfile,
                message: '简历分析完成'
            });
            
        } catch (parseError) {
            console.error('❌ 解析AI响应失败:', parseError);
            console.log('📝 原始响应:', fullText);
            
            sendResponse({
                success: false,
                error: '简历分析结果解析失败，请重试',
                rawResponse: fullText
            });
        }
        
    } catch (error) {
        console.error('💥 简历分析失败:', error);
        
        sendResponse({
            success: false,
            error: error.message || '简历分析失败，请重试'
        });
    }
}

console.log('👂 消息监听器已设置');
console.log('✅ 简单后台脚本初始化完成');