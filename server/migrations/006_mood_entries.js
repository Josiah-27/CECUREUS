/**
 * Migration 006 — Mood entries table
 *
 * From Figma Home screen: mood tracking with emoji-style moods.
 */
exports.up = async function (conn) {
  await conn.execute(`
    CREATE TABLE mood_entries (
      id CHAR(36) NOT NULL PRIMARY KEY,
      account_id CHAR(36) NOT NULL,
      mood ENUM('great', 'good', 'okay', 'low', 'bad') NOT NULL,
      note TEXT DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      KEY idx_mood_account (account_id),
      KEY idx_mood_created (created_at),

      CONSTRAINT fk_mood_account
        FOREIGN KEY (account_id) REFERENCES accounts(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async function (conn) {
  await conn.execute('DROP TABLE IF EXISTS mood_entries');
};
