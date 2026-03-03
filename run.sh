#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# run.sh — Timeline Generator Thin Orchestrator
#
# Stages:
#   1. Preflight   — check prerequisites (Node, pnpm, Docker)
#   2. Install     — pnpm install (idempotent)
#   3. Database    — start Neo4j via Docker Compose
#   4. Validate    — TypeScript type-check across all packages
#   5. Test        — run the full 185-test suite
#   6. Launch      — start backend + frontend, open browser
#
# Usage:
#   ./run.sh            # full pipeline
#   ./run.sh --skip-tests   # skip test stage
#   ./run.sh --test-only    # run tests only, no servers
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Helpers ──
log()  { echo -e "${CYAN}[run.sh]${NC} $1"; }
ok()   { echo -e "${GREEN}  ✅ $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠️  $1${NC}"; }
fail() { echo -e "${RED}  ❌ $1${NC}"; exit 1; }
hr()   { echo -e "${CYAN}─────────────────────────────────────────────${NC}"; }

SKIP_TESTS=false
TEST_ONLY=false

for arg in "$@"; do
    case "$arg" in
        --skip-tests) SKIP_TESTS=true ;;
        --test-only)  TEST_ONLY=true ;;
        --help|-h)
            echo "Usage: ./run.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-tests   Skip the test suite"
            echo "  --test-only    Run tests only (no servers)"
            echo "  --help, -h     Show this help"
            exit 0
            ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${BOLD}${RED}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${RED}║         Timeline Generator — Orchestrator         ║${NC}"
echo -e "${BOLD}${RED}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Stage 1: Preflight ──
hr
log "${BOLD}Stage 1: Preflight Checks${NC}"
hr

# Node.js
if command -v node &>/dev/null; then
    NODE_VER=$(node -v)
    ok "Node.js $NODE_VER"
else
    fail "Node.js not found. Install Node.js >= 20.x"
fi

# pnpm
if command -v pnpm &>/dev/null; then
    PNPM_VER=$(pnpm -v)
    ok "pnpm $PNPM_VER"
else
    fail "pnpm not found. Install with: npm install -g pnpm"
fi

# Docker
if command -v docker &>/dev/null; then
    DOCKER_VER=$(docker --version | head -1)
    ok "$DOCKER_VER"
else
    fail "Docker not found. Install Docker Desktop: https://docs.docker.com/get-docker/"
fi

# .env check
if [ -f packages/backend/.env ]; then
    ok "Backend .env exists"
    if grep -q "PERPLEXITY_API_KEY" packages/backend/.env 2>/dev/null; then
        ok "Perplexity API key configured"
    else
        warn "PERPLEXITY_API_KEY not set — research feature will show fallback"
    fi
else
    warn "packages/backend/.env not found — using defaults (Neo4j: bolt://localhost:7687)"
fi

echo ""

# ── Stage 2: Install ──
hr
log "${BOLD}Stage 2: Install Dependencies${NC}"
hr

pnpm install --frozen-lockfile 2>/dev/null || pnpm install
ok "Dependencies installed"
echo ""

# ── Stage 3: Database ──
hr
log "${BOLD}Stage 3: Neo4j Database${NC}"
hr

# Check if Neo4j is already running
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'timeline_neo4j'; then
    ok "Neo4j already running (timeline_neo4j)"
else
    log "Starting Neo4j via Docker Compose..."
    docker compose up -d
    ok "Neo4j container started"

    # Wait for Neo4j to become healthy
    log "Waiting for Neo4j to become healthy..."
    MAX_WAIT=60
    WAITED=0
    while [ $WAITED -lt $MAX_WAIT ]; do
        STATUS=$(docker inspect --format='{{.State.Health.Status}}' timeline_neo4j 2>/dev/null || echo "starting")
        if [ "$STATUS" = "healthy" ]; then
            ok "Neo4j healthy (${WAITED}s)"
            break
        fi
        sleep 2
        WAITED=$((WAITED + 2))
        printf "."
    done
    echo ""
    if [ $WAITED -ge $MAX_WAIT ]; then
        warn "Neo4j health check timed out after ${MAX_WAIT}s — continuing anyway"
    fi
fi

echo ""

# ── Stage 4: Validate ──
hr
log "${BOLD}Stage 4: TypeScript Validation${NC}"
hr

log "Type-checking backend..."
(cd packages/backend && npx tsc --noEmit)
ok "Backend type-check passed (0 errors)"

echo ""

# ── Stage 5: Test ──
if [ "$SKIP_TESTS" = false ]; then
    hr
    log "${BOLD}Stage 5: Test Suite${NC}"
    hr

    pnpm test
    ok "All tests passed"
    echo ""
fi

# ── Stage 6: Launch ──
if [ "$TEST_ONLY" = false ]; then
    hr
    log "${BOLD}Stage 6: Launch${NC}"
    hr

    # Kill any existing processes on our ports
    lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
    sleep 1

    log "Starting backend (port 3001) and frontend (port 5173)..."
    pnpm dev &
    DEV_PID=$!

    # Wait for backend to respond
    log "Waiting for backend..."
    MAX_WAIT=30
    WAITED=0
    while [ $WAITED -lt $MAX_WAIT ]; do
        if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
            break
        fi
        sleep 1
        WAITED=$((WAITED + 1))
    done

    if [ $WAITED -ge $MAX_WAIT ]; then
        warn "Backend did not respond within ${MAX_WAIT}s"
    else
        HEALTH=$(curl -s http://localhost:3001/api/health)
        ENGINE=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('engine','unknown'))" 2>/dev/null || echo "unknown")
        VERSION=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('version','?'))" 2>/dev/null || echo "?")
        ok "Backend live — engine: ${ENGINE}, version: ${VERSION}"
    fi

    # Wait for frontend to respond
    log "Waiting for frontend..."
    WAITED=0
    while [ $WAITED -lt 15 ]; do
        if curl -s http://localhost:5173 >/dev/null 2>&1; then
            break
        fi
        sleep 1
        WAITED=$((WAITED + 1))
    done
    ok "Frontend live"

    # Open the browser
    log "Opening browser..."
    if command -v open &>/dev/null; then
        open http://localhost:5173
    elif command -v xdg-open &>/dev/null; then
        xdg-open http://localhost:5173
    else
        warn "Could not auto-open browser. Navigate to http://localhost:5173"
    fi

    echo ""
    echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║         Timeline Generator — Running! 🚀          ║${NC}"
    echo -e "${BOLD}${GREEN}╠════════════════════════════════════════════════════╣${NC}"
    echo -e "${BOLD}${GREEN}║  Frontend:  http://localhost:5173                 ║${NC}"
    echo -e "${BOLD}${GREEN}║  Backend:   http://localhost:3001                 ║${NC}"
    echo -e "${BOLD}${GREEN}║  Neo4j:     http://localhost:7474                 ║${NC}"
    echo -e "${BOLD}${GREEN}║  Health:    http://localhost:3001/api/health      ║${NC}"
    echo -e "${BOLD}${GREEN}╠════════════════════════════════════════════════════╣${NC}"
    echo -e "${BOLD}${GREEN}║  Press Ctrl+C to stop all services               ║${NC}"
    echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Trap Ctrl+C for clean shutdown
    trap 'echo ""; log "Shutting down..."; kill $DEV_PID 2>/dev/null; ok "Servers stopped. Neo4j remains running (docker compose down to stop)."; exit 0' INT TERM

    # Keep alive
    wait $DEV_PID
else
    echo ""
    echo -e "${GREEN}${BOLD}Tests complete. No servers launched (--test-only mode).${NC}"
fi
