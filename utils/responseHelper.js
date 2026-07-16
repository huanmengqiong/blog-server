class ResponseHelper {
    
    static success(res, data = null, message = '操作成功', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            data: data,
            error: null,
            message: message
        });
    }

    static error(res, message = '服务器内部错误', statusCode = 500, error = null) {
        return res.status(statusCode).json({
            success: false,
            data: null,
            error: error,
            message: message
        });
    }

    static pagination(res, list, total, page, limit, message = '查询成功') {
        return res.status(200).json({
            success: true,
            data: {
                list: list,
                pagination: {
                    total: total,
                    page: page,
                    limit: limit,
                    totalPages: Math.ceil(total / limit)
                }
            },
            error: null,
            message: message
        });
    }
}

module.exports = ResponseHelper;