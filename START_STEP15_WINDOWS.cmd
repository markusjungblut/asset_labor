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
echo VEDRAS REICHE - SCHRITT 14 KACHEL- UND KAMERADIAGNOSE
echo.
node "%~dp0scripts\rendering-step15-auto.mjs" %*
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" (
 echo TEILWEISE FEHLER. Siehe artifacts\rendering-step15-diagnostics\result.json
) else (
 echo MESSUNG BEENDET. Siehe artifacts\rendering-step15-diagnostics\step15-diagnostics.zip
)
echo.
pause
exit /b %RESULT%
