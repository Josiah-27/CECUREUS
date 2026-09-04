/**
 * CECUREUS Server Configuration
 *
 * Loads and validates environment variables.
 * Fails fast on missing required configuration in production.
 */

// Load .env from server/ directory or root directory
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

const envPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env'),
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

const env = process.env;

const config = {
  env: env.NODE_ENV || 'development',
  isDev: (env.NODE_ENV || 'development') === 'development',
  isProd: env.NODE_ENV === 'production',

  server: {
    host: env.API_HOST || '0.0.0.0',
    port: parseInt(env.API_PORT, 10) || 3000,
    publicUrl: env.PUBLIC_API_URL || `http://localhost:${env.API_PORT || 3000}`,
    trustProxy: parseInt(env.TRUST_PROXY, 10) || 0,
  },

  db: {
    host: env.DB_HOST || '127.0.0.1',
    port: parseInt(env.DB_PORT, 10) || 3306,
    database: env.DB_NAME || 'cecureus',
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    pool: {
      min: parseInt(env.DB_POOL_MIN, 10) || 2,
      max: parseInt(env.DB_POOL_MAX, 10) || 10,
    },
    connectTimeout: parseInt(env.DB_CONNECT_TIMEOUT, 10) || 10000,
    acquireTimeout: parseInt(env.DB_ACQUIRE_TIMEOUT, 10) || 30000,
  },

  auth: {
    tokenSecret: env.AUTH_TOKEN_SECRET || '',
    tokenExpiryHours: parseInt(env.AUTH_TOKEN_EXPIRY_HOURS, 10) || 24,
    bcryptRounds: parseInt(env.BCRYPT_ROUNDS, 10) || 12,
  },

  otp: {
    expiryMinutes: parseInt(env.OTP_EXPIRY_MINUTES, 10) || 5,
    maxAttempts: parseInt(env.OTP_MAX_ATTEMPTS, 10) || 3,
    maxResendsPerHour: parseInt(env.OTP_MAX_RESENDS_PER_HOUR, 10) || 5,
  },

  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(env.RATE_LIMIT_MAX, 10) || 100,
    authWindowMs: parseInt(env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 900000,
    authMax: parseInt(env.AUTH_RATE_LIMIT_MAX, 10) || 20,
  },

  cors: {
    allowedOrigins: env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
      : [],
  },

  push: {
    fcmServerKey: env.FCM_SERVER_KEY || '',
    apnsKeyId: env.APNS_KEY_ID || '',
    apnsTeamId: env.APNS_TEAM_ID || '',
    apnsBundleId: env.APNS_BUNDLE_ID || '',
    expoAccessToken: env.EXPO_ACCESS_TOKEN || '',
  },

  logging: {
    level: env.LOG_LEVEL || 'info',
    format: env.LOG_FORMAT || 'simple',
  },
};

/**
 * Validate required config for production.
 * In development, warn but don't crash.
 */
function validateConfig() {
  const required = [];

  if (!config.auth.tokenSecret) {
    required.push('AUTH_TOKEN_SECRET — generate with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  }

  if (!config.db.password && config.isProd) {
    required.push('DB_PASSWORD — your MySQL database password');
  }

  if (!config.server.publicUrl || config.server.publicUrl.includes('localhost')) {
    if (config.isProd) {
      required.push('PUBLIC_API_URL — your public HTTPS API endpoint (e.g. https://api.cecureus.com)');
    }
  }

  if (required.length > 0) {
    const message = `\n⚠️  Missing required configuration:\n\n${required.map((r) => `  • ${r}`).join('\n')}\n`;

    if (config.isProd) {
      console.error(message);
      process.exit(1);
    } else {
      console.warn(message);
    }
  }
}

validateConfig();

module.exports = config;
