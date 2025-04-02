const Singel = require('./models/singel');

// 创建新记录
const createExample = async () => {
    console.log('Creating example record...');
    const newSingel = {
        name: 'example',
        time: new Date(),
        ca: 'some-ca',
        resonanceTimesWhenAibuy: 1,
        BCTPID: '12345'
    };
    const created = await Singel.create(newSingel);
    console.log('Created:', created);
};

// 查询所有记录
const findAllExample = async () => {
    console.log('Finding all records...');
    const allSingels = await Singel.findAll();
    console.log('All:', allSingels);
};

// 根据ID查询
const findByIdExample = async (id) => {
    console.log(`Finding record with ID: ${id}`);
    const singel = await Singel.findById(id);
    console.log('Found:', singel);
};

// 更新记录
const updateExample = async (id) => {
    console.log(`Updating record with ID: ${id}`);
    const updated = await Singel.update(id, {
        name: 'updated-name'
    });
    console.log('Updated:', updated);
};

// 启动程序
(async () => {
    try {
        console.log('Starting application...');
        
        // 可以在这里添加其他启动逻辑
        console.log('Application started successfully');
    } catch (error) {
        console.error('Error starting application:', error);
    }
})();