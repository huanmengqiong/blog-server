/**
 * API 请求封装
 */
const API_BASE = 'http://localhost:3003/api';
const REQUEST_TIMEOUT = 10000; // 10秒超时

// ========== 请求拦截器 ==========
const requestInterceptor = (config) => {
    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
};

// ========== 响应拦截器 ==========
const responseInterceptor = async (response, url) => {
    // Token 过期，自动跳转登录
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname.indexOf('login.html') === -1) {
            showToast('登录已过期，请重新登录', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    }
    return response;
};

// ========== 工具函数 ==========

// 获取 Token
function getToken() {
    return localStorage.getItem('token');
}

// 超时控制
function fetchWithTimeout(url, options, timeout = REQUEST_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    return fetch(url, {
        ...options,
        signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== 通用请求函数 ==========
async function request(url, options = {}, retryCount = 0) {
    const maxRetries = 1; // 最多重试1次

    // 默认配置
    const defaultConfig = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // 合并配置
    const config = {
        ...defaultConfig,
        ...options,
        headers: {
            ...defaultConfig.headers,
            ...options.headers,
        },
    };

    // 请求拦截
    const finalConfig = requestInterceptor(config);

    // 如果 body 是对象，转成 JSON 字符串
    if (finalConfig.body && typeof finalConfig.body === 'object' && !(finalConfig.body instanceof FormData)) {
        finalConfig.body = JSON.stringify(finalConfig.body);
    }

    // 如果是 FormData，删除 Content-Type 让浏览器自动设置
    if (finalConfig.body instanceof FormData) {
        delete finalConfig.headers['Content-Type'];
    }

    const fullUrl = API_BASE + url;
    const startTime = Date.now();

    try {
        // 发起请求（带超时）
        const response = await fetchWithTimeout(fullUrl, finalConfig);

        // 响应拦截
        await responseInterceptor(response, url);

        // 解析 JSON
        const data = await response.json();

        // 开发环境日志
        if (window.location.hostname === 'localhost') {
            console.log(
                `[API] ${finalConfig.method || 'GET'} ${url}`,
                `${response.status} ${Date.now() - startTime}ms`,
                data.success ? '✅' : '❌'
            );
        }

        return data;

    } catch (error) {
        // 超时处理
        if (error.name === 'AbortError') {
            console.error(`[API] 请求超时: ${url}`);
            return {
                success: false,
                message: '请求超时，请检查网络后重试',
            };
        }

        // 网络错误 - 重试
        if (retryCount < maxRetries && error.message === 'Failed to fetch') {
            console.warn(`[API] 请求失败，正在重试 (${retryCount + 1}/${maxRetries}): ${url}`);
            await delay(1000);
            return request(url, options, retryCount + 1);
        }

        // 在线检测
        if (!navigator.onLine) {
            return {
                success: false,
                message: '网络已断开，请检查网络连接',
            };
        }

        console.error(`[API] 请求失败: ${url}`, error.message);
        return {
            success: false,
            message: '网络错误，请检查后端服务是否启动',
        };
    }
}

// ========== 并发请求去重 ==========
const pendingRequests = new Map();

function deduplicatedRequest(key, requestFn) {
    if (pendingRequests.has(key)) {
        console.log(`[API] 复用进行中的请求: ${key}`);
        return pendingRequests.get(key);
    }

    const promise = requestFn().finally(() => {
        pendingRequests.delete(key);
    });

    pendingRequests.set(key, promise);
    return promise;
}

// ========== 用户 API ==========
const UserAPI = {
    register: (data) => request('/users/register', { method: 'POST', body: data }),
    
    login: (data) => request('/users/login', { method: 'POST', body: data }),
    
    getProfile: () => request('/users/profile'),
    
    updateProfile: (data) => request('/users/profile', { method: 'PUT', body: data }),
    
    updatePassword: (data) => request('/users/password', { method: 'PUT', body: data }),
    
    // 获取用户统计
    getStats: (userId) => request(`/users/${userId}/stats`),
};

// ========== 文章 API ==========
const ArticleAPI = {
    // 获取文章列表
    getList: (params = {}) => {
        const validParams = {};
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                validParams[key] = params[key];
            }
        });
        const query = new URLSearchParams(validParams).toString();
        return request(`/articles${query ? '?' + query : ''}`);
    },

    // 获取文章详情
    getDetail: (id) => request(`/articles/${id}`),

    // 创建文章
    create: (data) => request('/articles', { method: 'POST', body: data }),

    // 更新文章
    update: (id, data) => request(`/articles/${id}`, { method: 'PUT', body: data }),

    // 删除文章
    remove: (id) => request(`/articles/${id}`, { method: 'DELETE' }),

    // 点赞/取消点赞
    toggleLike: (id) => request(`/articles/${id}/like`, { method: 'POST' }),

    // 获取点赞状态
    getLikeStatus: (id) => request(`/articles/${id}/like`),

    // 搜索文章
    search: (keyword, params = {}) => {
        return ArticleAPI.getList({ ...params, keyword });
    },

    // 文章归档
    getArchives: () => request('/articles/archives'),
};

// ========== 分类 API ==========
const CategoryAPI = {
    getAll: () => deduplicatedRequest('categories_all', () => request('/categories')),
    
    create: (data) => request('/categories', { method: 'POST', body: data }),
    
    // 获取分类及其文章数
    getWithCount: () => request('/categories?withCount=true'),
};

// ========== 标签 API ==========
const TagAPI = {
    getAll: () => deduplicatedRequest('tags_all', () => request('/tags')),
    
    create: (data) => request('/tags', { method: 'POST', body: data }),
    
    // 热门标签
    getHot: (limit = 10) => request(`/tags?sort=hot&limit=${limit}`),
};

// ========== 评论 API ==========
const CommentAPI = {
    getByArticle: (articleId) => request(`/comments/article/${articleId}`),
    
    create: (data) => request('/comments', { method: 'POST', body: data }),
    
    remove: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
    
    // 获取用户的所有评论
    getByUser: (userId) => request(`/comments/user/${userId}`),
};

// ========== 文件上传 API ==========
const UploadAPI = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return request('/upload/image', {
            method: 'POST',
            body: formData,
            headers: {}, // 让浏览器自动设置 Content-Type
        });
    },
};

// ========== 健康检查 ==========
const HealthAPI = {
    check: () => request('/health'),
    ping: () => request('/ping'),
};