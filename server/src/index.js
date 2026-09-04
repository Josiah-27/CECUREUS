/**
 * CECUREUS — Main Express Server
 *
 * Production-grade Express application with:
 * - Security middleware (Helmet, CORS, rate limiting)
 * - Structured logging
 * - Request ID correlation
 * - Graceful shutdown (SIGTERM/SIGINT)
 * - Database pool management
 * - Domain-separated routes
 */

const express = require('express');
const config = require('./config');
const logger = require('./config/logger');
const { securityMiddleware } = require('./middleware/security');
const { globalLimiter } = require('./middleware/rate-limit');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler');
const db = require('./database/pool');

// Routes
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const counsellorRoutes = require('./routes/counsellors');
const moodRoutes = require('./routes/mood');
const assessmentRoutes = require('./routes/assessments');
const allyRoutes = require('./routes/ally');

const app = express();

// ─── TRUST PROXY ───────────────────────────────────────────
// Required for rate limiting behind Nginx
if (config.server.trustProxy) {
  app.set('trust proxy', config.server.trustProxy);
}

// ─── SECURITY MIDDLEWARE ───────────────────────────────────
securityMiddleware().forEach((mw) => app.use(mw));

// ─── BODY PARSING ──────────────────────────────────────────
// Limit request body size to prevent abuse
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ─── GLOBAL RATE LIMITING ──────────────────────────────────
app.use(globalLimiter);

// ─── ROUTES ────────────────────────────────────────────────
// Health checks (no rate limit, no auth)
app.use(healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/counsellors', counsellorRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/ally', allyRoutes);

// ─── ERROR HANDLING ────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── SERVER START ──────────────────────────────────────────
let server;

async function start() {
  try {
    // Verify database connectivity before accepting traffic
    const dbHealthy = await db.healthCheck();
    if (!dbHealthy) {
      logger.error('Cannot start — database is not reachable');
      process.exit(1);
    }
    logger.info('Database connection verified');

    server = app.listen(config.server.port, config.server.host, () => {
      logger.info(`CECUREUS API server started`, {
        host: config.server.host,
        port: config.server.port,
        env: config.env,
        publicUrl: config.server.publicUrl,
      });
    });

    // Server timeout
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// ─── GRACEFUL SHUTDOWN ─────────────────────────────────────

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received — starting graceful shutdown`);

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  // Wait for active requests to finish (max 30s)
  const shutdownTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 30000);

  try {
    // Close database pool
    await db.closePool();
    logger.info('Graceful shutdown complete');
    clearTimeout(shutdownTimeout);
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Prevent unhandled rejections from crashing silently
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason?.message || reason,
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  // Exit after logging — let process manager restart
  process.exit(1);
});

// Start the server
start();

module.exports = app; // Export for testing
