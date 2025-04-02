const express = require('express');
const router = express.Router();
const Singel = require('../models/singel');
const TgBotHandler = require('../handlers/tgBotHandler');
const config = require('../config/config');

const tgBotHandler = new TgBotHandler(config.telegram.token, config.telegram.chatId);

// 定时检查新信号
let lastProcessedTime = null;

async function checkForNewSignals() {
    try {
        const singels = await Singel.findAll();
        for (const singel of singels) {
            if (!lastProcessedTime || singel.time > lastProcessedTime) {
                lastProcessedTime = singel.time;
                await tgBotHandler.sendSingelNotification(singel);
            }
        }
    } catch (error) {
        console.error('Error checking for new signals:', error);
    }
}

// 每5分钟检查一次新信号
setInterval(checkForNewSignals, 5 * 60 * 1000);

// API路由保持不变
router.get('/', async (req, res) => {
    try {
        const singels = await Singel.findAll();
        res.json(singels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, time, ca, resonanceTimesWhenAibuy, bctpVolumeBuy, bctpVolumeSell, bctpVolumeHold, bctpHoldRatio } = req.body;
        if (!name || !time || !ca || !resonanceTimesWhenAibuy || !bctpVolumeBuy || !bctpVolumeSell || !bctpVolumeHold || !bctpHoldRatio) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const newSingel = {
            name,
            time,
            ca,
            resonanceTimesWhenAibuy,
            bctpVolumeBuy,
            bctpVolumeSell,
            bctpVolumeHold,
            bctpHoldRatio
        };
        
        const created = await Singel.create(newSingel);
        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;