# 🚀 一键部署步骤 - LinkedIn Job Assistant

## 第一步：Supabase 数据库部署 (2分钟)

1. **打开 Supabase**
   ```
   https://supabase.com/dashboard
   ```

2. **创建新项目**
   - 点击 "New Project" 
   - 填写项目名称：`linkedin-job-assistant`
   - 设置数据库密码（记住这个密码）
   - 选择区域：`Southeast Asia (Singapore)` (最近)
   - 点击 "Create new project"

3. **设置数据库**
   - 等待项目创建完成 (约1-2分钟)
   - 点击左侧菜单 "SQL Editor"
   - 点击 "New query"
   - 复制 `supabase-setup.sql` 文件的全部内容
   - 粘贴到编辑器中
   - 点击 "RUN" 按钮
   - 看到 "Database setup completed successfully! 🎉" 表示成功

4. **获取连接信息**
   - 点击左侧菜单 "Settings" → "API"
   - 复制 "Project URL" (类似: https://xxx.supabase.co)
   - 复制 "anon public" key (很长的字符串)

## 第二步：Vercel 网站部署 (3分钟)

1. **打开 Vercel**
   ```
   https://vercel.com
   ```

2. **登录并创建项目**
   - 使用 GitHub/Google 登录
   - 点击 "Add New..." → "Project"

3. **上传项目**
   - 点击 "Browse" 或拖拽整个项目文件夹
   - 选择 `linkedin-job-assistant` 文件夹
   - Framework: 选择 "Next.js"
   - Root Directory: 选择 `apps/dashboard`
   - 点击 "Deploy"

4. **配置环境变量**
   - 部署完成后，进入项目设置
   - 点击 "Settings" → "Environment Variables"
   - 添加以下变量：
     ```
     NEXT_PUBLIC_SUPABASE_URL = 你的Supabase Project URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY = 你的Supabase anon key
     OPENAI_API_KEY = 你的OpenAI API密钥 (可选)
     ```
   - 点击 "Redeploy" 重新部署

## 第三步：Chrome 扩展安装 (1分钟)

1. **打开 Chrome 扩展页面**
   ```
   chrome://extensions/
   ```

2. **启用开发者模式**
   - 右上角开启 "Developer mode" 开关

3. **加载扩展**
   - 点击 "Load unpacked"
   - 选择文件夹：`apps/extension/dist`
   - 扩展应该出现在列表中

4. **配置扩展**
   - 编辑文件：`apps/extension/src/utils/supabase.ts`
   - 将 `YOUR_SUPABASE_URL` 替换为你的 Supabase URL
   - 将 `YOUR_SUPABASE_ANON_KEY` 替换为你的 anon key
   - 重新运行：`npm run build` (在 apps/extension 目录)
   - 在 Chrome 扩展页面点击 "🔄" 重新加载扩展

## 第四步：测试部署 (1分钟)

1. **测试网站**
   - 访问你的 Vercel 网站 URL
   - 检查所有页面是否正常加载

2. **测试扩展**
   - 访问 https://www.linkedin.com/jobs/
   - 点击任意职位
   - 应该看到右侧出现分析面板

## 🎯 完成！

总共约7分钟，你的 LinkedIn Job Assistant 就完全部署成功了！

### 📱 使用方法：
- **网站端**：访问你的 Vercel URL 管理职位和简历
- **扩展端**：在 LinkedIn 上浏览职位时自动分析并保存

### 🔧 如果遇到问题：
1. **Supabase连接失败**：检查URL和Key是否正确
2. **扩展不显示**：确保已重新构建并刷新扩展
3. **部署失败**：检查环境变量是否设置正确

现在你就有了一个完全可用的 LinkedIn 求职助手！🎉