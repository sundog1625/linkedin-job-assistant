// 注入脚本：在页面主线程中运行，绕过LinkedIn的沙盒限制
console.log('🔧 LinkedIn Job Assistant 注入脚本已加载');

// 监听DOM事件
document.addEventListener('lja-generate-summary', async function(event) {
  console.log('🎯 收到AI总结请求:', event.detail);
  
  const { requestId, jobData } = event.detail;
  const dataElement = document.getElementById(requestId);
  
  if (!dataElement) {
    console.error('❌ 找不到数据元素:', requestId);
    return;
  }

  try {
    // 调用Claude API
    console.log('🤖 开始调用Claude API...');
    
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': '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',
        'anthropic-version': '2023-06-01'
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

    console.log('📥 Claude API响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API错误:', errorText);
      throw new Error(`Claude API调用失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Claude API成功返回');
    
    const summary = data.content[0].text.trim();
    
    // 更新DOM元素状态
    dataElement.setAttribute('data-status', 'completed');
    dataElement.setAttribute('data-success', 'true');
    dataElement.setAttribute('data-summary', summary);
    
    console.log('✨ AI总结生成完成');
    
  } catch (error) {
    console.error('💥 AI总结生成失败:', error);
    
    // 设置错误状态
    dataElement.setAttribute('data-status', 'error');
    dataElement.setAttribute('data-success', 'false');
    dataElement.setAttribute('data-error', error.message);
    
    // 创建备用总结
    const fallbackSummary = `📋 职位分析（本地生成）
      
🎯 **职位**: ${jobData.title}
🏢 **公司**: ${jobData.company}
📍 **地点**: ${jobData.location}

⚠️ AI分析暂时不可用，请查看原始职位描述了解详细要求。

建议仔细阅读职位描述，关注技能要求和工作经验需求。`;
    
    dataElement.setAttribute('data-summary', fallbackSummary);
  }
});

console.log('👂 注入脚本事件监听器已设置完成');