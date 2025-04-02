# DogeSingel 生产环境部署指南

本文档提供了将 DogeSingel 应用部署到生产环境的详细步骤。

## 目录

1. [准备工作](#准备工作)
2. [安装依赖](#安装依赖)
3. [配置环境变量](#配置环境变量)
4. [数据库设置](#数据库设置)
5. [使用PM2部署](#使用pm2部署)
6. [配置Nginx](#配置nginx)
7. [设置SSL](#设置ssl)
8. [监控和日志](#监控和日志)
9. [自动化部署](#自动化部署)
10. [故障排除](#故障排除)

## 准备工作

### 系统要求

- Node.js 16.x 或更高版本
- MongoDB 5.x 或更高版本
- Nginx (用于反向代理)
- PM2 (用于进程管理)

### 服务器准备

1. 更新系统包：

```bash
sudo apt update
sudo apt upgrade -y
```

2. 安装Node.js和npm：

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

3. 验证安装：

```bash
node -v
npm -v
```

## 安装依赖

1. 克隆代码库：

```bash
git clone <repository-url> dogesingel
cd dogesingel
```

2. 安装项目依赖：

```bash
npm install --production
```

3. 安装PM2：

```bash
npm install -g pm2
```

## 配置环境变量

1. 创建环境变量文件：

```bash
cp .env.example .env
```

2. 编辑.env文件，设置生产环境变量：

```bash
nano .env
```

确保设置以下变量：

```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=dogesingel
TELEGRAM_TOKEN=your_telegram_bot_token
TELEGRAM_CHANNEL_ID=your_telegram_channel_id
```

## 数据库设置

### 安装MongoDB

1. 导入MongoDB公钥：

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
```

2. 创建MongoDB源列表文件：

```bash
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
```

3. 更新包列表并安装MongoDB：

```bash
sudo apt update
sudo apt install -y mongodb-org
```

4. 启动MongoDB服务：

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

5. 验证MongoDB服务状态：

```bash
sudo systemctl status mongod
```

### 创建数据库和用户

1. 连接到MongoDB：

```bash
mongo
```

2. 创建数据库和用户：

```javascript
use dogesingel
db.createUser({
  user: "dogesingel_user",
  pwd: "your_secure_password",
  roles: [{ role: "readWrite", db: "dogesingel" }]
})
```

3. 更新.env文件中的MongoDB URI：

```
MONGODB_URI=mongodb://dogesingel_user:your_secure_password@localhost:27017/dogesingel
```

## 使用PM2部署

1. 启动应用：

```bash
pm2 start ecosystem.config.js --env production
```

2. 保存PM2进程列表：

```bash
pm2 save
```

3. 设置PM2开机自启：

```bash
pm2 startup
```

然后运行PM2提供的命令。

## 配置Nginx

1. 安装Nginx：

```bash
sudo apt install -y nginx
```

2. 创建Nginx配置文件：

```bash
sudo nano /etc/nginx/sites-available/dogesingel
```

3. 添加以下配置：

```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

4. 启用站点配置：

```bash
sudo ln -s /etc/nginx/sites-available/dogesingel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 设置SSL

1. 安装Certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
```

2. 获取SSL证书：

```bash
sudo certbot --nginx -d your_domain.com
```

3. 按照提示完成SSL配置。

4. 设置自动续期：

```bash
sudo systemctl status certbot.timer
```

## 监控和日志

### 查看应用日志

```bash
pm2 logs dogesingel
```

### 监控应用性能

```bash
pm2 monit
```

### 设置日志轮转

创建PM2日志轮转配置：

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 自动化部署

### 创建部署脚本

创建`deploy.sh`文件：

```bash
#!/bin/bash

# 拉取最新代码
git pull

# 安装依赖
npm install --production

# 重启应用
pm2 restart dogesingel
```

赋予执行权限：

```bash
chmod +x deploy.sh
```

### 使用GitHub Actions自动部署

1. 在项目中创建`.github/workflows/deploy.yml`文件：

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/dogesingel
          ./deploy.sh
```

2. 在GitHub仓库设置中添加以下Secrets：
   - HOST: 服务器IP地址
   - USERNAME: SSH用户名
   - SSH_KEY: SSH私钥

## 故障排除

### 应用无法启动

1. 检查日志：

```bash
pm2 logs dogesingel
```

2. 检查环境变量：

```bash
cat .env
```

3. 检查MongoDB连接：

```bash
mongo mongodb://localhost:27017/dogesingel
```

### Nginx配置问题

1. 检查Nginx配置：

```bash
sudo nginx -t
```

2. 检查Nginx日志：

```bash
sudo tail -f /var/log/nginx/error.log
```

### PM2问题

1. 重启PM2：

```bash
pm2 restart all
```

2. 重新加载PM2：

```bash
pm2 reload all
```

3. 查看PM2状态：

```bash
pm2 status
```

---

如有任何问题，请联系项目维护者。
