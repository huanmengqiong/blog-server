const jwt = require('jsonwebtoken');
const ResponseHelper = require('../utils/responseHelper');
require('dotenv').config();

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return ResponseHelper.error(res, '未提供认证令牌', 401);
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return ResponseHelper.error(res, '令牌已过期，请重新登录', 401);
        }
        return ResponseHelper.error(res, '无效的认证令牌', 401);
    }
};

module.exports = auth;