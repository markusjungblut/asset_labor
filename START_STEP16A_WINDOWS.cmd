@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js 22+ required.
 exit /b 1
)
echo VEDRAS - SCHRITT 16A: ARCHITEKTUR-AUDIT (keine Optimierung)
node "%~dp0scripts\rendering-step16a-auto.mjs" %*
set "RESULT=%ERRORLEVEL%"
echo Audit: Der Node-Launcher gibt den eindeutigen Ergebnisordner mit ZIP aus.
exit /b %RESULT%
