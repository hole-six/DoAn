module.exports = {
  apps: [
    {
      name: 'itjob-backend',
      cwd: __dirname,
      script: 'backend/dist/maychu.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'itjob-webhook',
      cwd: __dirname,
      script: 'deploy/webhook-server.cjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
