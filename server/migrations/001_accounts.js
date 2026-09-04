/**
 * Migration 001 — Accounts table
 *
 * Core user accounts for CECUREUS.
 * Supports soft-delete for account deletion compliance.
 */
exports.up = async function (conn) {
  await conn.execute(`
    CREATE TABLE accounts (
      id CHAR(36) NOT NULL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) DEFAULT NULL,
      phone VARCHAR(20) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      status ENUM('active', 'suspended', 'deleted') NOT NULL DEFAULT 'active',
      email_verified TINYINT(1) NOT NULL DEFAULT 0,
      phone_verified TINYINT(1) NOT NULL DEFAULT 0,
      failed_login_attempts INT NOT NULL DEFAULT 0,
      locked_until TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL DEFAULT NULL,

      UNIQUE KEY uq_accounts_phone (phone),
      UNIQUE KEY uq_accounts_email (email),
      KEY idx_accounts_status (status),
      KEY idx_accounts_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async function (conn) {
  await conn.execute('DROP TABLE IF EXISTS accounts');
};
