/**
 * CECUREUS — Mood Tracking Routes
 *
 * GET  /api/mood         — Get user's mood history & stats
 * POST /api/mood         — Record a new mood entry
 */

const { Router } = require('express');
const { body, query: queryValidator, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/authenticate');
const db = require('../database/pool');

const router = Router();

/**
 * GET /api/mood — Retrieve mood history for the authenticated user
 */
router.get(
  '/',
  authenticate,
  [
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    queryValidator('days').optional().isInt({ min: 1, max: 365 }).toInt(),
  ],
  async (req, res, next) => {
    try {
      const limit = req.query.limit || 30;
      const days = req.query.days || 30;

      const [entries] = await db.query(
        `SELECT id, mood, note, created_at
         FROM mood_entries
         WHERE account_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         ORDER BY created_at DESC
         LIMIT ?`,
        [req.user.id, days, limit]
      );

      // Aggregate mood distribution
      const [distribution] = await db.query(
        `SELECT mood, COUNT(*) as count
         FROM mood_entries
         WHERE account_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY mood`,
        [req.user.id, days]
      );

      res.json({
        entries,
        summary: {
          totalEntries: entries.length,
          distribution: distribution.reduce((acc, curr) => {
            acc[curr.mood] = curr.count;
            return acc;
          }, {}),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/mood — Log a mood entry
 */
router.post(
  '/',
  authenticate,
  [
    body('mood')
      .trim()
      .isIn(['great', 'good', 'okay', 'low', 'bad'])
      .withMessage('Mood must be one of: great, good, okay, low, bad'),
    body('note').optional({ values: 'null' }).trim().isLength({ max: 500 }).withMessage('Note must be under 500 chars'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
      }

      const { mood, note } = req.body;
      const entryId = uuidv4();

      await db.query(
        `INSERT INTO mood_entries (id, account_id, mood, note)
         VALUES (?, ?, ?, ?)`,
        [entryId, req.user.id, mood, note || null]
      );

      res.status(201).json({
        message: 'Mood logged successfully',
        entry: {
          id: entryId,
          mood,
          note: note || null,
          created_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
