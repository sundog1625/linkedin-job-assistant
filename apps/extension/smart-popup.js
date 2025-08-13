// 智能popup脚本
console.log('🚀 智能LinkedIn AI助手已加载');

let currentJobData = null;
let userProfile = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📱 Popup初始化...');
    await initializePopup();
});

async function initializePopup() {
    try {
        // 先加载用户Profile
        await loadUserProfile();
        
        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('🔍 当前标签页:', tab.url);
        
        if (isLinkedInJobPage(tab.url)) {
            console.log('✅ 检测到LinkedIn职位页面');
            await handleLinkedInJobPage(tab);
        } else {
            showNotLinkedInPage();
        }
    } catch (error) {
        console.error('💥 初始化失败:', error);
        showError('初始化失败: ' + error.message);
    }
}

function isLinkedInJobPage(url) {
    return url && (
        url.includes('linkedin.com/jobs/view/') ||
        url.includes('linkedin.com/jobs/collections/')
    );
}

async function handleLinkedInJobPage(tab) {
    updateStatus('正在提取职位信息...', 'loading');
    
    try {
        // 从页面提取职位信息
        const jobData = await extractJobDataFromTab(tab.id);
        
        if (jobData) {
            currentJobData = jobData;
            displayJobInfo(jobData);
            updateStatus('职位信息提取成功！可以手动生成AI分析', 'success');
            
            // 显示操作按钮而不是自动生成总结
            showManualAnalysisSection();
        } else {
            updateStatus('无法提取职位信息，请刷新页面后重试', 'error');
        }
    } catch (error) {
        console.error('💥 提取职位信息失败:', error);
        updateStatus('提取职位信息失败: ' + error.message, 'error');
    }
}

async function extractJobDataFromTab(tabId) {
    return new Promise((resolve) => {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                // 在页面中执行的提取函数
                console.log('🔍 开始提取职位数据...');
                
                const titleSelectors = [
                    '.job-details-jobs-unified-top-card__job-title h1',
                    '.jobs-unified-top-card__job-title h1',
                    '.t-24.t-bold.inline',
                    'h1[data-automation-id="jobTitle"]'
                ];
                
                const companySelectors = [
                    '.job-details-jobs-unified-top-card__company-name a',
                    '.jobs-unified-top-card__company-name a',
                    '.job-details-jobs-unified-top-card__company-name',
                    '.jobs-unified-top-card__company-name'
                ];
                
                const locationSelectors = [
                    '.job-details-jobs-unified-top-card__bullet',
                    '.jobs-unified-top-card__bullet',
                    '.jobs-unified-top-card__subtitle-primary-grouping .t-black--light'
                ];
                
                const descriptionSelectors = [
                    '.jobs-description-content__text',
                    '.jobs-box__html-content',
                    '.jobs-description__content'
                ];
                
                function findElement(selectors) {
                    for (const selector of selectors) {
                        const element = document.querySelector(selector);
                        if (element && element.textContent?.trim()) {
                            return element;
                        }
                    }
                    return null;
                }
                
                const titleElement = findElement(titleSelectors);
                const companyElement = findElement(companySelectors);
                const locationElement = findElement(locationSelectors);
                const descriptionElement = findElement(descriptionSelectors);
                
                if (!titleElement) {
                    console.log('❌ 未找到职位标题');
                    return null;
                }
                
                const jobData = {
                    title: titleElement.textContent?.trim() || 'Unknown Position',
                    company: companyElement?.textContent?.trim() || 'Unknown Company',
                    location: locationElement?.textContent?.trim() || 'Unknown Location',
                    description: descriptionElement?.textContent?.trim() || 'No description available',
                    url: window.location.href
                };
                
                console.log('✅ 提取到职位数据:', jobData);
                return jobData;
            }
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error('❌ 执行脚本失败:', chrome.runtime.lastError);
                resolve(null);
            } else if (results && results[0] && results[0].result) {
                resolve(results[0].result);
            } else {
                resolve(null);
            }
        });
    });
}

function displayJobInfo(jobData) {
    const jobInfoDiv = document.getElementById('job-info');
    jobInfoDiv.innerHTML = `
        <div class="job-title">${jobData.title}</div>
        <div class="job-company">🏢 ${jobData.company}</div>
        <div class="job-location">📍 ${jobData.location}</div>
    `;
    jobInfoDiv.style.display = 'block';
}

async function generateAISummary() {
    if (!currentJobData) {
        showError('没有职位数据可供分析');
        return;
    }
    
    updateStatus('🤖 AI正在分析职位信息...', 'loading');
    
    try {
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                type: 'GENERATE_AI_SUMMARY',
                data: {
                    jobData: currentJobData,
                    userProfile: userProfile,
                    language: 'zh-CN'  // 默认中文，可以后续从storage读取
                }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
        
        if (response.success) {
            displayAISummary(response.summary, response.matchScore);
            updateStatus('✨ AI分析完成！', 'success');
        } else {
            throw new Error(response.error || '未知错误');
        }
    } catch (error) {
        console.error('💥 AI总结失败:', error);
        updateStatus('AI分析失败: ' + error.message, 'error');
        showRetryButton();
    }
}

