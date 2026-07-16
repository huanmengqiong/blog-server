const pool = require('../config/db');

class TagService {
    
    async getAll() {
        const [tags] = await pool.query(`
            SELECT 
                t.id,
                t.name,
                t.created_at,
                COUNT(at2.article_id) AS article_count
            FROM tags t
            LEFT JOIN article_tags at2 ON t.id = at2.tag_id
            GROUP BY t.id
            ORDER BY article_count DESC
        `);

        return tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            articleCount: tag.article_count,
            createdAt: tag.created_at
        }));
    }

    async create(name) {
        const [result] = await pool.query(
            'INSERT INTO tags (name) VALUES (?)',
            [name]
        );

        const [tags] = await pool.query(
            'SELECT * FROM tags WHERE id = ?',
            [result.insertId]
        );

        return tags[0];
    }
}

module.exports = new TagService();