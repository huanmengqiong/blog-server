const tagService = require('../services/tagService');
const ResponseHelper = require('../utils/responseHelper');

class TagController {
    
    async getAll(req, res, next) {
        try {
            const tags = await tagService.getAll();
            return ResponseHelper.success(res, tags, '获取标签列表成功');
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const { name } = req.body;
            
            if (!name) {
                return ResponseHelper.error(res, '标签名称不能为空', 400);
            }

            const tag = await tagService.create(name);
            return ResponseHelper.success(res, tag, '标签创建成功', 201);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TagController();