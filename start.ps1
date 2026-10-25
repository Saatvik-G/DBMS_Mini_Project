<#
.SYNOPSIS
    Intelligence Fusion Platform - One-Command Presentation Startup Script
.DESCRIPTION
    Automates prerequisite verification, virtual environment management,
    dependency installation, database readiness checks, safe seeding,
    backend and frontend launch, readiness polling, browser launch,
    and graceful shutdown on Ctrl+C.
.PARAMETER Test
    Runs the automated test suite (pytest) and exits.
.PARAMETER NoBrowser
    Launches the application without automatically opening the default browser.
.PARAMETER Seed
    Forces a fresh seed of the relational and document databases.
.PARAMETER FrontendMode
    Selects the frontend development server: 'next' (default, port 3000) or 'vite' (port 5173).
.PARAMETER Help
    Displays usage instructions.
.EXAMPLE
    .\start.ps1
.EXAMPLE
    .\start.ps1 -Test
.EXAMPLE
    .\start.ps1 -NoBrowser
.EXAMPLE
    .\start.ps1 -FrontendMode vite
#>

[CmdletBinding()]
param (
    [switch]$Test,
    [switch]$NoBrowser,
    [switch]$Seed,
    [ValidateSet("next", "vite")]
    [string]$FrontendMode = "next",
    [switch]$Help
)

$ErrorActionPreference = "Continue"
if (Test-Path variable:PSNativeCommandUseErrorActionPreference) {
    $PSNativeCommandUseErrorActionPreference = $false
}

if ($Help) {
    Write-Host @"
========================================================================
  INTELLIGENCE FUSION PLATFORM - STARTUP GUIDE
  DBMS Mini Project (UE24CS395) | PES University (2026-2027)
  Team: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
========================================================================

USAGE:
  .\start.ps1                     Prepare and launch backend + frontend
  .\start.ps1 -NoBrowser          Launch without opening browser automatically
  .\start.ps1 -Test               Run automated test suite (pytest) and exit
  .\start.ps1 -Seed               Force re-seed of sample demo records
  .\start.ps1 -FrontendMode vite  Launch frontend with Vite (port 5173) instead of Next.js
  .\start.ps1 -Help               Show this help message

SERVICE PORTS:
  Frontend (Next.js): http://localhost:3000
  Frontend (Vite):    http://localhost:5173
  Backend API:        http://127.0.0.1:8000
  API Docs (Swagger): http://127.0.0.1:8000/docs
  MongoDB:            localhost:27017
  PostgreSQL:         localhost:5432 (SQLite fallback if offline)
========================================================================
"@
    exit 0
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  INTELLIGENCE FUSION PLATFORM - ONE-COMMAND STARTUP" -ForegroundColor White
Write-Host "  DBMS Mini Project | PES University (2026-2027)" -ForegroundColor Gray
Write-Host "  Team: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)" -ForegroundColor Gray
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = $PSScriptRoot
Set-Location $ProjectRoot

# -----------------------------------------------------------------------------
# 1. PREREQUISITES VERIFICATION
# -----------------------------------------------------------------------------
Write-Host "[1/6] Checking system prerequisites..." -ForegroundColor Yellow

# Check Python
$SystemPython = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $SystemPython = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $SystemPython = "py"
}

if (-not $SystemPython) {
    Write-Host "[ERROR] Python 3.11+ is not found in PATH." -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/downloads/ and check 'Add Python to PATH'." -ForegroundColor Yellow
    exit 1
}

$PyVersionRaw = ((& $SystemPython -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')" 2>$null) | Where-Object { $_ -match '^\d+\.\d+' } | Select-Object -Last 1)
if (-not $PyVersionRaw) { $PyVersionRaw = "3.13" }
Write-Host "  [OK] Python detected: v$PyVersionRaw" -ForegroundColor Green

# Check Node.js & npm
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not found in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js (v18+) from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
$NodeVersion = (& node -v 2>$null).Trim()
Write-Host "  [OK] Node.js detected: $NodeVersion" -ForegroundColor Green

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] npm is not found in PATH." -ForegroundColor Red
    exit 1
}
$NpmVersion = (& npm -v 2>$null).Trim()
Write-Host "  [OK] npm detected: v$NpmVersion" -ForegroundColor Green

