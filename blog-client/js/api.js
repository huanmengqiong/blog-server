const API_BASE = 'http://localhost:3003/api';
const REQUEST_TIMEOUT = 10000;

const requestInterceptor = (config) => {
    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
};

const responseInterceptor = async (response, url) => {
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

function getToken() {
    return localStorage.getItem('token');
}

function fetchWithTimeout(url, options, timeout = REQUEST_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    return fetch(url, {
        ...options,
        signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(url, options = {}, retryCount = 0) {
    const maxRetries = 1;

    const defaultConfig = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = {
        ...defaultConfig,
        ...options,
        headers: {
            ...defaultConfig.headers,
            ...options.headers,
        },
    };

    const finalConfig = requestInterceptor(config);

    if (finalConfig.body && typeof finalConfig.body === 'object' && !(finalConfig.body instanceof FormData)) {
        finalConfig.body = JSON.stringify(finalConfig.body);
    }

    if (finalConfig.body instanceof FormData) {
        delete finalConfig.headers['Content-Type'];
    }

    const fullUrl = API_BASE + url;
    const startTime = Date.now();

    try {
        const response = await fetchWithTimeout(fullUrl, finalConfig);

        await responseInterceptor(response, url);

        const data = await response.json();

        if (window.location.hostname === 'localhost') {
            console.log(
                `[API] ${finalConfig.method || 'GET'} ${url}`,
                `${response.status} ${Date.now() - startTime}ms`,
                data.success ? '✅' : '❌'
            );
        }

        return data;

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error(`[API] 请求超时: ${url}`);
            return {
                success: false,
                message: '请求超时，请检查网络后重试',
            };
        }

        if (retryCount < maxRetries && error.message === 'Failed to fetch') {
            console.warn(`[API] 请求失败，正在重试 (${retryCount + 1}/${maxRetries}): ${url}`);
            await delay(1000);
            return request(url, options, retryCount + 1);
        }

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

const UserAPI = {
    register: (data) => request('/users/register', { method: 'POST', body: data }),
    login: (data) => request('/users/login', { method: 'POST', body: data }),
    getProfile: () => request('/users/profile'),
    updateProfile: (data) => request('/users/profile', { method: 'PUT', body: data }),
    updatePassword: (data) => request('/users/password', { method: 'PUT', body: data }),
    getStats: (userId) => request(`/users/${userId}/stats`),
};

const ArticleAPI = {
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
    getDetail: (id) => request(`/articles/${id}`),
    create: (data) => request('/articles', { method: 'POST', body: data }),
    update: (id, data) => request(`/articles/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/articles/${id}`, { method: 'DELETE' }),
    toggleLike: (id) => request(`/articles/${id}/like`, { method: 'POST' }),
    getLikeStatus: (id) => request(`/articles/${id}/like`),
    search: (keyword, params = {}) => {
        return ArticleAPI.getList({ ...params, keyword });
    },
    getArchives: () => request('/articles/archives'),
};

const CategoryAPI = {
    getAll: () => deduplicatedRequest('categories_all', () => request('/categories')),
    create: (data) => request('/categories', { method: 'POST', body: data }),
    getWithCount: () => request('/categories?withCount=true'),
};

const TagAPI = {
    getAll: () => deduplicatedRequest('tags_all', () => request('/tags')),
    create: (data) => request('/tags', { method: 'POST', body: data }),
    getHot: (limit = 10) => request(`/tags?sort=hot&limit=${limit}`),
};

const CommentAPI = {
    getByArticle: (articleId) => request(`/comments/article/${articleId}`),
    create: (data) => request('/comments', { method: 'POST', body: data }),
    remove: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
    getByUser: (userId) => request(`/comments/user/${userId}`),
};

const UploadAPI = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return request('/upload/image', {
            method: 'POST',
            body: formData,
            headers: {},
        });
    },
};

const HealthAPI = {
    check: () => request('/health'),
    ping: () => request('/ping'),
};