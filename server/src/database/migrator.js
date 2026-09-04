/**
 * CECUREUS — Database Migration Runner
 *
 * Tracks applied migrations in a _migrations table.
 * Runs pending migrations in order.
 * Never drops or destroys existing data.
 *
 * Usage:
 *   node src/database/migrator.js          # Run pending migrations
 *   node src/database/migrator.js --status # Show migration status
 */

const fs = require('fs');
const path = require('path');
const db = require('./pool');
const logger = require('../config/logger');

const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations');
const MIGRATIONS_TABLE = '_migrations';

/**
 * Ensure the migrations tracking table exists.
 */
async function ensureMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

/**
 * Get list of already-applied migration names.
 */
async function getAppliedMigrations() {
  const [rows] = await db.query(
    `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id ASC`
  );
  return rows.map((r) => r.name);
}

/**
 * Get all migration files from the migrations directory.
 */
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    return [];
  }
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort();
}

/**
 * Run all pending migrations.
 */
async function runMigrations() {
  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();
  const files = getMigrationFiles();
  const pending = files.filter((f) => !applied.includes(f));

  if (pending.length === 0) {
    logger.info('Database is up to date — no pending migrations');
    return;
  }

  logger.info(`Found ${pending.length} pending migration(s)`);

  for (const file of pending) {
    const migrationPath = path.join(MIGRATIONS_DIR, file);
    const migration = require(migrationPath);

    if (typeof migration.up !== 'function') {
      throw new Error(`Migration ${file} is missing an 'up' function`);
    }

    logger.info(`Running migration: ${file}`);

    try {
      // Run migration within a transaction where possible
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        await migration.up(conn);
        await conn.execute(
          `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES (?)`,
          [file]
        );
        await conn.commit();
        logger.info(`✓ Migration applied: ${file}`);
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    } catch (error) {
      logger.error(`✗ Migration failed: ${file}`, { error: error.message });
      throw error;
    }
  }

  logger.info('All migrations applied successfully');
}

/**
 * Show migration status.
 */
async function showStatus() {
  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();
  const files = getMigrationFiles();

  console.log('\n  Migration Status\n  ================\n');
  for (const file of files) {
    const status = applied.includes(file) ? '✓' : '○';
    console.log(`  ${status} ${file}`);
  }
  console.log(`\n  Total: ${files.length} | Applied: ${applied.length} | Pending: ${files.length - applied.length}\n`);
}

// CLI entry point
if (require.main === module) {
  const isStatus = process.argv.includes('--status');

  (async () => {
    try {
      if (isStatus) {
        await showStatus();
      } else {
        await runMigrations();
      }
    } catch (error) {
      console.error('Migration error:', error.message);
      process.exit(1);
    } finally {
      await db.closePool();
    }
  })();
}

module.exports = { runMigrations, showStatus };
