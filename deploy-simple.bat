@echo off
echo LinkedIn Job Assistant - Deployment Guide
echo ========================================
echo.
echo Step 1: Create GitHub Repository
echo --------------------------------
echo Opening GitHub...
start https://github.com/new
echo.
echo Repository Settings:
echo - Name: linkedin-job-assistant
echo - Description: AI-powered LinkedIn job application assistant
echo - Public or Private (your choice)
echo - Uncheck "Add README" (we already have one)
echo - Uncheck "Add .gitignore" (we already have one)
echo.
pause
echo.
echo Step 2: Push to GitHub
echo ----------------------
set /p GITHUB_URL=Enter your GitHub repository URL (e.g., https://github.com/username/linkedin-job-assistant.git): 
echo.
git -C "C:\Users\fangyu\Desktop\linkedin-job-assistant" remote add origin %GITHUB_URL%
git -C "C:\Users\fangyu\Desktop\linkedin-job-assistant" branch -M main  
git -C "C:\Users\fangyu\Desktop\linkedin-job-assistant" push -u origin main
echo.
echo Code pushed to GitHub successfully!
echo.
echo Step 3: Deploy to Vercel
echo ------------------------
echo Opening Vercel...
start https://vercel.com/new
echo.
echo In Vercel:
echo 1. Select "Import Git Repository"
echo 2. Find and select your linkedin-job-assistant repository
echo 3. Framework Preset: Next.js
echo 4. Root Directory: apps/dashboard
echo 5. Click Deploy
echo.
pause
echo.
echo Step 4: Setup Supabase Database
echo ------------------------------
echo Opening Supabase...
start https://supabase.com/dashboard
echo.
echo 1. Create new project: linkedin-job-assistant
echo 2. Go to SQL Editor
echo 3. Copy contents of supabase-setup.sql and execute
echo 4. Get Project URL and anon key for environment variables
echo.
echo Deployment Complete!
echo Your LinkedIn Job Assistant is now ready to use.
echo.
pause