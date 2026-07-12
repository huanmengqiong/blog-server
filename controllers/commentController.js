const commentService = require('../services/commentService');
const ResponseHelper = require('../utils/responseHelper');

class CommentController {
    /**
     * 获取文章评论列表
     */
    async getByArticleId(req, res, next) {
        try {
            const articleId = parseInt(req.params.articleId);
            const comments = await commentService.getByArticleId(articleId);
            return ResponseHelper.success(res, comments, '获取评论列表成功');
        } catch (error) {
            next(error);
        }
    }

    /**
     * 创建评论
     */
    async create(req, res, next) {
        try {
            const { content, articleId, parentId } = req.body;

            if (!content || !articleId) {
                return ResponseHelper.error(res, '评论内容和文章ID不能为空', 400);
            }

            const comment = await commentService.create({
                content,
                articleId,
                parentId: parentId || null,
                userId: req.user.id
            });

            return ResponseHelper.success(res, comment, '评论成功', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 删除评论
     */
    async remove(req, res, next) {
        try {
            const commentId = parseInt(req.params.id);
            await commentService.remove(commentId, req.user.id);
            return ResponseHelper.success(res, null, '评论删除成功');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CommentController();