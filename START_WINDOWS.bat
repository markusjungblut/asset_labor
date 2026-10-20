@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Vedras Reiche - Asset Labor – Schatten auf Sprites & Geografie-Zugang (Start-Port 8780, automatische Ausweichports)
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  py -3 server.py
) else (
  where python >nul 2>nul
  if %ERRORLEVEL% EQU 0 (
    python server.py
  ) else (
    echo Python 3 wurde nicht gefunden. Bitte Python 3 installieren oder die HTML im Browser oeffnen und einen Ordner auswaehlen.
    pause
  )
)