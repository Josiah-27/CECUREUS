/**
 * Migration 007 — Self assessments table
 *
 * From Figma Explore screen: Self assessments like Stress Level Check,
 * Burnout Assessment, Anxiety Screening, Work-Life Balance Score.
 */
exports.up = async function (conn) {
  // Assessment definitions (admin-managed)
  await conn.execute(`
    CREATE TABLE assessments (
      id CHAR(36) NOT NULL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      description VARCHAR(500) NOT NULL,
      category ENUM('stress', 'anxiety', 'burnout', 'work_life', 'sleep', 'workplace', 'general') NOT NULL,
      duration_minutes INT NOT NULL DEFAULT 5,
      questions JSON NOT NULL,
      scoring_guide JSON DEFAULT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      KEY idx_assessments_category (category),
      KEY idx_assessments_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // User assessment results
  await conn.execute(`
    CREATE TABLE assessment_results (
      id CHAR(36) NOT NULL PRIMARY KEY,
      account_id CHAR(36) NOT NULL,
      assessment_id CHAR(36) NOT NULL,
      answers JSON NOT NULL,
      score DECIMAL(5,2) DEFAULT NULL,
      result_summary VARCHAR(500) DEFAULT NULL,
      completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      KEY idx_results_account (account_id),
      KEY idx_results_assessment (assessment_id),
      KEY idx_results_completed (completed_at),

      CONSTRAINT fk_results_account
        FOREIGN KEY (account_id) REFERENCES accounts(id)
        ON DELETE CASCADE,

      CONSTRAINT fk_results_assessment
        FOREIGN KEY (assessment_id) REFERENCES assessments(id)
        ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.down = async function (conn) {
  await conn.execute('DROP TABLE IF EXISTS assessment_results');
  await conn.execute('DROP TABLE IF EXISTS assessments');
};
