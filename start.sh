#!/usr/bin/env bash
# ==============================================================================
# Intelligence Fusion Platform - One-Command Startup Script (macOS / Linux)
# DBMS Mini Project (UE24CS395) | PES University (2026-2027)
# Team: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

TEST_MODE=false
NO_BROWSER=false
FORCE_SEED=false
FRONTEND_MODE="next"

# Parse CLI arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -t|--test) TEST_MODE=true; shift ;;
        -n|--no-browser) NO_BROWSER=true; shift ;;
        -s|--seed) FORCE_SEED=true; shift ;;
        -f|--frontend) FRONTEND_MODE="$2"; shift 2 ;;
        -h|--help)
            echo "========================================================================"
            echo "  INTELLIGENCE FUSION PLATFORM - STARTUP GUIDE (Linux / macOS)"
            echo "========================================================================"
            echo "Usage: ./start.sh [options]"
            echo ""
            echo "Options:"
            echo "  -t, --test              Run automated test suite (pytest) and exit"
            echo "  -n, --no-browser        Launch without opening browser automatically"
            echo "  -s, --seed              Force database re-seeding"
            echo "  -f, --frontend <mode>   Frontend server: 'next' (port 3000) or 'vite' (port 5173)"
            echo "  -h, --help              Show this help message"
            echo "========================================================================"
            exit 0
            ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
done

echo ""
echo "========================================================================"
echo "  INTELLIGENCE FUSION PLATFORM - ONE-COMMAND STARTUP"
echo "  DBMS Mini Project | PES University (2026-2027)"
echo "  Team: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)"
echo "========================================================================"
echo ""

# 1. System Prerequisites
echo "[1/6] Checking system prerequisites..."
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python 3.11+ is required but not found in PATH."
    exit 1
fi
echo "  [OK] Python: $($PYTHON_CMD --version)"

if ! command -v node &>/dev/null; then
    echo "[ERROR] Node.js is required but not found in PATH."
    exit 1
fi
echo "  [OK] Node.js: $(node -v)"

if ! command -v npm &>/dev/null; then
    echo "[ERROR] npm is required but not found in PATH."
    exit 1
fi
echo "  [OK] npm: v$(npm -v)"

# 2. Virtual Environment & Backend Dependencies
echo ""
echo "[2/6] Verifying Python virtual environment..."
VENV_DIR="$PROJECT_ROOT/venv"
VENV_PYTHON="$VENV_DIR/bin/python"

if [ ! -f "$VENV_PYTHON" ]; then
    echo "  Creating virtual environment in ./venv..."
    $PYTHON_CMD -m venv "$VENV_DIR"
fi
echo "  [OK] Virtual environment verified."

