const Storage = require('../database/storage');
const PriceHandler = require('../handlers/priceHandler');
const SignalFilter = require('../handlers/signalFilter');
const TelegramBot = require('../handlers/telegramBot');
const config = require('../config/config');

class Singel {
    constructor(name, ca, currentPrice, aiSignalType, aiSignalPrice, aiSignalMarketCap, bctpVolumeBuy, bctpVolumeHold, isInnerPlate, resonanceTimesWhenAibuy, isDead) {
        this.name = name; // 名称
        this.ca = ca; // 合约地址
        this.currentPrice = currentPrice; // 当前价格
        this.aiSignalType = aiSignalType; // AI信号类型（买入或者卖出）
        this.aiSignalPrice = aiSignalPrice; // AI信号时价格
        this.aiSignalMarketCap = aiSignalMarketCap; // AI信号时市值
        this.bctpVolumeBuy = bctpVolumeBuy || 0; // AI信号时蓝筹买入量
        this.bctpVolumeHold = bctpVolumeHold || 0; // AI信号蓝筹持仓量
        this.isInnerPlate = isInnerPlate; // 是否内盘
        this.resonanceTimesWhenAibuy = resonanceTimesWhenAibuy; // AI买入时共振次数
        this.isDead = isDead; // 是否死亡
        this.createdAt = new Date(); // 创建时间
        this.updatedAt = new Date(); // 更新时间
        
        // 计算蓝筹状态（持仓量除以蓝筹买入量的百分比）
        this.calculateBctpStatus();
    }
    
    // 计算蓝筹状态（百分比）
    calculateBctpStatus() {
        if (this.bctpVolumeBuy && this.bctpVolumeBuy > 0) {
            // 计算持仓量除以买入量的百分比
            const holdRatio = (this.bctpVolumeHold / this.bctpVolumeBuy) * 100;
            this.bctpStatus = holdRatio.toFixed(2); // 保存两位小数的百分比值
        } else {
            this.bctpStatus = '0'; // 如果无法计算，设置为0
        }
    }

    static async initialize() {
        Singel.storage = new Storage('singels');
        Singel.priceHandler = new PriceHandler();
        
        // 初始化Telegram机器人
        Singel.telegramBot = new TelegramBot();
        await Singel.telegramBot.initialize();
        
        // 初始化信号过滤器
        Singel.signalFilter = new SignalFilter(Singel.telegramBot.bot);
    }

    async updatePriceData() {
        try {
            const marketData = await Singel.priceHandler.getMarketData(this.ca);
            this.currentPrice = marketData.usd;
            this.marketCap = marketData.mc;
            this.volume = marketData.vol;
            this.allTimeHigh = marketData.ath;
            this.updatedAt = new Date();
            return true;
        } catch (error) {
            console.error('Error updating price data:', error);
            return false;
        }
    }

    static async create(singelData) {
        const singel = new Singel(
            singelData.name,
            singelData.ca,
            singelData.currentPrice || 0,
            singelData.aiSignalType || 'buy',
            singelData.aiSignalPrice || 0,
            singelData.aiSignalMarketCap || 0,
            singelData.bctpVolumeBuy || 0,
            singelData.bctpVolumeHold || 0,
            singelData.isInnerPlate || false,
            singelData.resonanceTimesWhenAibuy || 0,
            singelData.isDead || false
        );
        
        // 更新价格数据
        await singel.updatePriceData();
        
        // 将新创建的singel添加到数据库
        const createdSingel = await Singel.storage.add(singel);
        
        // 如果信号过滤器已初始化，则处理信号
        if (Singel.signalFilter) {
            try {
                // 异步处理信号，不阻塞创建过程
                Singel.signalFilter.processSingel(createdSingel)
                    .then(passed => {
                        if (passed) {
                            console.log(`信号 ${createdSingel.name} 通过过滤器，已发送到Telegram`);
                        } else {
                            console.log(`信号 ${createdSingel.name} 未通过过滤器条件`);
                        }
                    })
                    .catch(error => {
                        console.error('处理信号时出错:', error);
                    });
            } catch (error) {
                console.error('处理信号时出错:', error);
            }
        }
        
        return createdSingel;
    }

    // 查找所有Singel记录
    static async findAll() {
        return await Singel.storage.getAll();
    }
    
    // 根据ID查找Singel记录
    static async findById(id) {
        return await Singel.storage.getById(id);
    }
    
    // 根据合约地址查找Singel记录
    static async findByCA(ca) {
        const allSingels = await Singel.storage.getAll();
        return allSingels.find(singel => singel.ca.toLowerCase() === ca.toLowerCase());
    }
    
    // 更新Singel记录
    static async update(id, updateData) {
        // 获取现有记录
        const existingSingel = await Singel.findById(id);
        if (!existingSingel) {
            throw new Error('Singel not found');
        }
        
        // 合并更新数据
        const updatedSingel = { ...existingSingel, ...updateData };
        
        // 如果更新了bctpVolumeBuy或bctpVolumeHold，需要重新计算bctpStatus
        if (updateData.bctpVolumeBuy !== undefined || updateData.bctpVolumeHold !== undefined) {
            // 创建一个临时Singel实例来计算bctpStatus
            const tempSingel = new Singel(
                updatedSingel.name,
                updatedSingel.ca,
                updatedSingel.currentPrice,
                updatedSingel.aiSignalType,
                updatedSingel.aiSignalPrice,
                updatedSingel.aiSignalMarketCap,
                updatedSingel.bctpVolumeBuy,
                updatedSingel.bctpVolumeHold,
                updatedSingel.isInnerPlate,
                updatedSingel.resonanceTimesWhenAibuy,
                updatedSingel.isDead
            );
            
            // 使用计算出的bctpStatus
            updatedSingel.bctpStatus = tempSingel.bctpStatus;
        }
        
        // 更新时间戳
        updatedSingel.updatedAt = new Date();
        
        // 保存到数据库
        return await Singel.storage.update(id, updatedSingel);
    }
    
    // 删除Singel记录
    static async delete(id) {
        return await Singel.storage.delete(id);
    }
}

// 初始化存储
Singel.initialize();

module.exports = Singel;