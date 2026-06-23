module.exports = {
  apps: [
    {
      name: 'habitaclick-backend',
      script: 'src/index.js',
      cwd: 'C:\\Users\\34645\\inmobiliaria-saas\\backend',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
    },
    {
      name: 'habitaclick-frontend',
      script: 'node_modules\\react-scripts\\bin\\react-scripts.js',
      args: 'start',
      cwd: 'C:\\Users\\34645\\inmobiliaria-saas\\frontend',
      interpreter: 'node',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        PORT: 3000,
        BROWSER: 'none',
        CI: 'false',
      },
    },
  ],
};
