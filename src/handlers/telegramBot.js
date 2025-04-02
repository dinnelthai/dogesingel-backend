/**
 * Telegram机器人处理类
 */
const config = require('../config/config');

class TelegramBot {
    constructor() {
        this.bot = null;
        this.initialized = false;
    }

    /**
     * 初始化Telegram机器人
     */
    async initialize() {
        try {
            // 检查是否配置了Telegram
            if (!config.telegram || !config.telegram.token) {
                console.log('Telegram配置不存在或token未设置，跳过初始化');
                return false;
            }

            // 动态导入node-telegram-bot-api，避免在不需要时加载
            const TelegramBotAPI = await import('node-telegram-bot-api');
            
            // 创建机器人实例
            this.bot = new TelegramBotAPI.default(config.telegram.token, { polling: false });
            this.initialized = true;
            console.log('Telegram机器人初始化成功');
            return true;
        } catch (error) {
            console.error('初始化Telegram机器人时出错:', error);
            return false;
        }
    }

    /**
     * 发送消息
     * @param {string|number} chatId 聊天ID
     * @param {string} text 消息文本
     * @param {Object} options 选项
     */
    async sendMessage(chatId, text, options = {}) {
        if (!this.initialized || !this.bot) {
            console.log('Telegram机器人未初始化，无法发送消息');
            return;
        }

        try {
            return await this.bot.sendMessage(chatId, text, options);
        } catch (error) {
            console.error('发送Telegram消息时出错:', error);
        }
    }
}

module.exports = TelegramBot;
