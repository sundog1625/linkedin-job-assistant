@echo off
chcp 65001 >nul
echo Building Chrome Extension...

cd /d "C:\Users\fangyu\Desktop\linkedin-job-assistant\apps\extension"

echo Installing dependencies...
call npm install

echo Building extension...
call npm run build

echo Build complete!

echo.
echo Next steps:
echo 1. Open Chrome browser, go to chrome://extensions/
echo 2. Find "LinkedIn Job Assistant" extension
echo 3. Click the refresh button to reload extension
echo 4. Visit any LinkedIn job page
echo 5. Look for the green "Add Job" button in the right panel

pause