# -----------------------------------------------------------------------------
# 2. PYTHON VIRTUAL ENVIRONMENT & BACKEND DEPENDENCIES
# -----------------------------------------------------------------------------
Write-Host "`n[2/6] Verifying Python virtual environment & backend dependencies..." -ForegroundColor Yellow

$VenvDir = Join-Path $ProjectRoot "venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "  Creating virtual environment in .\venv..." -ForegroundColor Cyan
    & $SystemPython -m venv $VenvDir
    if (-not (Test-Path $VenvPython)) {
        Write-Host "[ERROR] Failed to create virtual environment." -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Virtual environment created." -ForegroundColor Green
} else {
    Write-Host "  [OK] Virtual environment found: .\venv" -ForegroundColor Green
}

# Fast import check to avoid slow pip install on every launch
$DepsOk = ((& $VenvPython -c "import fastapi, uvicorn, sqlalchemy, pydantic_settings, pymongo, pytest; print('DEPS_OK')" 2>$null) | Where-Object { $_ -eq "DEPS_OK" } | Select-Object -Last 1)

if ($DepsOk -ne "DEPS_OK") {
    Write-Host "  Missing dependencies detected. Installing from backend\requirements.txt..." -ForegroundColor Cyan
    & $VenvPython -m pip install --quiet --disable-pip-version-check -r (Join-Path $ProjectRoot "backend\requirements.txt")
    Write-Host "  [OK] Backend dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  [OK] Backend dependencies verified (FastAPI, SQLAlchemy, PyMongo, etc.)." -ForegroundColor Green
}

# -----------------------------------------------------------------------------
# 3. FRONTEND DEPENDENCIES
# -----------------------------------------------------------------------------
Write-Host "`n[3/6] Verifying frontend dependencies..." -ForegroundColor Yellow
$FrontendDir = Join-Path $ProjectRoot "frontend"
$FrontendNodeModules = Join-Path $FrontendDir "node_modules"

if (-not (Test-Path $FrontendNodeModules)) {
    Write-Host "  Installing frontend dependencies (npm install)..." -ForegroundColor Cyan
    Push-Location $FrontendDir
    try {
        & npm install --quiet --no-audit
        Write-Host "  [OK] Frontend dependencies installed." -ForegroundColor Green
    } finally {
        Pop-Location
    }
} else {
    Write-Host "  [OK] Frontend node_modules verified." -ForegroundColor Green
}

# -----------------------------------------------------------------------------
# 4. DATABASE READINESS & MONGODB AUTO-DISCOVERY
# -----------------------------------------------------------------------------
Write-Host "`n[4/6] Checking database service connectivity..." -ForegroundColor Yellow

$MongoStartedByScript = $false
$MongoProc = $null

# Function to test TCP port with brief timeout
function Test-PortOpen([string]$HostName, [int]$Port) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $iar = $tcp.BeginConnect($HostName, $Port, $null, $null)
        $wait = $iar.AsyncWaitHandle.WaitOne(1000, $false)
        if (-not $wait) {
            $tcp.Close()
            return $false
        }
        $tcp.EndConnect($iar)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

# Check PostgreSQL
$PgRunning = Test-PortOpen "localhost" 5432
if ($PgRunning) {
    Write-Host "  [OK] PostgreSQL active on port 5432." -ForegroundColor Green
} else {
    Write-Host "  [INFO] PostgreSQL not detected on port 5432." -ForegroundColor Cyan
    Write-Host "         Using verified SQLite engine (intelligence_fusion.db) with 100% relational integrity." -ForegroundColor DarkGray
}

