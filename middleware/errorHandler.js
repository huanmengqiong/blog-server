const ResponseHelper = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
    console.error('错误详情:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });

    if (err.code === 'ER_DUP_ENTRY') {
        return ResponseHelper.error(res, '数据已存在，请勿重复添加', 409);
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return ResponseHelper.error(res, '关联数据不存在', 400);
    }

    if (err.isJoi) {
        return ResponseHelper.error(res, '参数校验失败', 400, err.details);
    }

    if (err.statusCode) {
        return ResponseHelper.error(res, err.message, err.statusCode);
    }

    return ResponseHelper.error(res, '服务器内部错误', 500);
};

module.exports = errorHandler;