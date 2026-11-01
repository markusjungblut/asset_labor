@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js 22+ required.
 exit /b 1
)
echo VEDRAS - SCHRITT 16B: NATIVE REGRESSIONSTESTS (ohne Render- oder Git-Aenderungen)
node "%~dp0scripts\rendering-step16b-native-acceptance.mjs" %*
set "RESULT=%ERRORLEVEL%"
echo Der neue Testbericht liegt in artifacts\rendering-step16b-native-* .
echo Bereits vorhandene Step16A-Audits werden nicht veraendert.
exit /b %RESULT%
