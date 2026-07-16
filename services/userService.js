const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

class UserService {

    async register({ username, email, password }) {
    const [existing] = await pool.query(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
    );

    if (existing.length > 0) {
        const error = new Error('用户名或邮箱已存在');
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = password;

    const [result] = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
    );

    const [users] = await pool.query(
        'SELECT id, username, email, avatar_url, bio, created_at FROM users WHERE id = ?',
        [result.insertId]
    );

    return users[0];
}
async login(email, password) {
    const [users] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );

    if (users.length === 0) {
        const error = new Error('邮箱或密码错误');
        error.statusCode = 401;
        throw error;
    }

    const user = users[0];

    if (password !== user.password_hash) {
        const error = new Error('邮箱或密码错误');
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatar_url,
            bio: user.bio,
            createdAt: user.created_at
        }
    };
}

    async getProfile(userId) {
        const [users] = await pool.query(
            'SELECT id, username, email, avatar_url, bio, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            const error = new Error('用户不存在');
            error.statusCode = 404;
            throw error;
        }

        return users[0];
    }

    async updateProfile(userId, updateData) {
        const allowedFields = ['username', 'avatar_url', 'bio'];
        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            const error = new Error('没有可更新的字段');
            error.statusCode = 400;
            throw error;
        }

        values.push(userId);
        await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return this.getProfile(userId);
    }
    async updatePassword(userId, oldPassword, newPassword) {
    const [users] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
    );

    if (users.length === 0) {
        const error = new Error('用户不存在');
        error.statusCode = 404;
        throw error;
    }

    const user = users[0];

    if (oldPassword !== user.password_hash) {
        const error = new Error('原密码错误');
        error.statusCode = 400;
        throw error;
    }

    await pool.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newPassword, userId]
    );
}
}

module.exports = new UserService();