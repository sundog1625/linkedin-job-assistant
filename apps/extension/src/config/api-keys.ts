// API配置文件
// 请将这些替换为你的真实API密钥

export const API_KEYS = {
  // OpenAI API Key - 需要从 https://platform.openai.com/api-keys 获取
  OPENAI: 'sk-your-openai-api-key-here',
  
  // Claude API Key - 需要从 https://console.anthropic.com/ 获取  
  CLAUDE: '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',
  
  // Google Translate API Key - 需要从 https://console.cloud.google.com/ 获取
  GOOGLE_TRANSLATE: 'YOUR_GOOGLE_API_KEY'
};

// API配置
export const API_CONFIG = {
  // OpenAI配置
  OPENAI: {
    BASE_URL: 'https://api.openai.com/v1',
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 300,
    TEMPERATURE: 0.7
  },
  
  // Claude配置  
  CLAUDE: {
    BASE_URL: 'https://api.anthropic.com/v1',
    MODEL: 'claude-3-haiku-20240307',
    MAX_TOKENS: 300,
    VERSION: '2023-06-01'
  },
  
  // Google翻译配置
  GOOGLE_TRANSLATE: {
    BASE_URL: 'https://translation.googleapis.com/language/translate/v2'
  }
};

// 检查API密钥是否已配置
export function checkAPIKeys() {
  const warnings = [];
  
  if (API_KEYS.OPENAI === 'sk-your-openai-api-key-here') {
    warnings.push('OpenAI API Key 未配置');
  }
  
  if (API_KEYS.CLAUDE === 'sk-ant-your-claude-api-key-here') {
    warnings.push('Claude API Key 未配置');
  }
  
  if (API_KEYS.GOOGLE_TRANSLATE === 'YOUR_GOOGLE_API_KEY') {
    warnings.push('Google Translate API Key 未配置');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ API配置提醒:', warnings.join(', '));
    console.warn('请在 src/config/api-keys.ts 中配置您的API密钥');
  }
  
  return warnings.length === 0;
}