// 直接测试Claude API
const API_KEY = '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';

async function testClaudeAPI() {
  console.log('🧪 开始测试Claude API...');
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: '请说"Hello World"'
          }
        ]
      })
    });

    console.log('📥 API响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API错误:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API成功返回:', data);
    console.log('📝 回复内容:', data.content[0].text);
    
  } catch (error) {
    console.error('💥 API调用失败:', error);
  }
}

testClaudeAPI();