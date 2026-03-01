require('dotenv').config();

module.exports = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    apiVersion: process.env.VERSION_V1,

    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
}