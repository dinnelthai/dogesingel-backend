/**
 * 过滤条件路由
 */
const express = require('express');
const router = express.Router();
const Filter = require('../models/filter');

// 获取所有过滤条件
router.get('/', async (req, res) => {
    try {
        const filters = await Filter.findAll();
        res.json(filters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取启用的过滤条件
router.get('/enabled', async (req, res) => {
    try {
        const filters = await Filter.getEnabledFilters();
        res.json(filters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 根据ID获取单个过滤条件
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = await Filter.findById(id);
        
        if (!filter) {
            return res.status(404).json({ error: 'Filter not found' });
        }
        
        res.json(filter);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 根据类型获取过滤条件
router.get('/type/:type', async (req, res) => {
    try {
        const type = req.params.type;
        const filters = await Filter.findByType(type);
        res.json(filters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建新的过滤条件
router.post('/', async (req, res) => {
    try {
        const { name, description, type, value, enabled } = req.body;
        
        // 检查必要的字段
        if (!name || !type || value === undefined) {
            return res.status(400).json({ error: 'Missing required fields: name, type, and value are required' });
        }
        
        const newFilter = {
            name,
            description,
            type,
            value,
            enabled
        };
        
        const created = await Filter.create(newFilter);
        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新过滤条件
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description, type, value, enabled } = req.body;
        
        // 检查记录是否存在
        const existingFilter = await Filter.findById(id);
        if (!existingFilter) {
            return res.status(404).json({ error: 'Filter not found' });
        }
        
        // 准备更新数据
        const updateData = {};
        
        // 只更新提供的字段
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (value !== undefined) updateData.value = value;
        if (enabled !== undefined) updateData.enabled = enabled;
        
        // 更新时间戳
        updateData.updatedAt = new Date();
        
        // 执行更新
        const updated = await Filter.update(id, updateData);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 删除过滤条件
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // 检查记录是否存在
        const existingFilter = await Filter.findById(id);
        if (!existingFilter) {
            return res.status(404).json({ error: 'Filter not found' });
        }
        
        // 执行删除
        await Filter.delete(id);
        res.status(204).send(); // 204 No Content 表示成功但没有返回内容
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 启用过滤条件
router.patch('/:id/enable', async (req, res) => {
    try {
        const id = req.params.id;
        
        // 检查记录是否存在
        const existingFilter = await Filter.findById(id);
        if (!existingFilter) {
            return res.status(404).json({ error: 'Filter not found' });
        }
        
        // 更新启用状态
        const updated = await Filter.update(id, { enabled: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 禁用过滤条件
router.patch('/:id/disable', async (req, res) => {
    try {
        const id = req.params.id;
        
        // 检查记录是否存在
        const existingFilter = await Filter.findById(id);
        if (!existingFilter) {
            return res.status(404).json({ error: 'Filter not found' });
        }
        
        // 更新启用状态
        const updated = await Filter.update(id, { enabled: false });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
