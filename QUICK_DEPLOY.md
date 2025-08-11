# 🚀 3步快速部署 LinkedIn Job Assistant

## 已完成 ✅
- Git仓库已初始化，代码已提交
- 所有配置文件已准备完毕
- Chrome Extension已构建完成

## 接下来只需要：

### 1️⃣ 创建GitHub仓库 (1分钟)
页面已自动打开：
- Repository name: `linkedin-job-assistant`
- Description: `AI-powered LinkedIn job application assistant with Chrome extension`
- Public 或 Private (你选择)
- **不要**勾选 "Add a README file"
- **不要**勾选 "Add .gitignore"
- 点击 "Create repository"

### 2️⃣ 推送代码到GitHub
创建仓库后，复制仓库URL，然后运行：
```bash
git -C "C:\Users\fangyu\Desktop\linkedin-job-assistant" remote add origin https://github.com/你的用户名/linkedin-job-assistant.git
git -C "C:\Users\fangyu\Desktop\linkedin-job-assistant" push -u origin main
```

### 3️⃣ Vercel自动部署 (2分钟)
页面已自动打开：
- 选择 "Import Git Repository"
- 选择刚创建的 `linkedin-job-assistant` 仓库
- Framework: `Next.js`
- Root Directory: `apps/dashboard`
- 点击 "Deploy"

### 4️⃣ 配置环境变量
部署完成后，在Vercel项目设置 → Environment Variables 添加：
```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase密钥
```

### 5️⃣ 设置Supabase数据库 (3分钟)
页面已自动打开：
- 点击 "New project"
- 项目名: `linkedin-job-assistant` 
- 等待创建完成
- 进入 SQL Editor → 新建查询
- 复制 `supabase-setup.sql` 全部内容，粘贴并运行
- 在Settings → API 获取URL和密钥

### 6️⃣ Chrome扩展安装
```
chrome://extensions/
```
- 开启开发者模式
- 点击"加载已解压的扩展程序"
- 选择 `apps/extension/dist` 文件夹

## 🎉 完成！

总用时约7分钟，你就有了：
- ✅ 专业的GitHub代码托管
- ✅ 自动部署的Web网站
- ✅ 完整的数据库系统
- ✅ 可用的Chrome扩展

你的LinkedIn Job Assistant现在完全可用了！

---
**需要仓库URL？** 告诉我你的GitHub用户名，我可以直接帮你推送代码。