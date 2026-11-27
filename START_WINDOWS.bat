@echo off
setlocal enableextensions
chcp 65001 >nul

set "TARGET=%~dp0..\browsergame\tools\asset-studio\START_STUDIO_WINDOWS.bat"
if not exist "%TARGET%" (
  echo =============================================================
  echo  VEDRAS REICHE - ASSET-STUDIO UMGEZOGEN (OPTION 1)
  echo =============================================================
  echo  Das WebGL2 Asset-Studio lebt jetzt zentral im Haupt-Repo:
  echo    ..\browsergame\tools\asset-studio\START_STUDIO_WINDOWS.bat
  echo.
  echo  FEHLER: "%TARGET%" wurde nicht gefunden.
  echo  Bitte browsergame und asset_labor nebeneinander im selben
  echo  Oberordner klonen und danach erneut starten.
  pause
  exit /b 2
)

call "%TARGET%" %*
exit /b %ERRORLEVEL%
