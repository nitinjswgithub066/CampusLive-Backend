const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('./config/config');
const errorHandler = require('./middlewares/errorHandler.middleware')
const routes = require('./routes/index');

const app = express();

app.use(express.json());
app.use(cookieParser());


app.get('/health', (req, res) => {
    res.json({status: 'ok'});
})

app.use(`/${config.apiVersion}`, routes)
app.use(errorHandler)

module.exports = app;