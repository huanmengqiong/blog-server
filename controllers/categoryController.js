const categoryService = require('../services/categoryService');
const ResponseHelper = require('../utils/responseHelper');

class CategoryController {
    
    async getAll(req, res, next) {
        try {
            const categories = await categoryService.getAll();
            return ResponseHelper.success(res, categories, '获取分类列表成功');
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const { name, description } = req.body;
            
            if (!name) {
                return ResponseHelper.error(res, '分类名称不能为空', 400);
            }

            const category = await categoryService.create({ name, description });
            return ResponseHelper.success(res, category, '分类创建成功', 201);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CategoryController();