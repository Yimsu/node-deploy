require('dotenv').config();

module.exports = {
    development: {
        username: 'nodebird',
        password: process.env.SEQUELIZE_PASSWORD,
        database: 'dbnodebird',
        host: 'ls-d2399811f130b5f29f3bd7f4d67caf7c35476796.cuvukhote9vs.ap-northeast-2.rds.amazonaws.com',
        dialect: 'mysql',
    },
    test: {
        username: "root",
        password: process.env.SEQUELIZE_PASSWORD,
        database: "nodebird_test",
        host: "127.0.0.1",
        dialect: "mysql"
    },
    production: {
        username: 'nodebird',
        password: process.env.SEQUELIZE_PASSWORD,
        database: 'dbnodebird',
        host: '127.0.0.1',
        dialect: 'ls-d2399811f130b5f29f3bd7f4d67caf7c35476796.cuvukhote9vs.ap-northeast-2.rds.amazonaws.com',
        logging: false,
    },
};


