const Storage = require('../database/storage');
const PriceHandler = require('../handlers/priceHandler');
const config = require('../config/config');

class Singel {
    constructor(name, time, ca, resonanceTimesWhenAibuy, bctpVolumeBuy, bctpVolumeSell, bctpVolumeHold, bctpHoldRatio) {
        this.name = name;
        this.time = time;
        this.ca = ca;
        this.resonanceTimesWhenAibuy = resonanceTimesWhenAibuy; // ai buy 信号产生的共振次数
        this.bctpVolumeBuy = bctpVolumeBuy; // ai buy 信号产生的时候蓝筹头部买入量
        this.bctpVolumeSell = bctpVolumeSell; // ai buy 信号产生的时候蓝筹头部卖出量
        this.bctpVolumeHold = bctpVolumeHold; // ai buy 信号产生的时候蓝筹头部持仓量
        this.bctpHoldRatio = bctpHoldRatio; // 蓝筹头部持仓占比
        this.createdAt = new Date();
    }

    static async initialize() {
        Singel.storage = new Storage('singels');
        Singel.priceHandler = new PriceHandler();
    }

    async updatePriceData() {
        try {
            const marketData = await Singel.priceHandler.getMarketData(this.ca);
            this.price = marketData.usd;
            this.mc = marketData.mc;
            this.vol = marketData.vol;
            this.ath = marketData.ath;
            return true;
        } catch (error) {
            console.error('Error updating price data:', error);
            return false;
        }
    }

    static async create(singelData) {
        const singel = new Singel(
            singelData.name,
            singelData.time,
            singelData.ca,
            singelData.resonanceTimesWhenAibuy,
            singelData.bctpVolumeBuy,
            singelData.bctpVolumeSell,
            singelData.bctpVolumeHold,
            singelData.bctpHoldRatio
        );
        
        // 更新价格数据
        await singel.updatePriceData();
        
        return await Singel.storage.add(singel);
    }

    // ... 其他方法保持不变 ...
}

// 初始化存储
Singel.initialize();

module.exports = Singel;