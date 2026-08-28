#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  GX-Arc · install.sh
#  Installs all required dependencies for the GX-Arc project.
#  Run from the repo root:  ./install.sh
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
RESET='\033[0m'

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

step()  { echo -e "\n${CYAN}[$1/$TOTAL]${RESET} $2"; }
ok()    { echo -e "    ${GREEN}✓${RESET} $1"; }
warn()  { echo -e "    ${YELLOW}!${RESET} $1"; }
fail()  { echo -e "    ${RED}✗${RESET} $1"; exit 1; }

TOTAL=4

echo -e "${CYAN}"
echo "  ┌──────────────────────────────────────┐"
echo "  │  GX-Arc · Install                    │"
echo "  │  Compose Vision. Create Intelligence │"
echo "  └──────────────────────────────────────┘"
echo -e "${RESET}"

# ── 1. Check Node.js ──
step 1 "Checking Node.js"

if ! command -v node &>/dev/null; then
    fail "Node.js is not installed. Install it from https://nodejs.org (v18+ recommended)."
fi

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    warn "Node.js v$NODE_VERSION detected — v18+ is recommended."
else
    ok "Node.js v$NODE_VERSION"
fi

# ── 2. Check npm ──
step 2 "Checking npm"

if ! command -v npm &>/dev/null; then
    fail "npm is not installed. It ships with Node.js — reinstall Node from https://nodejs.org"
fi

NPM_VERSION=$(npm -v)
ok "npm v$NPM_VERSION"

# ── 3. Install backend dependencies ──
step 3 "Installing backend dependencies"

if [ ! -d "$BACKEND_DIR" ]; then
    fail "backend/ directory not found at $BACKEND_DIR"
fi

cd "$BACKEND_DIR"
npm install --loglevel=warn
ok "node_modules installed ($(ls node_modules | wc -l | tr -d ' ') packages)"

# ── 4. Set up .env ──
step 4 "Setting up environment"

if [ -f "$BACKEND_DIR/.env" ]; then
    ok ".env already exists — skipping"
else
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        ok ".env created from .env.example"
        warn "Edit backend/.env and fill in your SMTP credentials and RECIPIENT_EMAIL before starting."
    else
        warn ".env.example not found — create backend/.env manually"
    fi
fi

# ── Done ──
cd "$ROOT_DIR"

echo ""
echo -e "${GREEN}  ✓ Install complete.${RESET}"
echo ""
echo -e "  ${DIM}Next steps:${RESET}"
echo -e "    1. Edit ${CYAN}backend/.env${RESET} with your SMTP credentials"
echo -e "    2. Run  ${CYAN}cd backend && npm start${RESET}"
echo -e "    3. Open ${CYAN}http://localhost:4000${RESET}"
echo ""
