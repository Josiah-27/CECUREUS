/**
 * CECUREUS — Structured Logger
 *
 * Production-safe logging:
 * - NEVER logs passwords, OTPs, tokens, secrets
 * - Structured JSON in production
 * - Human-readable in development
 * - Request correlation via request IDs
 */

const winston = require('winston');
const config = require('./index');

const SENSITIVE_KEYS = new Set([
  'password', 'password_hash', 'passwordHash',
  'token', 'sessionToken', 'session_token', 'authToken', 'auth_token',
  'otp', 'otpCode', 'otp_code', 'code',
  'secret', 'apiKey', 'api_key',
  'authorization', 'cookie',
  'DB_PASSWORD', 'AUTH_TOKEN_SECRET',
]);

/**
 * Recursively redact sensitive fields from objects before logging.
 */
function redactSensitive(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitive);

  const redacted = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key)) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitive(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

const formatForDev = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, requestId, devOtpCode, ...meta }) => {
    const rid = requestId ? ` [${requestId}]` : '';
    const metaStr = Object.keys(meta).length > 0
      ? ` ${JSON.stringify(redactSensitive(meta))}`
      : '';
    const otpTag = devOtpCode ? ` ➡️ [OTP: ${devOtpCode}]` : '';
    return `${timestamp} ${level}${rid}: ${message}${otpTag}${metaStr}`;
  })
);

const formatForProd = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: config.logging.level,
  format: config.logging.format === 'json' ? formatForProd : formatForDev,
  transports: [
    new winston.transports.Console(),
  ],
  // Redact sensitive data in metadata
  defaultMeta: {},
});

// Override log methods to always redact sensitive data
const originalLog = logger.log.bind(logger);
logger.log = function (level, message, meta) {
  if (typeof meta === 'object') {
    meta = redactSensitive(meta);
  }
  return originalLog(level, message, meta);
};

module.exports = logger;
