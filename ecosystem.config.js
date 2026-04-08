module.exports = {
  apps: [
    {
      name: 'aimstors-api',
      script: 'backend/dist/api-service/main.js',
      cwd: '/var/www/aimstors',
      env: {
        PORT: 3001,
      },
    },
    {
      name: 'aimstors-webhook',
      script: 'backend/dist/webhook-service/main.js',
      cwd: '/var/www/aimstors',
      env: {
        WEBHOOK_PORT: 3003,
      },
    },
    {
      name: 'aimstors-worker',
      script: 'backend/dist/worker-service/main.js',
      cwd: '/var/www/aimstors',
    },
    {
      name: 'aimstors-dashboard',
      script: 'frontend/app-dashboard/.next/standalone/server.js',
      cwd: '/var/www/aimstors',
      env: {
        PORT: 3000,
      },
    },
    {
      name: 'aimstors-admin',
      script: 'frontend/admin-panel/.next/standalone/server.js',
      cwd: '/var/www/aimstors',
      env: {
        PORT: 3002,
      },
    },
    {
      name: 'aimstors-reseller',
      script: 'frontend/reseller-panel/.next/standalone/server.js',
      cwd: '/var/www/aimstors',
      env: {
        PORT: 3004,
      },
    },
  ],
};
