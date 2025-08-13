# LinkedIn Job Assistant - API配置说明

## 🚀 功能完成情况

✅ **已完成功能**：
- 点击生成AI总结（而非自动显示）
- 集成OpenAI GPT和Claude AI API
- 集成Google翻译API
- 完整的UI交互流程
- 错误处理和备用方案

## 🔑 API配置步骤

### 1. OpenAI API（推荐）

1. 访问：https://platform.openai.com/api-keys
2. 注册账号并创建API密钥
3. 复制以`sk-`开头的密钥
4. 替换文件中的`sk-your-openai-api-key-here`

**费用**：约$0.002/1000 tokens（非常便宜）

### 2. Claude API（备用）

1. 访问：https://console.anthropic.com/
2. 注册账号并创建API密钥
3. 复制以`sk-ant-`开头的密钥
4. 替换文件中的`sk-ant-your-claude-api-key-here`

### 3. Google翻译API

1. 访问：https://console.cloud.google.com/
2. 启用"Cloud Translation API"
3. 创建API密钥（不是OAuth）
4. 替换文件中的`YOUR_GOOGLE_API_KEY`

**费用**：$20/月免费额度（50万字符）

## 📁 配置文件位置

修改文件：`apps/extension/src/config/api-keys.ts`

```typescript
export const API_KEYS = {
  OPENAI: 'sk-proj-你的OpenAI密钥',
  CLAUDE: 'sk-ant-你的Claude密钥', 
  GOOGLE_TRANSLATE: '你的Google密钥'
};
```

## 🎯 使用方法

1. **配置API密钥**后重新构建扩展：
   ```bash
   npm run build --prefix "C:\Users\fangyu\Desktop\linkedin-job-assistant\apps\extension"
   ```

2. **重新加载Chrome扩展**

3. **访问LinkedIn工作页面**，会看到：
   - 🤖 大图标和"生成AI总结"按钮
   - 点击后显示加载动画
   - AI分析完成后显示结果
   - 可以"查看原文"、"翻译"、"重新分析"

## 🔧 API调用流程

1. **AI总结**：
   - 首先尝试OpenAI GPT-3.5
   - 失败时尝试Claude Haiku
   - 都失败时显示错误信息

2. **翻译功能**：
   - 优先使用Google翻译API
   - 失败时使用本地词典映射

## 💡 注意事项

- **首次使用**需要配置至少一个AI API密钥
- **网络问题**可能导致API调用失败
- **免费额度**用完后需要付费或等待重置
- **CORS限制**：某些API可能需要代理服务器

## 🐛 常见问题

**Q: AI总结显示"分析失败"？**
A: 检查API密钥是否正确，网络是否正常

**Q: 翻译功能不工作？**
A: 检查Google API密钥和计费账户状态

**Q: 按钮点击没反应？**
A: 打开浏览器控制台查看错误信息

## 🎉 完成状态

现在扩展具备：
- ✅ 点击触发的AI总结
- ✅ 真实的AI API调用（OpenAI + Claude备用）
- ✅ Google翻译API集成
- ✅ 专业的UI设计和用户体验
- ✅ 完整的错误处理机制

配置好API密钥后即可享受完整的AI驱动职位分析功能！