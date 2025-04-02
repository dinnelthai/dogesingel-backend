/**
 * 信号过滤类
 * 用于处理singels消息，如果过滤成功则通过Telegram转发
 */
const config = require('../config/config');
const Filter = require('../models/filter');

class SignalFilter {
    constructor(telegramBot) {
        this.telegramBot = telegramBot;
        this.initialize();
    }

    /**
     * 初始化过滤器
     */
    async initialize() {
        console.log('信号过滤器初始化...');
        // 不需要手动初始化过滤器，现在使用Filter模型从数据库获取
    }

    /**
     * 处理singel信号
     * @param {Object} singel Singel对象
     * @returns {boolean} 是否通过过滤器
     */
    async processSingel(singel) {
        try {
            // 从数据库获取启用的过滤器
            const enabledFilters = await Filter.getEnabledFilters();
            
            if (enabledFilters.length === 0) {
                console.log('没有启用的过滤器，跳过处理');
                return false;
            }
            
            // 应用过滤器并获取通过的过滤器
            const passedFilters = enabledFilters.filter(filter => {
                return Filter.applyFilter(filter, singel);
            });
            
            if (passedFilters.length > 0) {
                // 通过了至少一个过滤器，发送Telegram消息
                await this.sendTelegramNotification(singel, passedFilters);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('处理信号时出错:', error);
            return false;
        }
    }

    /**
     * 发送Telegram通知
     * @param {Object} singel Singel对象
     * @param {Array} passedFilters 通过的过滤器列表
     */
    async sendTelegramNotification(singel, passedFilters) {
        if (!this.telegramBot) {
            console.log('Telegram bot not initialized, skipping notification');
            return;
        }

        try {
            const filterNames = passedFilters.map(f => f.name).join(', ');
            
            // 构建消息文本
            let message = `🔔 *新信号通知* 🔔\n\n`;
            message += `*代币名称*: ${singel.name}\n`;
            message += `*合约地址*: \`${singel.ca}\`\n\n`;
            message += `*当前价格*: $${singel.currentPrice}\n`;
            message += `*AI信号价格*: $${singel.aiSignalPrice}\n`;
            
            // 计算价格变化百分比
            let priceChange = 'N/A';
            if (singel.aiSignalPrice > 0 && singel.currentPrice > 0) {
                priceChange = ((singel.currentPrice / singel.aiSignalPrice - 1) * 100).toFixed(2) + '%';
            }
            message += `*价格变化*: ${priceChange}\n\n`;
            
            message += `*蓝筹持仓比例*: ${singel.bctpStatus}%\n`;
            message += `*共振次数*: ${singel.resonanceTimesWhenAibuy}\n`;
            message += `*是否内盘*: ${singel.isInnerPlate ? '是' : '否'}\n\n`;
            message += `*通过过滤器*: ${filterNames}\n`;
            
            // 发送消息到配置的频道
            if (config.telegram && config.telegram.channelId) {
                await this.telegramBot.sendMessage(
                    config.telegram.channelId, 
                    message, 
                    { parse_mode: 'Markdown' }
                );
                console.log(`已发送信号通知到Telegram频道: ${config.telegram.channelId}`);
            }
        } catch (error) {
            console.error('发送Telegram通知时出错:', error);
        }
    }
}

module.exports = SignalFilter;
