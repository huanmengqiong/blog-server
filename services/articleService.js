const pool = require('../config/db');

class ArticleService {
    
    async getList({ page, limit, categoryId, tagId, status, keyword, sort }) {
        const offset = (page - 1) * limit;
        let whereConditions = ['a.status = ?'];
        let params = [status];

        if (categoryId) {
            whereConditions.push('a.category_id = ?');
            params.push(categoryId);
        }

        if (tagId) {
            whereConditions.push('at2.tag_id = ?');
            params.push(tagId);
        }

        if (keyword) {
            whereConditions.push('(a.title LIKE ? OR a.summary LIKE ?)');
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        let countSql = `
            SELECT COUNT(DISTINCT a.id) as total
            FROM articles a
            LEFT JOIN article_tags at2 ON a.id = at2.article_id
            ${whereClause}
        `;

        const [countResult] = await pool.query(countSql, params);
        const total = countResult[0].total;

        let orderBy = 'a.created_at DESC';
        if (sort === 'popular') {
            orderBy = 'a.like_count DESC, a.created_at DESC';
        } else if (sort === 'most_viewed') {
            orderBy = 'a.view_count DESC, a.created_at DESC';
        }

        let listSql = `
            SELECT 
                a.id,
                a.title,
                a.summary,
                a.cover_image,
                a.status,
                a.view_count,
                a.like_count,
                a.created_at,
                a.updated_at,
                u.id AS author_id,
                u.username AS author_name,
                u.avatar_url AS author_avatar,
                c.id AS category_id,
                c.name AS category_name,
                GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ',') AS tag_names,
                GROUP_CONCAT(DISTINCT t.id ORDER BY t.id SEPARATOR ',') AS tag_ids
            FROM articles a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN article_tags at2 ON a.id = at2.article_id
            LEFT JOIN tags t ON at2.tag_id = t.id
            ${whereClause}
            GROUP BY a.id
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);
        const [list] = await pool.query(listSql, params);

        return { list: this.formatArticles(list), total };
    }

    async getDetail(articleId) {
        const [articles] = await pool.query(`
            SELECT 
                a.*,
                u.id AS author_id,
                u.username AS author_name,
                u.avatar_url AS author_avatar,
                u.bio AS author_bio,
                c.id AS category_id,
                c.name AS category_name
            FROM articles a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN categories c ON a.category_id = c.id
            WHERE a.id = ?
        `, [articleId]);

        if (articles.length === 0) {
            const error = new Error('文章不存在');
            error.statusCode = 404;
            throw error;
        }

        const article = articles[0];

        const [tags] = await pool.query(`
            SELECT t.id, t.name 
            FROM tags t
            JOIN article_tags at2 ON t.id = at2.tag_id
            WHERE at2.article_id = ?
        `, [articleId]);

        await pool.query('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [articleId]);

        return {
            id: article.id,
            title: article.title,
            content: article.content,
            summary: article.summary,
            coverImage: article.cover_image,
            status: article.status,
            viewCount: article.view_count + 1,
            likeCount: article.like_count || 0,
            author: {
                id: article.author_id,
                username: article.author_name,
                avatarUrl: article.author_avatar,
                bio: article.author_bio
            },
            category: article.category_id ? {
                id: article.category_id,
                name: article.category_name
            } : null,
            tags: tags,
            createdAt: article.created_at,
            updatedAt: article.updated_at
        };
    }

    async create({ title, content, summary, coverImage, categoryId, tagIds, status, userId }) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            const [result] = await connection.query(
                'INSERT INTO articles (title, content, summary, cover_image, category_id, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [title, content, summary, coverImage, categoryId, status, userId]
            );

            const articleId = result.insertId;

            if (tagIds && tagIds.length > 0) {
                const values = tagIds.map(tagId => [articleId, tagId]);
                await connection.query(
                    'INSERT INTO article_tags (article_id, tag_id) VALUES ?',
                    [values]
                );
            }

            await connection.commit();
            return this.getDetail(articleId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async update(articleId, updateData) {
        const [articles] = await pool.query(
            'SELECT * FROM articles WHERE id = ?',
            [articleId]
        );

        if (articles.length === 0) {
            const error = new Error('文章不存在');
            error.statusCode = 404;
            throw error;
        }

        if (articles[0].user_id !== updateData.userId) {
            const error = new Error('无权修改他人的文章');
            error.statusCode = 403;
            throw error;
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const fields = [];
            const values = [];

            if (updateData.title !== undefined) {
                fields.push('title = ?');
                values.push(updateData.title);
            }
            if (updateData.content !== undefined) {
                fields.push('content = ?');
                values.push(updateData.content);
            }
            if (updateData.summary !== undefined) {
                fields.push('summary = ?');
                values.push(updateData.summary);
            }
            if (updateData.coverImage !== undefined) {
                fields.push('cover_image = ?');
                values.push(updateData.coverImage);
            }
            if (updateData.categoryId !== undefined) {
                fields.push('category_id = ?');
                values.push(updateData.categoryId);
            }
            if (updateData.status !== undefined) {
                fields.push('status = ?');
                values.push(updateData.status);
            }

            if (fields.length > 0) {
                values.push(articleId);
                await connection.query(
                    `UPDATE articles SET ${fields.join(', ')} WHERE id = ?`,
                    values
                );
            }

            if (updateData.tagIds !== undefined) {
                await connection.query('DELETE FROM article_tags WHERE article_id = ?', [articleId]);
                
                if (updateData.tagIds.length > 0) {
                    const tagValues = updateData.tagIds.map(tagId => [articleId, tagId]);
                    await connection.query(
                        'INSERT INTO article_tags (article_id, tag_id) VALUES ?',
                        [tagValues]
                    );
                }
            }

            await connection.commit();
            return this.getDetail(articleId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async remove(articleId, userId) {
        const [articles] = await pool.query(
            'SELECT * FROM articles WHERE id = ?',
            [articleId]
        );

        if (articles.length === 0) {
            const error = new Error('文章不存在');
            error.statusCode = 404;
            throw error;
        }

        if (articles[0].user_id !== userId) {
            const error = new Error('无权删除他人的文章');
            error.statusCode = 403;
            throw error;
        }

        await pool.query('DELETE FROM articles WHERE id = ?', [articleId]);
    }

    async toggleLike(articleId, userId) {
        const [articles] = await pool.query('SELECT id FROM articles WHERE id = ?', [articleId]);
        if (articles.length === 0) {
            const error = new Error('文章不存在');
            error.statusCode = 404;
            throw error;
        }

        const [existing] = await pool.query(
            'SELECT id FROM article_likes WHERE article_id = ? AND user_id = ?',
            [articleId, userId]
        );

        if (existing.length > 0) {
            await pool.query(
                'DELETE FROM article_likes WHERE article_id = ? AND user_id = ?',
                [articleId, userId]
            );
            await pool.query(
                'UPDATE articles SET like_count = like_count - 1 WHERE id = ? AND like_count > 0',
                [articleId]
            );
            return { isLiked: false };
        } else {
            await pool.query(
                'INSERT INTO article_likes (article_id, user_id) VALUES (?, ?)',
                [articleId, userId]
            );
            await pool.query(
                'UPDATE articles SET like_count = like_count + 1 WHERE id = ?',
                [articleId]
            );
            return { isLiked: true };
        }
    }

    async getLikeStatus(articleId, userId) {
        const [existing] = await pool.query(
            'SELECT id FROM article_likes WHERE article_id = ? AND user_id = ?',
            [articleId, userId]
        );

        const [countResult] = await pool.query(
            'SELECT like_count FROM articles WHERE id = ?',
            [articleId]
        );

        return {
            isLiked: existing.length > 0,
            likeCount: countResult.length > 0 ? countResult[0].like_count : 0,
        };
    }

    async getArchives() {
        const [rows] = await pool.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                COUNT(*) AS count
            FROM articles 
            WHERE status = 'published'
            GROUP BY month
            ORDER BY month DESC
        `);

        return rows.map(row => ({
            month: row.month,
            count: row.count,
        }));
    }

    formatArticles(articles) {
        return articles.map(article => ({
            id: article.id,
            title: article.title,
            summary: article.summary,
            coverImage: article.cover_image,
            status: article.status,
            viewCount: article.view_count,
            likeCount: article.like_count || 0,
            author: {
                id: article.author_id,
                username: article.author_name,
                avatarUrl: article.author_avatar
            },
            category: article.category_id ? {
                id: article.category_id,
                name: article.category_name
            } : null,
            tags: article.tag_names ? article.tag_names.split(',').map((name, index) => ({
                id: article.tag_ids ? parseInt(article.tag_ids.split(',')[index]) : null,
                name: name.trim()
            })) : [],
            createdAt: article.created_at,
            updatedAt: article.updated_at
        }));
    }
}

module.exports = new ArticleService();