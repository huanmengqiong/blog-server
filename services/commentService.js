const pool = require('../config/db');

class CommentService {
    /**
     * 获取文章评论列表
     */
    async getByArticleId(articleId) {
        const [comments] = await pool.query(`
            SELECT 
                c.id,
                c.content,
                c.parent_id,
                c.created_at,
                u.id AS user_id,
                u.username,
                u.avatar_url
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.article_id = ?
            ORDER BY c.created_at DESC
        `, [articleId]);

        return comments.map(comment => ({
            id: comment.id,
            content: comment.content,
            parentId: comment.parent_id,
            user: {
                id: comment.user_id,
                username: comment.username,
                avatarUrl: comment.avatar_url
            },
            createdAt: comment.created_at
        }));
    }

    /**
     * 创建评论
     */
    async create({ content, articleId, parentId, userId }) {
        // 检查文章是否存在
        const [articles] = await pool.query(
            'SELECT id FROM articles WHERE id = ?',
            [articleId]
        );

        if (articles.length === 0) {
            const error = new Error('文章不存在');
            error.statusCode = 404;
            throw error;
        }

        // 如果有父评论，检查父评论是否存在
        if (parentId) {
            const [parentComments] = await pool.query(
                'SELECT id FROM comments WHERE id = ? AND article_id = ?',
                [parentId, articleId]
            );

            if (parentComments.length === 0) {
                const error = new Error('父评论不存在');
                error.statusCode = 404;
                throw error;
            }
        }

        const [result] = await pool.query(
            'INSERT INTO comments (content, article_id, user_id, parent_id) VALUES (?, ?, ?, ?)',
            [content, articleId, userId, parentId]
        );

        // 查询创建的评论
        const [comments] = await pool.query(`
            SELECT 
                c.id,
                c.content,
                c.parent_id,
                c.created_at,
                u.id AS user_id,
                u.username,
                u.avatar_url
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [result.insertId]);

        const comment = comments[0];
        return {
            id: comment.id,
            content: comment.content,
            parentId: comment.parent_id,
            user: {
                id: comment.user_id,
                username: comment.username,
                avatarUrl: comment.avatar_url
            },
            createdAt: comment.created_at
        };
    }

    /**
     * 删除评论
     */
    async remove(commentId, userId) {
        const [comments] = await pool.query(
            'SELECT * FROM comments WHERE id = ?',
            [commentId]
        );

        if (comments.length === 0) {
            const error = new Error('评论不存在');
            error.statusCode = 404;
            throw error;
        }

        if (comments[0].user_id !== userId) {
            const error = new Error('无权删除他人的评论');
            error.statusCode = 403;
            throw error;
        }

        await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);
    }
}

module.exports = new CommentService();