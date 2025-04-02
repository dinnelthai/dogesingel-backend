const TelegramForwarder = require('../telegramForwarder');

const forwarder = new TelegramForwarder();

// 处理进程退出
process.on('SIGINT', async () => {
    console.log('Stopping forwarder...');
    await forwarder.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Stopping forwarder...');
    await forwarder.stop();
    process.exit(0);
});

// 启动转发器
forwarder.start().catch(console.error);