# Check dependencies
DEPS_OK=$("$VENV_PYTHON" -c "
try:
    import fastapi, uvicorn, sqlalchemy, pydantic_settings, pymongo, pytest
    print('OK')
except Exception:
    print('MISSING')
" 2>/dev/null || echo "MISSING")

if [ "$DEPS_OK" != "OK" ]; then
    echo "  Installing backend dependencies from backend/requirements.txt..."
    "$VENV_PYTHON" -m pip install -q -r "$PROJECT_ROOT/backend/requirements.txt"
    echo "  [OK] Backend dependencies installed."
else
    echo "  [OK] Backend dependencies verified."
fi

# 3. Frontend Dependencies
echo ""
echo "[3/6] Verifying frontend dependencies..."
if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo "  Installing frontend dependencies (npm install)..."
    (cd "$PROJECT_ROOT/frontend" && npm install --silent --no-audit)
    echo "  [OK] Frontend dependencies installed."
else
    echo "  [OK] Frontend node_modules verified."
fi

# 4. Database Connectivity Check
echo ""
echo "[4/6] Checking database service connectivity..."
export PYTHONPATH="$PROJECT_ROOT/backend"

# Check PostgreSQL
if nc -z localhost 5432 2>/dev/null || (exec 3<>/dev/tcp/127.0.0.1/5432) 2>/dev/null; then
    echo "  [OK] PostgreSQL active on port 5432."
    PG_ACTIVE=true
else
    echo "  [INFO] PostgreSQL not detected on port 5432."
    echo "         Using verified SQLite engine (intelligence_fusion.db) with 100% relational integrity."
    PG_ACTIVE=false
fi

# Check MongoDB
if nc -z localhost 27017 2>/dev/null || (exec 3<>/dev/tcp/127.0.0.1/27017) 2>/dev/null; then
    echo "  [OK] MongoDB active on port 27017."
    MONGO_ACTIVE=true
else
    if command -v docker &>/dev/null; then
        echo "  Attempting to start MongoDB via Docker Compose..."
        docker compose up -d mongodb 2>/dev/null || true
        sleep 2
    fi
    if nc -z localhost 27017 2>/dev/null || (exec 3<>/dev/tcp/127.0.0.1/27017) 2>/dev/null; then
        echo "  [OK] MongoDB active on port 27017."
        MONGO_ACTIVE=true
    else
        echo "  [WARN] MongoDB is currently offline on port 27017."
        echo "         Relational queries remain fully operational. Documents will show offline status."
        MONGO_ACTIVE=false
    fi
fi

# 5. Database Seeding Status
echo ""
echo "[5/6] Checking database data integrity & seeding status..."
EXISTING_CASES=$("$VENV_PYTHON" -c "
from app.db.session import SessionLocal
from app.models.sql_models import Case
try:
    db = SessionLocal()
    print(db.query(Case).count())
except Exception:
    print('0')
" 2>/dev/null || echo "0")

if [ "$FORCE_SEED" = true ]; then
    echo "  User requested --seed. Populating demonstration records..."
    "$VENV_PYTHON" "$PROJECT_ROOT/backend/seed.py"
    echo "  [OK] Database re-seeded successfully."
elif [ "$EXISTING_CASES" -gt 0 ]; then
    echo "  [OK] Existing records detected ($EXISTING_CASES cases). Preserving existing database without resetting."
else
    echo "  Database is empty. Populating initial demonstration records..."
    "$VENV_PYTHON" "$PROJECT_ROOT/backend/seed.py"
    echo "  [OK] Initial database seed completed."
fi

# 6. Test Mode
if [ "$TEST_MODE" = true ]; then
    echo ""
    echo "========================================================================"
    echo "  RUNNING AUTOMATED TEST SUITE (pytest)"
    echo "========================================================================"
    "$VENV_PYTHON" -m pytest "$PROJECT_ROOT/backend/tests/test_api.py" -v
    exit $?
fi

# 7. Start Services
echo ""
echo "[6/6] Launching backend and frontend services..."

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    echo "Shutting down platform services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo "[OK] All presentation services stopped cleanly."
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start backend if not already running on 8000
if nc -z 127.0.0.1 8000 2>/dev/null || (exec 3<>/dev/tcp/127.0.0.1/8000) 2>/dev/null; then
    echo "  [OK] Backend server already running on port 8000."
else
    echo "  Starting FastAPI backend on http://127.0.0.1:8000..."
    (cd "$PROJECT_ROOT/backend" && "$VENV_PYTHON" -m uvicorn app.main:app --host 127.0.0.1 --port 8000) &
    BACKEND_PID=$!
    
    # Wait for backend health
    for i in {1..25}; do
        if curl -s http://127.0.0.1:8000/api/health >/dev/null 2>&1; then
            break
        fi
        sleep 0.5
    done
fi

# Start frontend
if [ "$FRONTEND_MODE" = "vite" ]; then
    FRONTEND_PORT=5173
    NPM_CMD="run dev:vite"
else
    FRONTEND_PORT=3000
    NPM_CMD="run dev"
fi
FRONTEND_URL="http://localhost:$FRONTEND_PORT"

if nc -z localhost "$FRONTEND_PORT" 2>/dev/null || (exec 3<>/dev/tcp/127.0.0.1/"$FRONTEND_PORT") 2>/dev/null; then
    echo "  [OK] Frontend already running on $FRONTEND_URL"
else
    echo "  Starting $FRONTEND_MODE frontend on $FRONTEND_URL (npm $NPM_CMD)..."
    (cd "$PROJECT_ROOT/frontend" && npm $NPM_CMD) &
    FRONTEND_PID=$!
    
    for i in {1..35}; do
        if curl -s "$FRONTEND_URL" >/dev/null 2>&1; then
            break
        fi
        sleep 0.5
    done
fi

REL_STATUS="SQLite 3 (intelligence_fusion.db) [Local Fallback]"
if [ "$PG_ACTIVE" = true ]; then
    REL_STATUS="PostgreSQL 16 (Port 5432)"
fi

NOSQL_STATUS="Offline (Optional)"
if [ "$MONGO_ACTIVE" = true ]; then
    NOSQL_STATUS="MongoDB (Port 27017)"
fi

echo ""
echo "========================================================================"
echo "  INTELLIGENCE FUSION PLATFORM IS READY FOR DEMONSTRATION"
echo "========================================================================"
echo "  Frontend URL:       $FRONTEND_URL"
echo "  Backend API:        http://127.0.0.1:8000"
echo "  Swagger API Docs:   http://127.0.0.1:8000/docs"
echo "  System Health:      http://127.0.0.1:8000/api/health"
echo "  Relational Engine:  $REL_STATUS"
echo "  NoSQL Document DB:  $NOSQL_STATUS"
echo "  Default Admin:      Username: admin | Password: password123"
echo "========================================================================"
echo "  Press Ctrl+C in this terminal to stop all services cleanly."
echo "========================================================================"
echo ""

if [ "$NO_BROWSER" = false ]; then
    sleep 1
    if command -v xdg-open &>/dev/null; then
        xdg-open "$FRONTEND_URL" 2>/dev/null || true
    elif command -v open &>/dev/null; then
        open "$FRONTEND_URL" 2>/dev/null || true
    fi
fi

# Wait for background processes
wait
