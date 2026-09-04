/**
 * CECUREUS — Counsellor Routes
 *
 * GET  /api/counsellors          — List/search counsellors
 * GET  /api/counsellors/:id      — Get counsellor profile
 * POST /api/counsellors/:id/book — Book a session
 * GET  /api/sessions             — List user's sessions
 * GET  /api/sessions/:id         — Get session details
 * PUT  /api/sessions/:id/cancel  — Cancel a session
 */

const { Router } = require('express');
const { body, query: queryValidator, param, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/authenticate');
const db = require('../database/pool');
const { v4: uuidv4 } = require('uuid');

const router = Router();

// Maximum page size to prevent unbounded queries
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;

/**
 * GET /api/counsellors — List/search counsellors with filters and pagination
 */
router.get(
  '/',
  [
    queryValidator('page').optional().isInt({ min: 1 }).toInt(),
    queryValidator('limit').optional().isInt({ min: 1, max: MAX_PAGE_SIZE }).toInt(),
    queryValidator('specialization').optional().trim().isLength({ max: 50 }),
    queryValidator('search').optional().trim().isLength({ max: 100 }),
  ],
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = Math.min(req.query.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
      const offset = (page - 1) * limit;
      const { specialization, search } = req.query;

      let whereClause = "WHERE status = 'active'";
      const params = [];

      if (specialization) {
        whereClause += ' AND JSON_CONTAINS(specializations, ?)';
        params.push(JSON.stringify(specialization));
      }

      if (search) {
        whereClause += ' AND (name LIKE ? OR title LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      // Get total count
      const [countResult] = await db.query(
        `SELECT COUNT(*) AS total FROM counsellors ${whereClause}`,
        params
      );

      // Get paginated results
      const [counsellors] = await db.query(
        `SELECT id, name, title, specializations, experience_years, rating,
                total_sessions, languages, avatar_url, is_verified, is_available
         FROM counsellors
         ${whereClause}
         ORDER BY rating DESC, total_sessions DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      res.json({
        counsellors: counsellors.map((c) => ({
          ...c,
          specializations: typeof c.specializations === 'string' ? JSON.parse(c.specializations) : c.specializations,
          languages: typeof c.languages === 'string' ? JSON.parse(c.languages) : c.languages,
        })),
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/counsellors/:id — Get a single counsellor's profile
 */
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid counsellor ID')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid ID format', code: 'VALIDATION_ERROR' });
      }

      const [rows] = await db.query(
        `SELECT id, name, title, specializations, experience_years, rating,
                total_sessions, languages, bio, avatar_url, is_verified, is_available
         FROM counsellors
         WHERE id = ? AND status = 'active'`,
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Counsellor not found', code: 'NOT_FOUND' });
      }

      const counsellor = rows[0];
      counsellor.specializations = typeof counsellor.specializations === 'string' ? JSON.parse(counsellor.specializations) : counsellor.specializations;
      counsellor.languages = typeof counsellor.languages === 'string' ? JSON.parse(counsellor.languages) : counsellor.languages;

      res.json({ counsellor });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/counsellors/:id/book — Book a session with a counsellor
 * Requires authentication. Uses idempotency key to prevent double-booking.
 */
router.post(
  '/:id/book',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid counsellor ID'),
    body('sessionType').isIn(['video_call', 'phone_call', 'chat']).withMessage('Invalid session type'),
    body('scheduledAt').isISO8601().withMessage('Invalid date format'),
    body('durationMinutes').optional().isInt({ min: 15, max: 120 }).withMessage('Duration must be 15-120 minutes'),
    body('topics').optional().isArray({ max: 5 }).withMessage('Topics must be an array (max 5)'),
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

      const idempotencyKey = req.headers['x-idempotency-key'] || null;
      const { sessionType, scheduledAt, durationMinutes, topics } = req.body;

      // Use transaction to prevent double-booking race conditions
      const booking = await db.transaction(async (conn) => {
        // Check idempotency
        if (idempotencyKey) {
          const [existing] = await conn.execute(
            'SELECT id, status FROM session_bookings WHERE idempotency_key = ?',
            [idempotencyKey]
          );
          if (existing.length > 0) {
            return { existing: true, booking: existing[0] };
          }
        }

        // Verify counsellor exists and is available
        const [counsellors] = await conn.execute(
          "SELECT id FROM counsellors WHERE id = ? AND status = 'active' AND is_available = 1 FOR SHARE",
          [req.params.id]
        );

        if (counsellors.length === 0) {
          const err = new Error('Counsellor is not available');
          err.statusCode = 404;
          throw err;
        }

        // Check for scheduling conflicts (same counsellor, overlapping time)
        const duration = durationMinutes || 60;
        const schedDate = new Date(scheduledAt);
        const endDate = new Date(schedDate.getTime() + duration * 60 * 1000);

        const [conflicts] = await conn.execute(
          `SELECT id FROM session_bookings
           WHERE counsellor_id = ? AND status IN ('pending', 'confirmed')
           AND scheduled_at < ? AND DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) > ?`,
          [req.params.id, endDate, schedDate]
        );

        if (conflicts.length > 0) {
          const err = new Error('This time slot is already booked');
          err.statusCode = 409;
          err.code = 'SLOT_CONFLICT';
          throw err;
        }

        const bookingId = uuidv4();
        await conn.execute(
          `INSERT INTO session_bookings
           (id, account_id, counsellor_id, session_type, scheduled_at, duration_minutes, topics, idempotency_key)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [bookingId, req.user.id, req.params.id, sessionType, schedDate, duration, JSON.stringify(topics || []), idempotencyKey]
        );

        return { existing: false, booking: { id: bookingId, status: 'pending' } };
      });

      if (booking.existing) {
        return res.json({ message: 'Booking already exists', booking: booking.booking });
      }

      res.status(201).json({ message: 'Session booked successfully', booking: booking.booking });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/sessions — List authenticated user's booked sessions
 */
router.get(
  '/sessions',
  authenticate,
  [
    queryValidator('page').optional().isInt({ min: 1 }).toInt(),
    queryValidator('limit').optional().isInt({ min: 1, max: MAX_PAGE_SIZE }).toInt(),
    queryValidator('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled']),
  ],
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = Math.min(req.query.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE sb.account_id = ?';
      const params = [req.user.id];

      if (req.query.status) {
        whereClause += ' AND sb.status = ?';
        params.push(req.query.status);
      }

      const [sessions] = await db.query(
        `SELECT sb.id, sb.session_type, sb.status, sb.scheduled_at, sb.duration_minutes,
                sb.topics, sb.summary, sb.created_at,
                c.id AS counsellor_id, c.name AS counsellor_name, c.title AS counsellor_title,
                c.avatar_url AS counsellor_avatar
         FROM session_bookings sb
         JOIN counsellors c ON sb.counsellor_id = c.id
         ${whereClause}
         ORDER BY sb.scheduled_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      res.json({
        sessions: sessions.map((s) => ({
          ...s,
          topics: typeof s.topics === 'string' ? JSON.parse(s.topics) : s.topics,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
