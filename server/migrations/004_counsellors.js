/**
 * Migration 004 — Counsellors table
 *
 * Mental health professionals listed in the app.
 * From Figma: name, title, specializations, experience, rating, languages.
 */
exports.up = async function (conn) {
  await conn.execute(`
    CREATE TABLE counsellors (
      id CHAR(36) NOT NULL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      title VARCHAR(100) NOT NULL,
      specializations JSON NOT NULL DEFAULT ('[]'),
      experience_years INT NOT NULL DEFAULT 0,
      rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
      total_sessions INT NOT NULL DEFAULT 0,
      languages JSON NOT NULL DEFAULT ('[]'),
      bio TEXT DEFAULT NULL,
      avatar_url VARCHAR(500) DEFAULT NULL,
      is_verified TINYINT(1) NOT NULL DEFAULT 0,
      is_available TINYINT(1) NOT NULL DEFAULT 1,
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      KEY idx_counsellors_status (status),
      KEY idx_counsellors_rating (rating),
      KEY idx_counsellors_available (is_available)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async function (conn) {
  await conn.execute('DROP TABLE IF EXISTS counsellors');
};
