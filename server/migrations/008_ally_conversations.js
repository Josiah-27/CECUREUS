/**
 * Migration 008 — Ally chat conversations
 *
 * From Figma: AI mental wellness companion "Ally" with chat interface.
 */
exports.up = async function (conn) {
  await conn.execute(`
    CREATE TABLE ally_conversations (
      id CHAR(36) NOT NULL PRIMARY KEY,
      account_id CHAR(36) NOT NULL,
      topic VARCHAR(100) DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      KEY idx_ally_conv_account (account_id),

      CONSTRAINT fk_ally_conv_account
        FOREIGN KEY (account_id) REFERENCES accounts(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.execute(`
    CREATE TABLE ally_messages (
      id CHAR(36) NOT NULL PRIMARY KEY,
      conversation_id CHAR(36) NOT NULL,
      role ENUM('user', 'ally') NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      KEY idx_ally_msg_conv (conversation_id),

      CONSTRAINT fk_ally_msg_conv
        FOREIGN KEY (conversation_id) REFERENCES ally_conversations(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async function (conn) {
  await conn.execute('DROP TABLE IF EXISTS ally_messages');
  await conn.execute('DROP TABLE IF EXISTS ally_conversations');
};
