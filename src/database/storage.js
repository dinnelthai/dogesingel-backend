const mongodb = require('./mongodb');
const fs = require('fs-extra');
const path = require('path');
const { ObjectId } = require('mongodb');

class Storage {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.memoryData = [];
        this.useMemoryStorage = false;
        this.dataFilePath = path.join(__dirname, '..', '..', 'data', `${collectionName}.json`);
        this.initialize();
    }

    async initialize() {
        try {
            // 尝试连接到MongoDB
            await mongodb.connect();
            console.log(`集合 ${this.collectionName} 已初始化`);
        } catch (error) {
            console.error(`初始化集合 ${this.collectionName} 时出错:`, error);
            // 如果连接失败，切换到内存存储
            this.useMemoryStorage = true;
            console.log(`由于错误，集合 ${this.collectionName} 将使用内存存储模式`);
            
            // 尝试从本地文件加载数据
            await this.loadDataFromFile();
        }
    }

    // 从文件加载数据到内存
    async loadDataFromFile() {
        try {
            await fs.ensureFile(this.dataFilePath);
            const fileData = await fs.readFile(this.dataFilePath, 'utf8');
            if (fileData.trim()) {
                this.memoryData = JSON.parse(fileData);
                console.log(`从文件加载了 ${this.memoryData.length} 条记录到内存`);
            } else {
                this.memoryData = [];
                await fs.writeJson(this.dataFilePath, this.memoryData);
            }
        } catch (error) {
            console.error(`从文件加载数据到内存时出错:`, error);
            this.memoryData = [];
            await fs.writeJson(this.dataFilePath, this.memoryData);
        }
    }

    // 将内存数据保存到文件
    async saveDataToFile() {
        if (this.useMemoryStorage) {
            try {
                await fs.ensureFile(this.dataFilePath);
                await fs.writeJson(this.dataFilePath, this.memoryData);
                console.log(`已将 ${this.memoryData.length} 条记录保存到文件`);
            } catch (error) {
                console.error(`将内存数据保存到文件时出错:`, error);
            }
        }
    }

    async getCollection() {
        if (this.useMemoryStorage) {
            throw new Error('使用内存存储模式，不需要MongoDB集合');
        }
        return await mongodb.getCollection(this.collectionName);
    }

    async getAll() {
        if (this.useMemoryStorage) {
            return [...this.memoryData];
        }

        try {
            const collection = await this.getCollection();
            const items = await collection.find({}).toArray();
            return items.map(item => {
                return {
                    ...item,
                    id: item._id.toString()
                };
            });
        } catch (error) {
            console.error(`获取所有 ${this.collectionName} 记录时出错:`, error);
            return [];
        }
    }

    async getById(id) {
        if (this.useMemoryStorage) {
            return this.memoryData.find(item => item.id === id) || null;
        }

        try {
            const collection = await this.getCollection();
            let _id;
            try {
                _id = new ObjectId(id);
            } catch (error) {
                return null; // 如果ID不是有效的ObjectId
            }
            
            const item = await collection.findOne({ _id });
            if (!item) return null;
            
            return {
                ...item,
                id: item._id.toString()
            };
        } catch (error) {
            console.error(`通过ID获取 ${this.collectionName} 记录时出错:`, error);
            return null;
        }
    }

    async add(item) {
        if (this.useMemoryStorage) {
            // 为新项目生成ID
            const newId = this.memoryData.length > 0 
                ? Math.max(...this.memoryData.map(i => i.id || 0)) + 1 
                : 1;
            const newItem = { ...item, id: newId.toString() };
            this.memoryData.push(newItem);
            await this.saveDataToFile();
            return newItem;
        }

        try {
            const collection = await this.getCollection();
            // 移除id，让MongoDB自动生成_id
            const { id, ...itemWithoutId } = item;
            
            const result = await collection.insertOne(itemWithoutId);
            
            // 返回带有新ID的项目
            return { 
                ...item, 
                id: result.insertedId.toString() 
            };
        } catch (error) {
            console.error(`添加 ${this.collectionName} 记录时出错:`, error);
            throw error;
        }
    }

    async update(id, updates) {
        if (this.useMemoryStorage) {
            const index = this.memoryData.findIndex(item => item.id === id);
            if (index === -1) return null;
            
            this.memoryData[index] = { ...this.memoryData[index], ...updates };
            await this.saveDataToFile();
            return this.memoryData[index];
        }

        try {
            const collection = await this.getCollection();
            let _id;
            try {
                _id = new ObjectId(id);
            } catch (error) {
                return null; // 如果ID不是有效的ObjectId
            }
            
            // 移除id，因为我们不希望更新_id
            const { id: updateId, ...updatesWithoutId } = updates;
            
            const result = await collection.findOneAndUpdate(
                { _id },
                { $set: updatesWithoutId },
                { returnDocument: 'after' }
            );
            
            if (!result.value) return null;
            
            return {
                ...result.value,
                id: result.value._id.toString()
            };
        } catch (error) {
            console.error(`更新 ${this.collectionName} 记录时出错:`, error);
            return null;
        }
    }

    async delete(id) {
        if (this.useMemoryStorage) {
            const index = this.memoryData.findIndex(item => item.id === id);
            if (index === -1) return false;
            
            this.memoryData.splice(index, 1);
            await this.saveDataToFile();
            return true;
        }

        try {
            const collection = await this.getCollection();
            let _id;
            try {
                _id = new ObjectId(id);
            } catch (error) {
                return false; // 如果ID不是有效的ObjectId
            }
            
            const result = await collection.deleteOne({ _id });
            
            return result.deletedCount > 0;
        } catch (error) {
            console.error(`删除 ${this.collectionName} 记录时出错:`, error);
            return false;
        }
    }
}

module.exports = Storage;