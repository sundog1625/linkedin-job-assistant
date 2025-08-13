// Simple test content script
console.log('LinkedIn Job Assistant Extension Loaded!');

// Add a simple test element to the page
const testDiv = document.createElement('div');
testDiv.id = 'lja-test';
testDiv.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #0077B5;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  z-index: 10000;
  font-family: system-ui;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;
testDiv.innerHTML = '🚀 LJA Extension Active';
document.body.appendChild(testDiv);

// Log page URL
console.log('Current page:', window.location.href);

// Check if on jobs page
if (window.location.href.includes('/jobs/')) {
  console.log('On LinkedIn jobs page!');
  testDiv.innerHTML = '💼 LJA - Jobs Page Detected';
}