/**
 * CECUREUS — Profile Routes
 *
 * GET    /api/profile     — Get current user profile
 * PUT    /api/profile     — Update profile
 */

const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/authenticate');
const db = require('../database/pool');

const router = Router();

/**
 * GET /api/profile — Get the authenticated user's profile and wellness overview
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    // Get account data
    const [accounts] = await db.query(
      `SELECT id, name, email, phone, phone_verified, email_verified, created_at
       FROM accounts WHERE id = ?`,
      [req.user.id]
    );

    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Profile not found', code: 'NOT_FOUND' });
    }

    // Get wellness overview stats
    const [sessionCount] = await db.query(
      `SELECT COUNT(*) AS count FROM session_bookings WHERE account_id = ? AND status = 'completed'`,
      [req.user.id]
    );

    const [assessmentCount] = await db.query(
      'SELECT COUNT(*) AS count FROM assessment_results WHERE account_id = ?',
      [req.user.id]
    );

    const [moodCount] = await db.query(
      'SELECT COUNT(*) AS count FROM mood_entries WHERE account_id = ?',
      [req.user.id]
    );

    // Get recent sessions
    const [recentSessions] = await db.query(
      `SELECT sb.id, sb.session_type, sb.scheduled_at, sb.status, sb.topics, sb.summary,
              c.name AS counsellor_name, c.title AS counsellor_title
       FROM session_bookings sb
       JOIN counsellors c ON sb.counsellor_id = c.id
       WHERE sb.account_id = ?
       ORDER BY sb.scheduled_at DESC
       LIMIT 5`,
      [req.user.id]
    );

    const profile = accounts[0];

    res.json({
      profile,
      wellnessOverview: {
        sessionsTaken: sessionCount[0].count,
        assessmentsDone: assessmentCount[0].count,
        moodEntries: moodCount[0].count,
      },
      recentSessions: recentSessions.map((s) => ({
        ...s,
        topics: typeof s.topics === 'string' ? JSON.parse(s.topics) : s.topics,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/profile — Update profile
 */
router.put(
  '/',
  authenticate,
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('email').optional({ values: 'null' }).trim().isEmail().withMessage('Invalid email'),
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

      const updates = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.email !== undefined) updates.email = req.body.email;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update', code: 'NO_UPDATES' });
      }

      const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
      const values = [...Object.values(updates), req.user.id];

      await db.query(
        `UPDATE accounts SET ${setClauses} WHERE id = ?`,
        values
      );

      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
