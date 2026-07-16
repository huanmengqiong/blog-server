function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function getUserInfo() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function saveUserInfo(user) {
    localStorage.setItem('token', user.token);
    localStorage.setItem('user', JSON.stringify(user.user));
}

function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    if (days < 365) return `${Math.floor(days / 30)}个月前`;
    return `${Math.floor(days / 365)}年前`;
}

function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function getAvatarUrl(username, size = 40) {
    if (!username) return '';
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#1abc9c'];
    const index = username.charCodeAt(0) % colors.length;
    const color = colors[index];
    const initial = username.charAt(0).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <rect width="${size}" height="${size}" rx="${size / 2}" fill="${color}"/>
        <text x="${size / 2}" y="${size / 2 + size * 0.15}" text-anchor="middle" fill="white" font-size="${size * 0.45}" font-family="Arial, sans-serif" font-weight="bold">${initial}</text>
    </svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function showToast(message, type = 'success', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || ''} ${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            toast.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, duration);
}

function debounce(fn, delay = 300) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function throttle(fn, delay = 300) {
    let last = 0;
    return function (...args) {
        const now = Date.now();
        if (now - last >= delay) {
            last = now;
            fn.apply(this, args);
        }
    };
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const user = getUserInfo();
    const avatarHtml = user 
        ? `<img src="${getAvatarUrl(user.username, 32)}" style="width:32px;height:32px;border-radius:50%;vertical-align:middle;margin-right:6px;" onerror="this.style.display='none'">`
        : '';

    navbar.innerHTML = `
        <div class="navbar-inner">
            <a href="index.html" class="navbar-brand">📝 我的博客</a>
            <div class="navbar-menu">
                <a href="index.html">🏠 首页</a>
                ${user ? `
                    <a href="publish.html">✍️ 写文章</a>
                    <a href="profile.html">👤 个人中心</a>
                    <span id="userInfo" style="display:flex;align-items:center;gap:6px;">
                        ${avatarHtml}
                        <span>${escapeHtml(user.username)}</span>
                        <span id="logoutBtn" onclick="logout()" title="退出登录">🚪</span>
                    </span>
                ` : `
                    <a href="login.html" class="btn btn-outline">🔐 登录</a>
                `}
            </div>
        </div>
    `;
}

function confirmDialog(message, title = '提示') {
    return new Promise((resolve) => {
        const result = confirm(title + '\n\n' + message);
        resolve(result);
    });
}

function showPageLoading(show = true) {
    let loader = document.getElementById('pageLoader');
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'pageLoader';
            loader.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(255,255,255,0.8); z-index: 9999;
                display: flex; align-items: center; justify-content: center;
            `;
            loader.innerHTML = '<div style="font-size:24px;color:#3498db;">加载中...</div>';
            document.body.appendChild(loader);
        }
    } else {
        if (loader) loader.remove();
    }
}