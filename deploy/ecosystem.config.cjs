module.exports = {
  apps: [
    {
      name: 'win-predict-ai-admin',
      cwd: '/var/www/win-predict-ai-admin',
      script: '.output/server/index.mjs',
      interpreter_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: 3000,
      },
    },
  ],
}
