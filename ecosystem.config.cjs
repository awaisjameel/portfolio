const path = require('node:path')

const appName = process.env.PM2_APP_NAME || 'portfolio'
const nitroHost = process.env.NITRO_HOST || '127.0.0.1'
const nitroPort = process.env.NITRO_PORT || '3001'
const logDir = process.env.PORTFOLIO_LOG_DIR

const logFiles = logDir
  ? {
      output: path.join(logDir, `${appName}-out.log`),
      error: path.join(logDir, `${appName}-error.log`)
    }
  : {}

module.exports = {
  apps: [
    {
      name: appName,
      cwd: __dirname,
      script: './.output/server/index.mjs',
      interpreter: 'node',
      node_args: ['--no-experimental-webstorage'],
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      autorestart: true,
      min_uptime: '10s',
      restart_delay: 5000,
      kill_timeout: 10000,
      max_memory_restart: process.env.PM2_MAX_MEMORY_RESTART || '400M',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      source_map_support: false,
      ...logFiles,
      env: {
        NODE_ENV: 'production',
        NITRO_HOST: nitroHost,
        HOST: nitroHost,
        NITRO_PORT: nitroPort,
        PORT: nitroPort
      }
    }
  ]
}
