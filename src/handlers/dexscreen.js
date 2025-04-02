const axios = require('axios');

class DexScreen {
    constructor() {
        this.baseUrl = 'https://api.dexscreener.com/latest/dex/tokens';
    }

    async getPriceData(ca) {
        try {
            const response = await axios.get(`${this.baseUrl}/${ca}`);
            const data = response.data;
            return {
                priceUsd: data.priceUsd,
                marketCap: data.marketCap,
                volume: data.volume,
                athPrice: data.athPrice
            };
        } catch (error) {
            console.error('Error fetching price data:', error);
            throw error;
        }
    }
}

module.exports = DexScreen;