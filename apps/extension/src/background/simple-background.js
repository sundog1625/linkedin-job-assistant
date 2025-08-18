// LinkedIn Job Assistant - Simple Background Script
console.log('🚀 LinkedIn Job Assistant Background Script Started');

// 简单的后台脚本，不依赖复杂的API配置
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📧 Background received message:', request);
  
  if (request.type === 'GENERATE_AI_SUMMARY') {
    sendResponse({
      success: false,
      error: 'AI Summary功能需要配置API密钥'
    });
    return;
  }
  
  if (request.type === 'OPEN_POPUP') {
    console.log('🚀 Opening popup for URL:', request.data?.url);
    sendResponse({
      success: true
    });
    return;
  }
  
  sendResponse({
    success: false,
    error: 'Unknown message type'
  });
});

console.log('✅ Background script initialized successfully');