function displayAISummary(summary, matchScore) {
    const summarySection = document.getElementById('summary-section');
    
    let content = '';
    
    // 如果有匹配度分数，显示匹配度卡片
    if (matchScore !== undefined && userProfile) {
        const scoreColor = matchScore >= 80 ? '#28a745' : matchScore >= 60 ? '#ffc107' : '#dc3545';
        const scoreText = matchScore >= 80 ? '高度匹配' : matchScore >= 60 ? '中等匹配' : '较低匹配';
        
        content += `
            <div class="match-score" style="background: linear-gradient(135deg, ${scoreColor}, ${scoreColor}dd); box-shadow: 0 12px 30px ${scoreColor}40;">
                <div class="match-percentage">${matchScore}%</div>
                <div class="match-score-text">🎯 ${scoreText}</div>
            </div>
        `;
    }
    
    content += `
        <div class="summary">
            <h3>🤖 AI智能分析</h3>
            <div>${summary}</div>
        </div>
    `;
    
    summarySection.innerHTML = content;
    summarySection.style.display = 'block';
    
    showActionsSection();
}

function showManualAnalysisSection() {
    const actionsDiv = document.getElementById('actions');
    actionsDiv.innerHTML = `
        <button class="btn btn-primary" onclick="generateAISummary()">
            🤖 生成AI职位分析
        </button>
    `;
    actionsDiv.style.display = 'block';
}

function showActionsSection() {
    const actionsDiv = document.getElementById('actions');
    actionsDiv.innerHTML = `
        <button class="btn btn-primary" onclick="regenerateAISummary()">
            🔄 重新分析
        </button>
    `;
    actionsDiv.style.display = 'block';
}

function showRetryButton() {
    const actionsDiv = document.getElementById('actions');
    actionsDiv.innerHTML = `
        <button class="btn btn-primary" onclick="generateAISummary()">
            🔄 重试AI分析
        </button>
    `;
    actionsDiv.style.display = 'block';
}

function regenerateAISummary() {
    document.getElementById('summary-section').style.display = 'none';
    generateAISummary();
}

function showNotLinkedInPage() {
    updateStatus(
        '请在LinkedIn职位页面使用此扩展。<br><br>' +
        '💡 使用方法：<br>' +
        '1. 打开LinkedIn.com<br>' +
        '2. 浏览任意职位页面<br>' +
        '3. 点击此扩展图标<br>' +
        '4. 获得AI智能分析！',
        'info'
    );
}

function updateStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.className = `status status-${type}`;
    statusDiv.innerHTML = type === 'loading' ? 
        `<span class="spinner"></span>${message}` : 
        message;
}

function showError(message) {
    updateStatus(`❌ ${message}`, 'error');
}

// Profile管理功能
async function loadUserProfile() {
    try {
        const result = await chrome.storage.local.get('userProfile');
        if (result.userProfile) {
            userProfile = result.userProfile;
            console.log('👤 用户Profile已加载:', userProfile);
        } else {
            console.log('👤 未找到用户Profile');
        }
        displayProfileSection();
    } catch (error) {
        console.error('💥 加载Profile失败:', error);
    }
}

function displayProfileSection() {
    const profileSection = document.getElementById('profile-section');
    
    if (!userProfile) {
        profileSection.innerHTML = `
            <div class="profile-setup">
                <h4>🎯 个性化匹配分析</h4>
                <p style="color: #6c757d; font-size: 13px; margin: 10px 0;">
                    设置您的技能和经验，获得AI个性化职位匹配分析
                </p>
                <button class="btn btn-primary" onclick="showProfileSetup()">
                    📝 设置个人档案
                </button>
            </div>
        `;
    } else {
        const skillsDisplay = Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : userProfile.skills;
        const rolesDisplay = Array.isArray(userProfile.preferredRoles) && userProfile.preferredRoles.length > 0 ? 
            userProfile.preferredRoles.join(', ') : '未设置';
        const languagesDisplay = Array.isArray(userProfile.languages) && userProfile.languages.length > 0 ? 
            userProfile.languages.join(', ') : '未设置';
            
        profileSection.innerHTML = `
            <div class="profile-display">
                <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1a202c;">👤 您的简历档案</h4>
                <div class="profile-item">
                    <strong>💼 技能:</strong>
                    <span style="color: #667eea; font-weight: 500;">${skillsDisplay}</span>
                </div>
                <div class="profile-item">
                    <strong>📚 经验:</strong>
                    <span>${userProfile.experience}</span>
                </div>
                <div class="profile-item">
                    <strong>🎓 教育:</strong>
                    <span>${userProfile.education}</span>
                </div>
                <div class="profile-item">
                    <strong>📍 地点:</strong>
                    <span>${userProfile.location}</span>
                </div>
                <div class="profile-item">
                    <strong>🎯 期望职位:</strong>
                    <span>${rolesDisplay}</span>
                </div>
                <div class="profile-item">
                    <strong>🌐 语言:</strong>
                    <span>${languagesDisplay}</span>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 16px;">
                    <button class="btn btn-small" onclick="showProfileSetup()" style="flex: 1; background: linear-gradient(135deg, #9f7aea, #667eea); color: white;">
                        ✏️ 编辑档案
                    </button>
                    <button class="btn btn-small" onclick="clearProfile()" style="width: auto; background: #dc3545; color: white;">
                        🗑️ 清除
                    </button>
                </div>
            </div>
        `;
    }
    profileSection.style.display = 'block';
}

