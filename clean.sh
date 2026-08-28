#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  GX-Arc · clean.sh
#  Removes all build artifacts, dependencies, and environment
#  files to return the repo to a fresh-clone state.
#  Run from the repo root:  ./clean.sh
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
skip()  { echo -e "    ${DIM}–${RESET} $1"; }
warn()  { echo -e "    ${YELLOW}!${RESET} $1"; }

TOTAL=4

echo -e "${CYAN}"
echo "  ┌──────────────────────────────────────┐"
echo "  │  GX-Arc · Clean                      │"
echo "  │  Compose Vision. Create Intelligence │"
echo "  └──────────────────────────────────────┘"
echo -e "${RESET}"

# ── Confirm ──
echo -e "  This will remove:${RESET}"
echo -e "    ${DIM}•${RESET} backend/node_modules/"
echo -e "    ${DIM}•${RESET} backend/package-lock.json"
echo -e "    ${DIM}•${RESET} backend/.env ${DIM}(your credentials)${RESET}"
echo -e "    ${DIM}•${RESET} npm cache (local)"
echo -e "    ${DIM}•${RESET} OS junk files (.DS_Store, Thumbs.db)"
echo ""

read -rp "  Continue? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "\n  ${DIM}Cancelled.${RESET}\n"
    exit 0
fi

# ── 1. Remove node_modules ──
step 1 "Removing node_modules"

if [ -d "$BACKEND_DIR/node_modules" ]; then
    rm -rf "$BACKEND_DIR/node_modules"
    ok "backend/node_modules/ removed"
else
    skip "backend/node_modules/ not found — already clean"
fi

# ── 2. Remove lock file ──
step 2 "Removing package-lock.json"

if [ -f "$BACKEND_DIR/package-lock.json" ]; then
    rm -f "$BACKEND_DIR/package-lock.json"
    ok "backend/package-lock.json removed"
else
    skip "package-lock.json not found — already clean"
fi

# ── 3. Remove .env ──
step 3 "Removing .env"

if [ -f "$BACKEND_DIR/.env" ]; then
    read -rp "    ${YELLOW}!${RESET} backend/.env contains credentials. Delete it? [y/N] " env_confirm
    if [[ "$env_confirm" =~ ^[Yy]$ ]]; then
        rm -f "$BACKEND_DIR/.env"
        ok "backend/.env removed"
    else
        skip "backend/.env kept"
    fi
else
    skip "backend/.env not found — already clean"
fi

# ── 4. Remove OS junk + npm cache ──
step 4 "Cleaning up"

# OS junk files
JUNK_COUNT=$(find "$ROOT_DIR" -name ".DS_Store" -o -name "Thumbs.db" 2>/dev/null | wc -l | tr -d ' ')
if [ "$JUNK_COUNT" -gt 0 ]; then
    find "$ROOT_DIR" -name ".DS_Store" -delete 2>/dev/null || true
    find "$ROOT_DIR" -name "Thumbs.db" -delete 2>/dev/null || true
    ok "Removed $JUNK_COUNT junk file(s)"
else
    skip "No junk files found"
fi

# npm cache (project-scoped)
if [ -d "$BACKEND_DIR/.npm" ]; then
    rm -rf "$BACKEND_DIR/.npm"
    ok "Local npm cache removed"
else
    skip "No local npm cache"
fi

# Log files
LOG_COUNT=$(find "$ROOT_DIR" -name "*.log" 2>/dev/null | wc -l | tr -d ' ')
if [ "$LOG_COUNT" -gt 0 ]; then
    find "$ROOT_DIR" -name "*.log" -delete 2>/dev/null || true
    ok "Removed $LOG_COUNT log file(s)"
else
    skip "No log files found"
fi

# ── Done ──
echo ""
echo -e "${GREEN}  ✓ Clean complete — repo is back to fresh-clone state.${RESET}"
echo -e "  ${DIM}Run ./install.sh to set up again.${RESET}"
echo ""
