@echo off
setlocal enableextensions
chcp 65001 >nul

set "TARGET=%~dp0..\browsergame\tools\asset-studio\IMPORT_CHATGPT_INBOX.bat"
if not exist "%TARGET%" (
  echo =============================================================
  echo  VEDRAS REICHE - CHATGPT INBOX-IMPORTER UMGEZOGEN (OPTION 1)
  echo =============================================================
  echo  Der Inbox-Importer lebt jetzt zentral im Haupt-Repo:
  echo    ..\browsergame\tools\asset-studio\IMPORT_CHATGPT_INBOX.bat
  echo.
  echo  FEHLER: "%TARGET%" wurde nicht gefunden.
  echo  Bitte browsergame und asset_labor nebeneinander klonen.
  pause
  exit /b 2
)

call "%TARGET%" %*
exit /b %ERRORLEVEL%
