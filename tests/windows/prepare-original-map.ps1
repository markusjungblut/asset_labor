# Windows-only, read-only acceptance preparation for the saved Frozen Viewer map.
# No reset/clean/stash/rebase/checkout in the original working tree.
[CmdletBinding()]
param(
 [ValidateSet('Prepare','Baseline','Candidate','All','Node')]
 [string]$Action='Prepare',
 [string]$RepoPath="$HOME\Desktop\asset_labor",
 [switch]$NoFetch
)
$ErrorActionPreference='Stop'
$branch='perf/step25z-real-ram-eviction-20261112'
$port=8780
function Require-Success([string]$description) {
 if ($LASTEXITCODE -ne 0) { throw "$description fehlgeschlagen (Exit $LASTEXITCODE)." }
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git fehlt im PATH.' }
if (-not (Test-Path -LiteralPath $RepoPath -PathType Container)) {
 throw "Original-Repository nicht gefunden: $RepoPath. -RepoPath angeben."
}
$root=(& git -C $RepoPath rev-parse --show-toplevel).Trim()
Require-Success 'Git repo'
$origin=(& git -C $root remote get-url origin).Trim()
Require-Success 'Git origin'
if ($origin -notmatch 'github[.]com[:/]markusjungblut/asset_labor(?:[.]git)?$') {
 throw "Unbekanntes origin '$origin'. Zum Schutz kein Eingriff."
}
$parent=Split-Path $root -Parent
$baseline=Join-Path $parent 'asset_labor_renderer_baseline_20261113'
$candidate=Join-Path $parent 'asset_labor_renderer_candidate_20261113'
$assets=@('renderer-original-map.html','renderer-original-map-suite.js')
if ($Action -eq 'Prepare') {
 $logs=Join-Path $parent ('asset_labor_renderer_results_'+(Get-Date -Format 'yyyyMMdd_HHmmss'))
 New-Item -ItemType Directory -Path $logs -ErrorAction Stop | Out-Null
 Write-Host "Originales Repo: $root" -ForegroundColor Cyan
 # Merely record the current state; untracked files are NOT captured by patches.
 & git -C $root status --short -uall |
  Out-File -LiteralPath (Join-Path $logs 'original-status.txt') -Encoding utf8
 & git -C $root log -1 --format='%H %cs %s' |
  Out-File -LiteralPath (Join-Path $logs 'original-head.txt') -Encoding utf8
 & git -C $root branch --show-current |
  Out-File -LiteralPath (Join-Path $logs 'original-branch.txt') -Encoding utf8
 & git -C $root ls-files --others --exclude-standard |
  Out-File -LiteralPath (Join-Path $logs 'untracked-list.txt') -Encoding utf8
 & git -C $root diff --binary "--output=$(Join-Path $logs 'unstaged.patch')"
 Require-Success 'unstaged patch'
 & git -C $root diff --cached --binary "--output=$(Join-Path $logs 'staged.patch')"
 Require-Success 'staged patch'
 if (-not $NoFetch) {
  & git -C $root fetch --no-tags origin
  Require-Success 'git fetch'
 }
 # Check both target directories before creating either; never overwrite.
 foreach ($dir in @($baseline,$candidate)) {
  if (Test-Path -LiteralPath $dir) {
   throw "Testverzeichnis existiert bereits: $dir. Abbruch ohne Überschreiben."
  }
 }
 foreach ($item in @(@{Dir=$baseline;Ref='origin/main'},@{Dir=$candidate;Ref="origin/$branch"})) {
  & git -C $root worktree add --detach $item.Dir $item.Ref
  Require-Success "Worktree $($item.Ref)"
  foreach ($asset in $assets) {
   Copy-Item -LiteralPath (Join-Path $PSScriptRoot $asset) -Destination (Join-Path $item.Dir $asset) -ErrorAction Stop
  }
 }
 & git -C $baseline rev-parse HEAD |
  Out-File -LiteralPath (Join-Path $logs 'baseline-head.txt') -Encoding utf8
 & git -C $candidate rev-parse HEAD |
  Out-File -LiteralPath (Join-Path $logs 'candidate-head.txt') -Encoding utf8
 Write-Host "Zwei isolierte Worktrees erstellt. Ergebnisse: $logs" -ForegroundColor Green
 Write-Host ('Baseline:  .\tests\windows\prepare-original-map.ps1 -Action Baseline -RepoPath "' + $root + '"')
 Write-Host ('Kandidat:  .\tests\windows\prepare-original-map.ps1 -Action Candidate -RepoPath "' + $root + '"')
 Write-Host ('Alle Tests: .\tests\windows\prepare-original-map.ps1 -Action All -RepoPath "' + $root + '"')
 Write-Host ('Node:      .\tests\windows\prepare-original-map.ps1 -Action Node -RepoPath "' + $root + '"')
 Write-Host "Browser:   http://127.0.0.1:8780/renderer-original-map.html"
 Write-Warning 'Untracked-Dateien wurden NUR aufgelistet, nicht gesichert. Originalprofil/IndexedDB/ZIP unverändert lassen.'
 return
}
if ($Action -eq 'Node') {
 if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js fehlt im PATH.' }
 if (-not (Test-Path -LiteralPath $candidate -PathType Container)) {
  throw 'Kandidaten-Worktree fehlt. Zuerst -Action Prepare.'
 }
 $tests=@(Get-ChildItem -LiteralPath (Join-Path $candidate 'tests') -Filter 'test_rendering_step25*.cjs' -File |
  Sort-Object Name | Select-Object -ExpandProperty FullName)
 if ($tests.Count -eq 0) { throw 'Keine Schritt-25-Tests vorhanden.' }
 Write-Host "Node-Regression: $($tests.Count) Testdateien"
 & node --test @tests
 Require-Success 'Node-Regression'
 return
}
if ($Action -eq 'All') {
 # Self-test the browser benchmark's pure helpers before any expensive
 # Windows original-map measurements (no access to image/IndexedDB files).
 $suiteTest=Join-Path $PSScriptRoot 'test-original-map-suite-v3.cjs'
 if (-not (Test-Path -LiteralPath $suiteTest -PathType Leaf)) {
  throw "Suite-Selbsttest fehlt: $suiteTest. Bitte PR #139 aktualisieren."
 }
 if (Get-Command node -ErrorAction SilentlyContinue) {
  & node --test $suiteTest
  Require-Success 'Renderer-Suite v3 Selbsttests'
 } else {
  Write-Warning 'Node nicht vorhanden. Suite-Selbsttests nicht automatisch ausgefuehrt.'
 }
 # Serve both isolated versions at a single exact localhost origin.
 # Only static GET/HEAD requests; the original working tree stays untouched.
 foreach ($dir in @($baseline,$candidate)) {
  if (-not (Test-Path -LiteralPath (Join-Path $dir 'frozen-map-game.html') -PathType Leaf)) {
   throw "Isolierter Test-Worktree fehlt oder ist unvollstaendig: $dir. Zuerst -Action Prepare."
  }
 }
 $suiteServer=Join-Path $PSScriptRoot 'serve-original-map-suite.py'
 if (-not (Test-Path -LiteralPath $suiteServer -PathType Leaf)) {
  throw "Gesamtserver fehlt: $suiteServer. Testzweig PR #139 aktualisieren."
 }
 if (-not (Get-Command py -ErrorAction SilentlyContinue) -and
     -not (Get-Command python -ErrorAction SilentlyContinue)) {
  throw 'Python 3 fehlt.'
 }
 $socket=[System.Net.Sockets.TcpClient]::new()
 try {
  try {
   $socket.Connect('127.0.0.1',$port)
   throw "Port $port ist belegt. Alten Server zuerst mit Strg+C beenden."
  } catch [System.Net.Sockets.SocketException] {
   # Connection refused: port is free.
  }
 } finally { $socket.Dispose() }
 Write-Host "Ein-Klick-Gesamttest: Baseline + Kandidat, gleiche Firefox-Origin" -ForegroundColor Green
 Write-Host "Im bisherigen Firefox-Profil: http://127.0.0.1:$port/renderer-original-map.html"
 Write-Host 'In der Browserseite: Alle Tests automatisch (1 Klick). Nach dem Export Strg+C.'
 if (Get-Command py -ErrorAction SilentlyContinue) {
  & py -3 $suiteServer --baseline $baseline --candidate $candidate --suite $PSScriptRoot --port $port
 } else {
  & python $suiteServer --baseline $baseline --candidate $candidate --suite $PSScriptRoot --port $port
 }
 return
}
$target=if ($Action -eq 'Baseline') {$baseline} else {$candidate}
if (-not (Test-Path -LiteralPath (Join-Path $target 'renderer-original-map.html') -PathType Leaf)) {
 throw "Worktree bzw. Test-Dashboard fehlt: $target. Zuerst -Action Prepare."
}
$socket=[System.Net.Sockets.TcpClient]::new()
try {
 try {
  $socket.Connect('127.0.0.1',$port)
  throw "Port $port ist belegt. Alten Server zuerst mit Strg+C beenden."
 } catch [System.Net.Sockets.SocketException] {
  # Connection refused: no competing server detected.
 }
} finally { $socket.Dispose() }
if (-not (Get-Command py -ErrorAction SilentlyContinue) -and
    -not (Get-Command python -ErrorAction SilentlyContinue)) {
 throw 'Python 3 fehlt.'
}
# Refresh only generated test worktrees. Do not touch the original repo.
foreach ($asset in $assets) {
 $source=Join-Path $PSScriptRoot $asset
 if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
  throw "Testdatei fehlt: $source. Testzweig PR #139 aktualisieren."
 }
 Copy-Item -LiteralPath $source -Destination (Join-Path $target $asset) -Force -ErrorAction Stop
}
Write-Host "Test-Dashboard und komplette Ein-Klick-Suite in $Action-Worktree aktualisiert." -ForegroundColor Green
Write-Host "$Action / $target" -ForegroundColor Cyan
Write-Host "Im bereits verwendeten Firefox-Profil öffnen: http://127.0.0.1:$port/renderer-original-map.html"
Write-Host 'Nach dem Test den Server mit Strg+C beenden. Nicht parallel starten.'
$env:VEDRAS_PORT="$port"
Push-Location -LiteralPath $target
try {
 if (Get-Command py -ErrorAction SilentlyContinue) { & py -3 server.py }
 else { & python server.py }
} finally { Pop-Location }