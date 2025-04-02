const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const singelsRouter = require('../src/routes/singels');
const filtersRouter = require('../src/routes/filters');
const Singel = require('../src/models/singel');
const Filter = require('../src/models/filter');

// 模拟依赖
jest.mock('../src/models/singel');
jest.mock('../src/models/filter');

// 创建测试用的Express应用
const app = express();
app.use(bodyParser.json());
app.use('/api/singels', singelsRouter);
app.use('/api/filters', filtersRouter);

describe('API路由测试', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('Singels API测试', () => {
        test('GET /api/singels 应返回所有Singel记录', async () => {
            // 模拟Singel.findAll方法
            Singel.findAll.mockResolvedValue([
                { id: '123', name: '测试代币1', ca: '0x123' },
                { id: '456', name: '测试代币2', ca: '0x456' }
            ]);
            
            const response = await request(app).get('/api/singels');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(Singel.findAll).toHaveBeenCalled();
        });
        
        test('GET /api/singels/:id 应返回指定ID的Singel记录', async () => {
            // 模拟Singel.findById方法
            Singel.findById.mockResolvedValue({
                id: '123',
                name: '测试代币',
                ca: '0x123'
            });
            
            const response = await request(app).get('/api/singels/123');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', '123');
            expect(Singel.findById).toHaveBeenCalledWith('123');
        });
        
        test('GET /api/singels/:id 当记录不存在时应返回404', async () => {
            // 模拟Singel.findById方法返回null
            Singel.findById.mockResolvedValue(null);
            
            const response = await request(app).get('/api/singels/999');
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
        
        test('POST /api/singels 应创建新的Singel记录', async () => {
            // 模拟Singel.create方法
            Singel.create.mockResolvedValue({
                id: '123',
                name: '新代币',
                ca: '0x123',
                currentPrice: 0.001
            });
            
            const response = await request(app)
                .post('/api/singels')
                .send({
                    name: '新代币',
                    ca: '0x123',
                    currentPrice: 0.001
                });
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id', '123');
            expect(Singel.create).toHaveBeenCalled();
        });
        
        test('POST /api/singels 缺少必要字段时应返回400', async () => {
            const response = await request(app)
                .post('/api/singels')
                .send({
                    name: '新代币'
                    // 缺少ca字段
                });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(Singel.create).not.toHaveBeenCalled();
        });
        
        test('PUT /api/singels/:id 应更新Singel记录', async () => {
            // 模拟Singel.findById和update方法
            Singel.findById.mockResolvedValue({
                id: '123',
                name: '测试代币',
                ca: '0x123'
            });
            
            Singel.update.mockResolvedValue({
                id: '123',
                name: '更新后的代币',
                ca: '0x123'
            });
            
            const response = await request(app)
                .put('/api/singels/123')
                .send({
                    name: '更新后的代币'
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', '更新后的代币');
            expect(Singel.update).toHaveBeenCalled();
        });
        
        test('DELETE /api/singels/:id 应删除Singel记录', async () => {
            // 模拟Singel.findById和delete方法
            Singel.findById.mockResolvedValue({
                id: '123',
                name: '测试代币',
                ca: '0x123'
            });
            
            Singel.delete.mockResolvedValue(true);
            
            const response = await request(app).delete('/api/singels/123');
            
            expect(response.status).toBe(204);
            expect(Singel.delete).toHaveBeenCalledWith('123');
        });
    });
    
    describe('Filters API测试', () => {
        test('GET /api/filters 应返回所有Filter记录', async () => {
            // 模拟Filter.findAll方法
            Filter.findAll.mockResolvedValue([
                { id: '123', name: '内盘过滤', type: 'isInnerPlate' },
                { id: '456', name: '价格增长过滤', type: 'priceIncrease' }
            ]);
            
            const response = await request(app).get('/api/filters');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(Filter.findAll).toHaveBeenCalled();
        });
        
        test('GET /api/filters/enabled 应返回所有启用的Filter记录', async () => {
            // 模拟Filter.getEnabledFilters方法
            Filter.getEnabledFilters.mockResolvedValue([
                { id: '123', name: '内盘过滤', type: 'isInnerPlate', enabled: true }
            ]);
            
            const response = await request(app).get('/api/filters/enabled');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(Filter.getEnabledFilters).toHaveBeenCalled();
        });
        
        test('POST /api/filters 应创建新的Filter记录', async () => {
            // 模拟Filter.create方法
            Filter.create.mockResolvedValue({
                id: '123',
                name: '内盘过滤',
                description: '只接收内盘信号',
                type: 'isInnerPlate',
                value: 'true',
                enabled: true
            });
            
            const response = await request(app)
                .post('/api/filters')
                .send({
                    name: '内盘过滤',
                    description: '只接收内盘信号',
                    type: 'isInnerPlate',
                    value: 'true',
                    enabled: true
                });
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id', '123');
            expect(Filter.create).toHaveBeenCalled();
        });
        
        test('PUT /api/filters/:id 应更新Filter记录', async () => {
            // 模拟Filter.findById和update方法
            Filter.findById.mockResolvedValue({
                id: '123',
                name: '内盘过滤',
                type: 'isInnerPlate',
                value: 'true'
            });
            
            Filter.update.mockResolvedValue({
                id: '123',
                name: '更新后的过滤器',
                type: 'isInnerPlate',
                value: 'false'
            });
            
            const response = await request(app)
                .put('/api/filters/123')
                .send({
                    name: '更新后的过滤器',
                    value: 'false'
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', '更新后的过滤器');
            expect(Filter.update).toHaveBeenCalled();
        });
        
        test('PATCH /api/filters/:id/enable 应启用Filter', async () => {
            // 模拟Filter.findById和update方法
            Filter.findById.mockResolvedValue({
                id: '123',
                name: '内盘过滤',
                enabled: false
            });
            
            Filter.update.mockResolvedValue({
                id: '123',
                name: '内盘过滤',
                enabled: true
            });
            
            const response = await request(app).patch('/api/filters/123/enable');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('enabled', true);
            expect(Filter.update).toHaveBeenCalledWith('123', { enabled: true });
        });
        
        test('PATCH /api/filters/:id/disable 应禁用Filter', async () => {
            // 模拟Filter.findById和update方法
            Filter.findById.mockResolvedValue({
                id: '123',
                name: '内盘过滤',
                enabled: true
            });
            
            Filter.update.mockResolvedValue({
                id: '123',
                name: '内盘过滤',
                enabled: false
            });
            
            const response = await request(app).patch('/api/filters/123/disable');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('enabled', false);
            expect(Filter.update).toHaveBeenCalledWith('123', { enabled: false });
        });
    });
});
