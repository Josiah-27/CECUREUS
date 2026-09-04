/**
 * CECUREUS — Self Assessment Routes
 *
 * GET  /api/assessments             — List available self assessments (Stress, Burnout, Anxiety, etc.)
 * GET  /api/assessments/:id         — Get assessment questions & details
 * POST /api/assessments/:id/submit  — Submit answers & get score result
 * GET  /api/assessments/history/me  — Get user's past assessment scores
 */

const { Router } = require('express');
const { body, param, query: queryValidator, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { authenticate, optionalAuth } = require('../middleware/authenticate');
const db = require('../database/pool');

const router = Router();

/**
 * GET /api/assessments — List all active assessments with category filter
 */
router.get(
  '/',
  optionalAuth,
  [queryValidator('category').optional().isIn(['stress', 'anxiety', 'burnout', 'work_life', 'sleep', 'workplace', 'general'])],
  async (req, res, next) => {
    try {
      let querySql = `SELECT id, title, description, category, duration_minutes FROM assessments WHERE is_active = 1`;
      const params = [];

      if (req.query.category) {
        querySql += ' AND category = ?';
        params.push(req.query.category);
      }

      querySql += ' ORDER BY created_at ASC';

      const [assessments] = await db.query(querySql, params);

      res.json({ assessments });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/assessments/history/me — User's completed assessments
 */
router.get('/history/me', authenticate, async (req, res, next) => {
  try {
    const [results] = await db.query(
      `SELECT ar.id, ar.score, ar.result_summary, ar.completed_at,
              a.id AS assessment_id, a.title, a.category, a.duration_minutes
       FROM assessment_results ar
       JOIN assessments a ON ar.assessment_id = a.id
       WHERE ar.account_id = ?
       ORDER BY ar.completed_at DESC`,
      [req.user.id]
    );

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/assessments/:id — Get a single assessment with questions
 */
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid assessment ID')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid assessment ID', code: 'VALIDATION_ERROR' });
      }

      const [rows] = await db.query(
        `SELECT id, title, description, category, duration_minutes, questions
         FROM assessments
         WHERE id = ? AND is_active = 1`,
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Assessment not found', code: 'NOT_FOUND' });
      }

      const assessment = rows[0];
      assessment.questions = typeof assessment.questions === 'string' ? JSON.parse(assessment.questions) : assessment.questions;

      res.json({ assessment });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/assessments/:id/submit — Submit assessment answers and compute score
 */
router.post(
  '/:id/submit',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid assessment ID'),
    body('answers').isArray({ min: 1 }).withMessage('Answers array is required'),
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

      const [rows] = await db.query(
        `SELECT id, title, category, questions FROM assessments WHERE id = ? AND is_active = 1`,
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Assessment not found', code: 'NOT_FOUND' });
      }

      const assessment = rows[0];
      const answers = req.body.answers;

      // Calculate score based on answers (standard Likert scale normalization 0-100)
      let totalPoints = 0;
      let maxPoints = answers.length * 4;

      answers.forEach((ans) => {
        const point = typeof ans.selectedOptionIndex === 'number' ? ans.selectedOptionIndex : 2;
        totalPoints += Math.min(Math.max(point, 0), 4);
      });

      const normalizedScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 50;

      let resultSummary = '';
      if (normalizedScore <= 30) {
        resultSummary = `Your ${assessment.title} indicates a Low/Mild level. Keep up your healthy lifestyle routines!`;
      } else if (normalizedScore <= 65) {
        resultSummary = `Your ${assessment.title} indicates a Moderate level. Regular mindfulness, breaks, and speaking with Ally can help.`;
      } else {
        resultSummary = `Your ${assessment.title} indicates an Elevated level. We recommend booking a session with one of our certified counsellors.`;
      }

      const resultId = uuidv4();
      await db.query(
        `INSERT INTO assessment_results (id, account_id, assessment_id, answers, score, result_summary)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [resultId, req.user.id, assessment.id, JSON.stringify(answers), normalizedScore, resultSummary]
      );

      res.status(201).json({
        message: 'Assessment completed successfully',
        result: {
          id: resultId,
          assessmentId: assessment.id,
          title: assessment.title,
          score: normalizedScore,
          resultSummary,
          completedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
