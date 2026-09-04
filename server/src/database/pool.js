/**
 * CECUREUS — MySQL Connection Pool
 *
 * Production-grade connection pooling with:
 * - Configurable pool size and timeouts
 * - Health check queries
 * - Graceful shutdown
 * - Auto-reconnection
 * - Promise-based API (mysql2/promise)
 */

const mysql = require('mysql2/promise');
const config = require('../config');
const logger = require('../config/logger');

let pool = null;

/**
 * Create and return the MySQL connection pool.
 * Returns existing pool if already created (singleton).
 */
function getPool() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,

    // Pool configuration
    connectionLimit: config.db.pool.max,
    queueLimit: config.db.pool.max * 2, // Bounded queue
    waitForConnections: true,
    connectTimeout: config.db.connectTimeout,

    // Enable named placeholders for cleaner queries
    namedPlaceholders: true,

    // Timezone
    timezone: '+00:00',

    // Don't create connections until needed
    enableKeepAlive: true,
    keepAliveInitialDelay: 30000,

    // Charset
    charset: 'utf8mb4',
  });

  // Log pool events
  pool.on('connection', () => {
    logger.debug('New database connection established');
  });

  pool.on('release', () => {
    logger.debug('Database connection released');
  });

  pool.on('enqueue', () => {
    logger.warn('Database connection request queued — pool may be exhausted');
  });

  logger.info('Database pool created', {
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    poolMax: config.db.pool.max,
  });

  return pool;
}

/**
 * Execute a query with parameterized values.
 * Always use this — never build SQL strings manually.
 *
 * @param {string} sql - SQL query with ? placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<[rows, fields]>}
 */
async function query(sql, params = []) {
  const p = getPool();
  return p.execute(sql, params);
}

/**
 * Get a connection from the pool for transactions.
 * IMPORTANT: Always release the connection in a finally block.
 *
 * @returns {Promise<Connection>}
 */
async function getConnection() {
  const p = getPool();
  return p.getConnection();
}

/**
 * Execute a function within a database transaction.
 * Automatically commits on success, rolls back on error.
 *
 * @param {Function} fn - async function(connection) => result
 * @returns {Promise<any>}
 */
async function transaction(fn) {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Health check — verify database connectivity.
 * @returns {Promise<boolean>}
 */
async function healthCheck() {
  try {
    const [rows] = await query('SELECT 1 AS healthy');
    return rows[0]?.healthy === 1;
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    return false;
  }
}

/**
 * Gracefully close all pool connections.
 */
async function closePool() {
  if (pool) {
    logger.info('Closing database pool...');
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
}

module.exports = {
  getPool,
  query,
  getConnection,
  transaction,
  healthCheck,
  closePool,
};
