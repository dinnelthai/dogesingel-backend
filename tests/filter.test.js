const Filter = require('../src/models/filter');
const Storage = require('../src/database/storage');

// 模拟依赖
jest.mock('../src/database/storage');

describe('Filter模型测试', () => {
    let mockStorage;
    
    beforeEach(() => {
        // 清除所有模拟的调用信息
        jest.clearAllMocks();
        
        // 模拟Storage类
        mockStorage = {
            add: jest.fn().mockImplementation(item => Promise.resolve({ ...item, id: '123' })),
            getAll: jest.fn().mockResolvedValue([]),
            getById: jest.fn().mockImplementation(id => {
                if (id === '123') {
                    return Promise.resolve({
                        id: '123',
                        name: '内盘过滤',
                        description: '只接收内盘信号',
                        type: 'isInnerPlate',
                        value: 'true',
                        enabled: true
                    });
                }
                return Promise.resolve(null);
            }),
            update: jest.fn().mockImplementation((id, updates) => Promise.resolve({ ...updates, id })),
            delete: jest.fn().mockResolvedValue(true)
        };
        
        // 替换Filter.storage为模拟对象
        Filter.storage = mockStorage;
    });
    
    test('应该正确创建Filter实例', () => {
        const filter = new Filter(
            '内盘过滤',
            '只接收内盘信号',
            'isInnerPlate',
            'true',
            true
        );
        
        expect(filter.name).toBe('内盘过滤');
        expect(filter.description).toBe('只接收内盘信号');
        expect(filter.type).toBe('isInnerPlate');
        expect(filter.value).toBe('true');
        expect(filter.enabled).toBe(true);
        expect(filter.createdAt).toBeInstanceOf(Date);
        expect(filter.updatedAt).toBeInstanceOf(Date);
    });
    
    test('应该正确调用create方法创建Filter', async () => {
        const filterData = {
            name: '内盘过滤',
            description: '只接收内盘信号',
            type: 'isInnerPlate',
            value: 'true',
            enabled: true
        };
        
        const result = await Filter.create(filterData);
        
        // 验证存储方法被调用
        expect(mockStorage.add).toHaveBeenCalled();
        
        // 验证返回值
        expect(result).toHaveProperty('id', '123');
        expect(result.name).toBe(filterData.name);
        expect(result.type).toBe(filterData.type);
        expect(result.value).toBe(filterData.value);
    });
    
    test('应该正确查找所有Filter记录', async () => {
        await Filter.findAll();
        expect(mockStorage.getAll).toHaveBeenCalled();
    });
    
    test('应该正确通过ID查找Filter记录', async () => {
        const result = await Filter.findById('123');
        expect(mockStorage.getById).toHaveBeenCalledWith('123');
        expect(result).toHaveProperty('id', '123');
    });
    
    test('应该正确通过类型查找Filter记录', async () => {
        // 模拟getAll返回一些数据
        mockStorage.getAll.mockResolvedValueOnce([
            { id: '123', type: 'isInnerPlate', name: '内盘过滤' },
            { id: '456', type: 'priceIncrease', name: '价格增长过滤' }
        ]);
        
        const result = await Filter.findByType('isInnerPlate');
        expect(mockStorage.getAll).toHaveBeenCalled();
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('id', '123');
    });
    
    test('应该正确更新Filter记录', async () => {
        const updateData = {
            name: '更新后的名称',
            value: 'false'
        };
        
        const result = await Filter.update('123', updateData);
        
        // 验证getById被调用
        expect(mockStorage.getById).toHaveBeenCalledWith('123');
        
        // 验证update被调用
        expect(mockStorage.update).toHaveBeenCalled();
        
        // 验证返回值
        expect(result).toHaveProperty('id', '123');
        expect(result).toHaveProperty('name', '更新后的名称');
        expect(result).toHaveProperty('value', 'false');
    });
    
    test('应该正确删除Filter记录', async () => {
        await Filter.delete('123');
        expect(mockStorage.delete).toHaveBeenCalledWith('123');
    });
    
    test('应该正确获取所有启用的Filter', async () => {
        // 模拟getAll返回一些数据
        mockStorage.getAll.mockResolvedValueOnce([
            { id: '123', enabled: true, name: '内盘过滤' },
            { id: '456', enabled: false, name: '价格增长过滤' }
        ]);
        
        const result = await Filter.getEnabledFilters();
        expect(mockStorage.getAll).toHaveBeenCalled();
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('id', '123');
    });
    
    describe('applyFilter测试', () => {
        test('应该正确应用priceIncrease过滤器', () => {
            const filter = {
                type: 'priceIncrease',
                value: '50'
            };
            
            // 价格增长超过50%的情况
            const singel1 = {
                aiSignalPrice: 100,
                currentPrice: 160 // 增长60%
            };
            expect(Filter.applyFilter(filter, singel1)).toBe(true);
            
            // 价格增长不足50%的情况
            const singel2 = {
                aiSignalPrice: 100,
                currentPrice: 140 // 增长40%
            };
            expect(Filter.applyFilter(filter, singel2)).toBe(false);
        });
        
        test('应该正确应用marketCap过滤器', () => {
            const filter = {
                type: 'marketCap',
                value: '1000000'
            };
            
            // 市值超过100万的情况
            const singel1 = {
                aiSignalMarketCap: 1500000
            };
            expect(Filter.applyFilter(filter, singel1)).toBe(true);
            
            // 市值不足100万的情况
            const singel2 = {
                aiSignalMarketCap: 500000
            };
            expect(Filter.applyFilter(filter, singel2)).toBe(false);
        });
        
        test('应该正确应用bctpHoldRatio过滤器', () => {
            const filter = {
                type: 'bctpHoldRatio',
                value: '80'
            };
            
            // 持仓比例超过80%的情况
            const singel1 = {
                bctpStatus: '85.00'
            };
            expect(Filter.applyFilter(filter, singel1)).toBe(true);
            
            // 持仓比例不足80%的情况
            const singel2 = {
                bctpStatus: '75.00'
            };
            expect(Filter.applyFilter(filter, singel2)).toBe(false);
        });
        
        test('应该正确应用resonanceTimes过滤器', () => {
            const filter = {
                type: 'resonanceTimes',
                value: '3'
            };
            
            // 共振次数大于3的情况
            const singel1 = {
                resonanceTimesWhenAibuy: 5
            };
            expect(Filter.applyFilter(filter, singel1)).toBe(true);
            
            // 共振次数不大于3的情况
            const singel2 = {
                resonanceTimesWhenAibuy: 2
            };
            expect(Filter.applyFilter(filter, singel2)).toBe(false);
        });
        
        test('应该正确应用isInnerPlate过滤器', () => {
            const filter = {
                type: 'isInnerPlate',
                value: 'true'
            };
            
            // 内盘的情况
            const singel1 = {
                isInnerPlate: true
            };
            expect(Filter.applyFilter(filter, singel1)).toBe(true);
            
            // 非内盘的情况
            const singel2 = {
                isInnerPlate: false
            };
            expect(Filter.applyFilter(filter, singel2)).toBe(false);
            
            // 反向过滤：只接收非内盘
            const filter2 = {
                type: 'isInnerPlate',
                value: 'false'
            };
            expect(Filter.applyFilter(filter2, singel1)).toBe(false);
            expect(Filter.applyFilter(filter2, singel2)).toBe(true);
        });
    });
});
