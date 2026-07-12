const articleService = require('../services/articleService');
const ResponseHelper = require('../utils/responseHelper');

class ArticleController {
    /**
     * 获取文章列表（支持分页、筛选、搜索、排序）
     */
    async getList(req, res, next) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
            const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : null;
            const tagId = req.query.tagId ? parseInt(req.query.tagId) : null;
            const status = req.query.status || 'published';
            const keyword = req.query.keyword || null;
            const sort = req.query.sort || 'latest'; // latest / popular / most_viewed

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

    /**
     * 获取文章详情
     */
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

    /**
     * 创建文章
     */
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

    /**
     * 更新文章
     */
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

            // 清除空字符串
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

    /**
     * 删除文章
     */
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

    /**
     * 点赞/取消点赞
     */
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

    /**
     * 获取点赞状态
     */
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

    /**
     * 文章归档
     */
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