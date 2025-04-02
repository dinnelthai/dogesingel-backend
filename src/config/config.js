module.exports = {
    telegram: {
        token: '8021465592:AAHkZME6IO0rkCZuWLnhNUkvIUc5-WjUkjk',
        chatId: '-4638234744'
    },
    mongodb: {
        uri: 'mongodb://localhost:27017',
        dbName: 'dogesingel',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 10000,
            maxPoolSize: 10
        }
    }
};