// Debug popup外部脚本
console.log('🚀 Debug popup JS文件已加载');

// 立即执行的基础测试
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('status').innerHTML = '✅ HTML和CSS已加载<br>🔄 JavaScript开始执行...';
    
    // 绑定事件监听器
    document.getElementById('test-basic').addEventListener('click', testBasic);
    document.getElementById('test-chrome').addEventListener('click', testChrome);
    document.getElementById('test-background').addEventListener('click', testBackground);
    document.getElementById('test-ai').addEventListener('click', testAI);
    
    console.log('✅ 事件监听器已绑定');
});

function testBasic() {
    const now = new Date().toLocaleString();
    document.getElementById('status').innerHTML = `✅ 基础JavaScript正常<br>⏰ 时间: ${now}`;
}

function testChrome() {
    let result = '🔍 Chrome API测试:<br>';
    
    if (typeof chrome !== 'undefined') {
        result += '✅ chrome对象存在<br>';
        
        if (chrome.runtime) {
            result += '✅ chrome.runtime可用<br>';
            result += `📍 扩展ID: ${chrome.runtime.id}<br>`;
        } else {
            result += '❌ chrome.runtime不可用<br>';
        }
        
        if (chrome.storage) {
            result += '✅ chrome.storage可用<br>';
        } else {
            result += '❌ chrome.storage不可用<br>';
        }
    } else {
        result += '❌ chrome对象不存在<br>';
    }
    
    document.getElementById('status').innerHTML = result;
}

function testBackground() {
    document.getElementById('status').innerHTML = '🔄 测试后台脚本通信...';
    
    if (typeof chrome === 'undefined' || !chrome.runtime) {
        document.getElementById('status').innerHTML = '❌ Chrome runtime不可用';
        return;
    }
    
    try {
        chrome.runtime.sendMessage({
            type: 'TEST_MESSAGE',
            data: 'Hello from popup'
        }, function(response) {
            if (chrome.runtime.lastError) {
                document.getElementById('status').innerHTML = `❌ 通信失败: ${chrome.runtime.lastError.message}`;
            } else if (response) {
                document.getElementById('status').innerHTML = `✅ 后台响应: ${JSON.stringify(response)}`;
            } else {
                document.getElementById('status').innerHTML = '❌ 没有收到响应';
            }
        });
        
        // 5秒超时
        setTimeout(() => {
            if (document.getElementById('status').innerHTML.includes('测试后台脚本通信')) {
                document.getElementById('status').innerHTML = '⏰ 后台脚本响应超时';
            }
        }, 5000);
        
    } catch (error) {
        document.getElementById('status').innerHTML = `💥 通信异常: ${error.message}`;
    }
}

function testAI() {
    document.getElementById('status').innerHTML = '🤖 测试AI总结功能...';
    
    if (typeof chrome === 'undefined' || !chrome.runtime) {
        document.getElementById('status').innerHTML = '❌ Chrome runtime不可用';
        return;
    }
    
    try {
        chrome.runtime.sendMessage({
            type: 'GENERATE_AI_SUMMARY',
            data: {
                title: '高级前端开发工程师',
                company: '某知名科技公司',
                location: '北京',
                description: '负责前端架构设计，熟悉React、Vue等框架，具备良好的编程基础和团队协作能力。'
            }
        }, function(response) {
            if (chrome.runtime.lastError) {
                document.getElementById('status').innerHTML = `❌ AI调用失败: ${chrome.runtime.lastError.message}`;
            } else if (response) {
                if (response.success) {
                    document.getElementById('status').innerHTML = `✅ AI总结成功!<br><br><strong>生成的总结:</strong><br>${response.summary}`;
                } else {
                    document.getElementById('status').innerHTML = `❌ AI总结失败: ${response.error || '未知错误'}`;
                }
            } else {
                document.getElementById('status').innerHTML = '❌ 没有收到AI响应';
            }
        });
        
        // 30秒超时
        setTimeout(() => {
            if (document.getElementById('status').innerHTML.includes('测试AI总结功能')) {
                document.getElementById('status').innerHTML = '⏰ AI总结响应超时';
            }
        }, 30000);
        
    } catch (error) {
        document.getElementById('status').innerHTML = `💥 AI调用异常: ${error.message}`;
    }
}

// 页面加载完成后的初始化
window.addEventListener('load', function() {
    document.getElementById('status').innerHTML += '<br>✅ 页面加载完成';
    console.log('✅ Debug popup 完全初始化完成');
});