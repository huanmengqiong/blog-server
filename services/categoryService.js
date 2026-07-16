const pool = require('../config/db');

class CategoryService {
    
    async getAll() {
        const [categories] = await pool.query(`
            SELECT 
                c.id,
                c.name,
                c.description,
                c.created_at,
                COUNT(a.id) AS article_count
            FROM categories c
            LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);

        return categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            articleCount: category.article_count,
            createdAt: category.created_at
        }));
    }

    async create({ name, description }) {
        const [result] = await pool.query(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name, description || null]
        );

        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [result.insertId]
        );

        return categories[0];
    }
}

module.exports = new CategoryService();