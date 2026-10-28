@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo FEHLER: Node.js ist nicht installiert oder nicht im PATH.
  echo Benoetigt: Node.js Version 22 oder neuer.
  pause
  exit /b 1
)
echo.
echo VEDRAS REICHE - AUTOMATISCHER RENDERINGTEST
echo.
node "%~dp0scripts\rendering-step13-auto.mjs" %*
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" (
  echo TEST FEHLGESCHLAGEN. Siehe artifacts\rendering-step13-auto\result.json
) else (
  echo TESTDURCHLAUF BEENDET. Die Grafikqualitaet muss anhand der PNGs kontrolliert werden.
)
echo.
pause
exit /b %RESULT%
