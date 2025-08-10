@echo off
chcp 65001 >nul
echo ========================================
echo     GitHub + Vercel 自动部署设置
echo ========================================
echo.

echo 🚀 第一步: 创建GitHub仓库
echo ----------------------------------------
echo 正在打开GitHub创建页面...
start https://github.com/new
echo.
echo 📋 请在GitHub页面填写:
echo    Repository name: linkedin-job-assistant
echo    Description: AI-powered LinkedIn job application assistant
echo    Public/Private: 你选择
echo    ✅ Add a README file: 取消勾选 (我们已经有了)
echo    ✅ Add .gitignore: 取消勾选 (我们已经有了)
echo    ✅ Choose a license: 可选 MIT License
echo.
pause

echo 🔗 第二步: 连接本地仓库到GitHub
echo ----------------------------------------
set /p GITHUB_URL=请输入GitHub仓库URL (例如: https://github.com/username/linkedin-job-assistant.git): 

git -C "C:\Users\fangyu\Desktop\linkedin-job-assistant" remote add origin %GITHUB_URL%
git -C "C:\Users\fangyu\Desktop\linkedin-job-assistant" branch -M main
git -C "C:\Users\fangyu\Desktop\linkedin-job-assistant" push -u origin main

echo ✅ 代码已推送到GitHub!
echo.

echo 🌐 第三步: Vercel自动部署
echo ----------------------------------------
echo 正在打开Vercel导入页面...
start https://vercel.com/new
echo.
echo 📋 在Vercel页面:
echo 1. 选择 "Import Git Repository"
echo 2. 找到并选择 linkedin-job-assistant 仓库
echo 3. Framework Preset: Next.js
echo 4. Root Directory: apps/dashboard
echo 5. 点击 Deploy
echo.
pause

echo 🔧 第四步: 配置环境变量
echo ----------------------------------------
echo 部署完成后，在Vercel项目设置中添加环境变量:
echo.
echo NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
echo OPENAI_API_KEY=你的OpenAI API密钥(可选)
echo.

echo 💾 第五步: 设置Supabase数据库
echo ----------------------------------------
echo 正在打开Supabase...
start https://supabase.com/dashboard
echo.
echo 1. 创建新项目: linkedin-job-assistant
echo 2. 进入SQL Editor
echo 3. 复制 supabase-setup.sql 内容并执行
echo 4. 获取Project URL和anon key用于环境变量
echo.

echo 🎉 完成! 你的LinkedIn Job Assistant现在:
echo ✅ 代码已在GitHub托管
echo ✅ 网站自动部署到Vercel
echo ✅ 每次推送代码都会自动更新
echo ✅ 专业的CI/CD流程
echo.

echo 📱 Chrome扩展安装:
echo 1. 打开 chrome://extensions/
echo 2. 启用开发者模式
echo 3. 加载 apps/extension/dist 文件夹
echo.

pause