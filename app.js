const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码请求体

// 请求日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API 路由
app.use('/api', routes);

// 根路由
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '博客系统 API 运行中',
        version: '1.0.0'
    });
});

// 404 处理
app.use(notFound);

// 全局错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API 地址: http://localhost:${PORT}/api`);
});

module.exports = app;