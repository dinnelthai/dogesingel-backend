const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');

describe('Telegram Bot', () => {
    let bot;

    beforeEach(() => {
        // 创建Telegram Bot实例
        bot = new TelegramBot(config.telegram.token, { polling: false });
    });

    test('should send message to chat', async () => {
        try {
            const testMessage = '0x661af369690a8f5591cc0df7d581c83d1a6e4444';
            const chatId = config.telegram.chatId;

            console.log('Sending message to chat:', chatId);
            console.log('Message:', testMessage);

            // 发送消息
            const result = await bot.sendMessage(chatId, testMessage, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });

            console.log('Message sent successfully:', result);
            expect(result).toBeDefined();
            expect(result.message_id).toBeDefined();
            expect(result.chat.id).toBe(chatId);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    });
});