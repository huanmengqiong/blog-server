const ResponseHelper = require('../utils/responseHelper');

/**
 * 参数校验中间件工厂函数
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false });
        
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join('; ');
            return ResponseHelper.error(res, errorMessage, 400);
        }
        
        next();
    };
};

module.exports = validate;