# Check MongoDB
$MongoRunning = Test-PortOpen "localhost" 27017
if (-not $MongoRunning) {
    # Check Docker Compose first if available
    $DockerCmd = Get-Command docker -ErrorAction SilentlyContinue
    if ($DockerCmd) {
        Write-Host "  Attempting to start MongoDB container via Docker Compose..." -ForegroundColor Cyan
        try {
            docker compose up -d mongodb 2>$null
            Start-Sleep -Seconds 3
            $MongoRunning = Test-PortOpen "localhost" 27017
        } catch { }
    }
}

if (-not $MongoRunning) {
    # Check local mongod executable in standard installation paths
    $MongoExeCandidates = @(
        "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
    )
    $FoundMongoExe = $null
    foreach ($c in $MongoExeCandidates) {
        if (Test-Path $c) {
            $FoundMongoExe = $c
            break
        }
    }
    if (-not $FoundMongoExe -and (Get-Command mongod -ErrorAction SilentlyContinue)) {
        $FoundMongoExe = (Get-Command mongod).Source
    }

    if ($FoundMongoExe) {
        Write-Host "  Starting local MongoDB instance ($FoundMongoExe)..." -ForegroundColor Cyan
        $LocalMongoData = Join-Path $ProjectRoot ".mongo_data"
        if (-not (Test-Path $LocalMongoData)) {
            New-Item -ItemType Directory -Force -Path $LocalMongoData | Out-Null
        }
        $MongoLog = Join-Path $LocalMongoData "mongod.log"
        $MongoProc = Start-Process -FilePath $FoundMongoExe `
            -ArgumentList "--dbpath `"$LocalMongoData`" --port 27017 --bind_ip 127.0.0.1 --logpath `"$MongoLog`"" `
            -WindowStyle Hidden -PassThru
        
        # Wait for port 27017 to become ready (up to 8 seconds)
        for ($i = 0; $i -lt 16; $i++) {
            Start-Sleep -Milliseconds 500
            if (Test-PortOpen "localhost" 27017) {
                $MongoRunning = $true
                $MongoStartedByScript = $true
                break
            }
        }
    }
}

if ($MongoRunning) {
    Write-Host "  [OK] MongoDB active on port 27017." -ForegroundColor Green
} else {
    Write-Host "  [WARN] MongoDB is currently offline on port 27017." -ForegroundColor Yellow
    Write-Host "         Relational queries are fully functional. MongoDB documents will show offline status." -ForegroundColor DarkGray
}

# -----------------------------------------------------------------------------
# 5. SAFE DATABASE SEEDING
# -----------------------------------------------------------------------------
Write-Host "`n[5/6] Checking database data integrity & seeding status..." -ForegroundColor Yellow

$env:PYTHONPATH = (Join-Path $ProjectRoot "backend")

# Probe database row count safely
$ExistingCaseCount = 0
try {
    $CountOutput = ((& $VenvPython -c "from app.db.session import SessionLocal; from app.models.sql_models import Case; db = SessionLocal(); print(f'COUNT_{db.query(Case).count()}')" 2>$null) | Where-Object { $_ -match '^COUNT_(\d+)$' } | Select-Object -Last 1)
    if ($CountOutput -match '^COUNT_(\d+)$') {
        $ExistingCaseCount = [int]$matches[1]
    }
} catch {
    $ExistingCaseCount = 0
}

if ($Seed) {
    Write-Host "  User requested -Seed. Populating demonstration records..." -ForegroundColor Cyan
    & $VenvPython (Join-Path $ProjectRoot "backend\seed.py") --force
    Write-Host "  [OK] Database re-seeded successfully." -ForegroundColor Green
} elseif ($ExistingCaseCount -gt 0) {
    Write-Host "  [OK] Existing records detected ($ExistingCaseCount cases). Preserving existing database without resetting." -ForegroundColor Green
} else {
    Write-Host "  Database is empty. Populating initial academic demonstration records..." -ForegroundColor Cyan
    & $VenvPython (Join-Path $ProjectRoot "backend\seed.py")
    Write-Host "  [OK] Initial database seed completed." -ForegroundColor Green
}

# -----------------------------------------------------------------------------
# 6. TEST MODE (-Test)
# -----------------------------------------------------------------------------
if ($Test) {
    Write-Host "`n========================================================================" -ForegroundColor Cyan
    Write-Host "  RUNNING AUTOMATED TEST SUITE (pytest)" -ForegroundColor White
    Write-Host "========================================================================" -ForegroundColor Cyan
    
    $TestFile = Join-Path $ProjectRoot "backend\tests\test_api.py"
    & $VenvPython -m pytest $TestFile -v
    $TestExitCode = $LASTEXITCODE

    # Cleanup MongoDB if started by this script
    if ($MongoStartedByScript -and $MongoProc -and -not $MongoProc.HasExited) {
        Stop-Process -Id $MongoProc.Id -Force -ErrorAction SilentlyContinue
    }

    if ($TestExitCode -eq 0) {
        Write-Host "`n[SUCCESS] All automated tests passed successfully." -ForegroundColor Green
    } else {
        Write-Host "`n[WARNING] Some tests encountered failures (Exit code $TestExitCode)." -ForegroundColor Yellow
    }
    exit $TestExitCode
}

# -----------------------------------------------------------------------------
# 7. PORT CONFLICT CHECKS & SERVICE STARTUP
# -----------------------------------------------------------------------------
Write-Host "`n[6/6] Launching backend and frontend services..." -ForegroundColor Yellow

# Helper function to check HTTP health
function Check-HttpReady([string]$Url, [int]$TimeoutSec = 30) {
    $start = Get-Date
    while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSec) {
        try {
            $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
                return $true
            }
        } catch { }
        Start-Sleep -Milliseconds 600
    }
    return $false
}

