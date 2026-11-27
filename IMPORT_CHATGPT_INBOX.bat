@echo off
setlocal enableextensions
chcp 65001 >nul
cd /d "%~dp0"

echo =============================================================
echo  VEDRAS REICHE - CHATGPT ART-KIT / INBOX-IMPORT (REINE CPU)
echo =============================================================
echo  Prueft alle PNGs in assets\_inbox\:
echo   - Transparent-Alpha & Rand-Saeuberung (--auto-defringe / --auto-key-bg)
echo   - Lichtrichtung (spiegelt Links-Licht automatisch auf Vedras-Rechtslicht)
echo   - Erstellt QA-Kontaktboegen in assets\_inbox\_qa_*.png
echo   - Baut WebP-Atlanten neu (und synct ins browsergame, falls vorhanden)
echo.

if not exist "scripts\ingest_new_pngs.py" (
  echo FEHLER: scripts\ingest_new_pngs.py fehlt.
  goto :failed
)

set "SYNC_ARG="
if exist "..\browsergame\public\game-assets" (
  set "SYNC_ARG=--sync-to ..\browsergame\public\game-assets"
)

where py >nul 2>nul
if not errorlevel 1 (
  py -3 scripts\ingest_new_pngs.py --inbox --auto-defringe --auto-key-bg --auto-flip-light --overwrite --export %SYNC_ARG%
  set "RESULT=%ERRORLEVEL%"
  goto :done
)
where python >nul 2>nul
if not errorlevel 1 (
  python scripts\ingest_new_pngs.py --inbox --auto-defringe --auto-key-bg --auto-flip-light --overwrite --export %SYNC_ARG%
  set "RESULT=%ERRORLEVEL%"
  goto :done
)

echo FEHLER: Python 3 ist nicht installiert oder nicht im PATH.
goto :failed

:failed
set "RESULT=2"
:done
echo.
if "%RESULT%"=="0" (
  echo Fertig! Bitte QA-Kontaktboegen in assets\_inbox\_qa_*.png kurz ansehen
  echo und danach im WebGL2 Studio (F5) das Ergebnis live auf der Karte pruefen.
) else (
  echo Hinweis: Mindestens eine Datei wurde abgelehnt oder der Ordner war leer.
)
pause
exit /b %RESULT%
