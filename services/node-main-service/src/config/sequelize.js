const { Sequelize } = require('sequelize');
config = require('./config');


const sequelize = new Sequelize(
    config.db.name,
    config.db.user,
    config.db.password,
    {
        host: config.db.host,
        dialect: 'mysql',
        logging: false,
    }
)

module.exports = sequelize;