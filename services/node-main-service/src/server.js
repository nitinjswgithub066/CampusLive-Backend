const app = require('./app');
const config = require('./config/config');
const sequelize = require('./config/sequelize');
const logger = require('./core/logger');
require('./models');

async function startServer() {

    try{
        await sequelize.authenticate()
        logger.info('Database connection has been established successfully.');

        app.listen(config.port, () => {
            logger.info(`Server is running on port ${config.port}`);
        })
    }catch (err) {
        logger.error('Unable to connect to the database')
        process.exit(1);
    }
}


startServer();