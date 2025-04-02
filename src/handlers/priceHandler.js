const DexScreen = require('./dexscreen');

class PriceHandler {
    constructor() {
        this.dexScreen = new DexScreen();
    }

    async getMarketData(ca) {
        try {
            const data = await this.dexScreen.getPriceData(ca);
            return {
                usd: parseFloat(data.priceUsd),
                mc: parseFloat(data.marketCap),
                vol: parseFloat(data.volume),
                ath: parseFloat(data.athPrice)
            };
        } catch (error) {
            console.error('Error getting market data:', error);
            throw error;
        }
    }

    async getMultipleMarketData(cas) {
        try {
            const results = {};
            for (const ca of cas) {
                const data = await this.getMarketData(ca);
                results[ca] = data;
            }
            return results;
        } catch (error) {
            console.error('Error getting multiple market data:', error);
            throw error;
        }
    }
}

module.exports = PriceHandler;