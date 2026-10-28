@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo FEHLER: Node.js ab Version 22 wird benoetigt.
  pause
  exit /b 1
)
echo.
echo VEDRAS REICHE - SCHRITT 14 ATLAS AN/AUS + ZOOM-PROFILING
echo.
node "%~dp0scripts\rendering-step14-auto.mjs" %*
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" (
 echo TEILWEISE FEHLER. Siehe artifacts\rendering-step14-ab\result.json
) else (
 echo MESSUNG BEENDET. Siehe artifacts\rendering-step14-ab\step14-atlas-ab.zip
)
echo.
pause
exit /b %RESULT%
