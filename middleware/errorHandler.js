const ResponseHelper = require('../utils/responseHelper');

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
    console.error('错误详情:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });

    // 数据库错误
    if (err.code === 'ER_DUP_ENTRY') {
        return ResponseHelper.error(res, '数据已存在，请勿重复添加', 409);
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return ResponseHelper.error(res, '关联数据不存在', 400);
    }

    // Joi 参数校验错误
    if (err.isJoi) {
        return ResponseHelper.error(res, '参数校验失败', 400, err.details);
    }

    // 自定义业务错误
    if (err.statusCode) {
        return ResponseHelper.error(res, err.message, err.statusCode);
    }

    // 默认服务器错误
    return ResponseHelper.error(res, '服务器内部错误', 500);
};

module.exports = errorHandler;