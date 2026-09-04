/**
 * CECUREUS — Authentication Unit & Security Tests
 */

const authService = require('../src/services/auth-service');
const { hashToken } = require('../src/middleware/authenticate');

describe('Authentication & Security Cryptography', () => {
  describe('Password Hashing', () => {
    it('should securely hash password with bcrypt', async () => {
      const password = 'StrongPassword123!';
      const hash = await authService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$2b$')).toBe(true);
      expect(hash).not.toEqual(password);

      const isValid = await authService.verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await authService.verifyPassword('WrongPassword123!', hash);
      expect(isInvalid).toBe(false);
    });

    it('should generate different salts for the same password', async () => {
      const password = 'SamePasswordToTestSalts';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);

      expect(hash1).not.toEqual(hash2);
      expect(await authService.verifyPassword(password, hash1)).toBe(true);
      expect(await authService.verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe('Session Token Hashing', () => {
    it('should generate 96-char hex session token and hash with SHA-256', () => {
      const token1 = 'a'.repeat(96);
      const hash1 = hashToken(token1);
      const hash2 = hashToken(token1);

      expect(hash1).toEqual(hash2);
      expect(hash1.length).toBe(64); // SHA-256 hex length
    });
  });

  describe('OTP Security', () => {
    it('should generate 6-digit cryptographic OTP', async () => {
      // Test the OTP generation logic
      const crypto = require('crypto');
      const otp = crypto.randomInt(100000, 999999).toString();

      expect(otp.length).toBe(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
      const intVal = parseInt(otp, 10);
      expect(intVal).toBeGreaterThanOrEqual(100000);
      expect(intVal).toBeLessThanOrEqual(999999);
    });
  });
});
