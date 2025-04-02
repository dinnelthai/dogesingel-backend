const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');

class TgBotHandler {
    constructor(token, chatId) {
        this.token = token;
        this.chatId = chatId;
        this.bot = new TelegramBot(token, { polling: false });
        
        // 添加错误处理
        this.bot.on('error', (error) => {
            console.error('Telegram bot error:', error);
        });
    }

    async sendMessage(message) {
        try {
            console.log('Sending message:', message);
            console.log('this.chatId:', this.chatId);
            
            // 确保消息发送成功
            const result = await this.bot.sendMessage(this.chatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
            
            console.log('Message sent successfully:', result);
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }
}

module.exports = TgBotHandler;