const Singel = require('../src/models/singel');
const Storage = require('../src/database/storage');

// 模拟依赖
jest.mock('../src/database/storage');
jest.mock('../src/handlers/priceHandler');
jest.mock('../src/handlers/signalFilter');
jest.mock('../src/handlers/telegramBot');

describe('Singel模型测试', () => {
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
                        name: '测试代币',
                        ca: '0x1234567890abcdef',
                        currentPrice: 0.001,
                        aiSignalType: 'buy',
                        aiSignalPrice: 0.0008,
                        aiSignalMarketCap: 1000000,
                        bctpVolumeBuy: 5000,
                        bctpVolumeHold: 4000,
                        bctpStatus: '80.00',
                        isInnerPlate: true,
                        resonanceTimesWhenAibuy: 3,
                        isDead: false
                    });
                }
                return Promise.resolve(null);
            }),
            update: jest.fn().mockImplementation((id, updates) => Promise.resolve({ ...updates, id })),
            delete: jest.fn().mockResolvedValue(true)
        };
        
        // 替换Singel.storage为模拟对象
        Singel.storage = mockStorage;
        
        // 模拟priceHandler
        Singel.priceHandler = {
            getMarketData: jest.fn().mockResolvedValue({
                usd: 0.001,
                mc: 1000000,
                vol: 50000,
                ath: 0.002
            })
        };
        
        // 模拟signalFilter
        Singel.signalFilter = {
            processSingel: jest.fn().mockResolvedValue(true)
        };
    });
    
    test('应该正确创建Singel实例', () => {
        const singel = new Singel(
            '测试代币',
            '0x1234567890abcdef',
            0.001,
            'buy',
            0.0008,
            1000000,
            5000,
            4000,
            true,
            3,
            false
        );
        
        expect(singel.name).toBe('测试代币');
        expect(singel.ca).toBe('0x1234567890abcdef');
        expect(singel.currentPrice).toBe(0.001);
        expect(singel.aiSignalType).toBe('buy');
        expect(singel.aiSignalPrice).toBe(0.0008);
        expect(singel.aiSignalMarketCap).toBe(1000000);
        expect(singel.bctpVolumeBuy).toBe(5000);
        expect(singel.bctpVolumeHold).toBe(4000);
        expect(singel.isInnerPlate).toBe(true);
        expect(singel.resonanceTimesWhenAibuy).toBe(3);
        expect(singel.isDead).toBe(false);
        expect(singel.bctpStatus).toBe('80.00'); // 应该自动计算
    });
    
    test('应该正确计算bctpStatus', () => {
        // 测试案例1: 持仓量是买入量的80%
        const singel1 = new Singel('测试1', '0x1', 0, 'buy', 0, 0, 100, 80, false, 0, false);
        expect(singel1.bctpStatus).toBe('80.00');
        
        // 测试案例2: 持仓量是买入量的50%
        const singel2 = new Singel('测试2', '0x2', 0, 'buy', 0, 0, 100, 50, false, 0, false);
        expect(singel2.bctpStatus).toBe('50.00');
        
        // 测试案例3: 买入量为0
        const singel3 = new Singel('测试3', '0x3', 0, 'buy', 0, 0, 0, 50, false, 0, false);
        expect(singel3.bctpStatus).toBe('0');
    });
    
    test('应该正确调用create方法创建Singel', async () => {
        const singelData = {
            name: '测试代币',
            ca: '0x1234567890abcdef',
            currentPrice: 0.001,
            aiSignalType: 'buy',
            aiSignalPrice: 0.0008,
            aiSignalMarketCap: 1000000,
            bctpVolumeBuy: 5000,
            bctpVolumeHold: 4000,
            isInnerPlate: true,
            resonanceTimesWhenAibuy: 3,
            isDead: false
        };
        
        const result = await Singel.create(singelData);
        
        // 验证存储方法被调用
        expect(mockStorage.add).toHaveBeenCalled();
        
        // 验证价格更新方法被调用
        expect(Singel.priceHandler.getMarketData).toHaveBeenCalledWith(singelData.ca);
        
        // 验证信号过滤器被调用
        expect(Singel.signalFilter.processSingel).toHaveBeenCalled();
        
        // 验证返回值
        expect(result).toHaveProperty('id', '123');
        expect(result.name).toBe(singelData.name);
        expect(result.ca).toBe(singelData.ca);
    });
    
    test('应该正确查找所有Singel记录', async () => {
        await Singel.findAll();
        expect(mockStorage.getAll).toHaveBeenCalled();
    });
    
    test('应该正确通过ID查找Singel记录', async () => {
        const result = await Singel.findById('123');
        expect(mockStorage.getById).toHaveBeenCalledWith('123');
        expect(result).toHaveProperty('id', '123');
    });
    
    test('应该正确通过合约地址查找Singel记录', async () => {
        // 模拟getAll返回一些数据
        mockStorage.getAll.mockResolvedValueOnce([
            { id: '123', ca: '0x1234567890abcdef', name: '测试代币' },
            { id: '456', ca: '0xabcdef1234567890', name: '另一个代币' }
        ]);
        
        const result = await Singel.findByCA('0x1234567890abcdef');
        expect(mockStorage.getAll).toHaveBeenCalled();
        expect(result).toHaveProperty('id', '123');
    });
    
    test('应该正确更新Singel记录', async () => {
        const updateData = {
            name: '更新后的名称',
            currentPrice: 0.002
        };
        
        const result = await Singel.update('123', updateData);
        
        // 验证getById被调用
        expect(mockStorage.getById).toHaveBeenCalledWith('123');
        
        // 验证update被调用
        expect(mockStorage.update).toHaveBeenCalled();
        
        // 验证返回值
        expect(result).toHaveProperty('id', '123');
        expect(result).toHaveProperty('name', '更新后的名称');
    });
    
    test('更新bctpVolumeBuy或bctpVolumeHold时应重新计算bctpStatus', async () => {
        const updateData = {
            bctpVolumeBuy: 10000,
            bctpVolumeHold: 6000
        };
        
        const result = await Singel.update('123', updateData);
        
        // 验证update被调用，并且bctpStatus被更新
        const updateCall = mockStorage.update.mock.calls[0];
        expect(updateCall[0]).toBe('123');
        expect(updateCall[1]).toHaveProperty('bctpStatus');
        expect(updateCall[1].bctpStatus).toBe('60.00'); // 6000/10000 = 60%
    });
    
    test('应该正确删除Singel记录', async () => {
        await Singel.delete('123');
        expect(mockStorage.delete).toHaveBeenCalledWith('123');
    });
});
