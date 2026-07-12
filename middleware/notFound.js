const ResponseHelper = require('../utils/responseHelper');

/**
 * 404 处理中间件
 */
const notFound = (req, res, next) => {
    ResponseHelper.error(res, `接口不存在: ${req.method} ${req.originalUrl}`, 404);
};

module.exports = notFound;