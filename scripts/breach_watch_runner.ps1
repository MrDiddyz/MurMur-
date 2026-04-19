$ErrorActionPreference = 'Stop'

# Ensure execution from repository root regardless of task working directory.
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# Load environment variables from .env if present.
$envFile = Join-Path $repoRoot '.env'
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) {
            return
        }
        $parts = $line -split '=', 2
        if ($parts.Count -eq 2) {
            $name = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"').Trim("'")
            if ($name) {
                [Environment]::SetEnvironmentVariable($name, $value, 'Process')
            }
        }
    }
}

# Scheduled runs should execute one scan and exit.
$env:BREACH_WATCH_ONCE = '1'

$pythonExe = Join-Path $env:LocalAppData 'Programs\Python\Python312\python.exe'
if (Test-Path $pythonExe) {
    & $pythonExe "scripts/breach_watch.py"
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
    exit 0
}

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