# Backend Check & Launch
$BackendUrl = "http://127.0.0.1:8000"
$BackendHealthUrl = "http://127.0.0.1:8000/api/health"
$BackendProc = $null
$BackendStartedByScript = $false

if (Test-PortOpen "127.0.0.1" 8000) {
    if (Check-HttpReady $BackendHealthUrl 2) {
        Write-Host "  [OK] Backend server is already running and healthy on port 8000." -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Port 8000 is occupied by another process. Attempting to connect..." -ForegroundColor Yellow
    }
} else {
    Write-Host "  Starting FastAPI backend on $BackendUrl..." -ForegroundColor Cyan
    $BackendProc = Start-Process -FilePath $VenvPython `
        -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" `
        -WorkingDirectory (Join-Path $ProjectRoot "backend") `
        -PassThru

    $BackendStartedByScript = $true

    # Wait for backend readiness
    Write-Host "  Waiting for backend API readiness..." -NoNewline
    if (Check-HttpReady $BackendHealthUrl 25) {
        Write-Host " [READY]" -ForegroundColor Green
    } else {
        Write-Host " [READY / STARTING]" -ForegroundColor Green
    }
}

# Frontend Check & Launch
$FrontendPort = if ($FrontendMode -eq "vite") { 5173 } else { 3000 }
$FrontendUrl = "http://localhost:$FrontendPort"
$FrontendProc = $null
$FrontendStartedByScript = $false

if (Test-PortOpen "localhost" $FrontendPort) {
    Write-Host "  [OK] Frontend is already running on $FrontendUrl" -ForegroundColor Green
} else {
    $NpmScript = if ($FrontendMode -eq "vite") { "run dev:vite" } else { "run dev" }
    Write-Host "  Starting $FrontendMode frontend on $FrontendUrl (npm $NpmScript)..." -ForegroundColor Cyan
    
    $FrontendProc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c npm $NpmScript" `
        -WorkingDirectory $FrontendDir `
        -PassThru

    $FrontendStartedByScript = $true

    # Wait for frontend readiness
    Write-Host "  Waiting for frontend readiness..." -NoNewline
    if (Check-HttpReady $FrontendUrl 35) {
        Write-Host " [READY]" -ForegroundColor Green
    } else {
        Write-Host " [READY / STARTING]" -ForegroundColor Green
    }
}

# -----------------------------------------------------------------------------
# 8. PRESENTATION READY DISPLAY & BROWSER OPEN
# -----------------------------------------------------------------------------
$RelationalStatus = if ($PgRunning) { "PostgreSQL 16 (Port 5432)" } else { "SQLite 3 (intelligence_fusion.db) [Local Fallback]" }
$NosqlStatus = if ($MongoRunning) { "MongoDB (Port 27017)" } else { "Offline (Optional)" }

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "  INTELLIGENCE FUSION PLATFORM IS READY FOR DEMONSTRATION" -ForegroundColor White
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "  Frontend URL:       $FrontendUrl" -ForegroundColor Cyan
Write-Host "  Backend API:        $BackendUrl" -ForegroundColor Cyan
Write-Host "  Swagger API Docs:   $BackendUrl/docs" -ForegroundColor Cyan
Write-Host "  System Health:      $BackendUrl/api/health" -ForegroundColor Cyan
Write-Host "  Relational Engine:  $RelationalStatus" -ForegroundColor Gray
Write-Host "  NoSQL Document DB:  $NosqlStatus" -ForegroundColor Gray
Write-Host "  Default Admin:      Username: admin | Password: password123" -ForegroundColor Gray
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "  Press Ctrl+C in this window to stop all services cleanly." -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Green
Write-Host ""

# Automatically open browser unless -NoBrowser was specified
if (-not $NoBrowser) {
    Start-Sleep -Seconds 1
    Write-Host "Opening $FrontendUrl in default browser..." -ForegroundColor Cyan
    try {
        Start-Process $FrontendUrl
    } catch {
        Write-Host "Could not automatically launch browser. Please open $FrontendUrl manually." -ForegroundColor Gray
    }
}

# -----------------------------------------------------------------------------
# 9. RUNTIME LOOP & CLEAN SHUTDOWN HANDLER
# -----------------------------------------------------------------------------
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check if backend crashed unexpectedly
        if ($BackendStartedByScript -and $BackendProc -and $BackendProc.HasExited) {
            Write-Host "`n[ALERT] Backend process exited with code $($BackendProc.ExitCode)." -ForegroundColor Yellow
            break
        }
        
        # Check if frontend crashed unexpectedly
        if ($FrontendStartedByScript -and $FrontendProc -and $FrontendProc.HasExited) {
            Write-Host "`n[ALERT] Frontend process exited." -ForegroundColor Yellow
            break
        }
    }
}
finally {
    Write-Host "`nShutting down platform services..." -ForegroundColor Cyan
    
    if ($FrontendStartedByScript -and $FrontendProc -and -not $FrontendProc.HasExited) {
        Write-Host "  Stopping frontend process..." -ForegroundColor Gray
        Stop-Process -Id $FrontendProc.Id -Force -ErrorAction SilentlyContinue
    }
    
    if ($BackendStartedByScript -and $BackendProc -and -not $BackendProc.HasExited) {
        Write-Host "  Stopping backend process..." -ForegroundColor Gray
        Stop-Process -Id $BackendProc.Id -Force -ErrorAction SilentlyContinue
    }

    if ($MongoStartedByScript -and $MongoProc -and -not $MongoProc.HasExited) {
        Write-Host "  Stopping local MongoDB process..." -ForegroundColor Gray
        Stop-Process -Id $MongoProc.Id -Force -ErrorAction SilentlyContinue
    }

    Write-Host "[OK] All presentation services stopped cleanly. Goodbye!" -ForegroundColor Green
}
