@echo off
chcp 65001 >nul
echo ========================================
echo   LinkedIn Job Assistant Dashboard 部署
echo ========================================
echo.

echo 🚀 方案1: 直接拖拽部署 (推荐)
echo ----------------------------------------
echo 1. 访问 https://vercel.com/new
echo 2. 点击 "Browse" 或拖拽整个项目文件夹
echo 3. 选择 linkedin-job-assistant 文件夹
echo 4. Framework Preset: Next.js
echo 5. Root Directory: apps/dashboard
echo 6. 点击 Deploy
echo.

echo 💡 如果部署失败，请先设置环境变量:
echo    NEXT_PUBLIC_SUPABASE_URL = 你的Supabase URL
echo    NEXT_PUBLIC_SUPABASE_ANON_KEY = 你的Supabase Key
echo.

echo 🛠️ 方案2: 使用 Vercel CLI
echo ----------------------------------------
echo 1. 安装: npm install -g vercel
echo 2. 登录: vercel login
echo 3. 部署: vercel --prod
echo.

echo 📋 部署后记得:
echo 1. 更新Chrome扩展中的Dashboard URL
echo 2. 在Supabase设置数据库
echo 3. 配置环境变量
echo.

pause