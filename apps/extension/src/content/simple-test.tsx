// 超简单的测试内容脚本
console.log('=== LinkedIn Job Assistant 扩展已加载 ===');
console.log('当前页面:', window.location.href);

// 创建测试元素
const testElement = document.createElement('div');
testElement.id = 'lja-simple-test';
testElement.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  background: #00a0dc;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  z-index: 999999;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
`;
testElement.textContent = '✅ LJA Extension Loaded';

// 等待页面完全加载后添加
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(testElement);
  });
} else {
  document.body.appendChild(testElement);
}

// 5秒后自动隐藏
setTimeout(() => {
  testElement.style.display = 'none';
}, 5000);