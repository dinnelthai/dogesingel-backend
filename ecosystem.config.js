/**
 * PM2配置文件
 * 用于生产环境部署
 */
module.exports = {
  apps: [{
    name: 'dogesingel',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
