const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongodb = require('./database/mongodb');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api/singels', require('./routes/singels'));

// 初始化数据库并启动服务器
async function startServer() {
    try {
        // 初始化MongoDB连接
        await mongodb.connect();
        
        // 启动服务器
        app.listen(port, () => {
            console.log(`MongoDB连接成功`);
            console.log(`服务器运行在 http://localhost:${port}`);
        });
    } catch (error) {
        console.error('启动服务器时出错:', error);
        console.log('将使用内存存储模式启动服务器');
        
        // 即使数据库连接失败，也启动服务器，使用内存存储
        app.listen(port, () => {
            console.log(`服务器运行在 http://localhost:${port}`);
        });
    }
}

// 启动服务器
startServer();

// 处理应用程序退出时关闭数据库连接
process.on('SIGINT', async () => {
    console.log('\n正在关闭MongoDB连接...');
    await mongodb.close();
    console.log('应用程序已安全退出');
    process.exit(0);
});