/**
 * CECUREUS — Authentication Middleware
 *
 * Validates Bearer tokens from the Authorization header.
 * Looks up session by hashed token, checks expiry and revocation.
 * Attaches user info to req.user.
 */

const crypto = require('crypto');
const db = require('../database/pool');
const logger = require('../config/logger');

/**
 * Hash a raw token for database lookup.
 * Tokens are stored hashed (SHA-256) to prevent token theft from DB compromise.
 */
function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Authentication middleware.
 * Extracts Bearer token, validates session, attaches req.user.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  const rawToken = authHeader.slice(7);

  if (!rawToken || rawToken.length < 32) {
    return res.status(401).json({
      error: 'Invalid authentication token',
      code: 'INVALID_TOKEN',
    });
  }

  try {
    const tokenHash = hashToken(rawToken);

    const [rows] = await db.query(
      `SELECT s.id AS session_id, s.account_id, s.expires_at, s.revoked_at,
              a.name, a.email, a.phone, a.status AS account_status
       FROM sessions s
       JOIN accounts a ON s.account_id = a.id
       WHERE s.token_hash = ?
       LIMIT 1`,
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid authentication token',
        code: 'INVALID_TOKEN',
      });
    }

    const session = rows[0];

    // Check if session is revoked
    if (session.revoked_at) {
      return res.status(401).json({
        error: 'Session has been revoked',
        code: 'SESSION_REVOKED',
      });
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return res.status(401).json({
        error: 'Session has expired',
        code: 'SESSION_EXPIRED',
      });
    }

    // Check if account is active
    if (session.account_status !== 'active') {
      return res.status(401).json({
        error: 'Account is not active',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    // Attach user info to request
    req.user = {
      id: session.account_id,
      sessionId: session.session_id,
      name: session.name,
      email: session.email,
      phone: session.phone,
    };

    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message, requestId: req.requestId });
    return res.status(500).json({
      error: 'Authentication service unavailable',
      code: 'AUTH_ERROR',
    });
  }
}

/**
 * Optional authentication — doesn't fail if no token provided,
 * but validates if one exists.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  return authenticate(req, res, next);
}

module.exports = { authenticate, optionalAuth, hashToken };
