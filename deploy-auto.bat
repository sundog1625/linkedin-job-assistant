@echo off
chcp 65001 >nul
echo ========================================
echo   LinkedIn Job Assistant 自动部署
echo ========================================
echo.

echo 🚀 开始自动部署流程...
echo.

echo 📋 检查依赖...
where gh >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ GitHub CLI 未安装
    echo 💡 请手动访问 https://github.com/new 创建仓库
    goto MANUAL_DEPLOY
)

where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 安装 Vercel CLI...
    npm install -g vercel
)

echo.
echo 🔄 创建GitHub仓库...
cd /d "C:\Users\fangyu\Desktop\linkedin-job-assistant"
gh repo create linkedin-job-assistant --public --description "AI-powered LinkedIn job application assistant" --source . --remote origin --push

if %errorlevel% neq 0 (
    echo ❌ GitHub仓库创建失败
    goto MANUAL_DEPLOY
)

echo ✅ 代码已推送到GitHub!
echo.

echo 🌐 开始Vercel部署...
cd apps\dashboard
vercel --prod

echo.
echo 🎉 部署完成！
echo.
echo 📋 后续步骤:
echo 1. 在Vercel项目设置中添加环境变量
echo 2. 重新部署项目
echo 3. 测试Dashboard功能
echo.
goto END

:MANUAL_DEPLOY
echo.
echo 📋 请手动部署：
echo 1. 访问 https://github.com/new
echo 2. 创建 linkedin-job-assistant 仓库
echo 3. 推送代码到GitHub
echo 4. 访问 https://vercel.com/new
echo 5. 导入GitHub仓库并部署
echo.
echo 详细说明请查看 DEPLOY_NOW.md 文件
echo.

:END
pause