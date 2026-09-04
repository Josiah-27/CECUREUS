/**
 * Migration 003 — OTP codes table
 *
 * OTP verification with:
 * - Hashed code storage (never store plaintext)
 * - Expiry enforcement
 * - Attempt counting for brute-force protection
 * - Purpose tracking (registration, login, password_reset)
 */
exports.up = async function (conn) {
  await conn.execute(`
    CREATE TABLE otp_codes (
      id CHAR(36) NOT NULL PRIMARY KEY,
      phone VARCHAR(191) NOT NULL,
      code_hash VARCHAR(64) NOT NULL,
      purpose ENUM('registration', 'login', 'password_reset') NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      expires_at TIMESTAMP NOT NULL,
      verified_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      KEY idx_otp_phone_purpose (phone, purpose),
      KEY idx_otp_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async function (conn) {
  await conn.execute('DROP TABLE IF EXISTS otp_codes');
};
