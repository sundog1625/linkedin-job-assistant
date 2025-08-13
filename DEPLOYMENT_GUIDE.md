# LinkedIn Job Assistant 部署指南

## 已完成的功能

### 1. Chrome扩展端
- ✅ 修复了面板位置（现在显示在右侧边栏）
- ✅ 实现真实的简历匹配度分数
- ✅ 添加语言选择功能
- ✅ 移除了弹窗中的自动总结（避免重复）
- ✅ "设置简历信息"按钮直接跳转到Vercel Dashboard

### 2. Dashboard端
- ✅ 实现了完整的简历上传页面 (`/resume`)
- ✅ 集成了AI简历分析功能
- ✅ 自动提取并填充用户信息
- ✅ 创建了 `/api/analyze-resume` API端点

## 部署步骤

### 1. Vercel部署
```bash
# 1. 登录Vercel
vercel login

# 2. 进入dashboard目录
cd apps/dashboard

# 3. 部署到Vercel
vercel --prod

# 4. 设置环境变量（在Vercel控制台）
# ANTHROPIC_API_KEY = 你的Claude API密钥
```

### 2. 确认Dashboard URL
部署后，你的Dashboard URL应该是：
`https://linkedin-job-assistant.vercel.app`

### 3. 更新扩展中的URL（如需要）
如果Vercel分配的URL不同，需要更新：
`apps/extension/src/content/safe-version.tsx`

```typescript
const dashboardUrl = 'https://你的实际URL.vercel.app/resume?setup=true';
```

## 功能验证

### 测试流程
1. 打开LinkedIn职位页面
2. 点击右侧面板中的"设置简历信息"
3. 应该跳转到Dashboard的简历页面
4. 上传简历文件或粘贴文本
5. 点击"AI分析简历"
6. 查看自动填充的信息
7. 保存简历信息
8. 返回LinkedIn查看匹配度更新

## 环境变量配置

在Vercel Dashboard设置以下环境变量：
- `ANTHROPIC_API_KEY`: Claude API密钥（必需）

## 注意事项

1. 确保Dashboard和Extension使用相同的数据结构
2. Chrome Storage会在扩展端保存用户简历信息
3. Dashboard使用localStorage保存用户设置
4. AI分析需要有效的Claude API密钥

## 文件结构
```
apps/
├── dashboard/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── resume/
│   │   │       └── page.tsx  # 简历上传页面
│   │   └── api/
│   │       └── analyze-resume/
│   │           └── route.ts  # AI分析API
│   └── vercel.json           # Vercel配置
└── extension/
    └── src/
        └── content/
            └── safe-version.tsx  # 已更新跳转逻辑
```