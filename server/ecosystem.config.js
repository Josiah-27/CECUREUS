/**
 * CECUREUS — PM2 Ecosystem Configuration
 *
 * Production process management:
 * - Cluster mode to utilize all CPU cores
 * - Auto-restart on crash
 * - Log rotation
 * - Graceful shutdown
 */

module.exports = {
  apps: [
    {
      name: 'cecureus-api',
      script: 'src/index.js',
      cwd: __dirname,

      // Cluster mode — one process per CPU core
      instances: 'max',
      exec_mode: 'cluster',

      // Environment
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },

      // Auto-restart
      max_restarts: 10,
      min_uptime: '5s',
      restart_delay: 1000,

      // Graceful shutdown
      kill_timeout: 30000,
      listen_timeout: 10000,
      shutdown_with_message: true,

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      log_type: 'json',

      // Memory limit — restart if exceeded
      max_memory_restart: '500M',

      // Watch (development only)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'tests'],
    },
  ],
};
