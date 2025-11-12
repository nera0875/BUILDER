module.exports = {
  apps: [{
    name: 'builder-frontend',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/home/pilote/projet/primaire/BUILDER/frontend',
    instances: 7,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 9000
    },
    error_file: '~/.pm2/logs/builder-frontend-error.log',
    out_file: '~/.pm2/logs/builder-frontend-out.log',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    kill_timeout: 5000
  }]
}
