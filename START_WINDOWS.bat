@echo off
setlocal enableextensions
chcp 65001 >nul
cd /d "%~dp0"

echo =============================================================
echo  VEDRAS REICHE - ASSET-LABOR (NORMALE EDITOR-OBERFLAECHE)
echo =============================================================
echo  Startseite: http://127.0.0.1:8780/index.html
echo  Wichtig: Port 8780 fuer dieselbe gespeicherte Firefox-Karte.
echo  Dies ist KEIN Rendering-/CI-/Geografie-Teststarter.
echo.

if not exist "server.py" (
  echo FEHLER: server.py fehlt. Bitte einen vollstaendigen Repository-Ordner benutzen.
  goto :failed
)
if not exist "index.html" (
  echo FEHLER: index.html fehlt. Dies ist kein vollstaendiger Asset-Labor-Ordner.
  goto :failed
)
if not exist "assets\" (
  echo FEHLER: assets-Ordner fehlt. Du bist moeglicherweise in einem Sparse-Test-Worktree.
  echo Bitte das vollstaendige Asset-Labor mit allen benoetigten Grafiken oeffnen.
  goto :failed
)
if not exist "app.js" (
  echo FEHLER: app.js fehlt. Bitte das vollstaendige Asset-Labor benutzen.
  goto :failed
)

set "VEDRAS_PORT=8780"
set "VEDRAS_STRICT_PORT=1"
set "VEDRAS_NO_BROWSER=0"

where py >nul 2>nul
if not errorlevel 1 (
  py -3 server.py
  set "RESULT=%ERRORLEVEL%"
  goto :done
)
where python >nul 2>nul
if not errorlevel 1 (
  python server.py
  set "RESULT=%ERRORLEVEL%"
  goto :done
)

echo FEHLER: Python 3 ist nicht installiert oder nicht im PATH.
echo Bitte Python 3 installieren. HTML nicht ueber file:// oeffnen.
goto :failed

:failed
set "RESULT=2"
:done
if not "%RESULT%"=="0" (
  echo.
  echo Start nicht abgeschlossen. Wenn Port 8780 belegt ist, den
  echo vorherigen lokalen Server kontrolliert beenden, NICHT andere
  echo Ports benutzen und keine Firefox-Browserdaten loeschen.
)
echo.
echo Fenster erst schliessen, wenn das Asset-Labor beendet werden soll.
pause
exit /b %RESULT%
