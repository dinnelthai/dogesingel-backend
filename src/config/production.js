/**
 * 生产环境配置
 */
module.exports = {
    telegram: {
        token: process.env.TELEGRAM_TOKEN || '',
        channelId: process.env.TELEGRAM_CHANNEL_ID || ''
    },
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        dbName: process.env.MONGODB_DB_NAME || 'dogesingel',
        options: {
            connectTimeoutMS: 30000,
            maxPoolSize: 50
        }
    },
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || '0.0.0.0'
    }
};
