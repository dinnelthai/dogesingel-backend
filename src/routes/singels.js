const express = require('express');
const router = express.Router();
const Singel = require('../models/singel');
const config = require('../config/config');

// 获取所有Singel记录
router.get('/', async (req, res) => {
    try {
        const singels = await Singel.findAll();
        res.json(singels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 根据ID获取单个Singel记录
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const singel = await Singel.findById(id);
        
        if (!singel) {
            return res.status(404).json({ error: 'Singel not found' });
        }
        
        res.json(singel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建新的Singel记录
router.post('/', async (req, res) => {
    try {
        const { 
            name, 
            ca, 
            currentPrice, 
            aiSignalType, 
            aiSignalPrice, 
            aiSignalMarketCap, 
            bctpVolumeBuy, 
            bctpVolumeHold, 
            isInnerPlate, 
            resonanceTimesWhenAibuy, 
            isDead 
        } = req.body;
        
        // 只检查必要的字段
        if (!name || !ca) {
            return res.status(400).json({ error: 'Missing required fields: name and ca are required' });
        }
        
        const newSingel = {
            name,
            ca,
            currentPrice,
            aiSignalType,
            aiSignalPrice,
            aiSignalMarketCap,
            bctpVolumeBuy,
            bctpVolumeHold,
            isInnerPlate,
            resonanceTimesWhenAibuy,
            isDead
        };
        
        const created = await Singel.create(newSingel);
        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新Singel记录
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { 
            name, 
            ca, 
            currentPrice, 
            aiSignalType, 
            aiSignalPrice, 
            aiSignalMarketCap, 
            bctpVolumeBuy, 
            bctpVolumeHold, 
            isInnerPlate, 
            resonanceTimesWhenAibuy, 
            isDead 
        } = req.body;
        
        // 检查记录是否存在
        const existingSingel = await Singel.findById(id);
        if (!existingSingel) {
            return res.status(404).json({ error: 'Singel not found' });
        }
        
        // 准备更新数据
        const updateData = {};
        
        // 只更新提供的字段
        if (name !== undefined) updateData.name = name;
        if (ca !== undefined) updateData.ca = ca;
        if (currentPrice !== undefined) updateData.currentPrice = currentPrice;
        if (aiSignalType !== undefined) updateData.aiSignalType = aiSignalType;
        if (aiSignalPrice !== undefined) updateData.aiSignalPrice = aiSignalPrice;
        if (aiSignalMarketCap !== undefined) updateData.aiSignalMarketCap = aiSignalMarketCap;
        if (bctpVolumeBuy !== undefined) updateData.bctpVolumeBuy = bctpVolumeBuy;
        if (bctpVolumeHold !== undefined) updateData.bctpVolumeHold = bctpVolumeHold;
        if (isInnerPlate !== undefined) updateData.isInnerPlate = isInnerPlate;
        if (resonanceTimesWhenAibuy !== undefined) updateData.resonanceTimesWhenAibuy = resonanceTimesWhenAibuy;
        if (isDead !== undefined) updateData.isDead = isDead;
        
        // 如果更新了bctpVolumeBuy或bctpVolumeHold，需要重新计算bctpStatus
        if (updateData.bctpVolumeBuy !== undefined || updateData.bctpVolumeHold !== undefined) {
            // 使用当前值或更新值
            const volumeBuy = updateData.bctpVolumeBuy !== undefined ? updateData.bctpVolumeBuy : existingSingel.bctpVolumeBuy;
            const volumeHold = updateData.bctpVolumeHold !== undefined ? updateData.bctpVolumeHold : existingSingel.bctpVolumeHold;
            
            // 计算新的bctpStatus
            if (volumeBuy && volumeBuy > 0) {
                const holdRatio = (volumeHold / volumeBuy) * 100;
                updateData.bctpStatus = holdRatio.toFixed(2);
            } else {
                updateData.bctpStatus = '0';
            }
        }
        
        // 更新时间戳
        updateData.updatedAt = new Date();
        
        // 执行更新
        const updated = await Singel.update(id, updateData);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 删除Singel记录
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // 检查记录是否存在
        const existingSingel = await Singel.findById(id);
        if (!existingSingel) {
            return res.status(404).json({ error: 'Singel not found' });
        }
        
        // 执行删除
        await Singel.delete(id);
        res.status(204).send(); // 204 No Content 表示成功但没有返回内容
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 根据合约地址(ca)查找Singel记录
router.get('/ca/:ca', async (req, res) => {
    try {
        const ca = req.params.ca;
        const singel = await Singel.findByCA(ca);
        
        if (!singel) {
            return res.status(404).json({ error: 'Singel not found' });
        }
        
        res.json(singel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;