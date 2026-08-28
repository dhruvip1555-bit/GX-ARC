#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  GX-Arc · deploy.sh
#  Single-VPS production setup on DigitalOcean (Ubuntu).
#  Serves frontend + API from one server.
#
#  Run as root:  sudo bash deploy.sh
# ──────────────────────────────────────────────────────────────

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
RESET='\033[0m'

step()  { echo -e "\n${CYAN}[$1/$TOTAL]${RESET} $2"; }
ok()    { echo -e "    ${GREEN}✓${RESET} $1"; }
warn()  { echo -e "    ${YELLOW}!${RESET} $1"; }
fail()  { echo -e "    ${RED}✗${RESET} $1"; exit 1; }

TOTAL=7
DEPLOY_DIR="/var/www/gx-arc"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${CYAN}"
echo "  ┌──────────────────────────────────────┐"
echo "  │  GX-Arc · Production Deploy          │"
echo "  │  DigitalOcean · Single VPS           │"
echo "  └──────────────────────────────────────┘"
echo -e "${RESET}"

if [ "$EUID" -ne 0 ]; then
    fail "Run as root:  sudo bash deploy.sh"
fi

# ── 1. System packages ──
step 1 "Installing system packages"

apt-get update -qq

if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null 2>&1
    apt-get install -y -qq nodejs
    ok "Node.js $(node -v) installed"
else
    ok "Node.js $(node -v) already present"
fi

if ! command -v nginx &>/dev/null; then
    apt-get install -y -qq nginx
    ok "Nginx installed"
else
    ok "Nginx already present"
fi

if ! command -v certbot &>/dev/null; then
    apt-get install -y -qq certbot python3-certbot-nginx
    ok "Certbot installed"
else
    ok "Certbot already present"
fi

# ── 2. Deploy project files ──
step 2 "Deploying project to $DEPLOY_DIR"

mkdir -p "$DEPLOY_DIR"
rsync -a --delete \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude 'deploy' \
    --exclude '.git' \
    "$REPO_ROOT/" "$DEPLOY_DIR/"
ok "Files synced"

# ── 3. Backend dependencies ──
step 3 "Installing backend dependencies"

cd "$DEPLOY_DIR/backend"
npm install --omit=dev --loglevel=warn
ok "Production dependencies installed"

# ── 4. Environment ──
step 4 "Checking .env"

if [ ! -f "$DEPLOY_DIR/backend/.env" ]; then
    cp "$DEPLOY_DIR/backend/.env.example" "$DEPLOY_DIR/backend/.env"
    chmod 600 "$DEPLOY_DIR/backend/.env"
    warn "Created backend/.env — edit it now:"
    warn "  nano $DEPLOY_DIR/backend/.env"
    warn ""
    warn "  Fill in: SMTP_USER, SMTP_PASS, RECIPIENT_EMAIL"
    echo ""
    read -rp "  Press Enter after editing .env..."
else
    ok ".env already exists"
fi

# ── 5. Nginx ──
step 5 "Configuring Nginx"

cp "$SCRIPT_DIR/gx-arc.conf" /etc/nginx/sites-available/gx-arc
ln -sf /etc/nginx/sites-available/gx-arc /etc/nginx/sites-enabled/gx-arc
rm -f /etc/nginx/sites-enabled/default
mkdir -p /var/www/certbot

nginx -t 2>/dev/null
ok "Nginx config valid"
systemctl reload nginx
ok "Nginx reloaded"

# ── 6. SSL ──
step 6 "Obtaining SSL certificates"

if [ -d "/etc/letsencrypt/live/pocketsarthi.com" ]; then
    ok "Certificates already exist"
else
    echo ""
    warn "Make sure DNS A records point to this server first."
    echo ""

    certbot --nginx \
        -d pocketsarthi.com \
        -d www.pocketsarthi.com \
        -d pocketsarthi.co.in \
        -d www.pocketsarthi.co.in \
        --non-interactive --agree-tos --redirect \
        --email "$(grep SMTP_USER $DEPLOY_DIR/backend/.env | cut -d= -f2)" \
        || {
            warn "Certbot failed — DNS may not have propagated yet."
            warn "Re-run:  certbot --nginx -d pocketsarthi.com -d www.pocketsarthi.com -d pocketsarthi.co.in -d www.pocketsarthi.co.in"
        }
fi

# ── 7. Systemd ──
step 7 "Setting up systemd service"

cp "$SCRIPT_DIR/gx-arc.service" /etc/systemd/system/gx-arc.service
chown -R www-data:www-data "$DEPLOY_DIR"
systemctl daemon-reload
systemctl enable gx-arc --now
ok "gx-arc.service enabled and started"

sleep 2
if systemctl is-active --quiet gx-arc; then
    ok "Backend is running"
else
    warn "Check logs: journalctl -u gx-arc -f"
fi

echo ""
echo -e "${GREEN}  ✓ Deployment complete.${RESET}"
echo ""
echo -e "  ${DIM}Your site:${RESET}"
echo -e "    ${CYAN}https://pocketsarthi.com${RESET}"
echo -e "    ${CYAN}https://pocketsarthi.co.in${RESET}"
echo ""
echo -e "  ${DIM}Commands:${RESET}"
echo -e "    sudo systemctl status gx-arc"
echo -e "    sudo journalctl -u gx-arc -f"
echo -e "    sudo certbot renew --dry-run"
echo ""
