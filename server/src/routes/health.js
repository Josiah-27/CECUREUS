/**
 * CECUREUS — Health & Readiness Routes
 *
 * GET /health — Liveness check (is the process alive?)
 * GET /ready  — Readiness check (is the app ready to serve traffic?)
 */

const { Router } = require('express');
const db = require('../database/pool');

const router = Router();

/**
 * Liveness check — lightweight, no external dependencies.
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Readiness check — verifies database connectivity.
 */
router.get('/ready', async (req, res) => {
  try {
    const dbHealthy = await db.healthCheck();

    if (!dbHealthy) {
      return res.status(503).json({
        status: 'not_ready',
        database: 'unavailable',
      });
    }

    res.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      database: 'error',
    });
  }
});

module.exports = router;
