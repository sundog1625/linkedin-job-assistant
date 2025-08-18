@echo off
chcp 65001 >nul
echo 正在部署到Vercel...
cd /d "C:\Users\fangyu\Desktop\linkedin-job-assistant"

REM 安装Vercel CLI（如果还没安装）
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 安装Vercel CLI...
    npm install -g vercel
)

REM 部署dashboard
cd apps\dashboard
echo 部署Dashboard到Vercel...
vercel --prod --yes

echo.
echo ✅ 部署完成！
echo 请等待1-2分钟让Vercel完成部署
pause