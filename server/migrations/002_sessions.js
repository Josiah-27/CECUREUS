/**
 * Migration 002 — Sessions table
 *
 * Authentication sessions with hashed tokens.
 * Supports expiry, revocation, and device tracking.
 */
exports.up = async function (conn) {
  await conn.execute(`
    CREATE TABLE sessions (
      id CHAR(36) NOT NULL PRIMARY KEY,
      account_id CHAR(36) NOT NULL,
      token_hash VARCHAR(64) NOT NULL,
      device_info VARCHAR(255) DEFAULT NULL,
      ip_address VARCHAR(45) DEFAULT NULL,
      expires_at TIMESTAMP NOT NULL,
      revoked_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      KEY idx_sessions_token_hash (token_hash),
      KEY idx_sessions_account (account_id),
      KEY idx_sessions_expires (expires_at),

      CONSTRAINT fk_sessions_account
        FOREIGN KEY (account_id) REFERENCES accounts(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async function (conn) {
  await conn.execute('DROP TABLE IF EXISTS sessions');
};
