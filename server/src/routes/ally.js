/**
 * CECUREUS — Ally AI Wellness Companion Routes
 *
 * GET  /api/ally/conversations          — List user's conversations
 * GET  /api/ally/conversations/:id      — Get conversation with messages
 * POST /api/ally/conversations          — Start a new conversation (or with a topic)
 * POST /api/ally/conversations/:id/messages — Send a message & get Ally's empathetic response
 */

const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/authenticate');
const db = require('../database/pool');
const aiService = require('../services/ai-service');

const router = Router();

/**
 * GET /api/ally/conversations — List user's conversations
 */
router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const [conversations] = await db.query(
      `SELECT c.id, c.topic, c.created_at, c.updated_at,
              (SELECT content FROM ally_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message
       FROM ally_conversations c
       WHERE c.account_id = ?
       ORDER BY c.updated_at DESC`,
      [req.user.id]
    );

    res.json({ conversations });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ally/conversations — Start a new Ally conversation
 */
router.post(
  '/conversations',
  authenticate,
  [body('topic').optional({ values: 'null' }).trim().isLength({ max: 100 }), body('initialMessage').optional().trim().isLength({ max: 1000 })],
  async (req, res, next) => {
    try {
      const topic = req.body.topic || 'General Check-in';
      const initialMessage = req.body.initialMessage || null;
      const conversationId = uuidv4();

      await db.query(
        `INSERT INTO ally_conversations (id, account_id, topic) VALUES (?, ?, ?)`,
        [conversationId, req.user.id, topic]
      );

      // Create introductory greeting from Ally
      const greetingId = uuidv4();
      const greetingText = `Hi, I'm Ally 👋 I'm here to listen, understand and support you with ${topic.toLowerCase()}. How are you feeling today?`;

      await db.query(
        `INSERT INTO ally_messages (id, conversation_id, role, content) VALUES (?, ?, 'ally', ?)`,
        [greetingId, conversationId, greetingText]
      );

      let userMsgObj = null;
      let replyMsgObj = null;

      if (initialMessage) {
        const userMsgId = uuidv4();
        await db.query(
          `INSERT INTO ally_messages (id, conversation_id, role, content) VALUES (?, ?, 'user', ?)`,
          [userMsgId, conversationId, initialMessage]
        );
        userMsgObj = { id: userMsgId, role: 'user', content: initialMessage, createdAt: new Date() };

        const replyId = uuidv4();
        const replyText = await aiService.generateAllyResponse([], initialMessage, topic);
        await db.query(
          `INSERT INTO ally_messages (id, conversation_id, role, content) VALUES (?, ?, 'ally', ?)`,
          [replyId, conversationId, replyText]
        );
        replyMsgObj = { id: replyId, role: 'ally', content: replyText, createdAt: new Date() };
      }

      res.status(201).json({
        conversation: {
          id: conversationId,
          topic,
          messages: [
            { id: greetingId, role: 'ally', content: greetingText, createdAt: new Date() },
            ...(userMsgObj ? [userMsgObj] : []),
            ...(replyMsgObj ? [replyMsgObj] : []),
          ],
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/ally/conversations/:id — Get a conversation with message history
 */
router.get(
  '/conversations/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid conversation ID')],
  async (req, res, next) => {
    try {
      const [convs] = await db.query(
        `SELECT id, topic, created_at FROM ally_conversations WHERE id = ? AND account_id = ?`,
        [req.params.id, req.user.id]
      );

      if (convs.length === 0) {
        return res.status(404).json({ error: 'Conversation not found', code: 'NOT_FOUND' });
      }

      const [messages] = await db.query(
        `SELECT id, role, content, created_at FROM ally_messages WHERE conversation_id = ? ORDER BY created_at ASC`,
        [req.params.id]
      );

      res.json({
        conversation: {
          ...convs[0],
          messages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/ally/conversations/:id/messages — Send user message and receive Ally response
 */
router.post(
  '/conversations/:id/messages',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid conversation ID'),
    body('content').trim().notEmpty().withMessage('Message content is required').isLength({ max: 2000 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const [convs] = await db.query(
        `SELECT id, topic FROM ally_conversations WHERE id = ? AND account_id = ?`,
        [req.params.id, req.user.id]
      );

      if (convs.length === 0) {
        return res.status(404).json({ error: 'Conversation not found', code: 'NOT_FOUND' });
      }

      const conversation = convs[0];
      const userContent = req.body.content;

      // Fetch prior messages for full conversational context
      const [history] = await db.query(
        `SELECT role, content FROM ally_messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 10`,
        [conversation.id]
      );

      // Save user message
      const userMsgId = uuidv4();
      await db.query(
        `INSERT INTO ally_messages (id, conversation_id, role, content) VALUES (?, ?, 'user', ?)`,
        [userMsgId, conversation.id, userContent]
      );

      // Generate intelligent Ally response via Phi-3 (Ollama)
      const allyReplyText = await aiService.generateAllyResponse(history, userContent, conversation.topic);
      const allyMsgId = uuidv4();
      await db.query(
        `INSERT INTO ally_messages (id, conversation_id, role, content) VALUES (?, ?, 'ally', ?)`,
        [allyMsgId, conversation.id, allyReplyText]
      );

      // Update conversation updated_at
      await db.query(`UPDATE ally_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [conversation.id]);

      res.status(201).json({
        userMessage: { id: userMsgId, role: 'user', content: userContent, created_at: new Date().toISOString() },
        allyMessage: { id: allyMsgId, role: 'ally', content: allyReplyText, created_at: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
