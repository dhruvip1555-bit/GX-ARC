# GX-Arc

**Compose Vision. Create Intelligence.**

GX-Arc turns computer vision from a coding problem into a building problem — drag together a pipeline, or simply describe the task, and ship hardware-optimized production code.

---

## Project structure

```
GX-ARC/
├── frontend/                        ← Served by Nginx on the VPS
│   ├── CSS/styles.css
│   ├── JS/app.js
│   ├── index.html
│   └── logo-badge.png
│
├── backend/                         ← Node.js API on the same VPS
│   ├── server.js
│   ├── routes/
│   │   ├── contact.js
│   │   └── requestAccess.js
│   ├── services/
│   │   └── emailService.js
│   ├── middleware/
│   │   └── validation.js
│   ├── package.json
│   └── .env.example
│
├── deploy/
│   ├── deploy.sh                    # One-command production setup
│   ├── gx-arc.conf                  # Nginx (frontend + API proxy)
│   └── gx-arc.service               # Systemd auto-start
│
├── install.sh
├── clean.sh
├── .gitignore
└── README.md
```

## Quick start

```bash
# One command — installs deps, creates .env from template
./install.sh

# Edit .env with your SMTP credentials
nano backend/.env

# Start
cd backend && npm start
#    → http://localhost:4000
```

### Clean everything

```bash
# Removes node_modules, package-lock.json, .env, logs, OS junk
# Returns the repo to a fresh-clone state
./clean.sh
```

The backend serves the frontend statically, so no separate dev server is needed for the landing page.

### Development (frontend only)

If you want to iterate on the frontend without the backend, open `frontend/index.html` directly in a browser or use any static server (Live Server, `python -m http.server`, etc.). The form will show a network error since the API isn't running, but everything else works.

## API endpoints

| Method | Path                  | Purpose                              |
| ------ | --------------------- | ------------------------------------ |
| POST   | `/api/contact`        | Talk to the Team / Book a Demo       |
| POST   | `/api/request-access` | Request Access                       |
| GET    | `/api/health`         | Health check                         |

### Request body (both POST endpoints)

```json
{
  "person_name": "string (required)",
  "contact_number": "string (required)",
  "email": "string (required)",
  "company_name": "string (optional)",
  "query": "string (required)",
  "subject": "string (optional — defaults to route context)",
  "notify": true
}
```

### Response

```json
{ "message": "Request submitted successfully." }
```

## Environment variables

| Variable          | Description                                     |
| ----------------- | ----------------------------------------------- |
| `PORT`            | Server port (default `4000`)                    |
| `SMTP_HOST`       | SMTP server (e.g. `smtp.gmail.com`)             |
| `SMTP_PORT`       | SMTP port (e.g. `587`)                          |
| `SMTP_USER`       | Sending email account                           |
| `SMTP_PASS`       | App password (not your account password)        |
| `RECIPIENT_EMAIL` | Where submissions are delivered (server-side only) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins                    |

## Security notes

- The recipient email address exists **only** in the server-side `.env` file — it never appears in HTML, CSS, JavaScript, API responses, or page source.
- Rate limiting: 10 submissions per IP per 15-minute window.
- Request body is capped at 16 KB.
- `.env` is git-ignored.

## Production deployment

The `deploy/` folder contains everything needed to go live on an Ubuntu VPS.

### Prerequisites

- A VPS (DigitalOcean, AWS EC2, Hetzner, etc.) running Ubuntu 22.04+
- SSH access as root
- Your domain's DNS A records pointing to the server IP

### DNS setup (GoDaddy)

Go to GoDaddy → DNS Management for each domain and set:

| Type | Name | Value            | TTL    |
| ---- | ---- | ---------------- | ------ |
| A    | @    | `YOUR_SERVER_IP` | 600    |
| A    | www  | `YOUR_SERVER_IP` | 600    |

Do this for **both** domains. Wait for propagation (5–30 min).

### Deploy

```bash
# On your server
git clone <your-repo-url> /root/GX-ARC
cd /root/GX-ARC/deploy
sudo bash deploy.sh
```

The script installs Node.js, Nginx, Certbot, configures the reverse proxy, obtains SSL certificates, and starts the backend as a systemd service.

### Swapping to a permanent domain

The domain names appear in exactly **two** files:

1. `deploy/nginx/gx-arc.conf` — `server_name` lines and SSL cert paths
2. `deploy/deploy.sh` — the `certbot` command's `-d` flags

Change them there, re-run `deploy.sh`, and everything else (app code, backend, `.env`) stays untouched.

### Useful commands

```bash
sudo systemctl status gx-arc           # backend status
sudo journalctl -u gx-arc -f           # backend logs (live)
sudo nginx -t && sudo systemctl reload nginx   # reload after config change
sudo certbot renew --dry-run            # test cert auto-renewal
```
