$ErrorActionPreference = 'Stop'

# Ensure execution from repository root regardless of task working directory.
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# Scheduled runs should execute one scan and exit.
$env:BREACH_WATCH_ONCE = '1'

$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    $pythonCmd = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $pythonCmd) {
    Write-Error 'Python runtime not found (python/py). Install Python and ensure it is in PATH.'
    exit 1
}

if ($pythonCmd.Name -ieq 'py' -or $pythonCmd.Name -ieq 'py.exe') {
    & $pythonCmd.Source -3 "scripts/breach_watch.py"
} else {
    & $pythonCmd.Source "scripts/breach_watch.py"
}

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
