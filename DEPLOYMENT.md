# DogeSingel 生产环境部署指南

本文档提供了将 DogeSingel 应用部署到生产环境的详细步骤，包括 Windows 和 Linux 环境。

## 目录

1. [准备工作](#准备工作)
2. [安装依赖](#安装依赖)
3. [配置环境变量](#配置环境变量)
4. [数据库设置](#数据库设置)
5. [使用PM2部署](#使用pm2部署)
6. [配置反向代理](#配置反向代理)
7. [设置SSL](#设置ssl)
8. [监控和日志](#监控和日志)
9. [自动化部署](#自动化部署)
10. [故障排除](#故障排除)

## 准备工作

### 系统要求

- Node.js 16.x 或更高版本
- MongoDB 5.x 或更高版本
- 反向代理 (Nginx 或 IIS 或 Apache)
- PM2 (用于进程管理)

### Windows 服务器准备

1. 安装 Node.js：

   - 从 [Node.js 官网](https://nodejs.org/) 下载并安装 LTS 版本
   - 或使用 [Chocolatey](https://chocolatey.org/) 包管理器安装：

   ```powershell
   choco install nodejs-lts
   ```

2. 验证安装：

   ```powershell
   node -v
   npm -v
   ```

### Linux (Ubuntu) 服务器准备

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

### Windows 和 Linux 通用步骤

1. 克隆代码库：

   ```bash
   git clone https://github.com/dinnelthai/dogesingel-backend.git dogesingel
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

### Windows 环境

1. 创建环境变量文件：

   ```powershell
   copy .env.example .env
   ```

2. 使用文本编辑器编辑 .env 文件，设置生产环境变量。

### Linux 环境

1. 创建环境变量文件：

   ```bash
   cp .env.example .env
   nano .env  # 或使用任何文本编辑器
   ```

### 环境变量设置（两种环境通用）

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

### Windows 上安装 MongoDB

1. 从 [MongoDB 官网](https://www.mongodb.com/try/download/community) 下载 MongoDB Community Server。

2. 运行安装程序，选择“完整”安装。

3. 安装过程中，可以选择将 MongoDB 安装为服务，并设置自动启动。

4. 安装完成后，可以使用 MongoDB Compass （随安装程序一起安装）来管理数据库。

5. 验证 MongoDB 服务是否运行：

   ```powershell
   # 检查 MongoDB 服务状态
   sc query MongoDB
   ```

### Linux 上安装 MongoDB

1. 导入 MongoDB 公钥：

   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   ```

2. 创建 MongoDB 源列表文件：

   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   ```

3. 更新包列表并安装 MongoDB：

   ```bash
   sudo apt update
   sudo apt install -y mongodb-org
   ```

4. 启动 MongoDB 服务：

   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. 验证 MongoDB 服务状态：

   ```bash
   sudo systemctl status mongod
   ```

### 创建数据库和用户（两种环境通用）

1. 连接到 MongoDB：

   Windows：
   ```powershell
   "C:\Program Files\MongoDB\Server\5.0\bin\mongo.exe"
   ```

   Linux：
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

3. 更新 .env 文件中的 MongoDB URI：

   ```
   MONGODB_URI=mongodb://dogesingel_user:your_secure_password@localhost:27017/dogesingel
   ```

## 使用 PM2 部署

### Windows 环境

1. 启动应用：

   ```powershell
   pm2 start ecosystem.config.js --env production
   ```

2. 保存 PM2 进程列表：

   ```powershell
   pm2 save
   ```

3. 设置 PM2 开机自启（需要管理员权限）：

   ```powershell
   # 以管理员身份运行 PowerShell
   pm2 startup
   # 执行命令输出的脚本
   ```

### Linux 环境

1. 启动应用：

   ```bash
   pm2 start ecosystem.config.js --env production
   ```

2. 保存 PM2 进程列表：

   ```bash
   pm2 save
   ```

3. 设置 PM2 开机自启：

   ```bash
   pm2 startup
   # 执行命令输出的脚本
   ```

## 配置反向代理

### Windows 环境下使用 IIS 配置反向代理

1. 安装 IIS：

   - 打开控制面板 > 程序和功能 > 启用或关闭 Windows 功能
   - 选择 "Internet Information Services" 并安装

2. 安装 URL Rewrite 模块：

   - 从 [Microsoft 官网](https://www.iis.net/downloads/microsoft/url-rewrite) 下载并安装 URL Rewrite 模块

3. 安装 Application Request Routing (ARR)：

   - 从 [Microsoft 官网](https://www.iis.net/downloads/microsoft/application-request-routing) 下载并安装 ARR

4. 配置反向代理：

   - 打开 IIS 管理器
   - 选择服务器节点，双击 "Application Request Routing Cache"
   - 点击右侧的 "Server Proxy Settings"
   - 勾选 "Enable proxy" 并保存
   - 创建新的站点或使用默认站点
   - 选择站点，双击 "URL Rewrite"
   - 点击右侧的 "Add Rule(s)..."，选择 "Reverse Proxy"
   - 在 "Enter the server name or IP address..." 字段中输入 "localhost:3000"
   - 点击 "OK" 完成配置

### Linux 环境下使用 Nginx 配置反向代理

1. 安装 Nginx：

   ```bash
   sudo apt install -y nginx
   ```

2. 创建 Nginx 配置文件：

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

## 设置 SSL

### Windows 环境下使用 IIS 配置 SSL

1. 获取 SSL 证书：

   - 从证书颁发机构获取证书（如 Let's Encrypt、DigiCert 等）
   - 或者使用 [win-acme](https://github.com/win-acme/win-acme) 工具自动获取 Let's Encrypt 证书

2. 安装证书：

   - 打开 IIS 管理器
   - 选择服务器节点，双击 "Server Certificates"
   - 点击右侧的 "Import..."，导入您的 SSL 证书

3. 配置 HTTPS 绑定：

   - 选择您的站点
   - 点击右侧的 "Bindings..."
   - 点击 "Add..."，选择类型为 "https"
   - 选择您的 SSL 证书
   - 点击 "OK" 完成配置

4. 配置 HTTP 到 HTTPS 的重定向：

   - 选择站点，双击 "URL Rewrite"
   - 点击右侧的 "Add Rule(s)..."
   - 选择 "Blank rule"
   - 设置以下参数：
     - Name: HTTP to HTTPS Redirect
     - Pattern: (.*)
     - Conditions: {HTTP_HOST} matches pattern your_domain.com AND {HTTPS} matches pattern OFF
     - Action: Redirect to https://{HTTP_HOST}{REQUEST_URI} (Permanent)
   - 点击 "Apply" 完成配置

### Linux 环境下使用 Certbot 配置 SSL

1. 安装 Certbot：

   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. 获取 SSL 证书：

   ```bash
   sudo certbot --nginx -d your_domain.com
   ```

3. 按照提示完成 SSL 配置。

4. 设置自动续期：

   ```bash
   sudo systemctl status certbot.timer
   ```

## 监控和日志

### 查看应用日志（Windows 和 Linux 通用）

```bash
pm2 logs dogesingel
```

### 监控应用性能（Windows 和 Linux 通用）

```bash
pm2 monit
```

### 设置日志轮转（Windows 和 Linux 通用）

安装和配置 PM2 日志轮转插件：

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 自动化部署

### Windows 环境创建部署脚本

创建 `deploy.bat` 文件：

```batch
@echo off
echo Deploying DogeSingel...

:: 拉取最新代码
git pull

:: 安装依赖
call npm install --production

:: 重启应用
call pm2 restart dogesingel

echo Deployment completed!
```

### Linux 环境创建部署脚本

创建 `deploy.sh` 文件：

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

### 使用 GitHub Actions 自动部署

#### 部署到 Windows 服务器

1. 在项目中创建 `.github/workflows/deploy-windows.yml` 文件：

```yaml
name: Deploy to Windows

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to Windows Server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.WIN_HOST }}
        username: ${{ secrets.WIN_USERNAME }}
        password: ${{ secrets.WIN_PASSWORD }}
        script: |
          cd C:\path\to\dogesingel
          .\deploy.bat
```

2. 在 GitHub 仓库设置中添加以下 Secrets：
   - WIN_HOST: Windows 服务器 IP 地址
   - WIN_USERNAME: 登录用户名
   - WIN_PASSWORD: 登录密码

#### 部署到 Linux 服务器

1. 在项目中创建 `.github/workflows/deploy-linux.yml` 文件：

```yaml
name: Deploy to Linux

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
        host: ${{ secrets.LINUX_HOST }}
        username: ${{ secrets.LINUX_USERNAME }}
        key: ${{ secrets.LINUX_SSH_KEY }}
        script: |
          cd /path/to/dogesingel
          ./deploy.sh
```

2. 在 GitHub 仓库设置中添加以下 Secrets：
   - LINUX_HOST: 服务器 IP 地址
   - LINUX_USERNAME: SSH 用户名
   - LINUX_SSH_KEY: SSH 私钥

## 故障排除

### Windows 环境故障排除

#### 应用无法启动

1. 检查日志：

   ```powershell
   pm2 logs dogesingel
   ```

2. 检查环境变量：

   ```powershell
   type .env
   ```

3. 检查 MongoDB 连接：

   ```powershell
   "C:\Program Files\MongoDB\Server\5.0\bin\mongo.exe" mongodb://localhost:27017/dogesingel
   ```

#### IIS 配置问题

1. 检查 IIS 日志：
   - 打开 IIS 管理器
   - 选择站点，双击“日志”图标
   - 查看最近的错误日志

2. 检查 URL Rewrite 配置：
   - 打开 IIS 管理器
   - 选择站点，双击 "URL Rewrite"
   - 确认规则配置正确

#### PM2 问题

1. 重启 PM2：

   ```powershell
   pm2 restart all
   ```

2. 重新加载 PM2：

   ```powershell
   pm2 reload all
   ```

3. 查看 PM2 状态：

   ```powershell
   pm2 status
   ```

### Linux 环境故障排除

#### 应用无法启动

1. 检查日志：

   ```bash
   pm2 logs dogesingel
   ```

2. 检查环境变量：

   ```bash
   cat .env
   ```

3. 检查 MongoDB 连接：

   ```bash
   mongo mongodb://localhost:27017/dogesingel
   ```

#### Nginx 配置问题

1. 检查 Nginx 配置：

   ```bash
   sudo nginx -t
   ```

2. 检查 Nginx 日志：

   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

#### PM2 问题

1. 重启 PM2：

   ```bash
   pm2 restart all
   ```

2. 重新加载 PM2：

   ```bash
   pm2 reload all
   ```

3. 查看 PM2 状态：

   ```bash
   pm2 status
   ```

---

如有任何问题，请联系项目维护者。
