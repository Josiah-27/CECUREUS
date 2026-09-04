# CECUREUS — macOS Self-Hosting & Deployment Guide

Complete step-by-step instructions for hosting and running the **CECUREUS** backend system on **macOS (Apple Silicon M1/M2/M3/M4 or Intel)** using Homebrew, MySQL 8.x, PM2, and Nginx / Cloudflare Tunnel.

---

## 1. Prerequisites Installation (via Homebrew)

If you don't have Homebrew installed yet:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install Node.js (v20+ LTS), MySQL, Nginx, and PM2:
```bash
# Install system packages
brew install node@20 mysql nginx mkcert

# Link Node 20 if needed
brew link --overwrite --force node@20

# Install PM2 globally
npm install -g pm2
```

---

## 2. MySQL 8 Database Setup on macOS

Start the MySQL background service:
```bash
# Start MySQL via Homebrew services
brew services start mysql
```

Secure and initialize the database:
```bash
# Connect to local MySQL
mysql -u root

# (If prompted for password and you haven't set one yet, just press Enter)
```

Within the MySQL prompt, create the database and user:
```sql
CREATE DATABASE cecureus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cecureus_user'@'localhost' IDENTIFIED BY 'StrongRandomPasswordHere123!';
GRANT ALL PRIVILEGES ON cecureus.* TO 'cecureus_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 3. Server Configuration & Database Migrations

Navigate to the server directory:
```bash
cd /Users/sainimal/CECUREUS/server

# Install dependencies (if not already installed)
npm install

# Create your .env file
cp .env.example .env
```

Open `.env` and set your local credentials:
```ini
NODE_ENV=development
API_HOST=127.0.0.1
API_PORT=3000
PUBLIC_API_URL=http://localhost:3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=cecureus
DB_USER=cecureus_user
DB_PASSWORD=StrongRandomPasswordHere123!

# Generate a 64-byte random secret:
# Run in terminal: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
AUTH_TOKEN_SECRET=replace_with_your_generated_random_secret_string

TRUST_PROXY=1
```

Run database migrations and seed data:
```bash
# Run all pending migrations (accounts, sessions, counsellors, assessments, etc.)
npm run migrate

# Check migration status
npm run migrate:status
```

Run the unit tests to verify database and cryptography health:
```bash
npm test
```

---

## 4. Process Management with PM2 on macOS

Start the server in cluster mode (auto-utilizes all Apple Silicon performance and efficiency cores):

```bash
# Start via PM2
pm2 start ecosystem.config.js

# View running status
pm2 status

# View real-time logs
pm2 logs cecureus-api

# Setup PM2 to auto-start on macOS boot
pm2 startup
pm2 save
```

To stop or restart:
```bash
pm2 restart cecureus-api
pm2 stop cecureus-api
```

---

## 5. Reverse Proxy with Nginx on macOS

On Apple Silicon Macs, Homebrew Nginx configuration lives at `/opt/homebrew/etc/nginx/`.
(On Intel Macs, it lives at `/usr/local/etc/nginx/`).

### Step A: Configure Nginx
Create or edit your Nginx configuration:
```bash
# For Apple Silicon:
nano /opt/homebrew/etc/nginx/servers/cecureus.conf
```

Paste the following macOS Nginx configuration:
```nginx
upstream cecureus_backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 8080;
    server_name localhost;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "0" always;

    # Health checks
    location /health {
        proxy_pass http://cecureus_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    location /ready {
        proxy_pass http://cecureus_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    # API endpoints
    location /api/ {
        proxy_pass http://cecureus_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step B: Start Nginx
```bash
# Start Nginx service
brew services start nginx

# Reload if already running
brew services restart nginx
```

---

## 6. Public HTTPS Access for Mobile App Testing (Cloudflare Tunnel)

To test the mobile app from a physical phone on 4G/5G or outside your local Wi-Fi without configuring router port-forwarding:

```bash
# Install Cloudflare Tunnel
brew install cloudflare/cloudflare/cloudflared

# Expose your local backend via free, instant public HTTPS URL:
cloudflared tunnel --url http://127.0.0.1:3000
```

Cloudflare will give you a public URL like:
`https://random-subdomain.trycloudflare.com`

You can put this public HTTPS URL directly into your mobile app or update `PUBLIC_API_URL` in `.env`.

---

## 7. Verification & Health Probes

Test your local setup from Terminal:

```bash
# 1. Liveness check (is Node.js running?)
curl -s http://localhost:3000/health | json_pp

# Expected Output:
# {
#    "status" : "ok",
#    "uptime" : 12.345
# }

# 2. Readiness check (is MySQL connected?)
curl -s http://localhost:3000/ready | json_pp

# Expected Output:
# {
#    "database" : "connected",
#    "status" : "ready"
# }

# 3. List seeded counsellors
curl -s http://localhost:3000/api/counsellors | json_pp
```
