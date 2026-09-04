/**
 * CECUREUS — Auth Routes
 *
 * POST /api/auth/register          — Create account directly
 * POST /api/auth/request-otp       — Generate single OTP
 * POST /api/auth/request-dual-otp  — Generate OTP for Phone & Gmail
 * POST /api/auth/verify-otp        — Verify OTP
 * POST /api/auth/register-with-otp — Verify dual OTP and register account
 * POST /api/auth/login             — Login
 * POST /api/auth/logout            — Logout (revoke session)
 * DELETE /api/auth/account         — Delete account
 */

const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const authService = require('../services/auth-service');
const { authenticate } = require('../middleware/authenticate');
const { authLimiter, otpLimiter } = require('../middleware/rate-limit');
const config = require('../config');
const logger = require('../config/logger');

const router = Router();

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return null;
}

/**
 * POST /api/auth/register
 */
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+?[1-9]\d{6,14}$/)
      .withMessage('Invalid phone number format'),
    body('email').optional({ values: 'null' }).trim().isEmail().withMessage('Invalid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be 8-128 characters'),
  ],
  async (req, res, next) => {
    try {
      const valError = handleValidationErrors(req, res);
      if (valError) return;

      const { name, phone, email, password } = req.body;
      const account = await authService.registerAccount({ name, phone, email, password });
      const session = await authService.createSession(account.id, {
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.status(201).json({
        message: 'Account created successfully',
        account,
        session: {
          token: session.token,
          expiresAt: session.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/request-dual-otp
 * Generates OTP for both phone and Gmail during registration
 */
router.post(
  '/request-dual-otp',
  otpLimiter,
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('email').trim().isEmail().withMessage('Valid email/Gmail is required'),
  ],
  async (req, res, next) => {
    try {
      const valError = handleValidationErrors(req, res);
      if (valError) return;

      const { phone, email } = req.body;

      // Check if phone already registered
      const existing = await authService.findAccountByPhone(phone);
      if (existing) {
        return res.status(409).json({
          error: 'An account with this phone number already exists',
          code: 'ACCOUNT_EXISTS',
        });
      }

      await authService.createOTP(phone, 'registration');
      await authService.createOTP(email, 'registration');

      res.json({
        message: 'Verification codes sent to phone and email',
        phone,
        email,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/verify-phone-step
 * Step 1 of registration: Verifies phone OTP, then triggers Gmail OTP dispatch
 */
router.post(
  '/verify-phone-step',
  authLimiter,
  [
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('code').trim().isLength({ min: 6, max: 6 }).withMessage('Phone OTP must be 6 digits'),
    body('email').trim().isEmail().withMessage('Valid email/Gmail is required'),
  ],
  async (req, res, next) => {
    try {
      const valError = handleValidationErrors(req, res);
      if (valError) return;

      const { phone, code, email } = req.body;

      const phoneRes = await authService.verifyOTP(phone, code, 'registration');
      if (!phoneRes.valid) {
        return res.status(400).json({
          error: phoneRes.error,
          code: 'PHONE_OTP_INVALID',
        });
      }

      // Phone is verified! Now dispatch Gmail OTP
      await authService.createOTP(email, 'registration');

      res.json({
        message: 'Phone verified successfully! Verification code sent to your Gmail.',
        phoneVerified: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/register-with-otp
 * Step 2 of registration: Verifies email OTP, then completes account creation
 */
router.post(
  '/register-with-otp',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('email').trim().isEmail().withMessage('Valid email/Gmail is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('emailOtp').trim().isLength({ min: 6, max: 6 }).withMessage('Email OTP must be 6 digits'),
  ],
  async (req, res, next) => {
    try {
      const valError = handleValidationErrors(req, res);
      if (valError) return;

      const { name, phone, email, password, emailOtp } = req.body;

      // Verify email OTP
      const emailRes = await authService.verifyOTP(email, emailOtp, 'registration');
      if (!emailRes.valid) {
        return res.status(400).json({
          error: `Email verification failed: ${emailRes.error}`,
          code: 'EMAIL_OTP_INVALID',
        });
      }

      // Register account
      const account = await authService.registerAccount({ name, phone, email, password });
      const session = await authService.createSession(account.id, {
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.status(201).json({
        message: 'Registration verified and completed successfully',
        account,
        session: {
          token: session.token,
          expiresAt: session.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  authLimiter,
  [
    body().custom((value, { req }) => {
      const identifier = req.body.identifier || req.body.phone || req.body.email;
      if (!identifier || !String(identifier).trim()) {
        throw new Error('Phone number or email is required');
      }
      return true;
    }),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const valError = handleValidationErrors(req, res);
      if (valError) return;

      const identifier = req.body.identifier || req.body.phone || req.body.email;
      const { password } = req.body;
      const result = await authService.login(identifier, password, {
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.json({
        message: 'Login successful',
        account: result.account,
        session: {
          token: result.session.token,
          expiresAt: result.session.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/request-otp
 */
router.post(
  '/request-otp',
  otpLimiter,
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('purpose')
      .notEmpty()
      .isIn(['registration', 'login', 'password_reset'])
      .withMessage('Purpose must be registration, login, or password_reset'),
  ],
  async (req, res, next) => {
    try {
      const valError = handleValidationErrors(req, res);
      if (valError) return;

      const { phone, purpose } = req.body;
      const code = await authService.createOTP(phone, purpose);

      res.json({
        message: 'Verification code sent',
        devOtpCode: config.isDev ? code : undefined,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/verify-otp
 */
router.post(
  '/verify-otp',
  authLimiter,
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Verification code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('Code must be 6 digits'),
    body('purpose')
      .notEmpty()
      .isIn(['registration', 'login', 'password_reset'])
      .withMessage('Purpose must be registration, login, or password_reset'),
  ],
  async (req, res, next) => {
    try {
      const valError = handleValidationErrors(req, res);
      if (valError) return;

      const { phone, code, purpose } = req.body;
      const result = await authService.verifyOTP(phone, code, purpose);

      if (!result.valid) {
        return res.status(400).json({
          error: result.error,
          code: 'OTP_INVALID',
        });
      }

      res.json({
        message: 'Verification successful',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/logout
 */
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const rawToken = req.token;
    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await authService.revokeSession(tokenHash);

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/auth/account
 */
router.delete('/account', authenticate, async (req, res, next) => {
  try {
    await authService.deleteAccount(req.account.id);
    res.json({
      message: 'Account and associated data deleted permanently',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