function showProfileSetup() {
    const profileSection = document.getElementById('profile-section');
    profileSection.innerHTML = `
        <div class="profile-setup">
            <h4>📝 设置个人简历档案</h4>
            <div style="text-align: left; margin: 15px 0; max-height: 300px; overflow-y: auto;">
                <div style="margin-bottom: 12px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 13px; font-weight: 600; color: #4a5568;">💼 核心技能:</label>
                    <textarea id="skills-input" placeholder="请输入您的技能，用逗号分隔&#10;如: React, JavaScript, Python, 项目管理, 数据分析" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; resize: vertical; min-height: 60px;">${Array.isArray(userProfile?.skills) ? userProfile.skills.join(', ') : (userProfile?.skills || '')}</textarea>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 13px; font-weight: 600; color: #4a5568;">📚 工作经验描述:</label>
                    <textarea id="experience-input" placeholder="请描述您的工作经验&#10;如: 3年前端开发经验，熟悉React生态系统，参与过多个电商项目开发" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; resize: vertical; min-height: 80px;">${userProfile?.experience || ''}</textarea>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 13px; font-weight: 600; color: #4a5568;">🎓 教育背景:</label>
                    <input type="text" id="education-input" placeholder="如: 计算机科学本科, 北京大学" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;"
                           value="${userProfile?.education || ''}">
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 13px; font-weight: 600; color: #4a5568;">📍 期望工作地点:</label>
                    <input type="text" id="location-input" placeholder="如: 北京, 上海, 深圳, 远程工作" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;"
                           value="${userProfile?.location || ''}">
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 13px; font-weight: 600; color: #4a5568;">🎯 期望职位类型:</label>
                    <textarea id="preferred-roles-input" placeholder="请输入期望的职位，用逗号分隔&#10;如: 前端工程师, 全栈开发, 技术经理" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; resize: vertical; min-height: 50px;">${Array.isArray(userProfile?.preferredRoles) ? userProfile.preferredRoles.join(', ') : (userProfile?.preferredRoles || '')}</textarea>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 13px; font-weight: 600; color: #4a5568;">🌐 语言能力:</label>
                    <input type="text" id="languages-input" placeholder="如: 中文（母语）, 英语（流利）, 日语（基础）" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;"
                           value="${Array.isArray(userProfile?.languages) ? userProfile.languages.join(', ') : (userProfile?.languages || '')}">
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="saveUserProfile()" style="flex: 1;">
                    💾 保存简历档案
                </button>
                <button class="btn" onclick="cancelProfileSetup()" style="flex: 0 0 auto; width: auto; padding: 16px 20px; background: #6c757d; color: white;">
                    取消
                </button>
            </div>
        </div>
    `;
}

async function saveUserProfile() {
    const skills = document.getElementById('skills-input').value.trim();
    const experience = document.getElementById('experience-input').value.trim();
    const education = document.getElementById('education-input').value.trim();
    const location = document.getElementById('location-input').value.trim();
    const preferredRoles = document.getElementById('preferred-roles-input').value.trim();
    const languages = document.getElementById('languages-input').value.trim();
    
    if (!skills || !experience) {
        alert('请至少填写核心技能和工作经验');
        return;
    }
    
    // 构建符合接口的用户资料
    userProfile = {
        skills: skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
        experience: experience,
        education: education || '未填写',
        location: location || '不限',
        preferredRoles: preferredRoles ? preferredRoles.split(',').map(r => r.trim()).filter(r => r.length > 0) : [],
        languages: languages ? languages.split(',').map(l => l.trim()).filter(l => l.length > 0) : ['中文']
    };
    
    try {
        await chrome.storage.local.set({ userProfile: userProfile });
        console.log('✅ 简历档案保存成功:', userProfile);
        displayProfileSection();
        
        updateStatus('✅ 简历档案已保存！现在可以获得个性化匹配分析', 'success');
        
        // 如果已有职位数据，显示分析按钮
        if (currentJobData) {
            showManualAnalysisSection();
        }
    } catch (error) {
        console.error('💥 保存简历档案失败:', error);
        alert('保存失败，请重试');
    }
}

function cancelProfileSetup() {
    displayProfileSection();
}

async function clearProfile() {
    if (confirm('确定要清除所有简历档案信息吗？此操作无法撤销。')) {
        try {
            await chrome.storage.local.remove('userProfile');
            userProfile = null;
            console.log('🗑️ 简历档案已清除');
            displayProfileSection();
            updateStatus('🗑️ 简历档案已清除', 'info');
        } catch (error) {
            console.error('💥 清除简历档案失败:', error);
            alert('清除失败，请重试');
        }
    }
}

// 简历上传功能已移至Dashboard
// popup保持简洁，专注于LinkedIn职位分析

console.log('✅ 智能popup脚本加载完成');