const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use('/api', routes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '博客系统 API 运行中',
        version: '1.0.0'
    });
});

app.use(notFound);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API 地址: http://localhost:${PORT}/api`);
});

module.exports = app;