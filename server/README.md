# CECUREUS — Self-Hosted Backend Server & API

Production-ready, security-hardened, self-hosted Node.js/Express & MySQL 8.x backend system for the **CECUREUS** mental health & wellness mobile platform.

---

## Architecture Overview

```
[ Mobile App (iOS / Android) ]
              │ (HTTPS / TLS 1.3)
              ▼
[ Nginx Reverse Proxy & SSL Termination ] (Rate Limiting, HSTS, Security Headers)
              │ (HTTP / Unix Socket / Keepalive)
              ▼
[ PM2 Cluster (Node.js Multi-Core Monolith) ]
   ├── Express API Server (Helmet, CORS, JSON Body Limits)
   ├── Auth & Session Management (SHA-256 Hashed Tokens, Bcrypt Cost 12)
   ├── Rate Limiters (Global Tier, Auth Tier, OTP Tier)
   └── Domain Services (Counsellors, Ally AI, Mood, Assessments)
              │ (Parameterized SQL / Connection Pool)
              ▼
[ MySQL 8.x Database Server (Private Localhost) ]
```

---

## Key Security Features

1. **Password Hashing**: Adaptive Bcrypt with configurable cost factor (default 12 rounds), auto-salted.
2. **Session Token Storage**: Cryptographically random 96-character hex tokens; only SHA-256 hashes are persisted in the database. Token compromise from database dumps is eliminated.
3. **Timing-Safe Operations**: Dummy bcrypt comparisons execute when phone numbers are not found to neutralize user enumeration via timing discrepancies.
4. **Brute Force & Account Lockout**:
   - Accounts lock automatically for 15 minutes after 5 consecutive failed login attempts.
   - OTP codes enforce attempt limits (max 3 tries per generated code).
   - Rate limiters enforce strict IP and phone-based throttles.
5. **No SQL String Concatenation**: 100% parameterized SQL prepared statements via `mysql2/promise` with transactions for double-booking race condition prevention.
6. **Data Privacy & App Store Compliance**:
   - Full account deletion endpoint (`DELETE /api/auth/account`) that revokes sessions, deactivates push tokens, and anonymizes personal records.
   - Zero sensitive information in server logs (passwords, OTPs, session tokens, and keys are automatically redacted).

---

## Directory Structure

```
server/
├── deploy/
│   ├── nginx.conf                 # Production Nginx reverse proxy configuration
│   ├── PM2_NGINX_DEPLOYMENT.md   # Production deployment runbook
│   ├── STORE_COMPLIANCE.md        # Apple App Store & Google Play compliance
│   └── RED_TEAM_AUDIT.md          # Security audit & threat mitigation
├── migrations/                    # Sequential database migration scripts
│   ├── 001_accounts.js
│   ├── 002_sessions.js
│   ├── 003_otp_codes.js
│   ├── 004_counsellors.js
│   ├── 005_session_bookings.js
│   ├── 006_mood_entries.js
│   ├── 007_assessments.js
│   ├── 008_ally_conversations.js
│   ├── 009_push_tokens_audit.js
│   └── 010_seed_data.js
├── src/
│   ├── config/
│   │   ├── index.js               # Environment config validation (fails fast)
│   │   └── logger.js              # Redacting structured Winston logger
│   ├── database/
│   │   ├── pool.js                # MySQL connection pool & transaction helper
│   │   └── migrator.js            # Database migration runner
│   ├── middleware/
│   │   ├── authenticate.js        # Hashed token Bearer auth middleware
│   │   ├── error-handler.js       # Safe error sanitization (no stack traces leaked)
│   │   ├── rate-limit.js          # Tiered rate limiters (Global, Auth, OTP)
│   │   └── security.js            # Helmet, CORS, and request correlation IDs
│   ├── routes/
│   │   ├── ally.js                # Ally AI mental health companion routes
│   │   ├── assessments.js         # Self-assessment questionnaires & scoring
│   │   ├── auth.js                # Registration, login, OTP, logout, deletion
│   │   ├── counsellors.js         # Counsellor directory & booking flow
│   │   ├── health.js              # Liveness and readiness probes (/health, /ready)
│   │   ├── mood.js                # Daily mood check-in & statistics
│   │   └── profile.js             # User profile & wellness overview stats
│   ├── services/
│   │   └── auth-service.js        # Core authentication & cryptographic engine
│   └── index.js                   # Main Express application entry & graceful shutdown
├── tests/
│   └── auth.test.js               # Cryptographic & security unit test suite
├── .env.example                   # Documented environment variables template
├── ecosystem.config.js            # PM2 cluster configuration
└── package.json
```

---

## Quick Start (Development)

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and supply DB credentials and a random AUTH_TOKEN_SECRET
   ```

3. **Run database migrations:**
   ```bash
   npm run migrate
   ```

4. **Run test suite:**
   ```bash
   npm test
   ```

5. **Start server:**
   ```bash
   npm run dev
   ```

---

## Production Deployment Commands

```bash
# Verify database connection and migrations
npm run migrate

# Start in cluster mode with PM2
pm2 start ecosystem.config.js --env production

# Monitor logs
pm2 logs cecureus-api
```
