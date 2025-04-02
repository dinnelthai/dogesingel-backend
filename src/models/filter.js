/**
 * 过滤条件模型
 */
const Storage = require('../database/storage');

class Filter {
    constructor(name, description, type, value, enabled = true) {
        this.name = name;               // 过滤条件名称
        this.description = description; // 过滤条件描述
        this.type = type;               // 过滤条件类型（例如：price, marketCap, isInnerPlate等）
        this.value = value;             // 过滤条件值
        this.enabled = enabled;         // 是否启用
        this.createdAt = new Date();    // 创建时间
        this.updatedAt = new Date();    // 更新时间
    }

    /**
     * 初始化存储
     */
    static async initialize() {
        Filter.storage = new Storage('filters');
        
        // 检查是否需要创建默认过滤条件
        await Filter.createDefaultFiltersIfNeeded();
    }

    /**
     * 如果没有过滤条件，创建默认过滤条件
     */
    static async createDefaultFiltersIfNeeded() {
        const filters = await Filter.findAll();
        
        if (filters.length === 0) {
            console.log('创建默认过滤条件...');
            
            // 创建默认过滤条件
            await Filter.create({
                name: '高价格增长',
                description: '价格增长超过50%的信号',
                type: 'priceIncrease',
                value: '50',
                enabled: true
            });
            
            await Filter.create({
                name: '高市值',
                description: '市值超过100万美元的信号',
                type: 'marketCap',
                value: '1000000',
                enabled: true
            });
            
            await Filter.create({
                name: '强蓝筹持仓',
                description: '蓝筹持仓比例超过特定百分比的信号',
                type: 'bctpHoldRatio',
                value: '80',
                enabled: true
            });
            
            await Filter.create({
                name: '高共振次数',
                description: '共振次数大于特定次数的信号',
                type: 'resonanceTimes',
                value: '3',
                enabled: true
            });
            
            await Filter.create({
                name: '内盘过滤',
                description: '只接收内盘信号',
                type: 'isInnerPlate',
                value: 'true',
                enabled: true
            });
            
            console.log('默认过滤条件创建完成');
        }
    }

    /**
     * 创建过滤条件
     */
    static async create(filterData) {
        const filter = new Filter(
            filterData.name,
            filterData.description,
            filterData.type,
            filterData.value,
            filterData.enabled !== undefined ? filterData.enabled : true
        );
        
        return await Filter.storage.add(filter);
    }

    /**
     * 查找所有过滤条件
     */
    static async findAll() {
        return await Filter.storage.getAll();
    }

    /**
     * 根据ID查找过滤条件
     */
    static async findById(id) {
        return await Filter.storage.getById(id);
    }

    /**
     * 根据类型查找过滤条件
     */
    static async findByType(type) {
        const allFilters = await Filter.storage.getAll();
        return allFilters.filter(filter => filter.type === type);
    }

    /**
     * 更新过滤条件
     */
    static async update(id, updateData) {
        // 获取现有记录
        const existingFilter = await Filter.findById(id);
        if (!existingFilter) {
            throw new Error('Filter not found');
        }
        
        // 合并更新数据
        const updatedFilter = { ...existingFilter, ...updateData };
        
        // 更新时间戳
        updatedFilter.updatedAt = new Date();
        
        // 保存到数据库
        return await Filter.storage.update(id, updatedFilter);
    }

    /**
     * 删除过滤条件
     */
    static async delete(id) {
        return await Filter.storage.delete(id);
    }

    /**
     * 获取所有启用的过滤条件
     */
    static async getEnabledFilters() {
        const allFilters = await Filter.findAll();
        return allFilters.filter(filter => filter.enabled);
    }

    /**
     * 应用过滤条件到信号
     */
    static applyFilter(filter, singel) {
        switch (filter.type) {
            case 'priceIncrease':
                // 价格增长超过指定百分比
                const threshold = parseFloat(filter.value);
                return singel.aiSignalPrice > 0 && 
                       singel.currentPrice > 0 && 
                       ((singel.currentPrice / singel.aiSignalPrice - 1) * 100) > threshold;
                
            case 'marketCap':
                // 市值超过指定值
                return singel.aiSignalMarketCap > parseFloat(filter.value);
                
            case 'bctpHoldRatio':
                // 蓝筹持仓比例超过指定百分比
                return parseFloat(singel.bctpStatus) >= parseFloat(filter.value);
                
            case 'resonanceTimes':
                // 共振次数大于指定次数
                return singel.resonanceTimesWhenAibuy > parseInt(filter.value);
                
            case 'isInnerPlate':
                // 内盘过滤
                return filter.value === 'true' ? singel.isInnerPlate : !singel.isInnerPlate;
                
            default:
                console.log(`未知的过滤条件类型: ${filter.type}`);
                return false;
        }
    }
}

// 初始化存储
Filter.initialize();

module.exports = Filter;
