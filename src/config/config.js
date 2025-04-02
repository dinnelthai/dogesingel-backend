/**
 * 配置文件
 * 根据环境变量NODE_ENV加载不同的配置
 */

// 默认开发环境配置
const development = {
    telegram: {
        token: '8021465592:AAHkZME6IO0rkCZuWLnhNUkvIUc5-WjUkjk',
        channelId: '-4638234744'
    },
    mongodb: {
        uri: 'mongodb://localhost:27017',
        dbName: 'dogesingel',
        options: {
            connectTimeoutMS: 10000,
            maxPoolSize: 10
        }
    },
    server: {
        port: 3000,
        host: 'localhost'
    }
};

// 根据环境变量加载配置
const env = process.env.NODE_ENV || 'development';
let config;

try {
    // 尝试加载对应环境的配置文件
    config = require(`./${env}`);
    console.log(`已加载 ${env} 环境配置`);
} catch (error) {
    // 如果配置文件不存在，使用开发环境配置
    console.log(`未找到 ${env} 环境配置文件，使用开发环境配置`);
    config = development;
}

module.exports = config;