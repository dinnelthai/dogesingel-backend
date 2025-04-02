const { MongoClient } = require('mongodb');
const config = require('../config/config');

class MongoDB {
    constructor() {
        this.client = null;
        this.db = null;
    }

    async connect() {
        if (this.db) {
            return this.db;
        }

        try {
            console.log('正在连接到MongoDB...');
            this.client = new MongoClient(config.mongodb.uri, config.mongodb.options);
            await this.client.connect();
            this.db = this.client.db(config.mongodb.dbName);
            console.log('成功连接到MongoDB');
            return this.db;
        } catch (error) {
            console.error('连接MongoDB失败:', error);
            throw error;
        }
    }

    async getCollection(collectionName) {
        const db = await this.connect();
        return db.collection(collectionName);
    }

    async close() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            console.log('MongoDB连接已关闭');
        }
    }
}

// 创建单例实例
const mongodb = new MongoDB();

// 确保应用退出时关闭连接
process.on('SIGINT', async () => {
    await mongodb.close();
    process.exit(0);
});

module.exports = mongodb;
