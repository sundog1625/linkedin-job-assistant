@echo off
chcp 65001 >nul
echo ========================================
echo   LinkedIn Job Assistant 自动部署
echo ========================================
echo.

echo 🚀 正在安装部署工具...
npm install -g supabase@latest vercel@latest

echo.
echo 📋 请提供部署信息:
set /p SUPABASE_PROJECT_NAME=输入 Supabase 项目名称: 
set /p VERCEL_PROJECT_NAME=输入 Vercel 项目名称: 

echo.
echo 🏗️  正在部署 Supabase...
cd "C:\Users\fangyu\Desktop\linkedin-job-assistant"

echo 正在登录 Supabase...
supabase login

echo 正在创建项目...
supabase projects create %SUPABASE_PROJECT_NAME%

echo 正在初始化本地环境...
supabase init

echo 正在启动本地 Supabase...
supabase start

echo 正在推送数据库架构...
supabase db push

echo.
echo 🌐 正在部署 Vercel...
echo 正在登录 Vercel...
vercel login

echo 正在部署项目...
cd apps/dashboard
vercel --prod --name %VERCEL_PROJECT_NAME%

echo.
echo 🔧 正在配置环境变量...
echo 获取 Supabase 配置...
supabase status

echo.
echo ✅ 部署完成！
echo.
echo 🎯 接下来的步骤:
echo 1. Chrome扩展: 打开 chrome://extensions/ 加载 apps/extension/dist 文件夹
echo 2. 配置扩展: 更新扩展中的 Supabase URL
echo.
pause