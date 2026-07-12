-- 创建数据库
CREATE DATABASE IF NOT EXISTS blog_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE blog_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章表
CREATE TABLE IF NOT EXISTS articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(500) DEFAULT NULL,
    cover_image VARCHAR(255) DEFAULT NULL,
    status ENUM('draft', 'published') DEFAULT 'published',
    view_count INT DEFAULT 0,
    user_id INT NOT NULL,
    category_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章-标签关联表
CREATE TABLE IF NOT EXISTS article_tags (
    article_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_article_id (article_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入测试数据
INSERT INTO users (username, email, password_hash, bio) VALUES
('张三', 'zhangsan@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '热爱技术，热爱生活'),
('李四', 'lisi@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '前端开发工程师'),
('王五', 'wangwu@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '后端开发工程师'),
('赵六', 'zhaoliu@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '全栈开发者'),
('孙七', 'sunqi@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'UI设计师');
-- 密码均为: 123456

INSERT INTO categories (name, description) VALUES
('前端开发', 'HTML、CSS、JavaScript相关技术'),
('后端开发', 'Node.js、Python、Java等后端技术'),
('数据库', 'MySQL、MongoDB等数据库技术'),
('DevOps', '部署、CI/CD相关'),
('人工智能', '机器学习、深度学习相关');

INSERT INTO tags (name) VALUES
('JavaScript'), ('Node.js'), ('React'), ('Vue'), ('MySQL'),
('Python'), ('Docker'), ('CSS'), ('TypeScript'), ('Linux');

INSERT INTO articles (title, content, summary, user_id, category_id, status) VALUES
('Node.js入门教程', 'Node.js是一个基于Chrome V8引擎的JavaScript运行时...', '本文将介绍Node.js的基础知识', 1, 2, 'published'),
('CSS Flexbox布局详解', 'Flexbox是CSS3中引入的一种布局模式...', '深入理解Flexbox布局', 2, 1, 'published'),
('MySQL索引优化实战', '索引是提高数据库查询性能的重要手段...', 'MySQL索引优化技巧总结', 3, 3, 'published'),
('Docker容器化部署指南', 'Docker是一个开源的应用容器引擎...', '使用Docker部署你的应用', 1, 4, 'published'),
('React Hooks深入理解', 'Hooks是React 16.8引入的新特性...', '掌握React Hooks的核心概念', 2, 1, 'published'),
('Python数据分析入门', 'Python在数据分析领域有着广泛的应用...', 'Python数据分析基础教程', 4, 5, 'published'),
('Vue3组合式API', 'Vue3引入了组合式API...', 'Vue3组合式API使用指南', 5, 1, 'published'),
('Linux常用命令总结', 'Linux是后端开发必备技能...', 'Linux常用命令速查', 3, 2, 'draft');

INSERT INTO article_tags (article_id, tag_id) VALUES
(1, 1), (1, 2), (2, 8), (3, 5), (4, 7),
(5, 3), (5, 1), (6, 6), (7, 4), (7, 1), (8, 10);

INSERT INTO comments (content, user_id, article_id) VALUES
('写得很好，学到了很多！', 2, 1),
('Node.js确实好用', 3, 1),
('Flexbox布局很实用', 1, 2),
('期待更多MySQL教程', 4, 3),
('Docker部署确实方便', 5, 4),
('React Hooks让代码更简洁', 3, 5),
('Python数据分析很强大', 1, 6);