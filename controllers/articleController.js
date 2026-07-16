const articleService = require('../services/articleService');
const ResponseHelper = require('../utils/responseHelper');

class ArticleController {
    
    async getList(req, res, next) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
            const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : null;
            const tagId = req.query.tagId ? parseInt(req.query.tagId) : null;
            const status = req.query.status || 'published';
            const keyword = req.query.keyword || null;
            const sort = req.query.sort || 'latest';

            const result = await articleService.getList({
                page, limit, categoryId, tagId, status, keyword, sort
            });

            return ResponseHelper.pagination(
                res, result.list, result.total, page, limit, '获取文章列表成功'
            );
        } catch (error) {
            next(error);
        }
    }

    async getDetail(req, res, next) {
        try {
            const articleId = parseInt(req.params.id);
            if (isNaN(articleId)) {
                return ResponseHelper.error(res, '文章ID格式错误', 400);
            }

            const article = await articleService.getDetail(articleId);
            return ResponseHelper.success(res, article, '获取文章详情成功');
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const { title, content, summary, coverImage, categoryId, tagIds, status } = req.body;

            if (!title || !title.trim()) {
                return ResponseHelper.error(res, '标题不能为空', 400);
            }
            if (!content || !content.trim()) {
                return ResponseHelper.error(res, '内容不能为空', 400);
            }
            if (title.length > 200) {
                return ResponseHelper.error(res, '标题不能超过200字', 400);
            }

            const article = await articleService.create({
                title: title.trim(),
                content: content.trim(),
                summary: summary ? summary.trim() : '',
                coverImage: coverImage || null,
                categoryId: categoryId || null,
                tagIds: tagIds || [],
                status: status || 'published',
                userId: req.user.id
            });

            return ResponseHelper.success(res, article, '文章创建成功', 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const articleId = parseInt(req.params.id);
            if (isNaN(articleId)) {
                return ResponseHelper.error(res, '文章ID格式错误', 400);
            }

            const updateData = {
                ...req.body,
                userId: req.user.id
            };

            Object.keys(updateData).forEach(key => {
                if (updateData[key] === '') {
                    delete updateData[key];
                }
            });

            const article = await articleService.update(articleId, updateData);
            return ResponseHelper.success(res, article, '文章更新成功');
        } catch (error) {
            next(error);
        }
    }

    async remove(req, res, next) {
        try {
            const articleId = parseInt(req.params.id);
            if (isNaN(articleId)) {
                return ResponseHelper.error(res, '文章ID格式错误', 400);
            }

            await articleService.remove(articleId, req.user.id);
            return ResponseHelper.success(res, null, '文章删除成功');
        } catch (error) {
            next(error);
        }
    }

    async toggleLike(req, res, next) {
        try {
            const articleId = parseInt(req.params.id);
            if (isNaN(articleId)) {
                return ResponseHelper.error(res, '文章ID格式错误', 400);
            }

            const result = await articleService.toggleLike(articleId, req.user.id);
            return ResponseHelper.success(
                res, 
                result, 
                result.isLiked ? '点赞成功' : '已取消点赞'
            );
        } catch (error) {
            next(error);
        }
    }

    async getLikeStatus(req, res, next) {
        try {
            const articleId = parseInt(req.params.id);
            if (isNaN(articleId)) {
                return ResponseHelper.error(res, '文章ID格式错误', 400);
            }

            const result = await articleService.getLikeStatus(articleId, req.user.id);
            return ResponseHelper.success(res, result, '获取点赞状态成功');
        } catch (error) {
            next(error);
        }
    }

    async getArchives(req, res, next) {
        try {
            const archives = await articleService.getArchives();
            return ResponseHelper.success(res, archives, '获取归档成功');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ArticleController();